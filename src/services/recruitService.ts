import apiClient from './api';
import { RecruitPost, Application, RecommendationResult } from '../types';

interface CreateRecruitPostRequest {
  title: string;
  description: string;
  projectType: string;
  requiredTechStacks: string[];
  recruitNumber: number;
  deadline: string;
}

export const recruitService = {
  // 모집 공고 목록 조회
  getRecruitPosts: async (params?: {
    page?: number;
    size?: number;
    projectType?: string;
    techStack?: string;
  }): Promise<{ content: RecruitPost[]; totalPages: number; totalElements: number }> => {
    const response = await apiClient.get('/recruits', { params });
    return response.data;
  },

  // 모집 공고 상세 조회
  getRecruitPost: async (id: number): Promise<RecruitPost> => {
    const response = await apiClient.get(`/recruits/${id}`);
    return response.data;
  },

  // 모집 공고 생성
  createRecruitPost: async (data: CreateRecruitPostRequest): Promise<RecruitPost> => {
    const response = await apiClient.post('/recruits', data);
    return response.data;
  },

  // 모집 공고 수정
  updateRecruitPost: async (id: number, data: Partial<CreateRecruitPostRequest>): Promise<RecruitPost> => {
    const response = await apiClient.put(`/recruits/${id}`, data);
    return response.data;
  },

  // 모집 공고 삭제
  deleteRecruitPost: async (id: number): Promise<void> => {
    await apiClient.delete(`/recruits/${id}`);
  },

  // 지원하기
  applyToRecruit: async (recruitId: number, motivation: string): Promise<Application> => {
    const response = await apiClient.post(`/recruits/${recruitId}/apply`, { motivation });
    return response.data;
  },

  // 지원 취소
  cancelApplication: async (recruitId: number, applicationId: number): Promise<void> => {
    await apiClient.delete(`/recruits/${recruitId}/applications/${applicationId}`);
  },

  // 지원자 목록 조회 (모집 공고 작성자용)
  getApplications: async (recruitId: number): Promise<Application[]> => {
    const response = await apiClient.get(`/recruits/${recruitId}/applications`);
    return response.data;
  },

  // 지원 수락/거절
  updateApplicationStatus: async (
    recruitId: number,
    applicationId: number,
    status: 'accepted' | 'rejected'
  ): Promise<Application> => {
    const response = await apiClient.patch(`/recruits/${recruitId}/applications/${applicationId}`, { status });
    return response.data;
  },

  // AI 추천 팀원 조회
  getRecommendedMembers: async (recruitId: number): Promise<RecommendationResult[]> => {
    const response = await apiClient.get(`/recruits/${recruitId}/recommendations`);
    return response.data;
  },
};
