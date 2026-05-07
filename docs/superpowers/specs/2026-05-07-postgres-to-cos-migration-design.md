# PostgreSQL迁移至腾讯云COS架构设计

> **重要声明：本方案仅适用于个人测试/学习环境，不可用于生产环境或对外发布。**

---

## 项目概述

### 目标

将Nebula笔记系统从PostgreSQL + NestJS后端架构迁移至纯静态前端 + 腾讯云COS对象存储架构，实现完全Serverless部署。

### 范围

**移除：**
- NestJS后端服务器（整个backend目录）
- PostgreSQL数据库
- Redis缓存
- Prisma ORM

**保留并改造：**
- React前端应用（frontend）
- Electron桌面应用（desktop，可选）
- 状态管理层（Zustand）
- UI组件层

**新增：**
- 腾讯云COS对象存储
- 前端直接使用腾讯云SDK
- 本地JSON数据结构
- 简化认证方案

### 约束条件

- **仅用于测试环境**：单用户测试，无并发冲突
- **网络依赖**：必须联网使用
- **安全性要求低**：个人测试，无生产安全要求
- **成本优化**：免费额度为主，控制成本

---

## 架构设计

### 原架构

```
┌─────────────┐
│ React前端   │
│ (Vite)      │
└──────┬──────┘
       │ HTTP API
       ▼
┌─────────────┐
│ NestJS后端  │
│ (Express)   │
└──────┬──────┘
       │ Prisma ORM
       ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ PostgreSQL  │     │ Redis       │     │ 本地文件    │
│ (数据库)    │     │ (缓存)      │     │ (附件)      │
└─────────────┘     └─────────────┘     └─────────────┘
```

### 新架构（测试环境）

```
┌─────────────────────────────┐
│ React前端                   │
│ - Zustand状态管理           │
│ - COS Service层             │
│ - 腾讯云SDK                 │
│ - 本地认证                  │
└──────────┬──────────────────┘
           │ 腾讯云SDK直连
           ▼
┌─────────────────────────────┐
│ 腾讯云COS                   │
│ - JSON文件存储              │
│ - 附件文件存储              │
│ - 无服务器                  │
│ - 无数据库                  │
└─────────────────────────────┘
```

### 关键技术栈

| 层级 | 原技术 | 新技术 |
|------|--------|--------|
| 前端框架 | React 18 | React 18（保持不变） |
| 状态管理 | Zustand | Zustand（保持不变） |
| 编辑器 | TipTap | TipTap（保持不变） |
| 后端服务 | NestJS | **移除** |
| 数据库 | PostgreSQL + Prisma | **移除** |
| 缓存 | Redis | **移除，前端内存缓存替代** |
| 存储层 | - | 腾讯云COS |
| SDK | Axios | cos-js-sdk-v5 |
| 认证 | JWT + Passport | 本地bcrypt + JWT |

---

## 数据存储设计

### COS Bucket目录结构

```
cos://nebula-test-bucket/
├── users/
│   └── {userId}/
│       ├── profile.json              # 用户基本信息
│       ├── settings.json             # 用户设置
│       ├── index.json                # 全局索引（快速统计）
│       ├── notes/
│       │   ├── {noteId}.json         # 单个笔记完整数据
│       │   ├── {noteId}.versions.json # 笔记版本历史
│       │   └── index.json            # 笔记列表索引（标题、时间等）
│       ├── folders/
│       │   ├── {folderId}.json       # 单个文件夹信息
│       │   └── tree.json             # 文件夹树形结构
│       ├── tags/
│       │   ├── {tagId}.json          # 单个标签信息
│       │   └── index.json            # 标签列表索引
│       └── attachments/
│           ├── {fileId}.jpg          # 附件文件（原文件）
│           ├── {fileId}.pdf          # 附件文件
│           └── index.json            # 附件元数据索引
└── backups/                           # 备份目录（可选）
    └── {userId}/
        └── {timestamp}.json
```

### JSON数据格式定义

#### 1. 用户数据

