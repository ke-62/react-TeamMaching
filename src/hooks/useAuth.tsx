import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: any) => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 페이지 로드 시 사용자 정보 확인
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        // 테스트 계정 토큰인 경우
        if (token === 'mock-access-token') {
          const mockUser: User = {
            id: 999,
            studentId: '20211234',
            name: '테스트 사용자',
            email: 'test@sejong.ac.kr',
            department: '컴퓨터공학과',
            techStacks: ['React', 'TypeScript', 'Node.js'],
            interests: ['웹 개발', '팀 프로젝트'],
            githubUrl: 'https://github.com/testuser',
            profileImage: undefined,
            createdAt: new Date().toISOString(),
          };
          setUser(mockUser);
        } else {
          // 실제 백엔드 API 호출
          try {
            const currentUser = await authService.getCurrentUser();
            setUser(currentUser);
          } catch (error) {
            console.error('Failed to fetch user:', error);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
          }
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (studentId: string, password: string) => {
    // 테스트 계정 - 디자인 확인용 (백엔드 호출 없음)
    if (studentId === '20211234' && password === 'test1234') {
      const mockUser: User = {
        id: 999,
        studentId: '20211234',
        name: '테스트 사용자',
        email: 'test@sejong.ac.kr',
        department: '컴퓨터공학과',
        techStacks: ['React', 'TypeScript', 'Node.js'],
        interests: ['웹 개발', '팀 프로젝트'],
        githubUrl: 'https://github.com/testuser',
        profileImage: undefined,
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem('accessToken', 'mock-access-token');
      localStorage.setItem('refreshToken', 'mock-refresh-token');
      setUser(mockUser);
      return;
    }

    // 실제 계정 - 백엔드 API 호출
    const response = await authService.login({ studentId, password });
    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);
    setUser(response.user);
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  };

  const register = async (data: any) => {
    await authService.register(data);
    // 회원가입 후 자동 로그인은 하지 않음
    // 이메일 인증 등의 절차가 필요할 수 있음
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    register,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
