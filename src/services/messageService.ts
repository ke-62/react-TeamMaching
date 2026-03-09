import apiClient from './api';

export interface RoomResponse {
  roomId: number;
  partnerId: number;
  partnerName: string;
  partnerDepartment: string;
  lastMessage: string;
  lastAt: string;
}

export interface MessageResponse {
  id: number;
  senderId: number;
  senderName: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export const messageService = {
  getRooms: async (): Promise<RoomResponse[]> => {
    const res = await apiClient.get('/v1/chat/rooms');
    return res.data;
  },

  createRoom: async (partnerId: number): Promise<RoomResponse> => {
    const res = await apiClient.post('/v1/chat/rooms', { partnerId });
    return res.data;
  },

  getMessages: async (roomId: number): Promise<MessageResponse[]> => {
    const res = await apiClient.get(`/v1/chat/rooms/${roomId}/messages`);
    return res.data;
  },

  sendMessage: async (roomId: number, content: string): Promise<MessageResponse> => {
    const res = await apiClient.post(`/v1/chat/rooms/${roomId}/messages`, { content });
    return res.data;
  },
};
