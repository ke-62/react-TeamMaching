import apiClient from './api';
import { User, Project, PeerReview } from '../types';

interface UpdateProfileRequest {
  name?: string;
  techStacks?: string[];
  interests?: string[];
  githubUrl?: string;
}

export const userService = {
  // 사용자 프로필 조회
  getProfile: async (userId: number): Promise<User> => {
    const response = await apiClient.get(`/users/${userId}`);
    return response.data;
  },

  // 내 프로필 조회
  getMyProfile: async (): Promise<User> => {
    const response = await apiClient.get('/users/me');
    return response.data;
  },

  // 프로필 업데이트
  updateProfile: async (data: UpdateProfileRequest): Promise<User> => {
    const response = await apiClient.put('/users/me', data);
    return response.data;
  },

  // 프로필 이미지 업로드
  uploadProfileImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await apiClient.post('/users/me/profile-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.imageUrl;
  },

  // 내 프로젝트 목록 조회
  getMyProjects: async (): Promise<Project[]> => {
    const response = await apiClient.get('/users/me/projects');
    return response.data;
  },

  // 사용자의 프로젝트 목록 조회
  getUserProjects: async (userId: number): Promise<Project[]> => {
    const response = await apiClient.get(`/users/${userId}/projects`);
    return response.data;
  },

  // GitHub 연동
  connectGithub: async (githubUrl: string): Promise<void> => {
    await apiClient.post('/users/me/github', { githubUrl });
  },

  // GitHub 레포지토리 동기화
  syncGithubRepositories: async (): Promise<Project[]> => {
    const response = await apiClient.post('/users/me/github/sync');
    return response.data;
  },

  // 받은 동료 평가 조회
  getReceivedReviews: async (): Promise<PeerReview[]> => {
    const response = await apiClient.get('/users/me/reviews/received');
    return response.data;
  },

  // 작성한 동료 평가 조회
  getWrittenReviews: async (): Promise<PeerReview[]> => {
    const response = await apiClient.get('/users/me/reviews/written');
    return response.data;
  },
};