**profile.json**
```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "passwordHash": "bcrypt-hash-string",
  "nickname": "用户昵称",
  "avatarUrl": "users/{userId}/attachments/avatar.jpg",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**settings.json**
```json
{
  "userId": "user-uuid",
  "theme": "dark",
  "editorFontSize": 16,
  "autoSave": true,
  "autoSaveInterval": 30,
  "defaultFolderId": "folder-uuid-1"
}
```

**index.json（用户全局索引）**
```json
{
  "userId": "user-uuid",
  "notesCount": 10,
  "foldersCount": 5,
  "tagsCount": 3,
  "attachmentsCount": 7,
  "lastSync": "2024-01-01T00:00:00.000Z",
  "version": 1
}
```

#### 2. 笔记数据

**{noteId}.json**
```json
{
  "id": "note-uuid-1",
  "userId": "user-uuid",
  "folderId": "folder-uuid-1",
  "title": "笔记标题",
  "content": "<html>笔记HTML内容</html>",
  "isPinned": false,
  "isDeleted": false,
  "deletedAt": null,
  "version": 1,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "tags": ["tag-uuid-1", "tag-uuid-2"]
}
```

**{noteId}.versions.json**
```json
{
  "noteId": "note-uuid-1",
  "versions": [
    {
      "id": "version-uuid-1",
      "version": 1,
      "title": "版本1标题",
      "content": "<html>版本1内容</html>",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": "version-uuid-2",
      "version": 2,
      "title": "版本2标题",
      "content": "<html>版本2内容</html>",
      "createdAt": "2024-01-02T00:00:00.000Z"
    }
  ]
}
```

**notes/index.json**
```json
{
  "userId": "user-uuid",
  "notes": [
    {
      "id": "note-uuid-1",
      "title": "笔记标题",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "isPinned": false,
      "folderId": "folder-uuid-1",
      "tags": ["tag-uuid-1"]
    },
    {
      "id": "note-uuid-2",
      "title": "置顶笔记",
      "updatedAt": "2024-01-02T00:00:00.000Z",
      "isPinned": true,
      "folderId": null,
      "tags": []
    }
  ],
  "updatedAt": "2024-01-02T00:00:00.000Z"
}
```

#### 3. 文件夹数据

**{folderId}.json**
```json
{
  "id": "folder-uuid-1",
  "userId": "user-uuid",
  "name": "我的笔记",
  "parentId": null,
  "sortOrder": 0,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**folders/tree.json**
```json
{
  "userId": "user-uuid",
  "tree": [
    {
      "id": "folder-uuid-1",
      "name": "我的笔记",
      "parentId": null,
      "children": [
        {
          "id": "folder-uuid-2",
          "name": "工作笔记",
          "parentId": "folder-uuid-1",
          "children": []
        }
      ]
    },
    {
      "id": "folder-uuid-3",
      "name": "个人笔记",
      "parentId": null,
      "children": []
    }
  ]
}
```

#### 4. 标签数据

**{tagId}.json**
```json
{
  "id": "tag-uuid-1",
  "userId": "user-uuid",
  "name": "重要",
  "color": "#10a37f",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**tags/index.json**
```json
{
  "userId": "user-uuid",
  "tags": [
    {
      "id": "tag-uuid-1",
      "name": "重要",
      "color": "#10a37f"
    },
    {
      "id": "tag-uuid-2",
      "name": "待办",
      "color": "#f59e0b"
    }
  ]
}
```

#### 5. 附件数据

**attachments/index.json**
```json
{
  "userId": "user-uuid",
  "attachments": [
    {
      "id": "file-uuid-1",
      "filename": "截图.jpg",
      "fileSize": 102400,
      "mimeType": "image/jpeg",
      "noteId": "note-uuid-1",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": "file-uuid-2",
      "filename": "文档.pdf",
      "fileSize": 2048000,
      "mimeType": "application/pdf",
      "noteId": "note-uuid-2",
      "createdAt": "2024-01-02T00:00:00.000Z"
    }
  ]
}
```

### 索引文件设计原理

**为什么使用index.json索引文件？**

1. **查询性能优化**：
   - 列表展示无需遍历所有文件
   - 减少COS API调用次数（1次 vs N次）
   - 类似数据库索引的作用

2. **数据组织**：
   - index存储摘要信息（标题、时间、标签）
   - 单文件存储完整数据
   - 分离查询数据和详情数据

3. **更新策略**：
   - 主文件修改 → 更新单文件
   - 索引更新 → 防抖延迟更新（减少写入）

---

## 前端服务层设计

### SDK集成

#### 1. 安装腾讯云SDK

```bash
npm install cos-js-sdk-v5
npm install bcryptjs jsonwebtoken
```

#### 2. COS配置

**环境变量（.env.local）**
```env
VITE_COS_BUCKET=nebula-test-bucket
VITE_COS_REGION=ap-guangzhou
VITE_COS_SECRET_ID=your-secret-id-here
VITE_COS_SECRET_KEY=your-secret-key-here
VITE_DEFAULT_USER_ID=test-user-001
```

**注意：**
- `.env.local`不提交到git
- `.env.example`提供模板（不含真实密钥）

#### 3. COS客户端初始化

```typescript
import COS from 'cos-js-sdk-v5';

const cosClient = new COS({
  SecretId: import.meta.env.VITE_COS_SECRET_ID,
  SecretKey: import.meta.env.VITE_COS_SECRET_KEY,
});

const config = {
  bucket: import.meta.env.VITE_COS_BUCKET,
  region: import.meta.env.VITE_COS_REGION,
  userId: import.meta.env.VITE_DEFAULT_USER_ID,
};
```

### 服务接口设计

#### 1. COS基础服务

```typescript
interface COSService {
  getJSON(path: string): Promise<any>;
  putJSON(path: string, data: any): Promise<void>;
  deleteJSON(path: string): Promise<void>;
  uploadFile(path: string, file: File | Buffer): Promise<void>;
  downloadFile(path: string): Promise<Blob>;
  listObjects(prefix: string): Promise<string[]>;
  batchGet(paths: string[]): Promise<any[]>;
}
```

**实现示例：**
```typescript
class COSServiceImpl implements COSService {
  async getJSON(path: string): Promise<any> {
    const response = await cosClient.getObject({
      Bucket: config.bucket,
      Region: config.region,
      Key: path,
    });
    return JSON.parse(response.Body);
  }
  
  async putJSON(path: string, data: any): Promise<void> {
    await cosClient.putObject({
      Bucket: config.bucket,
      Region: config.region,
      Key: path,
      Body: JSON.stringify(data, null, 2),
      ContentType: 'application/json',
    });
  }
  
  async deleteJSON(path: string): Promise<void> {
    await cosClient.deleteObject({
      Bucket: config.bucket,
      Region: config.region,
      Key: path,
    });
  }
  
  async uploadFile(path: string, file: File): Promise<void> {
    await cosClient.putObject({
      Bucket: config.bucket,
      Region: config.region,
      Key: path,
      Body: file,
    });
  }
}
```

#### 2. 缓存服务

```typescript
class CacheService {
  private cache = new Map<string, CacheEntry>();
  
  async getWithCache(path: string, ttl = 30000): Promise<any> {
    const cached = this.cache.get(path);
    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.data;
    }
    
    const data = await cosService.getJSON(path);
    this.cache.set(path, { data, timestamp: Date.now() });
    return data;
  }
  
  invalidate(path: string): void {
    this.cache.delete(path);
  }
  
  clear(): void {
    this.cache.clear();
  }
}
```

### 业务服务实现

#### 1. Note服务改造

**原API调用：**
```typescript
// 原实现
const response = await axios.get('/api/v1/notes');
return response.data;
```

**新COS实现：**
```typescript
class NoteService {
  async fetchNotes(): Promise<NoteSummary[]> {
    const index = await cacheService.getWithCache(
      `users/${userId}/notes/index.json`,
      30000
    );
    return index.notes;
  }
  
