import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './HomePage.css';

const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            대학생 팀 프로젝트,
            <br />
            완벽한 팀원을 찾아보세요
          </h1>
          <p className="hero-description">
            AI 기반 추천 시스템과 동료 평가 이력을 활용한
            <br />
            스마트한 팀원 모집 플랫폼
          </p>
          <div className="hero-buttons">
            {isAuthenticated ? (
              <Link to="/recruits" className="btn-primary">
                모집 공고 보기
              </Link>
            ) : (
              <Link to="/login" className="btn-primary">
                로그인하고 시작하기
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2 className="section-title">주요 기능</h2>
        <div className="features-grid">
          <Link to="/recruits" className="feature-card" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="feature-icon">🎯</div>
            <h3>AI 기반 팀원 추천</h3>
            <p>
              기술 스택, 관심 분야, 프로젝트 경험을 분석하여
              <br />
              최적의 팀원을 추천합니다
            </p>
          </Link>

          <Link to="/profile" className="feature-card" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="feature-icon">📊</div>
            <h3>동료 평가 이력 관리</h3>
            <p>
              프로젝트 종료 후 동료 평가 결과를 AI로 요약하여
              <br />
              다음 팀 모집에 활용합니다
            </p>
          </Link>

          <Link to="/profile" className="feature-card" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="feature-icon">💻</div>
            <h3>GitHub 연동</h3>
            <p>
              실제 프로젝트 결과물을 기반으로
              <br />
              신뢰도 높은 프로필을 구성합니다
            </p>
          </Link>

          <Link to="/alarm" className="feature-card" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="feature-icon">📅</div>
            <h3>일정 알림</h3>
            <p>
              창의학기제, 캡스톤, 해커톤 등
              <br />
              주요 공모 일정을 한눈에 확인하세요
            </p>
          </Link>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <h2 className="section-title">이용 방법</h2>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">1</div>
            <h3>회원가입 및 프로필 작성</h3>
            <p>기술 스택, 관심 분야, GitHub 연동으로 프로필을 완성하세요</p>
          </div>

          <div className="step-card">
            <div className="step-number">2</div>
            <h3>팀원 모집 또는 지원</h3>
            <p>원하는 프로젝트를 등록하거나 관심있는 공고에 지원하세요</p>
          </div>

          <div className="step-card">
            <div className="step-number">3</div>
            <h3>AI 추천으로 최적 매칭</h3>
            <p>시스템이 분석한 매칭 점수를 참고하여 팀원을 선택하세요</p>
          </div>

          <div className="step-card">
            <div className="step-number">4</div>
            <h3>프로젝트 완료 및 평가</h3>
            <p>동료 평가를 작성하면 다음 프로젝트에 자동으로 반영됩니다</p>
          </div>
        </div>
      </section>

      {/* Project Type Links Section */}
      <section className="project-types-section" style={{ background: '#f9fafb', padding: '60px 20px' }}>
        <h2 className="section-title">프로젝트 타입별 탐색</h2>
        <div className="features-grid" style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <Link to="/recruits?type=hackathon" className="feature-card" style={{
            textDecoration: 'none',
            color: 'inherit',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            // color: 'white'
          }}>
            <div className="feature-icon" style={{ fontSize: '3rem' }}>🚀</div>
            <h3>해커톤</h3>
            <p>단기간 집중 개발 프로젝트</p>
          </Link>

          <Link to="/recruits?type=capstone" className="feature-card" style={{
            textDecoration: 'none',
            color: 'inherit',
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            // color: 'white'
          }}>
            <div className="feature-icon" style={{ fontSize: '3rem' }}>🎓</div>
            <h3>캡스톤 디자인</h3>
            <p>졸업 작품 프로젝트</p>
          </Link>

          <Link to="/recruits?type=creative" className="feature-card" style={{
            textDecoration: 'none',
            color: 'inherit',
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            // color: 'white'
          }}>
            <div className="feature-icon" style={{ fontSize: '3rem' }}>💡</div>
            <h3>창의학기제</h3>
            <p>한 학기 집중 창의 프로젝트</p>
          </Link>

          <Link to="/recruits?type=other" className="feature-card" style={{
            textDecoration: 'none',
            color: 'inherit',
            background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            // color: 'white'
          }}>
            <div className="feature-icon" style={{ fontSize: '3rem' }}>💼</div>
            <h3>기타 프로젝트</h3>
            <p>스터디, 대외활동 등</p>
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <h2>지금 바로 시작하세요</h2>
        <p>더 나은 팀 프로젝트 경험을 위한 첫걸음</p>
        {!isAuthenticated && (
          <Link to="/login" className="btn-cta">
            로그인하고 시작하기
          </Link>
        )}
      </section>
    </div>
  );
};

export default HomePage;
