# PostgreSQL迁移至腾讯云COS实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将Nebula笔记系统从PostgreSQL+NestJS架构迁移至纯静态前端+腾讯云COS架构

**Architecture:** 移除后端和数据库，前端直接使用腾讯云SDK操作COS对象存储，所有数据以JSON文件形式存储

**Tech Stack:** React 18, Zustand, cos-js-sdk-v5, bcryptjs, jsonwebtoken, 腾讯云COS

---

## 并行执行策略

本项目可分解为5个相对独立的子项目，支持并行执行：

| 子项目 | 依赖 | 可并行 |
|--------|------|--------|
| A. COS SDK集成和基础服务 | 无 | ✅ 独立 |
| B. 认证系统改造 | A | ✅ 与C/D并行 |
| C. 业务服务改造 | A | ✅ 与B/D并行 |
| D. 数据迁移工具 | 无 | ✅ 独立 |
| E. 清理和配置 | A/B/C/D | ❌ 最后执行 |

---

## 子项目A：COS SDK集成和基础服务

### Task A1: 安装依赖和配置环境

**Files:**
- Modify: `frontend/package.json`
- Create: `frontend/.env.local`
- Create: `frontend/.env.example`
- Modify: `frontend/.gitignore`

- [ ] **Step 1: 安装新依赖**

Run:
```bash
cd frontend
npm install cos-js-sdk-v5 bcryptjs jsonwebtoken
npm uninstall axios
```

- [ ] **Step 2: 创建环境配置文件**

Create `frontend/.env.example`:
```env
VITE_COS_BUCKET=your-bucket-name
VITE_COS_REGION=ap-guangzhou
VITE_COS_SECRET_ID=your-secret-id-here
VITE_COS_SECRET_KEY=your-secret-key-here
VITE_DEFAULT_USER_ID=test-user-001
```

Create `frontend/.env.local` (not committed):
```env
VITE_COS_BUCKET=nebula-test-bucket
VITE_COS_REGION=ap-guangzhou
VITE_COS_SECRET_ID=AKIDxxxxxxxxxxxxxx
VITE_COS_SECRET_KEY=xxxxxxxxxxxxxxxxxx
VITE_DEFAULT_USER_ID=test-user-001
```

- [ ] **Step 3: 更新.gitignore**

Add to `frontend/.gitignore`:
```
.env.local
.env.*.local
```

- [ ] **Step 4: Commit**

```bash
git add frontend/package.json frontend/.env.example frontend/.gitignore
git commit -m "feat: add COS SDK dependencies and environment config"
```

---

### Task A2: 创建COS基础服务

**Files:**
- Create: `frontend/src/services/cos.service.ts`
- Create: `frontend/src/services/cache.service.ts`
- Create: `frontend/src/utils/uuid.ts`

- [ ] **Step 1: 创建UUID工具**

Create `frontend/src/utils/uuid.ts`:
```typescript
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
```

- [ ] **Step 2: 创建COS服务**

Create `frontend/src/services/cos.service.ts`:
```typescript
import COS from 'cos-js-sdk-v5';

interface COSConfig {
  bucket: string;
  region: string;
  secretId: string;
  secretKey: string;
}

const config: COSConfig = {
  bucket: import.meta.env.VITE_COS_BUCKET,
  region: import.meta.env.VITE_COS_REGION,
  secretId: import.meta.env.VITE_COS_SECRET_ID,
  secretKey: import.meta.env.VITE_COS_SECRET_KEY,
};

const cosClient = new COS({
  SecretId: config.secretId,
  SecretKey: config.secretKey,
});

export interface COSService {
  getJSON(path: string): Promise<any>;
  putJSON(path: string, data: any): Promise<void>;
  deleteJSON(path: string): Promise<void>;
  uploadFile(path: string, file: File): Promise<void>;
  downloadFile(path: string): Promise<Blob>;
  listObjects(prefix: string): Promise<string[]>;
}

export const cosService: COSService = {
  async getJSON(path: string): Promise<any> {
    const response = await cosClient.getObject({
      Bucket: config.bucket,
      Region: config.region,
      Key: path,
    });
    return JSON.parse(response.Body);
  },

  async putJSON(path: string, data: any): Promise<void> {
    await cosClient.putObject({
      Bucket: config.bucket,
      Region: config.region,
      Key: path,
      Body: JSON.stringify(data, null, 2),
      ContentType: 'application/json',
    });
  },

  async deleteJSON(path: string): Promise<void> {
    await cosClient.deleteObject({
      Bucket: config.bucket,
      Region: config.region,
      Key: path,
    });
  },

  async uploadFile(path: string, file: File): Promise<void> {
    await cosClient.putObject({
      Bucket: config.bucket,
      Region: config.region,
      Key: path,
      Body: file,
    });
  },

  async downloadFile(path: string): Promise<Blob> {
    const response = await cosClient.getObject({
      Bucket: config.bucket,
      Region: config.region,
      Key: path,
    });
    return response.Body;
  },

  async listObjects(prefix: string): Promise<string[]> {
    const response = await cosClient.getBucket({
      Bucket: config.bucket,
      Region: config.region,
      Prefix: prefix,
    });
    return response.Contents?.map((item) => item.Key) || [];
  },
};
```