  async fetchNote(noteId: string): Promise<Note> {
    return await cosService.getJSON(
      `users/${userId}/notes/${noteId}.json`
    );
  }
  
  async createNote(data: CreateNoteData): Promise<Note> {
    const noteId = generateUUID();
    const note = {
      id: noteId,
      userId: userId,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // 1. 创建笔记文件
    await cosService.putJSON(
      `users/${userId}/notes/${noteId}.json`,
      note
    );
    
    // 2. 更新索引（延迟更新）
    await this.updateIndex();
    
    return note;
  }
  
  async updateIndex(): Promise<void> {
    // 防抖：延迟更新索引，减少写入次数
    debounce(async () => {
      const allNotes = await this.listAllNotes();
      const index = {
        userId: userId,
        notes: allNotes.map(n => ({
          id: n.id,
          title: n.title,
          updatedAt: n.updatedAt,
          isPinned: n.isPinned,
          folderId: n.folderId,
          tags: n.tags,
        })),
      };
      await cosService.putJSON(
        `users/${userId}/notes/index.json`,
        index
      );
    }, 2000);
  }
}
```

#### 2. Folder服务改造

```typescript
class FolderService {
  async fetchFolders(): Promise<FolderTree> {
    return await cacheService.getWithCache(
      `users/${userId}/folders/tree.json`,
      60000
    );
  }
  
