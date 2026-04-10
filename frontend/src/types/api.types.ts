export interface User {
  id: string;
  email: string;
  nickname: string;
  avatarUrl?: string;
  createdAt?: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RegisterResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}