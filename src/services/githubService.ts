import apiClient from './api';

export interface GitHubProfile {
  login: string;
  name: string;
  bio: string;
  avatarUrl: string;
  publicRepos: number;
  followers: number;
  following: number;
  htmlUrl: string;
}

export interface GitHubRepository {
  name: string;
  description: string;
  htmlUrl: string;
  language: string;
  stargazersCount: number;
  forksCount: number;
  isPrivate: boolean;
}

export const githubService = {
  /**
   * GitHub 프로필 조회
   */
  getProfile: async (userId: number): Promise<GitHubProfile> => {
    const response = await apiClient.get(`/users/${userId}/github/profile`);
    return response.data;
  },

  /**
   * GitHub 레포지토리 목록 조회
   */
  getRepositories: async (userId: number, limit: number = 10): Promise<GitHubRepository[]> => {
    const response = await apiClient.get(`/users/${userId}/github/repositories`, {
      params: { limit },
    });
    return response.data;
  },
};