  async createFolder(data: CreateFolderData): Promise<Folder> {
    const folderId = generateUUID();
    const folder = {
      id: folderId,
      userId: userId,
      ...data,
      createdAt: new Date().toISOString(),
    };
    
    // 1. 创建文件夹文件
    await cosService.putJSON(
      `users/${userId}/folders/${folderId}.json`,
      folder
    );
    
    // 2. 更新树形结构
    await this.updateTree();
    
    return folder;
  }
  
  async updateTree(): Promise<void> {
    const allFolders = await this.listAllFolders();
    const tree = this.buildTree(allFolders);
    
    await cosService.putJSON(
      `users/${userId}/folders/tree.json`,
      { userId, tree }
    );
  }
}
```

#### 3. Auth服务改造

**本地认证方案：**

```typescript
class AuthService {
  async login(email: string, password: string): Promise<LoginResult> {
    // 1. 读取用户profile
    const userId = this.deriveUserIdFromEmail(email);
    const profile = await cosService.getJSON(
      `users/${userId}/profile.json`
    );
    
    // 2. 验证密码
    if (profile.email !== email) {
      throw new Error('用户不存在');
    }
    
    const isValid = await bcrypt.compare(password, profile.passwordHash);
    if (!isValid) {
      throw new Error('密码错误');
    }
    
    // 3. 生成JWT token
    const token = jwt.sign(
      { userId, email },
      'test-secret-key', // 测试环境硬编码
      { expiresIn: '7d' }
    );
    
    return { token, user: profile };
  }
  
  async register(data: RegisterData): Promise<User> {
    const userId = generateUUID();
    
    // 1. 检查用户是否存在
    try {
      await cosService.getJSON(`users/${userId}/profile.json`);
      throw new Error('用户已存在');
    } catch {
      // 用户不存在，继续注册
    }
    
    // 2. 创建用户数据
    const passwordHash = await bcrypt.hash(data.password, 10);
    const profile = {
      id: userId,
      email: data.email,
      passwordHash,
      nickname: data.nickname,
      createdAt: new Date().toISOString(),
    };
    
    // 3. 初始化默认数据
    await this.initializeUserData(userId, profile);
    
    return profile;
  }
  