- [ ] **Step 3: 创建缓存服务**

Create `frontend/src/services/cache.service.ts`:
```typescript
interface CacheEntry {
  data: any;
  timestamp: number;
}

class CacheService {
  private cache = new Map<string, CacheEntry>();

  async getWithCache(
    fetchFn: () => Promise<any>,
    key: string,
    ttl = 30000
  ): Promise<any> {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.data;
    }

    const data = await fetchFn();
    this.cache.set(key, { data, timestamp: Date.now() });
    return data;
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }
}

export const cacheService = new CacheService();
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/services/cos.service.ts frontend/src/services/cache.service.ts frontend/src/utils/uuid.ts
git commit -m "feat: create COS service and cache service"
```

---

## 子项目B：认证系统改造

### Task B1: 重写认证服务

**Files:**
- Create: `frontend/src/services/auth.service.ts`
- Modify: `frontend/src/store/auth.store.ts`

- [ ] **Step 1: 创建本地认证服务**

Create `frontend/src/services/auth.service.ts`:
```typescript
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cosService } from './cos.service';
import { generateUUID } from '../utils/uuid';

const JWT_SECRET = 'test-secret-key-do-not-use-in-production';
const JWT_EXPIRES_IN = '7d';

export interface User {
  id: string;
  email: string;
  nickname?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface LoginResult {
  token: string;
  user: User;
}

export interface RegisterData {
  email: string;
  password: string;
  nickname?: string;
}

export class AuthService {
  private getUserId(email: string): string {
    return import.meta.env.VITE_DEFAULT_USER_ID || `user-${email}`;
  }

  async login(email: string, password: string): Promise<LoginResult> {
    const userId = this.getUserId(email);
    
    try {
      const profile = await cosService.getJSON(`users/${userId}/profile.json`);
      
      if (profile.email !== email) {
        throw new Error('用户不存在');
      }

      const isValid = await bcrypt.compare(password, profile.passwordHash);
      if (!isValid) {
        throw new Error('密码错误');
      }

      const token = jwt.sign(
        { userId, email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      return {
        token,
        user: {
          id: profile.id,
          email: profile.email,
          nickname: profile.nickname,
          avatarUrl: profile.avatarUrl,
          createdAt: profile.createdAt,
        },
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('登录失败');
    }
  }

  async register(data: RegisterData): Promise<User> {
    const userId = generateUUID();

    const passwordHash = await bcrypt.hash(data.password, 10);
    const profile = {
      id: userId,
      email: data.email,
      passwordHash,
      nickname: data.nickname,
      createdAt: new Date().toISOString(),
    };

    await this.initializeUserData(userId, profile);

    return {
      id: profile.id,
      email: profile.email,
      nickname: profile.nickname,
      createdAt: profile.createdAt,
    };
  }

  private async initializeUserData(userId: string, profile: any): Promise<void> {
    await cosService.putJSON(`users/${userId}/profile.json`, profile);

    await cosService.putJSON(`users/${userId}/settings.json`, {
      userId,
      theme: 'dark',
      editorFontSize: 16,
      autoSave: true,
      autoSaveInterval: 30,
    });

    const defaultFolderId = generateUUID();
    await cosService.putJSON(`users/${userId}/folders/${defaultFolderId}.json`, {
      id: defaultFolderId,
      userId,
      name: '我的笔记',
      parentId: null,
      sortOrder: 0,
      createdAt: new Date().toISOString(),
    });

    await cosService.putJSON(`users/${userId}/folders/tree.json`, {
      userId,
      tree: [{
        id: defaultFolderId,
        name: '我的笔记',
        parentId: null,
        children: [],
      }],
    });

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
      lastSync: new Date().toISOString(),
      version: 1,
    });
  }
}

export const authService = new AuthService();
```

