import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { RecruitPost } from '../types';
import { recruitService } from '../services/recruitService';
import './RecruitsPage.css';

type TabType = 'hackathon' | 'capstone' | 'creative' | 'other' | '';

const RecruitsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlType = searchParams.get('type') as TabType || 'hackathon';

  const [recruits, setRecruits] = useState<RecruitPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>(urlType);
  const [showRecruitingOnly, setShowRecruitingOnly] = useState(false);
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
      console.error('공고 목록 불러오기 실패', err);
      setError('공고를 불러오는 데 실패했습니다. 서버가 실행 중인지 확인해주세요.');
      setRecruits([]);
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

  const displayedRecruits = showRecruitingOnly
    ? recruits.filter(r => r.status === 'RECRUITING')
    : recruits;

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
          <h2>해커톤 모집 공고 <span className="count">({displayedRecruits.length})</span></h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <label className="recruiting-filter-toggle">
              <input
                type="checkbox"
                checked={showRecruitingOnly}
                onChange={e => setShowRecruitingOnly(e.target.checked)}
              />
              <span>모집중만 보기</span>
            </label>
            <Link to="/recruits/new" className="btn-create">
              <span className="plus-icon">⊕</span>
              새 공고 등록
            </Link>
          </div>
        </div>

        {/* 로딩 상태 */}
        {isLoading && (
          <div className="loading-container">
            <p>로딩 중...</p>
          </div>
        )}

        {/* 에러 상태 */}
        {error && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#888' }}>
            <p style={{ fontSize: '32px', marginBottom: '12px' }}>🔌</p>
            <p style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px', color: '#555' }}>서버에 연결할 수 없습니다</p>
            <p style={{ fontSize: '13px', color: '#aaa' }}>백엔드 서버가 실행 중인지 확인해주세요. (localhost:8080)</p>
          </div>
        )}

        {/* 공고 목록 */}
        {!isLoading && !error && (
          <div className="recruits-grid">
            {displayedRecruits.length === 0 ? (
              <div className="empty-state">
                <p>{showRecruitingOnly ? '모집중인 공고가 없습니다.' : '등록된 모집 공고가 없습니다.'}</p>
                <Link to="/recruits/new" className="btn-create-empty">
                  첫 공고 작성하기
                </Link>
              </div>
            ) : (
              displayedRecruits.map((recruit) => (
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
                  <div
                    className="author-info"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      navigate(`/profile/${recruit.author.id}`);
                    }}
                    style={{
                      cursor: 'pointer', padding: '10px 12px',
                      borderTop: '1px solid #eee', display: 'flex',
                      alignItems: 'center', gap: '6px',
                      transition: 'background 0.15s', borderRadius: '0 0 8px 8px'
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#fff5f7')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    title={`${recruit.author.name} 프로필 보기`}
                  >
                    <div style={{
                      width: '24px', height: '24px', borderRadius: '50%',
                      background: '#8B1538', color: 'white',
                      fontSize: '11px', fontWeight: 'bold',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {recruit.author.name[0]}
                    </div>
                    <span style={{ color: '#8B1538', fontWeight: '600', fontSize: '13px' }}>
                      {recruit.author.name}
                    </span>
                    <span style={{ color: '#888', fontSize: '12px' }}>{recruit.author.department}</span>
                    <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#ccc' }}>프로필 →</span>
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
