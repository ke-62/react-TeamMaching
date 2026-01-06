import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './AuthPages.css';

const LoginPage: React.FC = () => {
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(studentId, password);
      navigate('/recruits');
    } catch (err: any) {
      setError(err.response?.data?.message || '학번 또는 비밀번호가 일치하지 않습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h2 className="auth-title">로그인</h2>
          <p className="auth-subtitle">세종대학교 학사정보시스템 계정으로 로그인하세요</p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="studentId">세종대학교 학번</label>
              <input
                type="text"
                id="studentId"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="학번을 입력하세요 (예: 20211234)"
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">세종대 포털 비밀번호</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="학사정보시스템 비밀번호"
                required
                disabled={isLoading}
              />
              <small>세종대학교 학사정보시스템과 동일한 비밀번호를 사용합니다</small>
            </div>

            <button type="submit" className="btn-submit" disabled={isLoading}>
              {isLoading ? '로그인 중...' : '로그인'}
            </button>
          </form>

          <div className="auth-footer">
            <div className="test-account-info" style={{
              background: '#f9fafb',
              padding: '1rem',
              borderRadius: '8px',
              marginTop: '1.5rem',
              border: '1px solid #e5e7eb'
            }}>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.75rem', fontWeight: '600' }}>
                💡 테스트 계정 안내
              </p>
              <p style={{ fontSize: '0.8125rem', color: '#6b7280', lineHeight: '1.6' }}>
                학번: <strong>20211234</strong> / 비밀번호: <strong>test1234</strong><br />
                학번: <strong>20211235</strong> / 비밀번호: <strong>test1234</strong>
              </p>
              <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.5rem' }}>
                ※ 등록되지 않은 학번은 자동으로 계정이 생성됩니다
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
