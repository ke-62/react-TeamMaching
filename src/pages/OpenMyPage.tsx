import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import './RecruitsPage.css';

const OpenMyPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    if (!user) {
        return (
            <div className="recruits-page">
                <div className="recruits-container">
                    <div className="recruit-card" style={{ textAlign: 'center', padding: '40px' }}>
                        <h2>로그인이 필요합니다</h2>
                        <button onClick={() => navigate('/login')} style={{ marginTop: '20px', padding: '10px 20px' }}>
                            로그인하기
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // 공개용 프로필 URL 생성
    const publicProfileUrl = `${window.location.origin}/profile/${user.id}`;

    return (
        <div className="recruits-page">
            <div className="recruits-container">
                <div className="recruit-card" style={{ textAlign: 'center', padding: '40px' }}>
                    <h2>🌐 공개 프로필</h2>
                    <p style={{ marginTop: '20px', color: '#666' }}>
                        아래 링크를 공유하면 다른 사람들이 내 프로필을 볼 수 있습니다
                    </p>

                    <div style={{
                        margin: '30px auto',
                        padding: '20px',
                        background: '#f5f5f5',
                        borderRadius: '8px',
                        maxWidth: '500px'
                    }}>
                        <input
                            type="text"
                            value={publicProfileUrl}
                            readOnly
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                marginBottom: '10px'
                            }}
                        />
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(publicProfileUrl);
                                alert('링크가 복사되었습니다!');
                            }}
                            style={{
                                padding: '10px 20px',
                                background: '#8B1538',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            📋 링크 복사하기
                        </button>
                    </div>

                    <div style={{ marginTop: '30px' }}>
                        <h3>공개 프로필 미리보기</h3>
                        <button
                            onClick={() => navigate(`/profile/${user.id}`)}
                            style={{
                                marginTop: '15px',
                                padding: '12px 24px',
                                background: '#fff',
                                border: '2px solid #8B1538',
                                color: '#8B1538',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}
                        >
                            👀 내 공개 프로필 보기
                        </button>
                    </div>
                </div>

                {/* 프로필 프리뷰 카드 */}
                <div className="recruit-card" style={{ marginTop: '20px' }}>
                    <h3>내 프로필 요약</h3>
                    <div style={{ textAlign: 'center', marginTop: '20px' }}>
                        <div className="avatar-circle" style={{ width: '60px', height: '60px', fontSize: '1.5rem', margin: '0 auto 15px' }}>
                            {user.name[0]}
                        </div>
                        <h4>{user.name}</h4>
                        <p style={{ color: '#666' }}>{user.department} | {user.studentId}</p>
                        <div className="tech-stacks" style={{ justifyContent: 'center', marginTop: '10px' }}>
                            {user.techStacks.map((tech, i) => (
                                <span key={i} className="tech-badge">{tech}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OpenMyPage;
