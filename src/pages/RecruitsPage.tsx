import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { RecruitPost } from '../types';
import { recruitService } from '../services/recruitService';
import './RecruitsPage.css';

type TabType = 'hackathon' | 'capstone' | 'creative' | 'other' | '';

const RecruitsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const urlType = searchParams.get('type') as TabType || 'hackathon';

  const [recruits, setRecruits] = useState<RecruitPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>(urlType);
  const [filter, setFilter] = useState({
    projectType: urlType,
    techStack: '',
  });

  const fetchRecruits = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await recruitService.getRecruitPosts({
        projectType: filter.projectType || undefined,
        techStack: filter.techStack || undefined,
      });
      setRecruits(response.content);
    } catch (err) {
      // 백엔드 연결 실패 시 임시 mock 데이터 사용
      console.log('백엔드 미연결, 임시 데이터 사용');
      const mockRecruits: RecruitPost[] = [
        {
          id: 1,
          title: '[해커톤] 2026 AI 해커톤 팀원 모집',
          description: 'AI 기반 서비스를 개발할 팀원을 찾습니다. React, Python 경험자 우대합니다.',
          projectType: 'hackathon',
          requiredTechStacks: ['React', 'Python', 'TensorFlow'],
          recruitNumber: 3,
          deadline: '2026-02-15',
          authorId: 1,
          author: {
            id: 1,
            email: 'student1@sejong.ac.kr',
            name: '김철수',
            studentId: '20211234',
            department: '컴퓨터공학과',
            techStacks: ['React', 'Node.js'],
            interests: ['AI', '웹개발'],
            createdAt: '2025-01-01',
          },
          createdAt: '2026-01-05',
          updatedAt: '2026-01-05',
        },
        {
          id: 2,
          title: '[캡스톤] 졸업작품 개발 팀원 모집',
          description: '모바일 앱 개발 프로젝트입니다. Flutter 또는 React Native 경험자 환영합니다.',
          projectType: 'capstone',
          requiredTechStacks: ['Flutter', 'Firebase', 'Figma'],
          recruitNumber: 2,
          deadline: '2026-02-28',
          authorId: 2,
          author: {
            id: 2,
            email: 'student2@sejong.ac.kr',
            name: '이영희',
            studentId: '20201111',
            department: '소프트웨어학과',
            techStacks: ['Flutter', 'Firebase'],
            interests: ['모바일', 'UI/UX'],
            createdAt: '2025-01-01',
          },
          createdAt: '2026-01-04',
          updatedAt: '2026-01-04',
        },
        {
          id: 3,
          title: '[창의학기제] 블록체인 프로젝트 팀원 구함',
          description: '블록체인 기술을 활용한 창의적인 프로젝트를 함께할 팀원을 찾습니다.',
          projectType: 'creative',
          requiredTechStacks: ['Solidity', 'Web3.js', 'React'],
          recruitNumber: 4,
          deadline: '2026-01-25',
          authorId: 3,
          author: {
            id: 3,
            email: 'student3@sejong.ac.kr',
            name: '박민수',
            studentId: '20221234',
            department: '컴퓨터공학과',
            techStacks: ['Blockchain', 'Solidity'],
            interests: ['블록체인', 'DApp'],
            createdAt: '2025-01-01',
          },
          createdAt: '2026-01-03',
          updatedAt: '2026-01-03',
        },
        {
          id: 4,
          title: '[기타] 스터디 그룹 멤버 모집',
          description: '알고리즘 코딩테스트 준비 스터디입니다. 주 3회 온라인 진행 예정입니다.',
          projectType: 'other',
          requiredTechStacks: ['Algorithm', 'Python', 'C++'],
          recruitNumber: 5,
          deadline: '2026-01-20',
          authorId: 4,
          author: {
            id: 4,
            email: 'student4@sejong.ac.kr',
            name: '최지우',
            studentId: '20231111',
            department: '정보보호학과',
            techStacks: ['Algorithm', 'Python'],
            interests: ['코딩테스트', '알고리즘'],
            createdAt: '2025-01-01',
          },
          createdAt: '2026-01-02',
          updatedAt: '2026-01-02',
        },
      ];

      // 현재 선택된 프로젝트 타입에 맞는 데이터만 필터링
      const filteredMockData = mockRecruits.filter(
        recruit => recruit.projectType === (filter.projectType || 'hackathon')
      );
      setRecruits(filteredMockData);
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchRecruits();
  }, [fetchRecruits]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR');
  };

  const isDeadlinePassed = (deadline: string) => {
    return new Date(deadline) < new Date();
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setFilter({ ...filter, projectType: tab || 'hackathon' });
  };

  return (
    <div className="recruits-page">
      <div className="recruits-container">
        <div className="page-header">
          <h1>팀원 모집</h1>
        </div>

        {/* 탭 네비게이션 */}
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'hackathon' ? 'active' : ''}`}
            onClick={() => handleTabChange('hackathon')}
          >
            <span className="tab-icon">🚀</span>
            해커톤
          </button>
          <button
            className={`tab ${activeTab === 'capstone' ? 'active' : ''}`}
            onClick={() => handleTabChange('capstone')}
          >
            <span className="tab-icon">🎓</span>
            캡스톤
          </button>
          <button
            className={`tab ${activeTab === 'creative' ? 'active' : ''}`}
            onClick={() => handleTabChange('creative')}
          >
            <span className="tab-icon">💡</span>
            창의학기제
          </button>
          <button
            className={`tab ${activeTab === 'other' ? 'active' : ''}`}
            onClick={() => handleTabChange('other')}
          >
            <span className="tab-icon">💼</span>
            기타
          </button>
        </div>

        {/* AI 추천 배너 */}
        <div className="ai-banner">
          <div className="ai-banner-content">
            <div className="ai-banner-text">
              <div className="ai-banner-icon">⚡</div>
              <div>
                <h3>AI 해커톤 맞춤 추천</h3>
                <p>내 프로필 정보를 바탕으로 적합한 프로젝트를 선별합니다.</p>
              </div>
            </div>
            <button className="ai-banner-button">
              <span>🔍</span>
              해커톤 추천 받기
            </button>
          </div>
        </div>

        {/* 헤더 영역 */}
        <div className="section-header">
          <h2>해커톤 모집 공고 <span className="count">(0)</span></h2>
          <Link to="/recruits/new" className="btn-create">
            <span className="plus-icon">⊕</span>
            새 공고 등록
          </Link>
        </div>

        {/* 로딩 상태 */}
        {isLoading && (
          <div className="loading-container">
            <p>로딩 중...</p>
          </div>
        )}

        {/* 에러 상태 */}
        {error && (
          <div className="error-container">
            <p>{error}</p>
          </div>
        )}

        {/* 공고 목록 */}
        {!isLoading && !error && (
          <div className="recruits-grid">
            {recruits.length === 0 ? (
              <div className="empty-state">
                <p>등록된 모집 공고가 없습니다.</p>
                <Link to="/recruits/new" className="btn-create-empty">
                  첫 공고 작성하기
                </Link>
              </div>
            ) : (
              recruits.map((recruit) => (
                <div
                  key={recruit.id}
                  className="recruit-card"
                  style={{ position: 'relative' }}
                >
                  <Link
                    to={`/recruits/${recruit.id}`}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <div className="recruit-header">
                      <span className={`project-type ${recruit.projectType}`}>
                        {recruit.projectType === 'creative' && '창의학기제'}
                        {recruit.projectType === 'capstone' && '캡스톤디자인'}
                        {recruit.projectType === 'hackathon' && '해커톤'}
                        {recruit.projectType === 'other' && '기타'}
                      </span>
                      {isDeadlinePassed(recruit.deadline) && (
                        <span className="deadline-badge closed">마감</span>
                      )}
                    </div>

                    <h3 className="recruit-title">{recruit.title}</h3>
                    <p className="recruit-description">{recruit.description}</p>

                    <div className="tech-stacks">
                      {recruit.requiredTechStacks.map((tech, index) => (
                        <span key={index} className="tech-badge">
                          {tech}
                        </span>
                      ))}
                    </div>

                    <div className="recruit-footer">
                      <div className="recruit-info">
                        <span>👤 {recruit.recruitNumber}명 모집</span>
                        <span>
                          📅 마감: {formatDate(recruit.deadline)}
                        </span>
                      </div>
                    </div>
                  </Link>
                  <div className="author-info" onClick={(e) => {
                    e.stopPropagation();
                    window.location.href = `/profile/${recruit.author.id}`;
                  }} style={{ cursor: 'pointer', padding: '10px 0', borderTop: '1px solid #eee' }}>
                    <span style={{ color: '#8B1538', fontWeight: 'bold' }}>{recruit.author.name}</span>
                    <span className="department">{recruit.author.department}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecruitsPage;
