// 사용자 타입
export interface User {
  id: number;
  email: string;
  name: string;
  studentId: string;
  department: string;
  techStacks: string[];
  interests: string[];
  githubUrl?: string;
  profileImage?: string;
  createdAt: string;
}

// 팀 모집 공고 타입
export interface RecruitPost {
  id: number;
  title: string;
  description: string;
  projectType: 'creative' | 'capstone' | 'hackathon' | 'other';
  requiredTechStacks: string[];
  recruitNumber: number;
  deadline: string;
  authorId: number;
  author: User;
  createdAt: string;
  updatedAt: string;
}

// 지원서 타입
export interface Application {
  id: number;
  recruitPostId: number;
  applicantId: number;
  applicant: User;
  motivation: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

// 프로젝트 타입
export interface Project {
  id: number;
  name: string;
  description: string;
  techStacks: string[];
  githubUrl?: string;
  startDate: string;
  endDate?: string;
  teamMembers: User[];
}

// 동료 평가 타입
export interface PeerReview {
  id: number;
  projectId: number;
  reviewerId: number;
  revieweeId: number;
  content: string;
  keywords: string[];
  rating: number;
  createdAt: string;
}

// AI 추천 결과 타입
export interface RecommendationResult {
  user: User;
  matchScore: number;
  matchReasons: Record<string, string>;  // 예: { "기술 스택": "80% 일치", "동료 평가": "평균 4.5점" }
}
