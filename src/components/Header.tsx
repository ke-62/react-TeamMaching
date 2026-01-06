import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './Header.css';

const Header: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-spacer"></div>

        <div className="user-section">
          {isAuthenticated ? (
            <>
              <span className="user-name">세종인</span>
              <span className="user-email">{user?.email || 'guest@sejong.ac.kr'}</span>
              <Link to="/profile" className="user-avatar">
                <div className="avatar-circle">세</div>
              </Link>
            </>
          ) : (
            <Link to="/login" className="btn-login">
              로그인
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