- [ ] **Step 2: 修改auth.store.ts**

Modify `frontend/src/store/auth.store.ts`:
```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { authService, User } from '../services/auth.service';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, nickname?: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        const result = await authService.login(email, password);
        set({
          user: result.user,
          accessToken: result.token,
          isAuthenticated: true,
        });
        localStorage.setItem('accessToken', result.token);
      },

      register: async (email: string, password: string, nickname?: string) => {
        const user = await authService.register({ email, password, nickname });
        const result = await authService.login(email, password);
        set({
          user: result.user,
          accessToken: result.token,
          isAuthenticated: true,
        });
        localStorage.setItem('accessToken', result.token);
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
        });
        localStorage.removeItem('accessToken');
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/services/auth.service.ts frontend/src/store/auth.store.ts
git commit -m "feat: implement local authentication with bcrypt and JWT"
```

---

## 子项目C：业务服务改造

### Task C1: 重写笔记服务

**Files:**
- Create: `frontend/src/services/note.service.ts`
- Modify: `frontend/src/store/note.store.ts`

- [ ] **Step 1: 创建笔记服务**

Create `frontend/src/services/note.service.ts`:
```typescript
import { cosService } from './cos.service';
import { cacheService } from './cache.service';
import { generateUUID } from '../utils/uuid';

export interface Note {
  id: string;
  userId: string;
  folderId: string | null;
  title: string;
  content: string | null;
  isPinned: boolean;
  isDeleted: boolean;
  deletedAt: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

export interface NoteSummary {
  id: string;
  title: string;
  updatedAt: string;
  isPinned: boolean;
  folderId: string | null;
  tags: string[];
}

export interface CreateNoteData {
  title: string;
  content?: string;
  folderId?: string | null;
}

export interface UpdateNoteData {
  title?: string;
  content?: string;
  folderId?: string | null;
  isPinned?: boolean;
}

const userId = import.meta.env.VITE_DEFAULT_USER_ID || 'test-user-001';

export class NoteService {
  async fetchNotes(): Promise<NoteSummary[]> {
    const index = await cacheService.getWithCache(
      () => cosService.getJSON(`users/${userId}/notes/index.json`),
      `notes-index-${userId}`,
      30000
    );
    return index.notes || [];
  }

  async fetchNote(noteId: string): Promise<Note> {
    return await cosService.getJSON(`users/${userId}/notes/${noteId}.json`);
  }

  async createNote(data: CreateNoteData): Promise<Note> {
    const noteId = generateUUID();
    const now = new Date().toISOString();
    
    const note: Note = {
      id: noteId,
      userId,
      folderId: data.folderId || null,
      title: data.title,
      content: data.content || null,
      isPinned: false,
      isDeleted: false,
      deletedAt: null,
      version: 1,
      createdAt: now,
      updatedAt: now,
      tags: [],
    };

    await cosService.putJSON(`users/${userId}/notes/${noteId}.json`, note);
    await this.updateIndex();

    return note;
  }

  async updateNote(noteId: string, data: UpdateNoteData): Promise<Note> {
    const note = await this.fetchNote(noteId);
    const updatedNote = {
      ...note,
      ...data,
      updatedAt: new Date().toISOString(),
      version: note.version + 1,
    };

    await cosService.putJSON(`users/${userId}/notes/${noteId}.json`, updatedNote);
    await this.updateIndex();

    return updatedNote;
  }

  async deleteNote(noteId: string): Promise<void> {
    const note = await this.fetchNote(noteId);
    const deletedNote = {
      ...note,
      isDeleted: true,
      deletedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await cosService.putJSON(`users/${userId}/notes/${noteId}.json`, deletedNote);
    await this.updateIndex();
  }

  private async updateIndex(): Promise<void> {
    const allNotes = await this.listAllNotes();
    const activeNotes = allNotes.filter((n) => !n.isDeleted);
    
    const index = {
      userId,
      notes: activeNotes
        .map((n) => ({
          id: n.id,
          title: n.title,
          updatedAt: n.updatedAt,
          isPinned: n.isPinned,
          folderId: n.folderId,
          tags: n.tags,
        }))
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        ),
    };

    await cosService.putJSON(`users/${userId}/notes/index.json`, index);
    cacheService.invalidate(`notes-index-${userId}`);
  }

  private async listAllNotes(): Promise<Note[]> {
    const index = await cosService.getJSON(`users/${userId}/notes/index.json`);
    const notes = await Promise.all(
      (index.notes || []).map((n: NoteSummary) => this.fetchNote(n.id))
    );
    return notes;
  }
}

export const noteService = new NoteService();
```

