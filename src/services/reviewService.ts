import apiClient from './api';

export interface Review {
  id: number;
  reviewedUser: {
    id: number;
    name: string;
    studentId: string;
    department: string;
  };
  reviewer: {
    id: number;
    name: string;
    studentId: string;
    department: string;
  };
  recruitPostId: number;
  recruitPostTitle: string;
  collaborationScore: number;
  technicalScore: number;
  responsibilityScore: number;
  comment: string;
  aiSummary?: string;
  positiveKeywords: string[];
  improvementKeywords: string[];
  createdAt: string;
}

export interface ReviewSummary {
  userId: number;
  userName: string;
  totalReviewCount: number;
  averageCollaborationScore: number;
  averageTechnicalScore: number;
  averageResponsibilityScore: number;
  topPositiveKeywords: string[];
  recentComments: string[];
}

export interface CreateReviewRequest {
  reviewedUserId: number;
  recruitPostId: number;
  collaborationScore: number;
  technicalScore: number;
  responsibilityScore: number;
  comment: string;
}

export const reviewService = {
  /**
   * 동료 평가 작성
   */
  createReview: async (data: CreateReviewRequest): Promise<Review> => {
    const response = await apiClient.post('/reviews', data);
    return response.data;
  },

  /**
   * 특정 사용자가 받은 평가 목록 조회
   */
  getReviewsForUser: async (userId: number): Promise<Review[]> => {
    const response = await apiClient.get(`/reviews/user/${userId}`);
    return response.data;
  },

  /**
   * 특정 프로젝트의 평가 목록 조회
   */
  getReviewsForProject: async (projectId: number): Promise<Review[]> => {
    const response = await apiClient.get(`/reviews/project/${projectId}`);
    return response.data;
  },

  /**
   * 사용자 평가 요약 정보 조회 (프로필용)
   */
  getUserReviewSummary: async (userId: number): Promise<ReviewSummary> => {
    const response = await apiClient.get(`/reviews/user/${userId}/summary`);
    return response.data;
  },
};
