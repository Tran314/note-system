# 第一阶段：严重问题修复方案

> 共 16 项严重问题，按修复优先级排列

---

## 1. 修复 ecosystem.config.js 硬编码路径

**文件**: `backend/ecosystem.config.js`

**问题**: `cwd` 硬编码为 `/root/.openclaw/workspace/projects/note-system/backend`

**修复**: 删除 `cwd` 字段，PM2 默认使用配置文件所在目录

```js
// 删除第 6 行:
// cwd: '/root/.openclaw/workspace/projects/note-system/backend',

// 同时删除 env 中的 PORT（由 .env 文件提供）
// PORT: 3001,
```

---

## 2. 修复 backend/deploy.sh 硬编码路径 + pm2 start→reload

**文件**: `backend/deploy.sh`

**问题**: 
- 第 10 行硬编码路径
- 第 34 行使用 `pm2 start` 而非 `pm2 reload`
- 第 14 行使用 `npm install` 而非 `npm ci`

**修复**:

```bash
#!/bin/bash
# 部署脚本

set -e

echo "🚀 开始部署笔记系统..."

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 安装依赖（使用 npm ci 确保可重复性）
echo "📦 安装后端依赖..."
npm ci --production

# 生成 Prisma 客户端
echo "🔧 生成 Prisma 客户端..."
npx prisma generate

# 运行数据库迁移
echo "📊 运行数据库迁移..."
npx prisma migrate deploy

# 构建项目
echo "🔨 构建项目..."
npm run build

# 创建日志目录
mkdir -p logs

# 使用 PM2 启动/重载
echo "🚀 启动服务..."
if command -v pm2 &> /dev/null; then
    # 检查是否已有运行的进程
    if pm2 list | grep -q "note-system-backend"; then
        pm2 reload ecosystem.config.js
    else
        pm2 start ecosystem.config.js
    fi
    pm2 save
else
    echo "⚠️ PM2 未安装，使用 node 直接启动"
    nohup node dist/main.js > logs/out.log 2> logs/error.log &
fi

echo "✅ 部署完成！"
echo "📚 API 地址: http://localhost:3001/api/v1"
echo "📖 API 文档: http://localhost:3001/api/docs"
```

---

## 3. 修复 seed.ts editorLineHeight 字段

**文件**: `backend/prisma/seed.ts`

**问题**: 第 33 行 `editorLineHeight: 1.6` 在 UserSettings schema 中不存在

**修复**: 删除该行

```ts
// 删除第 33 行:
// editorLineHeight: 1.6,

// 修改后:
await prisma.userSettings.upsert({
  where: { userId: user.id },
  update: {},
  create: {
    userId: user.id,
    theme: 'light',
    editorFontSize: 16,
  },
});
```

---

## 4. 修复 attachment.service.ts（3 个问题合并）

**文件**: `backend/src/modules/attachment/attachment.service.ts`

**问题**:
- 同步文件 I/O 阻塞事件循环
- 文件写入无错误处理
- uploadMultiple 部分失败无回滚

**修复**: 完整重写 upload、getFile、remove、uploadMultiple 方法