  async initializeUserData(userId: string, profile: any): Promise<void> {
    // 1. 创建profile
    await cosService.putJSON(`users/${userId}/profile.json`, profile);
    
    // 2. 创建默认设置
    await cosService.putJSON(`users/${userId}/settings.json`, {
      userId,
      theme: 'dark',
      autoSave: true,
    });
    
    // 3. 创建默认文件夹
    const defaultFolderId = generateUUID();
    await cosService.putJSON(
      `users/${userId}/folders/${defaultFolderId}.json`,
      {
        id: defaultFolderId,
        userId,
        name: '我的笔记',
        parentId: null,
      }
    );
    
    await cosService.putJSON(`users/${userId}/folders/tree.json`, {
      userId,
      tree: [{ id: defaultFolderId, name: '我的笔记', children: [] }],
    });
    
    // 4. 创建空索引
    await cosService.putJSON(`users/${userId}/notes/index.json`, {
      userId,
      notes: [],
    });
    
    await cosService.putJSON(`users/${userId}/tags/index.json`, {
      userId,
      tags: [],
    });
    
    await cosService.putJSON(`users/${userId}/attachments/index.json`, {
      userId,
      attachments: [],
    });
    
    await cosService.putJSON(`users/${userId}/index.json`, {
      userId,
      notesCount: 0,
      foldersCount: 1,
      tagsCount: 0,
      attachmentsCount: 0,
    });
  }
}
```

---

## 数据迁移方案

### PostgreSQL数据导出

#### 1. 迁移脚本

**位置：** `scripts/migrate-postgres-to-cos.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateUser(userId: string) {
  // 1. 读取PostgreSQL数据
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const notes = await prisma.note.findMany({ 
    where: { userId },
    include: { tags: { include: { tag: true } } },
  });
  const folders = await prisma.folder.findMany({ where: { userId } });
  const tags = await prisma.tag.findMany({ where: { userId } });
  const attachments = await prisma.attachment.findMany({ where: { userId } });
  const versions = await prisma.noteVersion.findMany({
    where: { noteId: { in: notes.map(n => n.id) } },
  });
  
  // 2. 转换为JSON格式
  const profile = convertUserToProfile(user);
  const notesJSON = notes.map(convertNoteToJSON);
  const foldersJSON = folders.map(convertFolderToJSON);
  const tagsJSON = tags.map(convertTagToJSON);
  const attachmentsJSON = attachments.map(convertAttachmentToJSON);
  
  // 3. 生成索引
  const notesIndex = generateNotesIndex(notesJSON);
  const folderTree = buildFolderTree(foldersJSON);
  const tagsIndex = { userId, tags: tagsJSON };
  const attachmentsIndex = { userId, attachments: attachmentsJSON };
  
  // 4. 上传到COS
  await uploadToCOS(userId, {
    profile,
    notes: notesJSON,
    notesIndex,
    versions: groupVersions(versions),
    folders: foldersJSON,
    folderTree,
    tags: tagsJSON,
    tagsIndex,
    attachments: attachmentsJSON,
    attachmentsIndex,
  });
  
  console.log(`Migration completed for user ${userId}`);
}
```

#### 2. 数据转换函数

```typescript
function convertNoteToJSON(note: NoteDB): NoteJSON {
  return {
    id: note.id,
    userId: note.userId,
    folderId: note.folderId,
    title: note.title,
    content: note.content,
    isPinned: note.isPinned,
    isDeleted: note.isDeleted,
    deletedAt: note.deletedAt?.toISOString(),
    version: note.version,
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt.toISOString(),
    tags: note.tags.map(nt => nt.tagId),
  };
}

function generateNotesIndex(notes: NoteJSON[]): NotesIndex {
  const activeNotes = notes.filter(n => !n.isDeleted);
  return {
    userId: userId,
    notes: activeNotes
      .map(n => ({
        id: n.id,
        title: n.title,
        updatedAt: n.updatedAt,
        isPinned: n.isPinned,
        folderId: n.folderId,
        tags: n.tags,
      }))
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
  };
}
```

#### 3. COS上传

```typescript
async function uploadToCOS(userId: string, data: MigrationData) {
  // Profile
  await cosService.putJSON(`users/${userId}/profile.json`, data.profile);
  
  // Notes
  for (const note of data.notes) {
    await cosService.putJSON(`users/${userId}/notes/${note.id}.json`, note);
    
    // Versions
    if (data.versions[note.id]) {
      await cosService.putJSON(
        `users/${userId}/notes/${note.id}.versions.json`,
        { noteId: note.id, versions: data.versions[note.id] }
      );
    }
  }
  await cosService.putJSON(`users/${userId}/notes/index.json`, data.notesIndex);
  
  // Folders
  for (const folder of data.folders) {
    await cosService.putJSON(`users/${userId}/folders/${folder.id}.json`, folder);
  }
  await cosService.putJSON(`users/${userId}/folders/tree.json`, data.folderTree);
  
  // Tags
  for (const tag of data.tags) {
    await cosService.putJSON(`users/${userId}/tags/${tag.id}.json`, tag);
  }
  await cosService.putJSON(`users/${userId}/tags/index.json`, data.tagsIndex);
  
  // Attachments
  for (const attachment of data.attachments) {
    const fileBuffer = fs.readFileSync(attachment.filePath);
    await cosClient.putObject({
      Bucket: config.bucket,
      Region: config.region,
      Key: `users/${userId}/attachments/${attachment.id}`,
      Body: fileBuffer,
    });
  }
  await cosService.putJSON(`users/${userId}/attachments/index.json`, data.attachmentsIndex);
}
```

### 迁移验证

```typescript
async function verifyMigration(userId: string) {
  // 1. 检查文件数量
  const profile = await cosService.getJSON(`users/${userId}/profile.json`);
  assert(profile.id === userId);
  
  const notesIndex = await cosService.getJSON(`users/${userId}/notes/index.json`);
  const expectedNotesCount = await prisma.note.count({ where: { userId } });
  assert(notesIndex.notes.length === expectedNotesCount);
  
  // 2. 检查数据一致性
  const firstNote = await cosService.getJSON(
    `users/${userId}/notes/${notesIndex.notes[0].id}.json`
  );
  const dbNote = await prisma.note.findUnique({
    where: { id: firstNote.id },
  });
  assert(firstNote.title === dbNote.title);
  
  console.log('Migration verification passed!');
}
```

---

## 前端改造实施

### 文件变更清单

#### 移除文件

```
backend/                             # 整个后端目录删除
```

#### 新增文件

```
frontend/src/
  services/
    cos.service.ts                   # COS基础操作
    cache.service.ts                 # 前端缓存
    auth.service.ts                  # 本地认证（重写）
    note.service.ts                  # 笔记服务（重写）
    folder.service.ts                # 文件夹服务（重写）
    tag.service.ts                   # 标签服务（重写）
    attachment.service.ts            # 附件服务（重写）
  utils/
    uuid.ts                          # UUID生成
    debounce.ts                      # 防抖工具
```

#### 修改文件

```
frontend/src/
  store/
    auth.store.ts                    # 移除API调用
    note.store.ts                    # 移除API调用
    folder.store.ts                  # 移除API调用
    tag.store.ts                     # 移除API调用
  services/
    api.ts                           # 移除（不再需要axios）
```

#### 配置文件

```
frontend/
  .env.local                         # 新增：COS密钥配置
  .env.example                       # 新增：配置模板
  vite.config.ts                     # 移除proxy配置
  package.json                       # 移除axios，新增cos-sdk
```

### 依赖变更

**移除依赖：**
```json
{
  "axios": "不再需要HTTP请求"
}
```

**新增依赖：**
```json
{
  "cos-js-sdk-v5": "^latest",
  "bcryptjs": "^2.4.3",
  "jsonwebtoken": "^9.0.0"
}
```

### Store层适配

**改造策略：**
- 保持Zustand store接口不变
- 替换内部API调用为COS操作
- 添加本地缓存状态

**示例改造：**

```typescript
// 原 auth.store.ts
login: async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  const { user, accessToken } = response.data.data;
  set({ user, accessToken, isAuthenticated: true });
}