- [ ] **Step 2: 修改note.store.ts**

Modify `frontend/src/store/note.store.ts` to use new noteService:
```typescript
import { create } from 'zustand';
import { noteService, Note, NoteSummary } from '../services/note.service';

interface NoteState {
  notes: NoteSummary[];
  currentNote: Note | null;
  loading: boolean;
  fetchNotes: () => Promise<void>;
  fetchNote: (id: string) => Promise<void>;
  createNote: (data: { title: string; content?: string }) => Promise<Note>;
  updateNote: (id: string, data: { title?: string; content?: string }) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
}

export const useNoteStore = create<NoteState>((set, get) => ({
  notes: [],
  currentNote: null,
  loading: false,

  fetchNotes: async () => {
    set({ loading: true });
    try {
      const notes = await noteService.fetchNotes();
      set({ notes });
    } finally {
      set({ loading: false });
    }
  },

  fetchNote: async (id: string) => {
    set({ loading: true });
    try {
      const note = await noteService.fetchNote(id);
      set({ currentNote: note });
    } finally {
      set({ loading: false });
    }
  },

  createNote: async (data) => {
    const note = await noteService.createNote(data);
    await get().fetchNotes();
    return note;
  },

  updateNote: async (id, data) => {
    await noteService.updateNote(id, data);
    await get().fetchNotes();
    if (get().currentNote?.id === id) {
      await get().fetchNote(id);
    }
  },

  deleteNote: async (id) => {
    await noteService.deleteNote(id);
    await get().fetchNotes();
    if (get().currentNote?.id === id) {
      set({ currentNote: null });
    }
  },
}));
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/services/note.service.ts frontend/src/store/note.store.ts
git commit -m "feat: implement note service with COS storage"
```

---

### Task C2: 重写文件夹和标签服务

**Files:**
- Create: `frontend/src/services/folder.service.ts`
- Create: `frontend/src/services/tag.service.ts`
- Modify: `frontend/src/store/folder.store.ts`
- Modify: `frontend/src/store/tag.store.ts`

- [ ] **Step 1: 创建文件夹服务**