```ts
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import * as fs from 'fs/promises';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AttachmentService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  private async ensureUploadDir(dir: string): Promise<void> {
    try {
      await fs.access(dir);
    } catch {
      await fs.mkdir(dir, { recursive: true });
    }
  }

  async upload(userId: string, file: Express.Multer.File, noteId?: string) {
    if (!file) {
      throw new BadRequestException('文件不存在');
    }

    const maxSize = this.configService.get<number>('MAX_FILE_SIZE', 10485760);
    if (file.size > maxSize) {
      throw new BadRequestException('文件大小超过限制（10MB）');
    }

    const allowedMimeTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
      'application/pdf',
      'text/plain', 'text/csv',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('不支持的文件类型');
    }

    const ext = path.extname(file.originalname);
    const uniqueFilename = `${uuidv4()}${ext}`;
    const uploadDir = this.configService.get<string>('UPLOAD_DIR', './uploads');
    const filePath = path.join(uploadDir, uniqueFilename);

    await this.ensureUploadDir(uploadDir);

    // 先写入文件，成功后再创建数据库记录
    await fs.writeFile(filePath, file.buffer);

    try {
      const attachment = await this.prisma.attachment.create({
        data: {
          userId,
          noteId,
          filename: file.originalname,
          filePath: uniqueFilename,
          fileSize: file.size,
          mimeType: file.mimetype,
        },
      });
      return attachment;
    } catch (error) {
      // 数据库写入失败，清理已上传的文件
      await fs.unlink(filePath).catch(() => {});
      throw error;
    }
  }

  async uploadMultiple(userId: string, files: Express.Multer.File[], noteId?: string) {
    const uploaded: string[] = [];
    const attachments: any[] = [];

    try {
      for (const file of files) {
        const attachment = await this.upload(userId, file, noteId);
        uploaded.push((attachment as any).filePath);
        attachments.push(attachment);
      }
      return attachments;
    } catch (error) {
      // 部分失败时清理已上传的文件
      const uploadDir = this.configService.get<string>('UPLOAD_DIR', './uploads');
      for (const filePath of uploaded) {
        await fs.unlink(path.join(uploadDir, filePath)).catch(() => {});
      }
      // 清理已创建的数据库记录
      if (attachments.length > 0) {
        await this.prisma.attachment.deleteMany({
          where: { id: { in: attachments.map((a) => a.id) } },
        }).catch(() => {});
      }
      throw error;
    }
  }

  async findAll(userId: string, noteId?: string) {
    const where: Prisma.AttachmentWhereInput = { userId };
    if (noteId) where.noteId = noteId;

    return this.prisma.attachment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, attachmentId: string) {
    const attachment = await this.prisma.attachment.findFirst({
      where: { id: attachmentId, userId },
    });

    if (!attachment) {
      throw new NotFoundException('文件不存在');
    }

    return attachment;
  }

  async getFile(userId: string, attachmentId: string) {
    const attachment = await this.findOne(userId, attachmentId);

    const uploadDir = this.configService.get<string>('UPLOAD_DIR', './uploads');
    const filePath = path.join(uploadDir, attachment.filePath);

    try {
      const fileBuffer = await fs.readFile(filePath);
      return {
        buffer: fileBuffer,
        filename: attachment.filename,
        mimeType: attachment.mimeType,
      };
    } catch {
      throw new NotFoundException('文件不存在或已被删除');
    }
  }

  async remove(userId: string, attachmentId: string) {
    const attachment = await this.findOne(userId, attachmentId);

    const uploadDir = this.configService.get<string>('UPLOAD_DIR', './uploads');
    const filePath = path.join(uploadDir, attachment.filePath);

    // 先删除数据库记录
    await this.prisma.attachment.delete({
      where: { id: attachmentId },
    });

    // 再删除物理文件（即使失败也不影响数据库一致性）
    await fs.unlink(filePath).catch(() => {});

    return { message: '文件已删除' };
  }

  async attachToNote(userId: string, attachmentId: string, noteId: string) {
    const note = await this.prisma.note.findFirst({
      where: { id: noteId, userId, isDeleted: false },
    });

    if (!note) {
      throw new NotFoundException('笔记不存在');
    }

    await this.prisma.attachment.update({
      where: { id: attachmentId, userId },
      data: { noteId },
    });

    return { message: '文件关联成功' };
  }
}
```

---

## 5. 修复 folder.service.ts 递归删除 userId 验证

**文件**: `backend/src/modules/folder/folder.service.ts`

**问题**: `removeChildFolders` 查找子文件夹时未过滤 userId

**修复**: 在 `where` 中添加 `userId`

```ts
// 第 103-105 行修改为:
const children = await this.prisma.folder.findMany({
  where: { parentId: folderId, userId },  // 添加 userId
});
```

