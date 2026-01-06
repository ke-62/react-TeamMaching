import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './Sidebar.css';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

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
          to="/notifications"
          className={`sidebar-item ${isActive('/notifications') ? 'active' : ''}`}
        >
          <span className="sidebar-icon">🔔</span>
          <span className="sidebar-label">일정 알리미</span>
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
        <Link to="/logout" className="sidebar-logout">
          <span className="sidebar-icon">🚪</span>
          <span className="sidebar-label">로그아웃</span>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