Create `frontend/src/services/folder.service.ts`:
```typescript
import { cosService } from './cos.service';
import { cacheService } from './cache.service';
import { generateUUID } from '../utils/uuid';

export interface Folder {
  id: string;
  userId: string;
  name: string;
  parentId: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface FolderTree {
  id: string;
  name: string;
  parentId: string | null;
  children: FolderTree[];
}

const userId = import.meta.env.VITE_DEFAULT_USER_ID || 'test-user-001';

export class FolderService {
  async fetchFolders(): Promise<FolderTree[]> {
    const tree = await cacheService.getWithCache(
      () => cosService.getJSON(`users/${userId}/folders/tree.json`),
      `folders-tree-${userId}`,
      60000
    );
    return tree.tree || [];
  }

  async createFolder(data: { name: string; parentId?: string | null }): Promise<Folder> {
    const folderId = generateUUID();
    const now = new Date().toISOString();

    const folder: Folder = {
      id: folderId,
      userId,
      name: data.name,
      parentId: data.parentId || null,
      sortOrder: 0,
      createdAt: now,
      updatedAt: now,
    };

    await cosService.putJSON(`users/${userId}/folders/${folderId}.json`, folder);
    await this.updateTree();

    return folder;
  }

  async updateFolder(folderId: string, data: { name?: string }): Promise<Folder> {
    const folder = await cosService.getJSON(`users/${userId}/folders/${folderId}.json`);
    const updatedFolder = {
      ...folder,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    await cosService.putJSON(`users/${userId}/folders/${folderId}.json`, updatedFolder);
    await this.updateTree();

    return updatedFolder;
  }

  async deleteFolder(folderId: string): Promise<void> {
    await cosService.deleteJSON(`users/${userId}/folders/${folderId}.json`);
    await this.updateTree();
  }

  private async updateTree(): Promise<void> {
    const allFolders = await this.listAllFolders();
    const tree = this.buildTree(allFolders);

    await cosService.putJSON(`users/${userId}/folders/tree.json`, {
      userId,
      tree,
    });
    cacheService.invalidate(`folders-tree-${userId}`);
  }

  private async listAllFolders(): Promise<Folder[]> {
    const keys = await cosService.listObjects(`users/${userId}/folders/`);
    const folderKeys = keys.filter(
      (k) => k.endsWith('.json') && !k.includes('tree.json')
    );
    const folders = await Promise.all(
      folderKeys.map((k) => cosService.getJSON(k))
    );
    return folders;
  }

  private buildTree(folders: Folder[]): FolderTree[] {
    const folderMap = new Map<string, FolderTree>();
    const roots: FolderTree[] = [];

    folders.forEach((f) => {
      folderMap.set(f.id, {
        id: f.id,
        name: f.name,
        parentId: f.parentId,
        children: [],
      });
    });

    folderMap.forEach((node) => {
      if (node.parentId && folderMap.has(node.parentId)) {
        folderMap.get(node.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }
}

export const folderService = new FolderService();
```

- [ ] **Step 2: 创建标签服务**

Create `frontend/src/services/tag.service.ts`:
```typescript
import { cosService } from './cos.service';
import { cacheService } from './cache.service';
import { generateUUID } from '../utils/uuid';

export interface Tag {
  id: string;
  userId: string;
  name: string;
  color: string;
  createdAt: string;
}

const userId = import.meta.env.VITE_DEFAULT_USER_ID || 'test-user-001';

export class TagService {
  async fetchTags(): Promise<Tag[]> {
    const index = await cacheService.getWithCache(
      () => cosService.getJSON(`users/${userId}/tags/index.json`),
      `tags-index-${userId}`,
      60000
    );
    return index.tags || [];
  }

  async createTag(data: { name: string; color?: string }): Promise<Tag> {
    const tagId = generateUUID();
    const tag: Tag = {
      id: tagId,
      userId,
      name: data.name,
      color: data.color || '#6B7280',
      createdAt: new Date().toISOString(),
    };

    await this.updateTagInIndex(tag, 'add');
    return tag;
  }

  async updateTag(tagId: string, data: { name?: string; color?: string }): Promise<Tag> {
    const tag = await cosService.getJSON(`users/${userId}/tags/${tagId}.json`);
    const updatedTag = { ...tag, ...data };

    await cosService.putJSON(`users/${userId}/tags/${tagId}.json`, updatedTag);
    await this.updateTagInIndex(updatedTag, 'update');

    return updatedTag;
  }

  async deleteTag(tagId: string): Promise<void> {
    await cosService.deleteJSON(`users/${userId}/tags/${tagId}.json`);
    await this.updateTagInIndex({ id: tagId }, 'remove');
  }

  private async updateTagInIndex(
    tag: Partial<Tag>,
    action: 'add' | 'update' | 'remove'
  ): Promise<void> {
    const index = await cosService.getJSON(`users/${userId}/tags/index.json`);
    let tags = index.tags || [];

    if (action === 'add') {
      tags.push(tag as Tag);
    } else if (action === 'update') {
      tags = tags.map((t: Tag) => (t.id === tag.id ? { ...t, ...tag } : t));
    } else {
      tags = tags.filter((t: Tag) => t.id !== tag.id);
    }

    await cosService.putJSON(`users/${userId}/tags/index.json`, {
      userId,
      tags,
    });
    cacheService.invalidate(`tags-index-${userId}`);
  }
}

export const tagService = new TagService();
```