---

## 6. 修复 trash.service.ts 所有权验证

**文件**: `backend/src/modules/trash/trash.service.ts`

**问题**: `restoreNote` 和 `permanentDelete` 未验证 userId

**修复**: 添加 userId 参数并验证所有权

```ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class TrashService {
  constructor(private prisma: PrismaService) {}

  async getTrashNotes(userId: string) {
    return this.prisma.note.findMany({
      where: {
        userId,
        isDeleted: true,
      },
    });
  }

  async restoreNote(userId: string, id: string) {
    const note = await this.prisma.note.findFirst({
      where: { id, userId, isDeleted: true },
    });

    if (!note) {
      throw new NotFoundException('笔记不存在或不属于当前用户');
    }

    return this.prisma.note.update({
      where: { id },
      data: { isDeleted: false, deletedAt: null },
    });
  }

  async permanentDelete(userId: string, id: string) {
    const note = await this.prisma.note.findFirst({
      where: { id, userId },
    });

    if (!note) {
      throw new NotFoundException('笔记不存在或不属于当前用户');
    }

    return this.prisma.note.delete({
      where: { id },
    });
  }
}
```

---

## 7. 修复 useNoteExport.ts XSS 漏洞

**文件**: `frontend/src/hooks/useNoteExport.ts`

**问题**: note.title 未转义直接嵌入 HTML

**修复**: 添加 HTML 转义函数

```ts
// 在文件顶部添加转义函数:
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// 第 94 行修改为:
<title>${escapeHtml(note.title)}</title>

// 第 113 行修改为:
html += `<h1>${escapeHtml(note.title)}</h1>\n`;

// 第 81 行 markdown 导出也转义:
content += `# ${escapeHtml(note.title)}\n\n`;

// 第 75 行 metadata 也转义:
content += `title: ${escapeHtml(note.title)}\n`;

// 第 122 行 txt 导出也转义:
let txt = `${escapeHtml(note.title)}\n\n`;
```

---

## 8. 修复 Modal.tsx + Modal.test.tsx data-testid

**文件**: `frontend/src/components/common/Modal.tsx`

**修复**: 在 backdrop div 添加 `data-testid`

```tsx
// 第 31-34 行修改为:
<div 
  className="absolute inset-0 bg-black/50"
  onClick={onClose}
  data-testid="modal-overlay"
/>
```

---

## 9. 修复 frontend/.dockerignore 排除 nginx.conf

**文件**: `frontend/.dockerignore`

**问题**: `nginx.conf` 被排除但 Dockerfile 需要它

**修复**: 删除第 20 行 `nginx.conf`

```
# 删除这一行:
# nginx.conf
```

---

## 10. 修复 kubernetes.yml shell 变量语法

**文件**: `kubernetes.yml`

**问题**: K8s 不解析 shell 变量 `${VAR:-default}`

**修复**: 改为固定值（或使用 Helm/kustomize 管理）

```yaml
# 第 170 行修改为:
image: note-system-backend:latest

# 第 224 行修改为:
image: note-system-frontend:latest
```

---

## 11. 修复 kubernetes.yml Redis command 环境变量

**文件**: `kubernetes.yml`

**问题**: `command` 数组中 `$(REDIS_PASSWORD)` 不展开

**修复**: 使用 `args` 替代

```yaml
# 第 118-127 行修改为:
containers:
  - name: redis
    image: redis:7-alpine
    args: ["--appendonly", "yes", "--requirepass", "$(REDIS_PASSWORD)"]
    env:
      - name: REDIS_PASSWORD
        valueFrom:
          secretKeyRef:
            name: note-secrets
            key: REDIS_PASSWORD
```

---

## 12. 修复 docker-compose.yml 默认密码回退

**文件**: `docker-compose.yml`

**问题**: 默认密码公开可见

**修复**: 移除默认值，要求必须设置环境变量

```yaml
# 第 10-12 行修改为:
POSTGRES_USER: ${DB_USER}
POSTGRES_PASSWORD: ${DB_PASSWORD}
POSTGRES_DB: ${DB_NAME}

