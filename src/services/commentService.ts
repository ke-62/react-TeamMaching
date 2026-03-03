import apiClient from './api';
import { Comment } from '../types';

// 백엔드 응답 타입 (isVisible 포함)
export interface CommentResponse {
    id: number;
    projectId: number;
    authorId: number;
    authorName: string;
    authorDepartment: string;
    content: string | null;  // 비밀글 + 권한 없으면 null
    isSecret: boolean;
    isVisible: boolean;
    createdAt: string;
    parentId?: number | null;  // 대댓글이면 부모 댓글 id
}

export const commentService = {
    // 댓글 목록 조회
    getComments: async (projectId: number): Promise<CommentResponse[]> => {
        const response = await apiClient.get(`/v1/projects/${projectId}/comments`);
        return response.data;
    },

    // 댓글 등록 (parentId 있으면 대댓글)
    createComment: async (projectId: number, content: string, isSecret: boolean, parentId?: number): Promise<CommentResponse> => {
        const response = await apiClient.post(`/v1/projects/${projectId}/comments`, { content, isSecret, parentId });
        return response.data;
    },

    // 댓글 삭제
    deleteComment: async (projectId: number, commentId: number): Promise<void> => {
        await apiClient.delete(`/v1/projects/${projectId}/comments/${commentId}`);
    },
};