- [ ] **Step 3: 修改folder.store.ts和tag.store.ts**

Modify `frontend/src/store/folder.store.ts`:
```typescript
import { create } from 'zustand';
import { folderService, FolderTree } from '../services/folder.service';

interface FolderState {
  folders: FolderTree[];
  loading: boolean;
  fetchFolders: () => Promise<void>;
  createFolder: (data: { name: string; parentId?: string }) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
}

export const useFolderStore = create<FolderState>((set, get) => ({
  folders: [],
  loading: false,

  fetchFolders: async () => {
    set({ loading: true });
    try {
      const folders = await folderService.fetchFolders();
      set({ folders });
    } finally {
      set({ loading: false });
    }
  },

  createFolder: async (data) => {
    await folderService.createFolder(data);
    await get().fetchFolders();
  },

  deleteFolder: async (id) => {
    await folderService.deleteFolder(id);
    await get().fetchFolders();
  },
}));
```

Modify `frontend/src/store/tag.store.ts`:
```typescript
import { create } from 'zustand';
import { tagService, Tag } from '../services/tag.service';

interface TagState {
  tags: Tag[];
  loading: boolean;
  fetchTags: () => Promise<void>;
  createTag: (data: { name: string; color?: string }) => Promise<void>;
  deleteTag: (id: string) => Promise<void>;
}

export const useTagStore = create<TagState>((set, get) => ({
  tags: [],
  loading: false,

  fetchTags: async () => {
    set({ loading: true });
    try {
      const tags = await tagService.fetchTags();
      set({ tags });
    } finally {
      set({ loading: false });
    }
  },

  createTag: async (data) => {
    await tagService.createTag(data);
    await get().fetchTags();
  },

  deleteTag: async (id) => {
    await tagService.deleteTag(id);
    await get().fetchTags();
  },
}));
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/services/folder.service.ts frontend/src/services/tag.service.ts frontend/src/store/folder.store.ts frontend/src/store/tag.store.ts
git commit -m "feat: implement folder and tag services with COS storage"
```

---

## 子项目D：数据迁移工具

### Task D1: 创建迁移脚本

**Files:**
- Create: `scripts/migrate-postgres-to-cos.ts`
- Create: `scripts/tsconfig.json`

- [ ] **Step 1: 创建迁移脚本配置**

Create `scripts/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "outDir": "./dist"
  },
  "include": ["*.ts"]
}
```

- [ ] **Step 2: 创建迁移脚本**