# 第 16 行修改为:
- "${DB_PORT}:5432"

# 第 18 行修改为:
test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]

# 第 28 行修改为:
command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}

# 第 34 行修改为:
test: ["CMD", "redis-cli", "--pass", "${REDIS_PASSWORD}", "ping"]

# 第 52 行修改为:
DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_NAME}?schema=public

# 第 55 行修改为:
REDIS_PASSWORD: ${REDIS_PASSWORD}

# 第 56 行修改为:
JWT_SECRET: ${JWT_SECRET}
```

**同时更新 `.env.example`**:

```env
# 数据库
DB_USER=noteuser
DB_PASSWORD=your-secure-password-here
DB_NAME=notesystem
DB_PORT=5432

# Redis
REDIS_PASSWORD=your-redis-password-here
REDIS_PORT=6379

# JWT
JWT_SECRET=your-jwt-secret-here-min-32-chars
JWT_ACCESS_EXPIRES_IN=1800
JWT_REFRESH_EXPIRES_IN=604800

# 应用
BACKEND_PORT=3001
FRONTEND_PORT=3000
```

---

## 13. 修复 .env.production localhost API URL

**文件**: `frontend/.env.production`

**问题**: API 指向 localhost

**修复**: 使用相对路径或占位符

```env
# 修改为:
VITE_API_URL=/api/v1
```

**说明**: 生产环境通过 Nginx 反向代理 `/api` 到后端，前端使用相对路径即可。

---

## 14. 修复 .gitignore package-lock.json 注释

**文件**: `.gitignore`

**问题**: `package-lock.json` 被注释但 CI 使用 `npm ci`

**修复**: 确保 lock 文件不被忽略（已注释表示不忽略，确认即可）

```gitignore
# 确认第 66-67 行保持注释状态（表示不忽略这些文件）:
# package-lock.json
# pnpm-lock.yaml
```

---

## 修复汇总

| # | 问题 | 文件 | 状态 |
|---|------|------|------|
| 1 | ecosystem.config.js 硬编码路径 | `backend/ecosystem.config.js` | ✅ 待修复 |
| 2 | backend/deploy.sh 硬编码路径 + pm2 | `backend/deploy.sh` | ✅ 待修复 |
| 3 | seed.ts editorLineHeight | `backend/prisma/seed.ts` | ✅ 待修复 |
| 4 | attachment.service.ts 同步 I/O + 错误处理 + 回滚 | `backend/src/modules/attachment/attachment.service.ts` | ✅ 待修复 |
| 5 | folder.service.ts userId 验证 | `backend/src/modules/folder/folder.service.ts` | ✅ 待修复 |
| 6 | trash.service.ts 所有权验证 | `backend/src/modules/trash/trash.service.ts` | ✅ 待修复 |
| 7 | useNoteExport.ts XSS | `frontend/src/hooks/useNoteExport.ts` | ✅ 待修复 |
| 8 | Modal data-testid | `frontend/src/components/common/Modal.tsx` | ✅ 待修复 |
| 9 | .dockerignore nginx.conf | `frontend/.dockerignore` | ✅ 待修复 |
| 10 | k8s shell 变量 | `kubernetes.yml` | ✅ 待修复 |
| 11 | k8s Redis command | `kubernetes.yml` | ✅ 待修复 |
| 12 | docker-compose 默认密码 | `docker-compose.yml` | ✅ 待修复 |
| 13 | .env.production localhost | `frontend/.env.production` | ✅ 待修复 |
| 14 | .gitignore lock 文件 | `.gitignore` | ✅ 待修复 |

---

**总工作量**: 约 1-2 小时
**风险等级**: 低（所有修复均为明确的 bug 修复，不改变业务逻辑）
