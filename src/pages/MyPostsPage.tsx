import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { recruitService } from '../services/recruitService';
import { useAuth } from '../hooks/useAuth';
import { RecruitPost } from '../types';
import './RecruitsPage.css';

const PROJECT_TYPE_LABELS: Record<string, string> = {
  hackathon: '해커톤',
  capstone: '캡스톤',
  creative: '창의학기제',
  other: '기타',
};

const STATUS_LABELS: Record<string, string> = {
  RECRUITING: '모집중',
  IN_PROGRESS: '진행중',
  COMPLETED: '완료',
};

const MyPostsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [posts, setPosts] = useState<RecruitPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMyPosts = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        const response = await recruitService.getRecruitPosts({ size: 100 });
        setPosts(response.content.filter(p => p.authorId === user.id));
      } catch (err) {
        setError('공고를 불러오는 데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchMyPosts();
  }, [user]);

  const handleToggleStatus = async (post: RecruitPost) => {
    const newStatus = post.status === 'RECRUITING' ? 'COMPLETED' : 'RECRUITING';
    try {
      await recruitService.updateProjectStatus(post.id, newStatus as 'RECRUITING' | 'COMPLETED');
      setPosts(prev => prev.map(p => p.id === post.id ? { ...p, status: newStatus } : p));
    } catch {
      alert('상태 변경에 실패했습니다.');
    }
  };

  const handleDelete = async (post: RecruitPost) => {
    if (!window.confirm(`"${post.title}" 공고를 삭제하시겠습니까?`)) return;
    try {
      await recruitService.deleteRecruitPost(post.id);
      setPosts(prev => prev.filter(p => p.id !== post.id));
    } catch {
      alert('삭제에 실패했습니다.');
    }
  };

  return (
    <div className="recruits-page">
      <div className="recruits-container">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>내가 작성한 공고</h1>
          <Link to="/recruits/new" className="btn-create">
            <span className="plus-icon">⊕</span>
            새 공고 등록
          </Link>
        </div>

        {isLoading && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#aaa' }}>로딩 중...</div>
        )}

        {error && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#888' }}>
            <p>🔌 {error}</p>
          </div>
        )}

        {!isLoading && !error && posts.length === 0 && (
          <div className="empty-state">
            <p>작성한 공고가 없습니다.</p>
            <Link to="/recruits/new" className="btn-create-empty">첫 공고 작성하기</Link>
          </div>
        )}

        {!isLoading && !error && posts.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {posts.map(post => (
              <div
                key={post.id}
                onClick={() => navigate(`/recruits/${post.id}`)}
                style={{
                  background: '#fff',
                  border: '1px solid #eee',
                  borderRadius: '12px',
                  padding: '20px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  cursor: 'pointer',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span className={`project-type ${post.projectType}`}>
                      {PROJECT_TYPE_LABELS[post.projectType] || post.projectType}
                    </span>
                    <span style={{
                      fontSize: '12px', fontWeight: 600,
                      padding: '2px 8px', borderRadius: '99px',
                      background: post.status === 'RECRUITING' ? '#e8f5e9' : '#f5f5f5',
                      color: post.status === 'RECRUITING' ? '#2e7d32' : '#999',
                    }}>
                      {STATUS_LABELS[post.status] || post.status}
                    </span>
                  </div>
                  <Link
                    to={`/recruits/${post.id}`}
                    style={{ fontWeight: 700, fontSize: '16px', color: '#1a1a1a', textDecoration: 'none' }}
                  >
                    {post.title}
                  </Link>
                  <p style={{ fontSize: '13px', color: '#888', margin: '4px 0 0', lineHeight: 1.5 }}>
                    👤 {post.recruitNumber}명 모집
                    {post.requiredTechStacks.length > 0 && (
                      <span> · {post.requiredTechStacks.slice(0, 3).join(', ')}</span>
                    )}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  <button
                    onClick={e => { e.stopPropagation(); handleToggleStatus(post); }}
                    style={{
                      padding: '8px 14px', borderRadius: '8px', border: '1.5px solid #ddd',
                      background: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
                      color: '#555', transition: 'all 0.15s',
                    }}
                  >
                    {post.status === 'RECRUITING' ? '마감하기' : '모집재개'}
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); handleDelete(post); }}
                    style={{
                      padding: '8px 14px', borderRadius: '8px', border: '1.5px solid #fca5a5',
                      background: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
                      color: '#dc2626', transition: 'all 0.15s',
                    }}
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPostsPage;