Create `scripts/migrate-postgres-to-cos.ts`:
```typescript
import { PrismaClient } from '@prisma/client';
import COS from 'cos-js-sdk-v5';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

const cosClient = new COS({
  SecretId: process.env.VITE_COS_SECRET_ID!,
  SecretKey: process.env.VITE_COS_SECRET_KEY!,
});

const config = {
  bucket: process.env.VITE_COS_BUCKET!,
  region: process.env.VITE_COS_REGION!,
};

async function migrateUser(userId: string) {
  console.log(`Migrating user: ${userId}`);

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    console.error(`User ${userId} not found`);
    return;
  }

  const notes = await prisma.note.findMany({
    where: { userId },
    include: { tags: { include: { tag: true } } },
  });

  const folders = await prisma.folder.findMany({ where: { userId } });
  const tags = await prisma.tag.findMany({ where: { userId } });
  const attachments = await prisma.attachment.findMany({ where: { userId } });
  const versions = await prisma.noteVersion.findMany({
    where: { noteId: { in: notes.map((n) => n.id) } },
  });

  await uploadProfile(user);
  await uploadSettings(user);
  await uploadNotes(notes, versions);
  await uploadFolders(folders);
  await uploadTags(tags);
  await uploadAttachments(attachments);

  console.log(`Migration completed for user ${userId}`);
}

async function uploadProfile(user: any) {
  const profile = {
    id: user.id,
    email: user.email,
    passwordHash: user.passwordHash,
    nickname: user.nickname,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };

  await cosClient.putObject({
    Bucket: config.bucket,
    Region: config.region,
    Key: `users/${user.id}/profile.json`,
    Body: JSON.stringify(profile, null, 2),
    ContentType: 'application/json',
  });
}

async function uploadSettings(user: any) {
  const settings = await prisma.userSettings.findUnique({
    where: { userId: user.id },
  });

  if (settings) {
    await cosClient.putObject({
      Bucket: config.bucket,
      Region: config.region,
      Key: `users/${user.id}/settings.json`,
      Body: JSON.stringify(
        {
          userId: user.id,
          theme: settings.theme,
          editorFontSize: settings.editorFontSize,
          autoSave: settings.autoSave,
          autoSaveInterval: settings.autoSaveInterval,
        },
        null,
        2
      ),
      ContentType: 'application/json',
    });
  }
}

async function uploadNotes(notes: any[], versions: any[]) {
  const versionsByNote = new Map<string, any[]>();
  versions.forEach((v) => {
    if (!versionsByNote.has(v.noteId)) {
      versionsByNote.set(v.noteId, []);
    }
    versionsByNote.get(v.noteId)!.push(v);
  });

  const notesIndex: any[] = [];

  for (const note of notes) {
    const noteData = {
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
      tags: note.tags.map((nt) => nt.tagId),
    };

    await cosClient.putObject({
      Bucket: config.bucket,
      Region: config.region,
      Key: `users/${note.userId}/notes/${note.id}.json`,
      Body: JSON.stringify(noteData, null, 2),
      ContentType: 'application/json',
    });

    const noteVersions = versionsByNote.get(note.id) || [];
    if (noteVersions.length > 0) {
      await cosClient.putObject({
        Bucket: config.bucket,
        Region: config.region,
        Key: `users/${note.userId}/notes/${note.id}.versions.json`,
        Body: JSON.stringify(
          {
            noteId: note.id,
            versions: noteVersions.map((v) => ({
              id: v.id,
              version: v.version,
              title: v.title,
              content: v.content,
              createdAt: v.createdAt.toISOString(),
            })),
          },
          null,
          2
        ),
        ContentType: 'application/json',
      });
    }

    if (!note.isDeleted) {
      notesIndex.push({
        id: note.id,
        title: note.title,
        updatedAt: note.updatedAt.toISOString(),
        isPinned: note.isPinned,
        folderId: note.folderId,
        tags: note.tags.map((nt) => nt.tagId),
      });
    }
  }

  await cosClient.putObject({
    Bucket: config.bucket,
    Region: config.region,
    Key: `users/${notes[0]?.userId}/notes/index.json`,
    Body: JSON.stringify(
      {
        userId: notes[0]?.userId,
        notes: notesIndex.sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        ),
      },
      null,
      2
    ),
    ContentType: 'application/json',
  });
}

async function uploadFolders(folders: any[]) {
  const tree = buildFolderTree(folders);

  for (const folder of folders) {
    await cosClient.putObject({
      Bucket: config.bucket,
      Region: config.region,
      Key: `users/${folder.userId}/folders/${folder.id}.json`,
      Body: JSON.stringify(
        {
          id: folder.id,
          userId: folder.userId,
          name: folder.name,
          parentId: folder.parentId,
          sortOrder: folder.sortOrder,
          createdAt: folder.createdAt.toISOString(),
          updatedAt: folder.updatedAt.toISOString(),
        },
        null,
        2
      ),
      ContentType: 'application/json',
    });
  }

  await cosClient.putObject({
    Bucket: config.bucket,
    Region: config.region,
    Key: `users/${folders[0]?.userId}/folders/tree.json`,
    Body: JSON.stringify({ userId: folders[0]?.userId, tree }, null, 2),
    ContentType: 'application/json',
  });
}

function buildFolderTree(folders: any[]): any[] {
  const folderMap = new Map<string, any>();
  const roots: any[] = [];

  folders.forEach((f) => {
    folderMap.set(f.id, {
      id: f.id,
      name: f.name,
      parentId: f.parentId,
      children: [],
    });
  });

  folderMap.forEach((node) => {
    if (node.parentId && folderMap.has(node.parentId)) {
      folderMap.get(node.parentId).children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}

async function uploadTags(tags: any[]) {
  for (const tag of tags) {
    await cosClient.putObject({
      Bucket: config.bucket,
      Region: config.region,
      Key: `users/${tag.userId}/tags/${tag.id}.json`,
      Body: JSON.stringify(
        {
          id: tag.id,
          userId: tag.userId,
          name: tag.name,
          color: tag.color,
          createdAt: tag.createdAt.toISOString(),
        },
        null,
        2
      ),
      ContentType: 'application/json',
    });
  }

  await cosClient.putObject({
    Bucket: config.bucket,
    Region: config.region,
    Key: `users/${tags[0]?.userId}/tags/index.json`,
    Body: JSON.stringify(
      {
        userId: tags[0]?.userId,
        tags: tags.map((t) => ({
          id: t.id,
          name: t.name,
          color: t.color,
        })),
      },
      null,
      2
    ),
    ContentType: 'application/json',
  });
}

async function uploadAttachments(attachments: any[]) {
  for (const attachment of attachments) {
    const filePath = path.resolve(attachment.filePath);
    if (fs.existsSync(filePath)) {
      const fileBuffer = fs.readFileSync(filePath);
      await cosClient.putObject({
        Bucket: config.bucket,
        Region: config.region,
        Key: `users/${attachment.userId}/attachments/${attachment.id}`,
        Body: fileBuffer,
      });
    }
  }

  await cosClient.putObject({
    Bucket: config.bucket,
    Region: config.region,
    Key: `users/${attachments[0]?.userId}/attachments/index.json`,
    Body: JSON.stringify(
      {
        userId: attachments[0]?.userId,
        attachments: attachments.map((a) => ({
          id: a.id,
          filename: a.filename,
          fileSize: a.fileSize,
          mimeType: a.mimeType,
          noteId: a.noteId,
          createdAt: a.createdAt.toISOString(),
        })),
      },
      null,
      2
    ),
    ContentType: 'application/json',
  });
}

async function main() {
  const userId = process.argv[2];
  if (!userId) {
    console.error('Usage: ts-node migrate-postgres-to-cos.ts <userId>');
    process.exit(1);
  }

  try {
    await migrateUser(userId);
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
```

