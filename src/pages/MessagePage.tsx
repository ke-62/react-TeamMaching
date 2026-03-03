import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './MessagePage.css';

interface Message {
    id: number;
    senderId: number;
    senderName: string;
    receiverId: number;
    receiverName: string;
    content: string;
    createdAt: string;
}

interface Conversation {
    partnerId: number;
    partnerName: string;
    partnerDepartment: string;
    lastMessage: string;
    lastAt: string;
    unread: number;
    messages: Message[];
}

// 미니 프로필 팝업 타입
interface MiniProfile {
    id: number;
    name: string;
    department: string;
}


function formatTime(isoString: string) {
    const date = new Date(isoString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
    if (diffDays < 7) return ['일', '월', '화', '수', '목', '금', '토'][date.getDay()] + '요일';
    return date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });
}

function formatBubbleTime(isoString: string) {
    return new Date(isoString).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: true });
}

const MessagePage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const myId = user?.id || 0;
    const myName = user?.name || '나';

    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [inputText, setInputText] = useState('');
    const [showNewDM, setShowNewDM] = useState(false);
    const [newDMTarget, setNewDMTarget] = useState('');
    const [miniProfile, setMiniProfile] = useState<MiniProfile | null>(null);
    const chatBottomRef = useRef<HTMLDivElement>(null);

    // ── 모집글에서 "쪽지 보내기"로 넘어왔을 때: 자동으로 대화 열기 ──
    useEffect(() => {
        const state = location.state as { partnerId?: number; partnerName?: string; partnerDepartment?: string } | null;
        if (!state?.partnerId || !state?.partnerName) return;

        const { partnerId, partnerName, partnerDepartment = '' } = state;

        setConversations(prev => {
            const existing = prev.find(c => c.partnerId === partnerId);
            if (existing) {
                setSelectedId(partnerId);
                return prev;
            }
            const newConv: Conversation = {
                partnerId,
                partnerName,
                partnerDepartment,
                lastMessage: '',
                lastAt: new Date().toISOString(),
                unread: 0,
                messages: [],
            };
            setSelectedId(partnerId);
            return [newConv, ...prev];
        });

        // state 소비 (뒤로가기 시 재실행 방지)
        window.history.replaceState({}, '');
    }, [location.state]);

    const selectedConv = conversations.find(c => c.partnerId === selectedId) || null;

    useEffect(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [selectedConv?.messages.length, selectedId]);

    useEffect(() => {
        if (selectedId !== null) {
            setConversations(prev =>
                prev.map(c => c.partnerId === selectedId ? { ...c, unread: 0 } : c)
            );
        }
    }, [selectedId]);

    const handleSend = () => {
        if (!inputText.trim() || !selectedConv) return;
        const newMsg: Message = {
            id: Date.now(),
            senderId: myId,
            senderName: myName,
            receiverId: selectedConv.partnerId,
            receiverName: selectedConv.partnerName,
            content: inputText.trim(),
            createdAt: new Date().toISOString(),
        };
        setConversations(prev =>
            prev.map(c =>
                c.partnerId === selectedConv.partnerId
                    ? { ...c, messages: [...c.messages, newMsg], lastMessage: newMsg.content, lastAt: newMsg.createdAt }
                    : c
            )
        );
        setInputText('');
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleStartNewDM = () => {
        if (!newDMTarget.trim()) return;
        const existing = conversations.find(c => c.partnerName === newDMTarget.trim());
        if (existing) {
            setSelectedId(existing.partnerId);
            setShowNewDM(false);
            setNewDMTarget('');
            return;
        }
        const newConv: Conversation = {
            partnerId: Date.now(),
            partnerName: newDMTarget.trim(),
            partnerDepartment: '',
            lastMessage: '',
            lastAt: new Date().toISOString(),
            unread: 0,
            messages: [],
        };
        setConversations(prev => [newConv, ...prev]);
        setSelectedId(newConv.partnerId);
        setShowNewDM(false);
        setNewDMTarget('');
    };

    // 아바타 클릭 → 미니 프로필 팝업
    const handleAvatarClick = (conv: Conversation) => {
        setMiniProfile({ id: conv.partnerId, name: conv.partnerName, department: conv.partnerDepartment });
    };

    return (
        <div className="dm-layout">
            {/* ── 좌측: 대화 목록 ── */}
            <div className="dm-sidebar">
                <div className="dm-sidebar-header">
                    <span className="dm-sidebar-title">{myName}</span>
                    <button className="dm-new-btn" onClick={() => setShowNewDM(true)} title="새 메시지">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 20h9" />
                            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                        </svg>
                    </button>
                </div>

                <div className="dm-list">
                    {conversations.map(conv => (
                        <div
                            key={conv.partnerId}
                            className={`dm-list-item ${selectedId === conv.partnerId ? 'active' : ''}`}
                            onClick={() => setSelectedId(conv.partnerId)}
                        >
                            {/* 아바타 클릭 → 미니 프로필 */}
                            <div
                                className="dm-avatar"
                                onClick={e => { e.stopPropagation(); handleAvatarClick(conv); }}
                                title="프로필 보기"
                            >
                                {conv.partnerName[0]}
                            </div>
                            <div className="dm-list-info">
                                <div className="dm-list-top">
                                    <span className="dm-partner-name">{conv.partnerName}</span>
                                    <span className="dm-list-time">{formatTime(conv.lastAt)}</span>
                                </div>
                                <div className="dm-list-bottom">
                                    <span className={`dm-last-msg ${conv.unread > 0 ? 'unread' : ''}`}>
                                        {conv.lastMessage || '대화를 시작해보세요'}
                                    </span>
                                    {conv.unread > 0 && <span className="dm-unread-dot">{conv.unread}</span>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── 우측: 채팅창 ── */}
            <div className="dm-chat">
                {selectedConv ? (
                    <>
                        {/* 채팅 헤더 */}
                        <div className="dm-chat-header">
                            {/* 헤더 아바타 클릭 → 미니 프로필 */}
                            <div
                                className="dm-avatar small"
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleAvatarClick(selectedConv)}
                                title="프로필 보기"
                            >
                                {selectedConv.partnerName[0]}
                            </div>
                            <div>
                                <span
                                    className="dm-chat-partner-name"
                                    onClick={() => navigate(`/profile/${selectedConv.partnerId}`)}
                                    title="프로필 페이지로 이동"
                                >
                                    {selectedConv.partnerName}
                                </span>
                                {selectedConv.partnerDepartment && (
                                    <div style={{ fontSize: '12px', color: '#8e8e8e', marginTop: '1px' }}>
                                        {selectedConv.partnerDepartment}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 메시지 버블 영역 */}
                        <div className="dm-messages">
                            {selectedConv.messages.length === 0 && (
                                <div className="dm-empty-chat">
                                    <div
                                        className="dm-avatar large"
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => handleAvatarClick(selectedConv)}
                                    >
                                        {selectedConv.partnerName[0]}
                                    </div>
                                    <p className="dm-empty-name">{selectedConv.partnerName}</p>
                                    {selectedConv.partnerDepartment && (
                                        <p style={{ fontSize: '13px', color: '#aaa', margin: '0 0 4px' }}>
                                            {selectedConv.partnerDepartment}
                                        </p>
                                    )}
                                    <p className="dm-empty-desc">첫 메시지를 보내보세요!</p>
                                </div>
                            )}

                            {selectedConv.messages.map((msg, idx) => {
                                const isMine = msg.senderId === myId;
                                const prevMsg = selectedConv.messages[idx - 1];
                                const showAvatar = !isMine && (!prevMsg || prevMsg.senderId !== msg.senderId);

                                return (
                                    <div key={msg.id} className={`dm-bubble-row ${isMine ? 'mine' : 'theirs'}`}>
                                        {!isMine && (
                                            <div className="dm-bubble-avatar">
                                                {showAvatar ? (
                                                    <div
                                                        className="dm-avatar tiny"
                                                        style={{ cursor: 'pointer' }}
                                                        onClick={() => handleAvatarClick(selectedConv)}
                                                        title="프로필 보기"
                                                    >
                                                        {msg.senderName[0]}
                                                    </div>
                                                ) : (
                                                    <div style={{ width: 28 }} />
                                                )}
                                            </div>
                                        )}
                                        <div className="dm-bubble-content">
                                            <div className={`dm-bubble ${isMine ? 'mine' : 'theirs'}`}>
                                                {msg.content}
                                            </div>
                                            <span className="dm-bubble-time">{formatBubbleTime(msg.createdAt)}</span>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={chatBottomRef} />
                        </div>

                        {/* 입력창 */}
                        <div className="dm-input-bar">
                            <input
                                className="dm-input"
                                type="text"
                                placeholder="메시지 입력..."
                                value={inputText}
                                onChange={e => setInputText(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                            <button
                                className={`dm-send-btn ${inputText.trim() ? 'active' : ''}`}
                                onClick={handleSend}
                                disabled={!inputText.trim()}
                            >
                                전송
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="dm-no-chat">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                        <p>대화를 선택하거나 새 메시지를 보내보세요</p>
                    </div>
                )}
            </div>

            {/* ── 미니 프로필 팝업 ── */}
            {miniProfile && (
                <div className="dm-modal-overlay" onClick={() => setMiniProfile(null)}>
                    <div className="dm-mini-profile" onClick={e => e.stopPropagation()}>
                        <button className="dm-modal-close" style={{ position: 'absolute', top: 12, right: 12 }} onClick={() => setMiniProfile(null)}>✕</button>
                        <div className="dm-avatar large" style={{ margin: '0 auto 12px' }}>
                            {miniProfile.name[0]}
                        </div>
                        <p className="dm-mini-name">{miniProfile.name}</p>
                        {miniProfile.department && (
                            <p className="dm-mini-dept">{miniProfile.department}</p>
                        )}
                        <div className="dm-mini-actions">
                            <button
                                className="dm-mini-btn profile"
                                onClick={() => { navigate(`/profile/${miniProfile.id}`); setMiniProfile(null); }}
                            >
                                👤 프로필 보기
                            </button>
                            <button
                                className="dm-mini-btn message"
                                onClick={() => {
                                    setSelectedId(miniProfile.id);
                                    setMiniProfile(null);
                                }}
                            >
                                💬 쪽지 보내기
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── 새 DM 모달 ── */}
            {showNewDM && (
                <div className="dm-modal-overlay" onClick={() => setShowNewDM(false)}>
                    <div className="dm-modal" onClick={e => e.stopPropagation()}>
                        <div className="dm-modal-header">
                            <span>새 메시지</span>
                            <button className="dm-modal-close" onClick={() => setShowNewDM(false)}>✕</button>
                        </div>
                        <div className="dm-modal-body">
                            <label className="dm-modal-label">받는 사람</label>
                            <input
                                className="dm-modal-input"
                                type="text"
                                placeholder="이름 또는 학번 입력"
                                value={newDMTarget}
                                onChange={e => setNewDMTarget(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleStartNewDM()}
                                autoFocus
                            />
                        </div>
                        <div className="dm-modal-footer">
                            <button className="dm-modal-cancel" onClick={() => setShowNewDM(false)}>취소</button>
                            <button className="dm-modal-confirm" onClick={handleStartNewDM}>채팅 시작</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MessagePage;
