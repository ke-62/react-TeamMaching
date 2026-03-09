import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './Sidebar.css';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <Link to="/" className="sidebar-logo">
          <div className="logo-icon">🚀</div>
          <span className="logo-text">TEAM HUB</span>
        </Link>
      </div>

      <nav className="sidebar-nav">
        <Link
          to="/recruits"
          className={`sidebar-item ${isActive('/recruits') ? 'active' : ''}`}
        >
          <span className="sidebar-icon">👥</span>
          <span className="sidebar-label">팀원 모집</span>
        </Link>

        <Link
          to="/alarm"
          className={`sidebar-item ${isActive('/alarm') ? 'active' : ''}`}
        >
          <span className="sidebar-icon">🔔</span>
          <span className="sidebar-label">일정 알리미</span>
        </Link>

        <Link
          to="/messages"
          className={`sidebar-item ${isActive('/messages') ? 'active' : ''}`}
        >
          <span className="sidebar-icon">💬</span>
          <span className="sidebar-label">쪽지</span>
        </Link>

        <Link
          to="/my-applications"
          className={`sidebar-item ${isActive('/my-applications') ? 'active' : ''}`}
        >
          <span className="sidebar-icon">📋</span>
          <span className="sidebar-label">내 지원 현황</span>
        </Link>

        <Link
          to="/my-posts"
          className={`sidebar-item ${isActive('/my-posts') ? 'active' : ''}`}
        >
          <span className="sidebar-icon">📝</span>
          <span className="sidebar-label">내 공고 관리</span>
        </Link>

        <Link
          to="/profile"
          className={`sidebar-item ${isActive('/profile') ? 'active' : ''}`}
        >
          <span className="sidebar-icon">👤</span>
          <span className="sidebar-label">내 프로필</span>
        </Link>
      </nav>

      <div className="sidebar-footer">
        {isAuthenticated && (
          <button
            onClick={async () => {
              await logout();
              navigate('/');
            }}
            className="sidebar-logout"
          >
            <span className="sidebar-icon">🚪</span>
            <span className="sidebar-label">로그아웃</span>
          </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