- [ ] **Step 3: Commit**

```bash
git add scripts/migrate-postgres-to-cos.ts scripts/tsconfig.json
git commit -m "feat: add PostgreSQL to COS migration script"
```

---

## 子项目E：清理和配置更新

### Task E1: 移除后端和更新配置

**Files:**
- Delete: `backend/` (entire directory)
- Modify: `frontend/vite.config.ts`
- Modify: `package.json` (root)
- Modify: `README.md`
- Modify: `ARCHITECTURE.md`

- [ ] **Step 1: 移除vite proxy配置**

Modify `frontend/vite.config.ts` - remove proxy section:
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Remove server.proxy section
});
```

- [ ] **Step 2: 更新根package.json**

Modify `package.json` (root) - remove backend-related scripts:
```json
{
  "scripts": {
    "dev": "cd frontend && npm run dev",
    "build": "cd frontend && npm run build",
    "preview": "cd frontend && npm run preview"
  }
}
```

- [ ] **Step 3: 更新README.md**

Update `README.md` to reflect new architecture.

- [ ] **Step 4: 更新ARCHITECTURE.md**

Update `ARCHITECTURE.md` with new architecture diagram.

- [ ] **Step 5: Commit**

```bash
git add frontend/vite.config.ts package.json README.md ARCHITECTURE.md
git rm -r backend/
git commit -m "chore: remove backend and update configuration for COS architecture"
```

---

## 验证步骤

### V1: 构建验证

Run:
```bash
cd frontend
npm run build
```

Expected: Build succeeds with no TypeScript errors.

### V2: 功能测试

1. 启动前端: `npm run dev`
2. 测试用户注册
3. 测试用户登录
4. 测试笔记CRUD
5. 测试文件夹管理
6. 测试标签管理
7. 测试附件上传

### V3: COS验证

检查COS bucket中是否存在正确的JSON文件结构。

---

## 执行顺序

1. **并行执行**: 子项目A, B, C, D可以同时开始
2. **依赖等待**: 子项目E等待A/B/C/D完成后执行
3. **最终验证**: 所有子项目完成后执行V1/V2/V3验证