// 新 auth.store.ts
login: async (email, password) => {
  const result = await authService.login(email, password);
  const { user, token } = result;
  set({ user, accessToken: token, isAuthenticated: true });
  localStorage.setItem('accessToken', token);
}
```

---

## 测试计划

### 功能测试

| 功能 | 测试内容 | 验证方法 |
|------|---------|---------|
| 用户注册 | 创建profile.json | COS中存在文件 |
| 用户登录 | 验证密码hash | JWT token有效 |
| 笔记列表 | 加载notes/index.json | 显示列表 |
| 笔记详情 | 加载单个笔记文件 | 内容正确 |
| 创建笔记 | 写入文件+更新索引 | 文件存在 |
| 编辑笔记 | 更新文件内容 | 内容更新 |
| 删除笔记 | 标记deleted+更新索引 | 状态正确 |
| 文件夹树 | 加载tree.json | 树形展示 |
| 标签管理 | 加载tags/index.json | 标签列表 |
| 附件上传 | 上传文件到COS | 文件可访问 |
| 版本历史 | 加载versions.json | 显示历史 |
| 刷新页面 | 重新加载数据 | 数据完整 |

### 性能测试

| 操作 | 目标响应时间 | 测试条件 |
|------|------------|---------|
| 加载笔记列表 | < 500ms | index.json（10笔记） |
| 加载单个笔记 | < 300ms | 单文件读取 |
| 创建笔记 | < 400ms | 写入+更新索引 |
| 上传附件(1MB) | < 2s | COS上传 |
| 批量加载(10笔记) | < 1s | 并发读取 |

### 安全验证（测试环境）

**验证项：**
- ✅ 密钥存储在.env.local，不提交git
- ✅ .gitignore包含.env.local
- ✅ 使用子账号密钥，权限受限
- ✅ 密码bcrypt加密存储
- ✅ JWT token有效期限制

---

## 安全配置指南

### 腾讯云CAM配置

#### 1. 创建子账号

**步骤：**
1. 登录腾讯云CAM控制台
2. 创建子用户，授予"只读写特定bucket"权限
3. 记录SecretId和SecretKey

#### 2. 权限策略示例

```json
{
  "version": "2.0",
  "statement": [
    {
      "effect": "allow",
      "action": [
        "cos:GetObject",
        "cos:PutObject",
        "cos:DeleteObject",
        "cos:ListBucket"
      ],
      "resource": [
        "qcs::cos:ap-guangzhou:uid/1250000000:nebula-test-bucket/users/test-user-001/*"
      ]
    }
  ]
}
```

**关键点：**
- 仅授予读写权限，不给管理权限
- 限制到特定路径（`users/{userId}/*`）
- 不同测试用户使用不同子账号密钥

### 前端密钥管理

**.env.local**
```env
VITE_COS_SECRET_ID=AKIDxxxxxxxxxxxxxx
VITE_COS_SECRET_KEY=xxxxxxxxxxxxxxxxxx
```

**.gitignore**
```gitignore
.env.local
.env.*.local
```

**.env.example**
```env
VITE_COS_BUCKET=your-bucket-name
VITE_COS_REGION=ap-guangzhou
VITE_COS_SECRET_ID=your-secret-id-here
VITE_COS_SECRET_KEY=your-secret-key-here
VITE_DEFAULT_USER_ID=test-user-001
```

---

## 风险与应对

### 潜在问题

#### 1. 数据丢失风险

**风险：** COS误删文件，数据无法恢复

**应对：**
- 定期备份：`backups/{userId}/{timestamp}.json`
- 启用COS版本控制功能
- 重要数据本地保留副本

#### 2. 性能问题

**风险：** 列表查询慢，大量文件遍历慢

**应对：**
- 使用index.json索引
- 前端内存缓存（30秒TTL）
- 防抖更新索引（减少写入）

#### 3. 网络依赖

**风险：** 必须联网，离线不可用

**应对：**
- 测试环境接受网络依赖
- Electron版本可本地缓存（未来扩展）

#### 4. 并发冲突（单用户无此问题）

**风险：** 多用户同时修改同一文件

**应对：**
- 测试环境单用户，无并发
- 未来扩展：使用updatedAt乐观锁

#### 5. 密钥泄露

**风险：** 前端密钥暴露，数据被盗

**应对：**
- 仅用于测试环境
- 使用子账号密钥，权限受限
- 定期更换密钥

### 备份策略

**手动备份：**
```typescript
async function createBackup(userId: string) {
  const timestamp = Date.now();
  
  // 1. 读取所有数据
  const profile = await cosService.getJSON(`users/${userId}/profile.json`);
  const notesIndex = await cosService.getJSON(`users/${userId}/notes/index.json`);
  const folderTree = await cosService.getJSON(`users/${userId}/folders/tree.json`);
  
  // 2. 批量读取笔记
  const notes = await Promise.all(
    notesIndex.notes.map(n => 
      cosService.getJSON(`users/${userId}/notes/${n.id}.json`)
    )
  );
  
  // 3. 组合备份数据
  const backupData = {
    timestamp,
    profile,
    notes,
    folders: folderTree.tree,
  };
  
  // 4. 上传备份
  await cosService.putJSON(
    `backups/${userId}/${timestamp}.json`,
    backupData
  );
  
  console.log('Backup created:', timestamp);
}
```

---

## 实施步骤

### Phase 1: 准备阶段

1. 配置腾讯云COS bucket
2. 创建CAM子账号，获取密钥
3. 安装前端依赖（cos-js-sdk-v5）
4. 配置.env.local环境变量

### Phase 2: 数据迁移

1. 编写迁移脚本
2. 导出PostgreSQL数据
3. 转换为JSON格式
4. 上传到COS
5. 验证数据完整性

### Phase 3: 前端改造

1. 创建COS Service层
2. 实现缓存Service
3. 改造Auth Service
4. 改造Note/Folder/Tag Service
5. 移除API层依赖
6. 更新Store调用

### Phase 4: 测试验证

1. 功能测试：所有操作正常
2. 性能测试：响应时间达标
3. 安全检查：密钥配置正确
4. 数据验证：迁移数据完整

### Phase 5: 清理阶段

1. 移除backend目录
2. 移除PostgreSQL/Redis
3. 更新README文档
4. 更新ARCHITECTURE.md

---

## 成功标准

### 功能完整性

- ✅ 用户注册/登录功能正常
- ✅ 笔记CRUD操作正常
- ✅ 文件夹管理功能正常
- ✅ 标签管理功能正常
- ✅ 附件上传下载正常
- ✅ 版本历史功能正常
- ✅ 数据刷新同步正常

### 性能达标

- ✅ 笔记列表加载 < 500ms
- ✅ 单笔记加载 < 300ms
- ✅ 创建笔记 < 400ms

### 数据完整性

- ✅ PostgreSQL数据完整迁移
- ✅ 所有JSON文件结构正确
- ✅ 索引文件与实际数据一致

### 安全合规（测试环境）

- ✅ 密钥存储在环境变量
- ✅ .gitignore正确配置
- ✅ 使用子账号受限权限

---

## 附录：原数据模型对照

### PostgreSQL Schema vs COS JSON对照表

| PostgreSQL Model | COS JSON File | 说明 |
|------------------|---------------|------|
| User | profile.json | 用户基本信息 |
| UserSettings | settings.json | 用户设置 |
| Note | {noteId}.json | 单个笔记 |
| NoteVersion | {noteId}.versions.json | 版本历史 |
| Folder | {folderId}.json | 单个文件夹 |
| - | folders/tree.json | 文件夹树（新增） |
| Tag | {tagId}.json | 单个标签 |
| NoteTag | note.tags[] | 笔记内嵌标签ID |
| Attachment | attachments/index.json | 附件元数据 |
| Attachment.file | attachments/{fileId} | 附件文件 |

---

**文档完成日期：** 2026-05-07  
**适用环境：** 个人测试/学习  
**警告：** 本方案不可用于生产环境