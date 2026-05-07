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
