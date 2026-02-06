import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { recruitService } from '../services/recruitService';
import { useAuth } from '../hooks/useAuth';
import { RecruitPost, Application, RecommendationResult } from '../types';
import './RecruitsPage.css'; // 기존 스타일 재사용 또는 별도 CSS 생성

const RecruitDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [recruit, setRecruit] = useState<RecruitPost | null>(null);
    const [applications, setApplications] = useState<Application[]>([]);
    const [recommendations, setRecommendations] = useState<RecommendationResult[]>([]);
    const [motivation, setMotivation] = useState('');
    const [activeTab, setActiveTab] = useState<'info' | 'applicants' | 'ai-recommend'>('info');


    const loadRecruitData = useCallback(async (recruitId: number) => {
        try {
            const data = await recruitService.getRecruitPost(recruitId);
            setRecruit(data);

            // 작성자인 경우 지원자 목록과 AI 추천 목록을 미리 로드할 수 있음
            if (user && data.authorId === user.id) {
                const apps = await recruitService.getApplications(recruitId);
                setApplications(apps);
                // AI 추천은 탭을 누를 때 로드하거나 여기서 로드
            }
        } catch (error) {
            console.error('Failed to load recruit detail - using mock data', error);
            // 백엔드 미연결 시 mock 데이터
            const mockRecruit: RecruitPost = {
                id: recruitId,
                title: '[' + (['hackathon', 'capstone', 'creative', 'other'][recruitId % 4]) + '] 팀원 모집 공고',
                description: '프로젝트를 함께 할 팀원을 모집합니다. 열정적이고 책임감 있는 분들의 지원을 기다립니다.',
                projectType: ['hackathon', 'capstone', 'creative', 'other'][recruitId % 4] as any,
                requiredTechStacks: ['React', 'TypeScript', 'Node.js'],
                recruitNumber: 3,
                deadline: '2026-02-28',
                authorId: 1,
                author: {
                    id: 1,
                    email: 'author@sejong.ac.kr',
                    name: '공고 작성자',
                    studentId: '20211234',
                    department: '컴퓨터공학과',
                    techStacks: ['React', 'Node.js'],
                    interests: ['웹개발'],
                    createdAt: '2025-01-01',
                },
                createdAt: '2026-01-05',
                updatedAt: '2026-01-05',
            };
            setRecruit(mockRecruit);
        }
    }, [user]);

    useEffect(() => {
        if (id) {
            loadRecruitData(parseInt(id));
        }
    }, [id, loadRecruitData]);



    const handleApply = async () => {
        if (!recruit || !id) return;
        try {
            await recruitService.applyToRecruit(parseInt(id), motivation);
            alert('지원 완료되었습니다!');
            setMotivation('');
        } catch (error) {
            alert('지원 중 오류가 발생했습니다.');
        }
    };

    const handleLoadRecommendations = async () => {
        if (!id) return;
        try {
            const data = await recruitService.getRecommendedMembers(parseInt(id));
            setRecommendations(data);
        } catch (error) {
            console.error(error);
            alert('AI 추천 정보를 불러올 수 없습니다.');
        }
    };

    const handleAcceptApplicant = async (appId: number) => {
        if (!id) return;
        try {
            await recruitService.updateApplicationStatus(parseInt(id), appId, 'accepted');
            alert('수락 처리되었습니다.');
            // 목록 갱신
            const apps = await recruitService.getApplications(parseInt(id));
            setApplications(apps);
        } catch (e) {
            alert('처리 실패');
        }
    };

    if (!recruit) return <div>Loading...</div>;

    const isAuthor = user?.id === recruit.authorId;

    return (
        <div className="recruits-page">
            <div className="recruits-container">
                <div className="page-header">
                    <button onClick={() => navigate('/recruits')} className="btn-back">← 목록으로</button>
                    <h1>{recruit.title}</h1>
                </div>

                {/* 탭 메뉴 (작성자에게만 관리 탭 노출) */}
                <div className="tabs">
                    <button
                        className={`tab ${activeTab === 'info' ? 'active' : ''}`}
                        onClick={() => setActiveTab('info')}
                    >
                        📋 상세 정보
                    </button>
                    {isAuthor && (
                        <>
                            <button
                                className={`tab ${activeTab === 'applicants' ? 'active' : ''}`}
                                onClick={() => setActiveTab('applicants')}
                            >
                                🙋‍♂️ 지원자 관리 ({applications.length})
                            </button>
                            <button
                                className={`tab ${activeTab === 'ai-recommend' ? 'active' : ''}`}
                                onClick={() => {
                                    setActiveTab('ai-recommend');
                                    handleLoadRecommendations();
                                }}
                            >
                                🤖 AI 팀원 추천
                            </button>
                        </>
                    )}
                </div>

                <div className="recruit-content-body" style={{ marginTop: '20px' }}>
                    {/* 상세 정보 탭 */}
                    {activeTab === 'info' && (
                        <div className="recruit-detail-card">
                            <div className="detail-section">
                                <h3>프로젝트 소개</h3>
                                <p style={{ whiteSpace: 'pre-wrap' }}>{recruit.description}</p>
                            </div>

                            <div className="detail-section">
                                <h3>모집 정보</h3>
                                <div className="info-grid">
                                    <div><strong>유형:</strong> {recruit.projectType}</div>
                                    <div><strong>모집 인원:</strong> {recruit.recruitNumber}명</div>
                                    <div><strong>마감일:</strong> {recruit.deadline}</div>
                                    <div><strong>작성자:</strong> {recruit.author.name} ({recruit.author.department})</div>
                                </div>
                            </div>

                            <div className="detail-section">
                                <h3>필요 기술 스택</h3>
                                <div className="tech-stacks">
                                    {recruit.requiredTechStacks.map((tech, i) => (
                                        <span key={i} className="tech-badge">{tech}</span>
                                    ))}
                                </div>
                            </div>

                            {/* 지원하기 영역 (작성자가 아닐 때만) */}
                            {!isAuthor && (
                                <div className="apply-section" style={{ marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                                    <h3>이 프로젝트에 지원하기</h3>
                                    <textarea
                                        className="form-textarea"
                                        placeholder="지원 동기와 각오를 간단히 적어주세요."
                                        value={motivation}
                                        onChange={(e) => setMotivation(e.target.value)}
                                        rows={3}
                                    />
                                    <button className="btn-create" onClick={handleApply} style={{ marginTop: '10px' }}>
                                        지원서 제출
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 지원자 관리 탭 */}
                    {activeTab === 'applicants' && (
                        <div className="applicants-list">
                            {applications.length === 0 ? <p>아직 지원자가 없습니다.</p> : (
                                applications.map(app => (
                                    <div key={app.id} className="recruit-card">
                                        <div className="recruit-header">
                                            <h4>{app.applicant.name} ({app.applicant.department})</h4>
                                            <span className={`deadline-badge ${app.status === 'accepted' ? 'active' : ''}`}>
                                                {app.status}
                                            </span>
                                        </div>
                                        <p><strong>지원 동기:</strong> {app.motivation}</p>
                                        <div className="tech-stacks">
                                            {app.applicant.techStacks.map((t, i) => <span key={i} className="tech-badge">{t}</span>)}
                                        </div>
                                        {app.status === 'pending' && (
                                            <div style={{ marginTop: '10px' }}>
                                                <button className="btn-create" onClick={() => handleAcceptApplicant(app.id)}>수락</button>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* AI 추천 탭 */}
                    {activeTab === 'ai-recommend' && (
                        <div className="ai-recommendations">
                            <div className="ai-banner">
                                <p>⚡ 프로젝트 성향과 기술 스택을 분석하여 최적의 팀원을 추천해 드립니다.</p>
                            </div>
                            {recommendations.map((rec, idx) => (
                                <div key={idx} className="recruit-card" style={{ border: '2px solid #6c5ce7' }}>
                                    <div className="recruit-header">
                                        <h4>{rec.user.name} ({rec.user.department})</h4>
                                        <span className="deadline-badge active">일치도 {rec.matchScore}%</span>
                                    </div>
                                    <div className="match-reasons">
                                        {Object.entries(rec.matchReasons).map(([key, val]) => (
                                            <div key={key}>• {key}: {val}</div>
                                        ))}
                                    </div>
                                    <button className="btn-primary" style={{ marginTop: '10px', width: '100%' }}>
                                        제안 메시지 보내기
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RecruitDetailPage;