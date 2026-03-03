import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { userService } from '../services/userService';
import { githubService, GitHubRepository } from '../services/githubService';
import { reviewService, ReviewSummary } from '../services/reviewService';
import { User, Project } from '../types';
import './RecruitsPage.css';

const ProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const { userId } = useParams<{ userId: string }>();
    const { user: authUser } = useAuth();

    // 다른 사람 프로필이면 userId 파라미터가 있음
    const isMyProfile = !userId;

    const [profile, setProfile] = useState<User | null>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [repos, setRepos] = useState<GitHubRepository[]>([]);
    const [reviewSummary, setReviewSummary] = useState<ReviewSummary | null>(null);
    const [githubUrl, setGithubUrl] = useState('');
    const [isEditingGithub, setIsEditingGithub] = useState(false);
    const [showReviewDetail, setShowReviewDetail] = useState(false);

    useEffect(() => {
        loadProfileData();
    }, [userId]);

    const loadProfileData = async () => {
        try {
            let userData: User;
            if (isMyProfile) {
                userData = await userService.getMyProfile();
                const projectData = await userService.getMyProjects();
                setProjects(projectData);
            } else {
                userData = await userService.getProfile(parseInt(userId!));
            }
            setProfile(userData);

            try {
                const summary = await reviewService.getUserReviewSummary(userData.id);
                setReviewSummary(summary);
            } catch (e) {
                console.log('리뷰 요약 없음');
            }

            if (userData.githubUrl) {
                try {
                    const repoData = await githubService.getRepositories(userData.id);
                    setRepos(repoData);
                } catch (e) {
                    console.log('GitHub 연동 실패');
                }
            }
        } catch (error) {
            console.error('프로필 로드 실패', error);
        }
    };

    // GitHub URL 정규화: https:// 없으면 자동으로 붙여줌
    const normalizeGithubUrl = (url: string): string => {
        const trimmed = url.trim();
        if (!trimmed) return '';
        if (trimmed.startsWith('https://') || trimmed.startsWith('http://')) return trimmed;
        if (trimmed.startsWith('github.com/')) return 'https://' + trimmed;
        return trimmed;
    };

    const validateGithubUrl = (url: string): boolean => {
        return url.includes('github.com/') && url.startsWith('https://');
    };

    const handleSaveGithubUrl = async () => {
        if (!githubUrl.trim()) {
            alert('GitHub URL을 입력해주세요.\n예: https://github.com/username');
            return;
        }
        const normalized = normalizeGithubUrl(githubUrl);
        if (!validateGithubUrl(normalized)) {
            alert('GitHub URL 형식을 확인해주세요.\n예: https://github.com/username');
            return;
        }
        try {
            await userService.connectGithub(normalized);
        } catch (e) {
            console.log('GitHub URL 저장 실패 (백엔드 미연결)');
        }
        if (profile) {
            setProfile({ ...profile, githubUrl: normalized });
        }
        setGithubUrl(normalized);
        setIsEditingGithub(false);
    };

    useEffect(() => {
        if (profile?.githubUrl) {
            setGithubUrl(profile.githubUrl);
        }
    }, [profile]);

    if (!profile) return <div>Loading...</div>;

    if (isMyProfile && !authUser) {
        return (
            <div className="recruits-page">
                <div className="recruits-container">
                    <div className="recruit-card" style={{ textAlign: 'center', padding: '40px' }}>
                        <h2>로그인이 필요합니다</h2>
                        <p style={{ marginTop: '20px', color: '#666' }}>프로필을 보려면 로그인해주세요.</p>
                        <button
                            onClick={() => navigate('/login')}
                            style={{
                                marginTop: '20px', padding: '10px 20px',
                                background: '#8B1538', color: 'white',
                                border: 'none', borderRadius: '4px',
                                cursor: 'pointer', fontWeight: 'bold'
                            }}
                        >
                            로그인하러 가기
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="recruits-page">
            <div className="recruits-container">
                {/* 다른 사람 프로필일 때 뒤로가기 버튼 */}
                {!isMyProfile && (
                    <div className="page-header" style={{ marginBottom: '20px' }}>
                        <button onClick={() => navigate(-1)} className="btn-back">← 뒤로가기</button>
                    </div>
                )}

                {/* 프로필 헤더 */}
                <div className="recruit-card" style={{ textAlign: 'center', padding: '40px' }}>
                    <div
                        className="avatar-circle"
                        style={{ width: '80px', height: '80px', fontSize: '2rem', margin: '0 auto 20px' }}
                    >
                        {profile.name[0]}
                    </div>
                    <h2>{profile.name}</h2>
                    <p>{profile.department} | {profile.studentId}</p>
                    <p style={{ color: '#666' }}>{profile.email}</p>

                    {/* 기술 스택 */}
                    <div className="tech-stacks" style={{ justifyContent: 'center', marginTop: '15px' }}>
                        {profile.techStacks.map((tech, i) => (
                            <span key={i} className="tech-badge">{tech}</span>
                        ))}
                    </div>

                    {/* GitHub 링크 섹션 */}
                    <div style={{ marginTop: '24px', maxWidth: '420px', margin: '24px auto 0' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', textAlign: 'left' }}>
                            💻 GitHub
                        </label>

                        {/* 내 프로필: 편집 가능 */}
                        {isMyProfile ? (
                            <div>
                                {isEditingGithub ? (
                                    /* 편집 모드 */
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        <input
                                            type="text"
                                            value={githubUrl}
                                            onChange={(e) => setGithubUrl(e.target.value)}
                                            placeholder="https://github.com/username"
                                            autoFocus
                                            onKeyDown={(e) => e.key === 'Enter' && handleSaveGithubUrl()}
                                            style={{
                                                flex: 1, padding: '10px',
                                                border: '2px solid #8B1538', borderRadius: '6px',
                                                fontSize: '14px', minWidth: '200px'
                                            }}
                                        />
                                        <button
                                            onClick={handleSaveGithubUrl}
                                            style={{
                                                padding: '10px 15px', background: '#28a745',
                                                color: 'white', border: 'none', borderRadius: '6px',
                                                cursor: 'pointer', fontWeight: 'bold'
                                            }}
                                        >
                                            저장
                                        </button>
                                        <button
                                            onClick={() => {
                                                setGithubUrl(profile.githubUrl || '');
                                                setIsEditingGithub(false);
                                            }}
                                            style={{
                                                padding: '10px 15px', background: '#6c757d',
                                                color: 'white', border: 'none', borderRadius: '6px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            취소
                                        </button>
                                    </div>
                                ) : (
                                    /* 보기 모드: URL 있으면 클릭 링크, 없으면 placeholder - 항상 "수정" 버튼 표시 */
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        {profile.githubUrl ? (
                                            <a
                                                href={profile.githubUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                style={{
                                                    flex: 1, display: 'flex', alignItems: 'center', gap: '8px',
                                                    padding: '10px 14px', border: '1px solid #ddd',
                                                    borderRadius: '6px', background: '#f6f8fa',
                                                    color: '#24292e', textDecoration: 'none',
                                                    fontSize: '14px', fontWeight: '500',
                                                }}
                                            >
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="#24292e">
                                                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                                                </svg>
                                                {profile.githubUrl.replace('https://github.com/', '@')}
                                                <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#8B1538' }}>↗ 방문</span>
                                            </a>
                                        ) : (
                                            <div
                                                style={{
                                                    flex: 1, padding: '10px 14px',
                                                    border: '1px dashed #ccc', borderRadius: '6px',
                                                    fontSize: '14px', color: '#aaa',
                                                    textAlign: 'left', cursor: 'text'
                                                }}
                                                onClick={() => setIsEditingGithub(true)}
                                            >
                                                GitHub 링크를 등록해주세요
                                            </div>
                                        )}
                                        <button
                                            onClick={() => setIsEditingGithub(true)}
                                            style={{
                                                padding: '10px 15px', background: '#8B1538',
                                                color: 'white', border: 'none', borderRadius: '6px',
                                                cursor: 'pointer', fontWeight: 'bold', fontSize: '13px',
                                                whiteSpace: 'nowrap'
                                            }}
                                        >
                                            수정
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* 다른 사람 프로필: 링크만 표시 (편집 불가) */
                            profile.githubUrl ? (
                                <a
                                    href={profile.githubUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '10px 14px',
                                        border: '1px solid #ddd',
                                        borderRadius: '6px',
                                        background: '#f6f8fa',
                                        color: '#24292e',
                                        textDecoration: 'none',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        transition: 'background 0.15s'
                                    }}
                                    onMouseEnter={e => (e.currentTarget.style.background = '#eaeef2')}
                                    onMouseLeave={e => (e.currentTarget.style.background = '#f6f8fa')}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#24292e">
                                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                                    </svg>
                                    {profile.githubUrl.replace('https://github.com/', '@')}
                                    <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#8B1538' }}>↗ GitHub 방문</span>
                                </a>
                            ) : (
                                <p style={{ color: '#999', fontSize: '14px', textAlign: 'left' }}>GitHub 링크가 등록되지 않았습니다.</p>
                            )
                        )}
                    </div>
                </div>

                {/* 2단 그리드 */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>

                    {/* 동료 평가 요약 */}
                    <div className="recruit-card">
                        <h3>📊 동료 평가 요약</h3>
                        {reviewSummary ? (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', alignItems: 'center' }}>
                                    <span style={{ minWidth: '60px', fontSize: '13px' }}>협업 능력</span>
                                    <div style={{ flex: 1, margin: '0 10px', background: '#e0e0e0', height: '8px', borderRadius: '4px' }}>
                                        <div style={{ width: `${reviewSummary.averageCollaborationScore * 20}%`, background: '#8B1538', height: '100%', borderRadius: '4px' }}></div>
                                    </div>
                                    <span style={{ fontSize: '13px', fontWeight: 'bold' }}>{reviewSummary.averageCollaborationScore.toFixed(1)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', alignItems: 'center' }}>
                                    <span style={{ minWidth: '60px', fontSize: '13px' }}>기술 역량</span>
                                    <div style={{ flex: 1, margin: '0 10px', background: '#e0e0e0', height: '8px', borderRadius: '4px' }}>
                                        <div style={{ width: `${reviewSummary.averageTechnicalScore * 20}%`, background: '#8B1538', height: '100%', borderRadius: '4px' }}></div>
                                    </div>
                                    <span style={{ fontSize: '13px', fontWeight: 'bold' }}>{reviewSummary.averageTechnicalScore.toFixed(1)}</span>
                                </div>
                                <div style={{ marginTop: '15px' }}>
                                    <strong style={{ fontSize: '13px' }}>자주 언급된 키워드:</strong>
                                    <div className="tech-stacks" style={{ marginTop: '8px' }}>
                                        {reviewSummary.topPositiveKeywords.map((k, i) => (
                                            <span key={i} className="tech-badge" style={{ backgroundColor: '#e3f2fd', color: '#1976d2' }}>{k}</span>
                                        ))}
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowReviewDetail(true)}
                                    style={{
                                        marginTop: '15px', padding: '8px 16px',
                                        background: '#8B1538', color: 'white',
                                        border: 'none', borderRadius: '4px',
                                        cursor: 'pointer', width: '100%', fontSize: '13px'
                                    }}
                                >
                                    상세 평가 보기
                                </button>
                            </div>
                        ) : (
                            <p style={{ color: '#999' }}>아직 받은 평가가 없습니다.</p>
                        )}
                    </div>

                    {/* GitHub 활동 */}
                    <div className="recruit-card">
                        <h3>💻 GitHub 활동</h3>
                        {repos.length > 0 ? (
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                {repos.map(repo => (
                                    <li key={repo.name} style={{ borderBottom: '1px solid #eee', padding: '10px 0' }}>
                                        <a
                                            href={repo.htmlUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            style={{ fontWeight: 'bold', color: '#0969da', fontSize: '14px' }}
                                        >
                                            {repo.name}
                                        </a>
                                        <p style={{ fontSize: '12px', color: '#666', margin: '4px 0' }}>{repo.description}</p>
                                        <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#888' }}>
                                            {repo.language && <span>● {repo.language}</span>}
                                            <span>⭐ {repo.stargazersCount}</span>
                                            <span>🍴 {repo.forksCount}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p style={{ color: '#999' }}>
                                {isMyProfile ? 'GitHub URL을 등록하면 레포지토리가 표시됩니다.' : 'GitHub 정보가 없습니다.'}
                            </p>
                        )}
                    </div>
                </div>

                {/* 참여 프로젝트 (내 프로필에서만) */}
                {isMyProfile && projects.length > 0 && (
                    <>
                        <h3 style={{ marginTop: '30px' }}>🚀 참여한 프로젝트</h3>
                        <div className="recruits-grid">
                            {projects.map(proj => (
                                <div key={proj.id} className="recruit-card">
                                    <h4>{proj.name}</h4>
                                    <p style={{ color: '#666', fontSize: '14px' }}>{proj.description}</p>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* 리뷰 상세 모달 */}
            {showReviewDetail && reviewSummary && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        background: 'white', padding: '30px',
                        borderRadius: '8px', maxWidth: '600px',
                        maxHeight: '80vh', overflow: 'auto', width: '90%'
                    }}>
                        <h2>동료 평가 상세</h2>
                        <div style={{ marginTop: '20px' }}>
                            {reviewSummary.recentComments.map((comment, i) => (
                                <div key={i} style={{
                                    padding: '15px', background: '#f9f9f9',
                                    borderRadius: '4px', marginBottom: '10px',
                                    borderLeft: '3px solid #8B1538'
                                }}>
                                    <p style={{ margin: 0, lineHeight: '1.6' }}>{comment}</p>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={() => setShowReviewDetail(false)}
                            style={{
                                marginTop: '20px', padding: '10px 20px',
                                background: '#8B1538', color: 'white',
                                border: 'none', borderRadius: '4px',
                                cursor: 'pointer', width: '100%'
                            }}
                        >
                            닫기
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;
