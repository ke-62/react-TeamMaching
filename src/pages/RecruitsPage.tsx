import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { RecruitPost } from '../types';
import { recruitService } from '../services/recruitService';
import './RecruitsPage.css';

type TabType = 'hackathon' | 'capstone' | 'creative' | '';

const RecruitsPage: React.FC = () => {
  const [recruits, setRecruits] = useState<RecruitPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('hackathon');
  const [filter, setFilter] = useState({
    projectType: 'hackathon',
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
      setError('모집 공고를 불러오는데 실패했습니다.');
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
    setFilter({ ...filter, projectType: tab });
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
                <Link
                  to={`/recruits/${recruit.id}`}
                  key={recruit.id}
                  className="recruit-card"
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
                    <div className="author-info">
                      <span>{recruit.author.name}</span>
                      <span className="department">{recruit.author.department}</span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecruitsPage;
