import apiClient from './api';
import { User } from '../types';

interface LoginRequest {
  studentId: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  studentId: string;
  department: string;
}

export const authService = {
  // 로그인
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post('/auth/login', data);
    return response.data;
  },

  // 회원가입
  register: async (data: RegisterRequest): Promise<User> => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  // 로그아웃
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  // 현재 사용자 정보 조회
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  // 이메일 인증 요청
  requestEmailVerification: async (email: string): Promise<void> => {
    await apiClient.post('/auth/verify-email/request', { email });
  },

  // 이메일 인증 확인
  verifyEmail: async (token: string): Promise<void> => {
    await apiClient.post('/auth/verify-email/confirm', { token });
  },
};
