import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { recruitService } from '../services/recruitService';
import { commentService, CommentResponse } from '../services/commentService';
import { useAuth } from '../hooks/useAuth';
import { RecruitPost, Application, RecommendationResult } from '../types';
import './RecruitsPage.css';
import './RecruitDetailPage.css';

const RecruitDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [recruit, setRecruit] = useState<RecruitPost | null>(null);
    const [recruitError, setRecruitError] = useState(false);
    const [applications, setApplications] = useState<Application[]>([]);
    const [recommendations, setRecommendations] = useState<RecommendationResult[]>([]);
    const [activeTab, setActiveTab] = useState<'info' | 'applicants' | 'ai-recommend'>('info');

    // 지원하기
    const [isApplyFormOpen, setIsApplyFormOpen] = useState(false);
    const [motivation, setMotivation] = useState('');
    const [hasApplied, setHasApplied] = useState(false);
    const [myApplicationId, setMyApplicationId] = useState<number | null>(null);

    // 지원자 메모 (모집 공고 작성자용)
    const [memos, setMemos] = useState<Record<number, string>>({});

    // 공고 수정
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editProjectType, setEditProjectType] = useState('');
    const [editTechInput, setEditTechInput] = useState('');
    const [editRecruitNumber, setEditRecruitNumber] = useState(1);

    // 댓글
    const [comments, setComments] = useState<CommentResponse[]>([]);
    const [commentText, setCommentText] = useState('');
    const [isSecretComment, setIsSecretComment] = useState(false);
    const [replyingTo, setReplyingTo] = useState<number | null>(null);
    const [replyText, setReplyText] = useState('');
    const [isSecretReply, setIsSecretReply] = useState(false);

    // 댓글 작성자 프로필 모달
    const [commentProfile, setCommentProfile] = useState<{ id: number; name: string; department: string } | null>(null);

    const loadRecruitData = useCallback(async (recruitId: number) => {
        try {
            const data = await recruitService.getRecruitPost(recruitId);
            setRecruit(data);
            if (user && data.authorId === user.id) {
                try {
                    const apps = await recruitService.getApplications(recruitId);
                    setApplications(apps);
                    setMemos(apps.reduce((acc, a) => ({ ...acc, [a.id]: a.memo || '' }), {}));
                } catch (appsError) {
                    console.error('지원자 목록 불러오기 실패', appsError);
                }
            }
        } catch (error) {
            console.error('공고 불러오기 실패', error);
            setRecruitError(true);
        }
    }, [user]);

    useEffect(() => {
        if (id) {
            loadRecruitData(parseInt(id));
            loadComments(parseInt(id));
        }
    }, [id, loadRecruitData]);

    const loadComments = async (projectId: number) => {
        try {
            const data = await commentService.getComments(projectId);
            setComments(data);
        } catch (e) {
            console.error('댓글 불러오기 실패', e);
            setComments([]);
        }
    };

    // 모집 상태 토글 (모집중 ↔ 마감)
    const handleToggleStatus = async () => {
        if (!recruit || !id) return;
        const newStatus = recruit.status === 'RECRUITING' ? 'COMPLETED' : 'RECRUITING';
        try {
            await recruitService.updateProjectStatus(parseInt(id), newStatus);
        } catch (e) {
            console.log('상태 변경 실패 (백엔드 미연결 - 로컬 적용)');
        }
        setRecruit({ ...recruit, status: newStatus });
    };

    // AI 추천 로드 (다른 팀원이 구현 예정)
    const handleLoadRecommendations = async () => {
        if (!id) return;
        try {
            const data = await recruitService.getRecommendedMembers(parseInt(id));
            setRecommendations(data);
        } catch (error) {
            console.error('AI 추천 로드 실패', error);
        }
    };

    // 지원자 메모 저장
    const handleSaveMemo = async (appId: number) => {
        if (!id) return;
        const memoText = memos[appId] ?? '';
        try {
            await recruitService.saveMemo(parseInt(id), appId, memoText);
            setApplications(prev => prev.map(a => a.id === appId ? { ...a, memo: memoText } : a));
        } catch (e) {
            console.error('메모 저장 실패 (로컬 적용)', e);
            setApplications(prev => prev.map(a => a.id === appId ? { ...a, memo: memoText } : a));
        }
    };

    // 댓글 등록
    const handleSubmitComment = async () => {
        if (!commentText.trim() || !id) return;
        try {
            const newComment = await commentService.createComment(
                parseInt(id), commentText.trim(), isSecretComment
            );
            setComments(prev => [...prev, newComment]);
            setCommentText('');
            setIsSecretComment(false);
        } catch (e) {
            console.error('댓글 등록 실패', e);
            alert('댓글 등록에 실패했습니다. 다시 시도해주세요.');
        }
    };

    // 대댓글 등록
    const handleSubmitReply = async (parentId: number) => {
        if (!replyText.trim() || !id) return;
        try {
            const newReply = await commentService.createComment(
                parseInt(id), replyText.trim(), isSecretReply, parentId
            );
            setComments(prev => [...prev, newReply]);
            setReplyText('');
            setIsSecretReply(false);
            setReplyingTo(null);
        } catch (e) {
            console.error('답글 등록 실패', e);
            alert('답글 등록에 실패했습니다. 다시 시도해주세요.');
        }
    };

    // 댓글 삭제
    const handleDeleteComment = async (commentId: number) => {
        if (!id) return;
        try {
            await commentService.deleteComment(parseInt(id), commentId);
            setComments(prev => prev.filter(c => c.id !== commentId));
        } catch (e) {
            console.error('댓글 삭제 실패', e);
            alert('댓글 삭제에 실패했습니다. 다시 시도해주세요.');
        }
    };

    // 지원하기
    const handleApply = async () => {
        if (!motivation.trim() || !id) return;
        try {
            const result = await recruitService.applyToRecruit(parseInt(id), motivation.trim());
            setHasApplied(true);
            setMyApplicationId(result.id);
            setIsApplyFormOpen(false);
            setMotivation('');
        } catch (e: any) {
            const msg = e?.response?.data?.message;
            alert(msg === 'DUPLICATE_APPLICATION' ? '이미 지원한 공고입니다.' : '지원에 실패했습니다. 다시 시도해주세요.');
        }
    };

    // 지원 취소
    const handleCancelApplication = async () => {
        if (!id || !myApplicationId) return;
        if (!window.confirm('지원을 취소하시겠습니까?')) return;
        try {
            await recruitService.cancelApplication(parseInt(id), myApplicationId);
            setHasApplied(false);
            setMyApplicationId(null);
        } catch (e) {
            alert('지원 취소에 실패했습니다. 다시 시도해주세요.');
        }
    };

    // 쪽지 보내기 - 메시지 페이지로 이동하며 대화 상대 정보 전달
    const handleSendMessage = (targetId: number, targetName: string, targetDept: string) => {
        navigate('/messages', {
            state: { partnerId: targetId, partnerName: targetName, partnerDepartment: targetDept }
        });
    };

    // 공고 수정 시작
    const handleStartEdit = () => {
        if (!recruit) return;
        setEditTitle(recruit.title);
        setEditDescription(recruit.description);
        setEditProjectType(recruit.projectType);
        setEditTechInput(recruit.requiredTechStacks.join(', '));
        setEditRecruitNumber(recruit.recruitNumber);
        setIsEditing(true);
    };

    // 공고 수정 저장
    const handleSaveEdit = async () => {
        if (!recruit || !id) return;
        const techStacks = editTechInput.split(',').map(t => t.trim()).filter(Boolean);
        try {
            const updated = await recruitService.updateRecruitPost(parseInt(id), {
                title: editTitle,
                description: editDescription,
                projectType: editProjectType,
                requiredTechStacks: techStacks,
                recruitNumber: editRecruitNumber,
            });
            setRecruit(updated);
            setIsEditing(false);
        } catch (e) {
            alert('수정에 실패했습니다. 다시 시도해주세요.');
        }
    };

    if (recruitError) return (
        <div className="recruits-page">
            <div className="recruits-container">
                <div style={{ textAlign: 'center', padding: '80px 20px', color: '#888' }}>
                    <p style={{ fontSize: '16px', marginBottom: '16px' }}>공고를 불러오는 데 실패했습니다.</p>
                    <button className="btn-message" onClick={() => navigate('/recruits')}>← 목록으로 돌아가기</button>
                </div>
            </div>
        </div>
    );
    if (!recruit) return (
        <div className="recruits-page">
            <div className="recruits-container">
                <div style={{ textAlign: 'center', padding: '80px 20px', color: '#aaa' }}>불러오는 중...</div>
            </div>
        </div>
    );

    const isAuthor = user?.id === recruit.authorId;
    const isRecruiting = recruit.status === 'RECRUITING';

    // 댓글을 최상위 댓글과 대댓글로 분류
    const topLevelComments = comments.filter(c => !c.parentId);
    const repliesMap = comments.reduce((acc, c) => {
        if (c.parentId) {
            acc[c.parentId] = [...(acc[c.parentId] || []), c];
        }
        return acc;
    }, {} as Record<number, CommentResponse[]>);

    return (
        <div className="recruits-page">
            <div className="recruits-container">
                {/* 헤더 */}
                <div className="page-header">
                    <button onClick={() => navigate('/recruits')} className="btn-back">← 목록으로</button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                        <h1 style={{ flex: 1 }}>{recruit.title}</h1>
                        {/* 상태 배지 */}
                        <span className={`status-badge ${isRecruiting ? 'recruiting' : 'closed'}`}>
                            {isRecruiting ? '🟢 모집중' : '🔴 마감'}
                        </span>
                        {/* 작성자 전용: 모집 상태 토글 + 수정 */}
                        {isAuthor && (
                            <>
                                <button
                                    onClick={handleToggleStatus}
                                    className={`toggle-status-btn ${isRecruiting ? 'close' : 'open'}`}
                                >
                                    {isRecruiting ? '모집 마감하기' : '모집 재개하기'}
                                </button>
                                {!isEditing && (
                                    <button
                                        onClick={handleStartEdit}
                                        className="toggle-status-btn open"
                                    >
                                        수정하기
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* 탭 */}
                <div className="tabs">
                    <button className={`tab ${activeTab === 'info' ? 'active' : ''}`} onClick={() => setActiveTab('info')}>
                        📋 상세 정보
                    </button>
                    {isAuthor && (
                        <>
                            <button
                                className={`tab ${activeTab === 'applicants' ? 'active' : ''}`}
                                onClick={() => setActiveTab('applicants')}
                            >
                                🙋 지원자 관리 ({applications.length})
                            </button>
                            <button
                                className={`tab ${activeTab === 'ai-recommend' ? 'active' : ''}`}
                                onClick={() => { setActiveTab('ai-recommend'); handleLoadRecommendations(); }}
                            >
                                🤖 AI 팀원 추천
                            </button>
                        </>
                    )}
                </div>

                <div className="recruit-content-body" style={{ marginTop: '20px' }}>

                    {/* ── 상세 정보 탭 ── */}
                    {activeTab === 'info' && (
                        <div className="recruit-detail-card">
                            {/* 수정 폼 */}
                            {isEditing && (
                                <div className="detail-section">
                                    <h3>공고 수정</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <div>
                                            <label style={{ fontSize: '13px', fontWeight: 600, color: '#555', display: 'block', marginBottom: '4px' }}>제목</label>
                                            <input
                                                type="text"
                                                value={editTitle}
                                                onChange={e => setEditTitle(e.target.value)}
                                                style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '13px', fontWeight: 600, color: '#555', display: 'block', marginBottom: '4px' }}>프로젝트 소개</label>
                                            <textarea
                                                className="comment-textarea"
                                                value={editDescription}
                                                onChange={e => setEditDescription(e.target.value)}
                                                rows={5}
                                                style={{ marginTop: 0 }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '13px', fontWeight: 600, color: '#555', display: 'block', marginBottom: '4px' }}>유형</label>
                                            <select
                                                value={editProjectType}
                                                onChange={e => setEditProjectType(e.target.value)}
                                                style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px' }}
                                            >
                                                <option value="hackathon">해커톤</option>
                                                <option value="capstone">캡스톤</option>
                                                <option value="creative">창의학기제</option>
                                                <option value="other">기타</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '13px', fontWeight: 600, color: '#555', display: 'block', marginBottom: '4px' }}>모집 인원</label>
                                            <input
                                                type="number"
                                                min={1}
                                                value={editRecruitNumber}
                                                onChange={e => setEditRecruitNumber(parseInt(e.target.value) || 1)}
                                                style={{ width: '80px', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '13px', fontWeight: 600, color: '#555', display: 'block', marginBottom: '4px' }}>기술 스택 (쉼표로 구분)</label>
                                            <input
                                                type="text"
                                                value={editTechInput}
                                                onChange={e => setEditTechInput(e.target.value)}
                                                placeholder="예: React, TypeScript, Java"
                                                style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                                            />
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                            <button
                                                onClick={() => setIsEditing(false)}
                                                style={{ padding: '8px 16px', border: '1px solid #ddd', borderRadius: '8px', background: '#fff', cursor: 'pointer', fontSize: '14px' }}
                                            >
                                                취소
                                            </button>
                                            <button
                                                className="comment-submit-btn"
                                                onClick={handleSaveEdit}
                                                disabled={!editTitle.trim()}
                                            >
                                                저장
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {!isEditing && <div className="detail-section">
                                <h3>프로젝트 소개</h3>
                                <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8' }}>{recruit.description}</p>
                            </div>}

                            {!isEditing && (
                            <div className="detail-section">
                                <h3>모집 정보</h3>
                                <div className="info-grid">
                                    <div><strong>유형:</strong> {recruit.projectType}</div>
                                    <div><strong>모집 인원:</strong> {recruit.recruitNumber}명</div>
                                    <div><strong>마감일:</strong> {recruit.deadline}</div>
                                    <div>
                                        <strong>작성자:</strong>{' '}
                                        {isAuthor ? (
                                            <span style={{ fontWeight: '600', color: '#333' }}>
                                                {user?.name || recruit.author.name}{' '}
                                                <span style={{ color: '#8B1538', fontSize: '13px' }}>(나)</span>
                                            </span>
                                        ) : (
                                            <span
                                                onClick={() => navigate(`/profile/${recruit.authorId}`)}
                                                style={{ color: '#8B1538', cursor: 'pointer', textDecoration: 'underline', fontWeight: '500' }}
                                            >
                                                {recruit.author.name}
                                            </span>
                                        )}
                                        {' '}({recruit.author.department})
                                    </div>
                                </div>
                            </div>
                            )}

                            {!isEditing && (
                            <div className="detail-section">
                                <h3>필요 기술 스택</h3>
                                <div className="tech-stacks">
                                    {recruit.requiredTechStacks.map((tech, i) => (
                                        <span key={i} className="tech-badge">{tech}</span>
                                    ))}
                                </div>
                            </div>
                            )}

                            {/* 작성자가 아닐 때: 지원하기 + 쪽지 보내기 */}
                            {!isAuthor && (
                                <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #eee' }}>

                                    {/* 지원하기 */}
                                    {user ? (
                                        <div className="apply-section">
                                            {hasApplied ? (
                                                <div className="apply-done">
                                                    <span>✅ 지원이 완료되었습니다!</span>
                                                    <button className="btn-cancel-apply" onClick={handleCancelApplication}>
                                                        지원 취소
                                                    </button>
                                                </div>
                                            ) : (
                                                <>
                                                    <button
                                                        className="btn-apply"
                                                        onClick={() => setIsApplyFormOpen(v => !v)}
                                                    >
                                                        {isApplyFormOpen ? '✕ 닫기' : '📩 지원하기'}
                                                    </button>
                                                    {isApplyFormOpen && (
                                                        <div className="apply-form">
                                                            <label style={{ fontSize: '14px', fontWeight: '600', color: '#333' }}>
                                                                지원 동기 <span style={{ color: '#8B1538' }}>*</span>
                                                            </label>
                                                            <textarea
                                                                className="comment-textarea"
                                                                placeholder="이 프로젝트에 지원하는 이유, 본인의 역량, 기여할 수 있는 점 등을 자유롭게 작성해주세요."
                                                                value={motivation}
                                                                onChange={e => setMotivation(e.target.value)}
                                                                rows={4}
                                                                style={{ marginTop: '8px' }}
                                                            />
                                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                                                                <button
                                                                    style={{ padding: '8px 16px', border: '1px solid #ddd', borderRadius: '8px', background: '#fff', cursor: 'pointer', fontSize: '14px' }}
                                                                    onClick={() => { setIsApplyFormOpen(false); setMotivation(''); }}
                                                                >
                                                                    취소
                                                                </button>
                                                                <button
                                                                    className="comment-submit-btn"
                                                                    onClick={handleApply}
                                                                    disabled={!motivation.trim()}
                                                                >
                                                                    지원하기
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    ) : (
                                        <p style={{ fontSize: '14px', color: '#888' }}>
                                            지원하려면{' '}
                                            <span onClick={() => navigate('/login')} style={{ color: '#8B1538', cursor: 'pointer', textDecoration: 'underline' }}>
                                                로그인
                                            </span>
                                            이 필요합니다.
                                        </p>
                                    )}

                                    {/* 쪽지 보내기 */}
                                    <div className="message-section">
                                        <button
                                            className="btn-message"
                                            onClick={() => handleSendMessage(recruit.authorId, recruit.author.name, recruit.author.department)}
                                        >
                                            💬 {recruit.author.name}에게 쪽지 보내기
                                        </button>
                                        <p className="message-note">
                                            쪽지는 작성자와 자유롭게 소통하기 위한 기능입니다. 지원과는 별개로 사용해주세요.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* ── 댓글 섹션 ── */}
                            <div className="comment-section">
                                <h3>
                                    💬 댓글 <span style={{ fontSize: '14px', color: '#888', fontWeight: 'normal' }}>
                                        ({comments.filter(c =>
                                            !c.isSecret || user?.id === c.authorId || user?.id === recruit.authorId
                                        ).length})
                                    </span>
                                </h3>

                                {/* 댓글 목록 */}
                                <div className="comment-list">
                                    {topLevelComments.length === 0 && (
                                        <p style={{ color: '#aaa', textAlign: 'center', padding: '20px' }}>
                                            첫 댓글을 남겨보세요!
                                        </p>
                                    )}
                                    {topLevelComments.map(comment => {
                                        const canSee = !comment.isSecret
                                            || user?.id === comment.authorId
                                            || user?.id === recruit.authorId;
                                        const replies = repliesMap[comment.id] || [];

                                        if (!canSee) {
                                            return (
                                                <div key={comment.id} className="comment-thread">
                                                    <div className="comment-item secret-hidden">
                                                        <div className="comment-author">
                                                            <div className="comment-avatar">🔒</div>
                                                            <span className="comment-author-name">비밀글</span>
                                                            <span className="comment-date" style={{ marginLeft: '8px' }}>
                                                                {new Date(comment.createdAt).toLocaleDateString('ko-KR')}
                                                            </span>
                                                        </div>
                                                        <p className="comment-content secret">🔒 비밀글입니다.</p>
                                                    </div>
                                                </div>
                                            );
                                        }

                                        const isMine = user?.id === comment.authorId;
                                        const isPostAuthorComment = comment.authorId === recruit.authorId;
                                        const displayName = comment.authorName + (isPostAuthorComment ? '(작성자)' : '');

                                        return (
                                            <div key={comment.id} className="comment-thread">
                                                {/* 원댓글 */}
                                                <div className={`comment-item ${comment.isSecret ? 'secret-visible' : ''} ${isMine ? 'my-comment' : ''}`}>
                                                    <div className="comment-author">
                                                        <div
                                                            className="comment-avatar clickable"
                                                            onClick={() => setCommentProfile({ id: comment.authorId, name: comment.authorName, department: comment.authorDepartment })}
                                                            title={`${comment.authorName} 프로필 보기`}
                                                        >
                                                            {(comment.authorName || '?')[0]}
                                                        </div>
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                                                <span className="comment-author-name clickable" onClick={() => setCommentProfile({ id: comment.authorId, name: comment.authorName, department: comment.authorDepartment })}>
                                                                    {displayName}
                                                                </span>
                                                                <span style={{ fontSize: '12px', color: '#aaa' }}>{comment.authorDepartment}</span>
                                                                {comment.isSecret && <span className="secret-badge">🔒 비밀글</span>}
                                                            </div>
                                                            <span className="comment-date">
                                                                {new Date(comment.createdAt).toLocaleString('ko-KR', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                        <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                                                            {!isMine && (
                                                                <button className="comment-dm-btn" onClick={() => handleSendMessage(comment.authorId, comment.authorName, comment.authorDepartment)} title="쪽지 보내기">💬</button>
                                                            )}
                                                            {isMine && (
                                                                <button className="comment-dm-btn" onClick={() => handleDeleteComment(comment.id)} title="댓글 삭제" style={{ color: '#dc2626' }}>🗑</button>
                                                            )}
                                                            {user && (
                                                                <button
                                                                    className={`comment-dm-btn reply-btn ${replyingTo === comment.id ? 'active' : ''}`}
                                                                    onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                                                                    title="답글 달기"
                                                                >
                                                                    {replyingTo === comment.id ? '✕' : '↩ 답글'}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <p className="comment-content">{comment.content}</p>
                                                </div>

                                                {/* 대댓글 영역 */}
                                                {(replies.length > 0 || replyingTo === comment.id) && (
                                                    <div className="replies-container">
                                                        {replies.map(reply => {
                                                            const replySee = !reply.isSecret
                                                                || user?.id === reply.authorId
                                                                || user?.id === recruit.authorId;
                                                            if (!replySee) {
                                                                return (
                                                                    <div key={reply.id} className="reply-item comment-item secret-hidden">
                                                                        <div className="comment-author">
                                                                            <div className="comment-avatar">🔒</div>
                                                                            <span className="comment-author-name">비밀 답글</span>
                                                                        </div>
                                                                        <p className="comment-content secret">🔒 비밀글입니다.</p>
                                                                    </div>
                                                                );
                                                            }
                                                            const replyIsMine = user?.id === reply.authorId;
                                                            const replyIsPostAuthor = reply.authorId === recruit.authorId;
                                                            const replyDisplayName = reply.authorName + (replyIsPostAuthor ? '(작성자)' : '');
                                                            return (
                                                                <div key={reply.id} className={`reply-item comment-item ${reply.isSecret ? 'secret-visible' : ''} ${replyIsMine ? 'my-comment' : ''}`}>
                                                                    <div className="comment-author">
                                                                        <div className="reply-arrow">↩</div>
                                                                        <div className="comment-avatar clickable" onClick={() => setCommentProfile({ id: reply.authorId, name: reply.authorName, department: reply.authorDepartment })}>
                                                                            {(reply.authorName || '?')[0]}
                                                                        </div>
                                                                        <div style={{ flex: 1 }}>
                                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                                                                <span className="comment-author-name clickable" onClick={() => setCommentProfile({ id: reply.authorId, name: reply.authorName, department: reply.authorDepartment })}>
                                                                                    {replyDisplayName}
                                                                                </span>
                                                                                <span style={{ fontSize: '12px', color: '#aaa' }}>{reply.authorDepartment}</span>
                                                                                {reply.isSecret && <span className="secret-badge">🔒 비밀글</span>}
                                                                            </div>
                                                                            <span className="comment-date">
                                                                                {new Date(reply.createdAt).toLocaleString('ko-KR', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                                            </span>
                                                                        </div>
                                                                        <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                                                                            {!replyIsMine && (
                                                                                <button className="comment-dm-btn" onClick={() => handleSendMessage(reply.authorId, reply.authorName, reply.authorDepartment)} title="쪽지 보내기">💬</button>
                                                                            )}
                                                                            {replyIsMine && (
                                                                                <button className="comment-dm-btn" onClick={() => handleDeleteComment(reply.id)} title="답글 삭제" style={{ color: '#dc2626' }}>🗑</button>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <p className="comment-content" style={{ paddingLeft: '70px' }}>{reply.content}</p>
                                                                </div>
                                                            );
                                                        })}

                                                        {/* 답글 입력창 */}
                                                        {replyingTo === comment.id && user && (
                                                            <div className="reply-input-inline">
                                                                <div className="comment-input-header">
                                                                    <div className="reply-arrow">↩</div>
                                                                    <div className="comment-avatar">{user.name[0]}</div>
                                                                    <span style={{ fontWeight: '600', fontSize: '14px' }}>{user.name}</span>
                                                                    <label className="secret-toggle">
                                                                        <input type="checkbox" checked={isSecretReply} onChange={e => setIsSecretReply(e.target.checked)} />
                                                                        <span>🔒 비밀글</span>
                                                                    </label>
                                                                    <button
                                                                        onClick={() => { setReplyingTo(null); setReplyText(''); setIsSecretReply(false); }}
                                                                        style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '13px' }}
                                                                    >
                                                                        취소
                                                                    </button>
                                                                </div>
                                                                <textarea
                                                                    className="comment-textarea"
                                                                    placeholder={isSecretReply ? '비밀 답글: 작성자와 본인만 볼 수 있습니다.' : '답글을 입력하세요... (Ctrl+Enter로 등록)'}
                                                                    value={replyText}
                                                                    onChange={e => setReplyText(e.target.value)}
                                                                    rows={2}
                                                                    autoFocus
                                                                    onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleSubmitReply(comment.id); }}
                                                                />
                                                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                                    <button className="comment-submit-btn" onClick={() => handleSubmitReply(comment.id)} disabled={!replyText.trim()}>
                                                                        등록
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* 댓글 입력창 */}
                                {user ? (
                                    <div className="comment-input-area">
                                        <div className="comment-input-header">
                                            <div className="comment-avatar">{user.name[0]}</div>
                                            <span style={{ fontWeight: '600', fontSize: '14px' }}>{user.name}</span>
                                            <label className="secret-toggle">
                                                <input
                                                    type="checkbox"
                                                    checked={isSecretComment}
                                                    onChange={e => setIsSecretComment(e.target.checked)}
                                                />
                                                <span>🔒 비밀글</span>
                                            </label>
                                        </div>
                                        <textarea
                                            className="comment-textarea"
                                            placeholder={isSecretComment
                                                ? '비밀글: 작성자와 본인만 볼 수 있습니다.'
                                                : '댓글을 입력하세요. 질문, 지원 의사, 현황 공유 등 자유롭게!'}
                                            value={commentText}
                                            onChange={e => setCommentText(e.target.value)}
                                            rows={3}
                                            onKeyDown={e => {
                                                if (e.key === 'Enter' && e.ctrlKey) handleSubmitComment();
                                            }}
                                        />
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '12px', color: '#aaa' }}>Ctrl+Enter로 등록</span>
                                            <button
                                                className="comment-submit-btn"
                                                onClick={handleSubmitComment}
                                                disabled={!commentText.trim()}
                                            >
                                                등록
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '16px', color: '#888', fontSize: '14px' }}>
                                        댓글을 쓰려면{' '}
                                        <span
                                            onClick={() => navigate('/login')}
                                            style={{ color: '#8B1538', cursor: 'pointer', textDecoration: 'underline' }}
                                        >
                                            로그인
                                        </span>
                                        이 필요합니다.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ── 지원자 관리 탭 ── */}
                    {activeTab === 'applicants' && (
                        <div className="applicants-list">
                            {applications.length === 0 ? (
                                <p style={{ color: '#aaa', textAlign: 'center', padding: '40px' }}>아직 지원자가 없습니다.</p>
                            ) : (
                                applications.map(app => (
                                    <div key={app.id} className="recruit-card">
                                        <div className="recruit-header">
                                            <h4>
                                                <span
                                                    onClick={() => navigate(`/profile/${app.applicant.id}`)}
                                                    style={{ color: '#8B1538', cursor: 'pointer', textDecoration: 'underline' }}
                                                >
                                                    {app.applicant.name}
                                                </span>
                                                {' '}({app.applicant.department})
                                            </h4>
                                            <span className={`deadline-badge ${app.status === 'accepted' ? 'active' : ''}`}>
                                                {app.status}
                                            </span>
                                        </div>
                                        <p><strong>지원 동기:</strong> {app.motivation}</p>
                                                        <div className="tech-stacks" style={{ margin: '8px 0' }}>
                                            {app.applicant.techStacks.map((t, i) => (
                                                <span key={i} className="tech-badge">{t}</span>
                                            ))}
                                        </div>
                                        <div style={{ marginTop: '12px' }}>
                                            <label style={{ fontSize: '13px', fontWeight: '600', color: '#555', display: 'block', marginBottom: '4px' }}>
                                                📝 메모 <span style={{ fontSize: '12px', color: '#aaa', fontWeight: 'normal' }}>(본인만 볼 수 있습니다)</span>
                                            </label>
                                            <textarea
                                                className="comment-textarea"
                                                placeholder="이 지원자에 대한 메모를 남겨보세요. (장단점, 인상, 연락 여부 등)"
                                                value={memos[app.id] ?? ''}
                                                onChange={e => setMemos(prev => ({ ...prev, [app.id]: e.target.value }))}
                                                rows={2}
                                                style={{ marginTop: '0' }}
                                            />
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                                                <button
                                                    className="comment-submit-btn"
                                                    onClick={() => handleSaveMemo(app.id)}
                                                    disabled={(memos[app.id] ?? '') === (app.memo || '')}
                                                >
                                                    메모 저장
                                                </button>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                                            <button
                                                className="btn-message"
                                                onClick={() => handleSendMessage(
                                                    app.applicant.id,
                                                    app.applicant.name,
                                                    app.applicant.department
                                                )}
                                            >
                                                💬 쪽지 보내기
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* ── AI 추천 탭 (백엔드 구현 예정) ── */}
                    {activeTab === 'ai-recommend' && (
                        <div className="ai-recommendations">
                            <div className="ai-banner">
                                <p>⚡ 프로젝트 성향과 기술 스택을 분석하여 최적의 팀원을 추천해 드립니다.</p>
                            </div>
                            {recommendations.length === 0 ? (
                                <p style={{ color: '#aaa', textAlign: 'center', padding: '40px' }}>
                                    AI 추천 기능이 준비 중입니다.
                                </p>
                            ) : (
                                recommendations.map((rec, idx) => (
                                    <div key={idx} className="recruit-card" style={{ border: '2px solid #6c5ce7' }}>
                                        <div className="recruit-header">
                                            <h4>
                                                <span
                                                    onClick={() => navigate(`/profile/${rec.user.id}`)}
                                                    style={{ color: '#6c5ce7', cursor: 'pointer', textDecoration: 'underline' }}
                                                >
                                                    {rec.user.name}
                                                </span>
                                                {' '}({rec.user.department})
                                            </h4>
                                            <span className="deadline-badge active">일치도 {rec.matchScore}%</span>
                                        </div>
                                        <div className="match-reasons">
                                            {Object.entries(rec.matchReasons).map(([key, val]) => (
                                                <div key={key}>• {key}: {val}</div>
                                            ))}
                                        </div>
                                        <button
                                            className="btn-message"
                                            style={{ marginTop: '10px', width: '100%' }}
                                            onClick={() => handleSendMessage(rec.user.id, rec.user.name, rec.user.department)}
                                        >
                                            💬 쪽지 보내기
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* 댓글 작성자 프로필 모달 */}
            {commentProfile && (
                <div className="dm-modal-overlay" onClick={() => setCommentProfile(null)}>
                    <div className="dm-mini-profile" onClick={e => e.stopPropagation()}>
                        <button className="dm-modal-close" style={{ position: 'absolute', top: 12, right: 12 }} onClick={() => setCommentProfile(null)}>✕</button>
                        <div className="dm-avatar large" style={{ margin: '0 auto 12px' }}>
                            {commentProfile.name[0]}
                        </div>
                        <p className="dm-mini-name">{commentProfile.name}</p>
                        {commentProfile.department && (
                            <p className="dm-mini-dept">{commentProfile.department}</p>
                        )}
                        <div className="dm-mini-actions">
                            <button className="dm-mini-btn profile" onClick={() => { navigate(`/profile/${commentProfile.id}`); setCommentProfile(null); }}>
                                프로필 보기
                            </button>
                            <button className="dm-mini-btn message" onClick={() => { handleSendMessage(commentProfile.id, commentProfile.name, commentProfile.department); setCommentProfile(null); }}>
                                쪽지 보내기
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecruitDetailPage;
