import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { userService } from '../services/userService';
import { githubService, GitHubRepository } from '../services/githubService';
import { reviewService, ReviewSummary } from '../services/reviewService';
import { User, Project } from '../types';
import './RecruitsPage.css'; // 기본 스타일 활용

const ProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const { user: authUser } = useAuth();
    const [profile, setProfile] = useState<User | null>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [repos, setRepos] = useState<GitHubRepository[]>([]);
    const [reviewSummary, setReviewSummary] = useState<ReviewSummary | null>(null);
    const [githubUrl, setGithubUrl] = useState('');
    const [isEditingGithub, setIsEditingGithub] = useState(false);
    const [showReviewDetail, setShowReviewDetail] = useState(false);

    useEffect(() => {
        loadProfileData();
    }, []);

    const loadProfileData = async () => {
        try {
            const userData = await userService.getMyProfile();
            setProfile(userData);

            const projectData = await userService.getMyProjects();
            setProjects(projectData);

            // 리뷰 요약 로드
            try {
                const summary = await reviewService.getUserReviewSummary(userData.id);
                setReviewSummary(summary);
            } catch (e) {
                console.log('리뷰 요약 없음');
            }

            // 깃허브 레포지토리 로드
            if (userData.githubUrl) {
                try {
                    const repoData = await githubService.getRepositories(userData.id);
                    setRepos(repoData);
                } catch (e) {
                    console.log('GitHub 연동 실패');
                }
            }
        } catch (error) {
            console.error('프로필 로드 실패 - 임시 데이터 사용', error);

            // 백엔드 미연결 시 임시 mock 데이터 사용
            const mockProfile: User = authUser || {
                id: 1,
                email: 'tempuser@sejong.ac.kr',
                name: '임시유저',
                studentId: '26012345',
                department: '컴퓨터공학과',
                techStacks: ['React', 'TypeScript', 'Node.js', 'Python'],
                interests: ['웹개발', 'AI', '알고리즘'],
                githubUrl: 'https://github.com/tempuser',
                profileImage: '',
                createdAt: new Date().toISOString(),
            };
            setProfile(mockProfile);

            // Mock 프로젝트 데이터
            const mockProjects: Project[] = [
                {
                    id: 1,
                    name: 'AI 챗봇 프로젝트',
                    description: 'GPT 기반 대화형 AI 챗봇 개발',
                    techStacks: ['Python', 'FastAPI', 'React'],
                    startDate: '2025-09-01',
                    endDate: '2025-12-20',
                    githubUrl: 'https://github.com/tempuser/ai-chatbot',
                    teamMembers: [],
                },
                {
                    id: 2,
                    name: '팀 매칭 플랫폼',
                    description: '대학생 팀 프로젝트 매칭 서비스',
                    techStacks: ['React', 'TypeScript', 'Node.js'],
                    startDate: '2026-01-01',
                    endDate: '2026-02-28',
                    githubUrl: 'https://github.com/tempuser/team-matching',
                    teamMembers: [],
                },
            ];
            setProjects(mockProjects);

            // Mock 리뷰 요약 데이터
            const mockReviewSummary: ReviewSummary = {
                userId: mockProfile.id,
                userName: mockProfile.name,
                averageCollaborationScore: 4.5,
                averageTechnicalScore: 4.2,
                averageResponsibilityScore: 4.7,
                totalReviewCount: 8,
                topPositiveKeywords: ['책임감', '소통', '적극적', '협력적'],
                recentComments: ['항상 적극적으로 참여해주셔서 좋았습니다', '기술적으로 뛰어나십니다'],
            };
            setReviewSummary(mockReviewSummary);

            // Mock GitHub 레포지토리 데이터
            const mockRepos: GitHubRepository[] = [
                {
                    name: 'ai-chatbot',
                    description: 'GPT 기반 대화형 AI 챗봇',
                    htmlUrl: 'https://github.com/tempuser/ai-chatbot',
                    stargazersCount: 15,
                    language: 'Python',
                    forksCount: 3,
                    isPrivate: false,
                },
                {
                    name: 'team-matching',
                    description: '대학생 팀 프로젝트 매칭 플랫폼',
                    htmlUrl: 'https://github.com/tempuser/team-matching',
                    stargazersCount: 8,
                    language: 'TypeScript',
                    forksCount: 2,
                    isPrivate: false,
                },
                {
                    name: 'algorithm-study',
                    description: '알고리즘 문제 풀이 저장소',
                    htmlUrl: 'https://github.com/tempuser/algorithm-study',
                    stargazersCount: 3,
                    language: 'Python',
                    forksCount: 1,
                    isPrivate: false,
                },
            ];
            setRepos(mockRepos);
        }
    };

    const validateGithubUrl = (url: string): boolean => {
        const githubPattern = /^https:\/\/(www\.)?github\.com\/[a-zA-Z0-9_-]+\/?$/;
        return githubPattern.test(url);
    };

    const handleSaveGithubUrl = () => {
        if (!githubUrl.trim()) {
            alert('GitHub URL을 입력해주세요.');
            return;
        }
        if (!validateGithubUrl(githubUrl)) {
            alert('유효한 GitHub URL을 입력해주세요.\n예: https://github.com/username');
            return;
        }
        // 여기서 백엔드 API 호출하여 저장
        if (profile) {
            setProfile({ ...profile, githubUrl });
        }
        setIsEditingGithub(false);
        alert('GitHub URL이 저장되었습니다.');
    };

    useEffect(() => {
        if (profile?.githubUrl) {
            setGithubUrl(profile.githubUrl);
        }
    }, [profile]);

    if (!profile) return <div>Loading...</div>;

    // 로그인 상태 확인
    if (!authUser) {
        return (
            <div className="recruits-page">
                <div className="recruits-container">
                    <div className="recruit-card" style={{ textAlign: 'center', padding: '40px' }}>
                        <h2>로그인이 필요합니다</h2>
                        <p style={{ marginTop: '20px', color: '#666' }}>
                            프로필을 보려면 로그인해주세요.
                        </p>
                        <button
                            onClick={() => navigate('/login')}
                            style={{
                                marginTop: '20px',
                                padding: '10px 20px',
                                background: '#8B1538',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontWeight: 'bold'
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
                {/* 프로필 헤더 */}
                <div className="recruit-card" style={{ textAlign: 'center', padding: '40px' }}>
                    <div className="avatar-circle" style={{ width: '80px', height: '80px', fontSize: '2rem', margin: '0 auto 20px' }}>
                        {profile.name[0]}
                    </div>
                    <h2>{profile.name}</h2>
                    <p>{profile.department} | {profile.studentId}</p>
                    <p>{profile.email}</p>
                    <div className="tech-stacks" style={{ justifyContent: 'center', marginTop: '15px' }}>
                        {profile.techStacks.map((tech, i) => (
                            <span key={i} className="tech-badge">{tech}</span>
                        ))}
                    </div>
                    {/* GitHub 링크 섭션 */}
                    <div style={{ marginTop: '20px', maxWidth: '400px', margin: '20px auto 0' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', textAlign: 'left' }}>
                            💻 GitHub 링크
                        </label>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <input
                                type="text"
                                value={githubUrl}
                                onChange={(e) => setGithubUrl(e.target.value)}
                                placeholder="https://github.com/username"
                                readOnly={!isEditingGithub}
                                style={{
                                    flex: 1,
                                    padding: '10px',
                                    border: isEditingGithub ? '2px solid #8B1538' : '1px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '14px',
                                    background: isEditingGithub ? 'white' : '#f9f9f9'
                                }}
                            />
                            {!isEditingGithub ? (
                                <button
                                    onClick={() => setIsEditingGithub(true)}
                                    style={{
                                        padding: '10px 15px',
                                        background: '#8B1538',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    수정
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={handleSaveGithubUrl}
                                        style={{
                                            padding: '10px 15px',
                                            background: '#28a745',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontWeight: 'bold'
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
                                            padding: '10px 15px',
                                            background: '#6c757d',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        취소
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* 2단 그리드 */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>

                    {/* 동료 평가 요약 섹션 */}
                    <div className="recruit-card">
                        <h3>📊 동료 평가 요약</h3>
                        {reviewSummary ? (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', alignItems: 'center' }}>
                                    <span>협업 능력</span>
                                    <div style={{ flex: 1, margin: '0 10px', background: '#e0e0e0', height: '8px', borderRadius: '4px' }}>
                                        <div style={{ width: `${reviewSummary.averageCollaborationScore * 20}%`, background: '#8B1538', height: '100%', borderRadius: '4px' }}></div>
                                    </div>
                                    <span>{reviewSummary.averageCollaborationScore.toFixed(1)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', alignItems: 'center' }}>
                                    <span>기술 역량</span>
                                    <div style={{ flex: 1, margin: '0 10px', background: '#e0e0e0', height: '8px', borderRadius: '4px' }}>
                                        <div style={{ width: `${reviewSummary.averageTechnicalScore * 20}%`, background: '#8B1538', height: '100%', borderRadius: '4px' }}></div>
                                    </div>
                                    <span>{reviewSummary.averageTechnicalScore.toFixed(1)}</span>
                                </div>
                                <div style={{ marginTop: '15px' }}>
                                    <strong>자주 언급된 키워드:</strong>
                                    <div className="tech-stacks" style={{ marginTop: '5px' }}>
                                        {reviewSummary.topPositiveKeywords.map((k, i) => (
                                            <span key={i} className="tech-badge" style={{ backgroundColor: '#e3f2fd', color: '#1976d2' }}>{k}</span>
                                        ))}
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowReviewDetail(true)}
                                    style={{
                                        marginTop: '15px',
                                        padding: '8px 16px',
                                        background: '#8B1538',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        width: '100%'
                                    }}
                                >
                                    상세 평가 보기
                                </button>
                            </div>
                        ) : (
                            <p>아직 받은 평가가 없습니다.</p>
                        )}
                    </div>

                    {/* GitHub 활동 섹션 */}
                    <div className="recruit-card">
                        <h3>💻 GitHub 활동</h3>
                        {repos.length > 0 ? (
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                {repos.map(repo => (
                                    <li key={repo.name} style={{ borderBottom: '1px solid #eee', padding: '10px 0' }}>
                                        <a href={repo.htmlUrl} target="_blank" rel="noreferrer" style={{ fontWeight: 'bold', color: '#333' }}>
                                            {repo.name}
                                        </a>
                                        <p style={{ fontSize: '0.8rem', color: '#666' }}>{repo.description}</p>
                                        <span style={{ fontSize: '0.8rem' }}>⭐ {repo.stargazersCount}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>GitHub 연동이 필요합니다.</p>
                        )}
                    </div>
                </div>

                {/* 참여 프로젝트 목록 */}
                <h3 style={{ marginTop: '30px' }}>🚀 참여한 프로젝트</h3>
                <div className="recruits-grid">
                    {projects.map(proj => (
                        <div key={proj.id} className="recruit-card">
                            <h4>{proj.name}</h4>
                            <p>{proj.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* 리뷰 상세 모달 */}
            {showReviewDetail && reviewSummary && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        background: 'white',
                        padding: '30px',
                        borderRadius: '8px',
                        maxWidth: '600px',
                        maxHeight: '80vh',
                        overflow: 'auto',
                        width: '90%'
                    }}>
                        <h2>동료 평가 상세</h2>
                        <div style={{ marginTop: '20px' }}>
                            {reviewSummary.recentComments.map((comment, i) => (
                                <div key={i} style={{
                                    padding: '15px',
                                    background: '#f9f9f9',
                                    borderRadius: '4px',
                                    marginBottom: '10px',
                                    borderLeft: '3px solid #8B1538'
                                }}>
                                    <p style={{ margin: 0, lineHeight: '1.6' }}>{comment}</p>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={() => setShowReviewDetail(false)}
                            style={{
                                marginTop: '20px',
                                padding: '10px 20px',
                                background: '#8B1538',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                width: '100%'
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