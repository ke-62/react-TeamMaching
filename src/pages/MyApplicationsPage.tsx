import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { recruitService } from '../services/recruitService';
import { Application } from '../types';
import { useAuth } from '../hooks/useAuth';
import './RecruitsPage.css';

const MyApplicationsPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [applications, setApplications] = useState<Application[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const data = await recruitService.getMyApplications();
                setApplications(data);
            } catch (e) {
                console.error('내 지원 목록 불러오기 실패', e);
            } finally {
                setIsLoading(false);
            }
        };
        if (user) fetch();
        else setIsLoading(false);
    }, [user]);

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'pending': return { text: '', cls: '' };
            case 'accepted': return { text: '수락됨', cls: 'active' };
            case 'rejected': return { text: '거절됨', cls: '' };
            default: return { text: '', cls: '' };
        }
    };

    const getProjectTypeLabel = (type?: string) => {
        switch (type) {
            case 'hackathon': return '🚀 해커톤';
            case 'capstone': return '🎓 캡스톤';
            case 'creative': return '💡 창의학기제';
            case 'other': return '📌 기타';
            default: return type || '';
        }
    };

    if (!user) {
        return (
            <div className="recruits-page">
                <div className="recruits-container">
                    <div style={{ textAlign: 'center', padding: '60px', color: '#888' }}>
                        <p style={{ marginBottom: '16px' }}>로그인이 필요합니다.</p>
                        <button className="btn-apply" onClick={() => navigate('/login')}>로그인하기</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="recruits-page">
            <div className="recruits-container">
                <div className="page-header">
                    <h1>내가 지원한 프로젝트</h1>
                </div>

                {isLoading ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: '#aaa' }}>불러오는 중...</div>
                ) : applications.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: '#888' }}>
                        <p style={{ fontSize: '16px', marginBottom: '16px' }}>아직 지원한 프로젝트가 없습니다.</p>
                        <button className="btn-apply" onClick={() => navigate('/recruits')}>
                            모집 공고 보러가기
                        </button>
                    </div>
                ) : (
                    <div className="applicants-list">
                        {applications.map(app => {
                            const { text: statusText, cls: statusCls } = getStatusLabel(app.status);
                            return (
                                <div key={app.id} className="recruit-card">
                                    <div className="recruit-header">
                                        <h4>
                                            <span
                                                onClick={() => navigate(`/recruits/${app.recruitPostId}`)}
                                                style={{ color: '#8B1538', cursor: 'pointer', textDecoration: 'underline' }}
                                            >
                                                {app.projectTitle || `프로젝트 #${app.recruitPostId}`}
                                            </span>
                                        </h4>
                                        {statusText && (
                                            <span className={`deadline-badge ${statusCls}`}>
                                                {statusText}
                                            </span>
                                        )}
                                    </div>

                                    {app.projectType && (
                                        <div style={{ marginBottom: '8px' }}>
                                            <span className="tech-badge">{getProjectTypeLabel(app.projectType)}</span>
                                        </div>
                                    )}

                                    <p style={{ color: '#555', lineHeight: '1.6' }}>
                                        <strong>지원 동기:</strong> {app.motivation}
                                    </p>

                                    <p style={{ fontSize: '12px', color: '#aaa', marginTop: '8px' }}>
                                        지원일: {new Date(app.createdAt).toLocaleDateString('ko-KR')}
                                    </p>

                                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                                        <button
                                            className="btn-message"
                                            onClick={() => navigate(`/recruits/${app.recruitPostId}`)}
                                        >
                                            공고 보기
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyApplicationsPage;
