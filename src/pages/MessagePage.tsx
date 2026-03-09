import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { messageService, RoomResponse, MessageResponse } from '../services/messageService';
import './MessagePage.css';

interface Conversation extends RoomResponse {
    messages: MessageResponse[];
    unread: number;
}

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
    const [selectedPartnerId, setSelectedPartnerId] = useState<number | null>(null);
    const [inputText, setInputText] = useState('');
    const [miniProfile, setMiniProfile] = useState<MiniProfile | null>(null);
    const chatBottomRef = useRef<HTMLDivElement>(null);

    const selectedConv = conversations.find(c => c.partnerId === selectedPartnerId) || null;

    // 대화 목록 로드
    const loadRooms = useCallback(async () => {
        try {
            const rooms = await messageService.getRooms();
            setConversations(prev => rooms.map(r => {
                const existing = prev.find(c => c.partnerId === r.partnerId);
                return {
                    ...r,
                    messages: existing?.messages || [],
                    unread: existing?.unread || 0,
                };
            }));
        } catch {
            // 비로그인 등 에러는 무시
        }
    }, []);

    // 메시지 로드
    const loadMessages = useCallback(async (roomId: number, partnerId: number) => {
        try {
            const msgs = await messageService.getMessages(roomId);
            setConversations(prev => prev.map(c =>
                c.partnerId === partnerId ? { ...c, messages: msgs, unread: 0 } : c
            ));
        } catch {
            // ignore
        }
    }, []);

    // 초기 대화 목록 + 3초 폴링
    useEffect(() => {
        if (!user) return;
        loadRooms();
        const interval = setInterval(loadRooms, 3000);
        return () => clearInterval(interval);
    }, [user, loadRooms]);

    // 선택된 방 메시지 3초 폴링
    useEffect(() => {
        if (!selectedConv) return;
        loadMessages(selectedConv.roomId, selectedConv.partnerId);
        const interval = setInterval(() => {
            loadMessages(selectedConv.roomId, selectedConv.partnerId);
        }, 3000);
        return () => clearInterval(interval);
    }, [selectedPartnerId]); // eslint-disable-line react-hooks/exhaustive-deps

    // 다른 페이지에서 쪽지 보내기로 진입
    useEffect(() => {
        const state = location.state as { partnerId?: number; partnerName?: string; partnerDepartment?: string } | null;
        if (!state?.partnerId || !user) return;

        const openRoom = async () => {
            try {
                const room = await messageService.createRoom(state.partnerId!);
                await loadRooms();
                setSelectedPartnerId(room.partnerId);
            } catch {
                // ignore
            }
        };
        openRoom();
        window.history.replaceState({}, '');
    }, [location.state, user]);

    // 스크롤 아래로
    useEffect(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [selectedConv?.messages.length]);

    const handleSend = async () => {
        if (!inputText.trim() || !selectedConv) return;
        const text = inputText.trim();
        setInputText('');
        try {
            const newMsg = await messageService.sendMessage(selectedConv.roomId, text);
            setConversations(prev => prev.map(c =>
                c.partnerId === selectedConv.partnerId
                    ? { ...c, messages: [...c.messages, newMsg], lastMessage: newMsg.content, lastAt: newMsg.createdAt }
                    : c
            ));
        } catch {
            setInputText(text);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleAvatarClick = (conv: Conversation) => {
        setMiniProfile({ id: conv.partnerId, name: conv.partnerName, department: conv.partnerDepartment });
    };

    return (
        <div className="dm-layout">
            {/* 좌측: 대화 목록 */}
            <div className="dm-sidebar">
                <div className="dm-sidebar-header">
                    <span className="dm-sidebar-title">{myName}</span>
                </div>

                <div className="dm-list">
                    {conversations.length === 0 && (
                        <div style={{ padding: '24px 16px', color: '#aaa', fontSize: '13px', textAlign: 'center' }}>
                            아직 대화가 없습니다.<br />프로필에서 쪽지를 보내보세요.
                        </div>
                    )}
                    {conversations.map(conv => (
                        <div
                            key={conv.partnerId}
                            className={`dm-list-item ${selectedPartnerId === conv.partnerId ? 'active' : ''}`}
                            onClick={() => setSelectedPartnerId(conv.partnerId)}
                        >
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

            {/* 우측: 채팅창 */}
            <div className="dm-chat">
                {selectedConv ? (
                    <>
                        <div className="dm-chat-header">
                            <div
                                className="dm-avatar small"
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleAvatarClick(selectedConv)}
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

                        <div className="dm-messages">
                            {selectedConv.messages.length === 0 && (
                                <div className="dm-empty-chat">
                                    <div className="dm-avatar large" style={{ cursor: 'pointer' }} onClick={() => handleAvatarClick(selectedConv)}>
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
                                                    <div className="dm-avatar tiny" style={{ cursor: 'pointer' }} onClick={() => handleAvatarClick(selectedConv)}>
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
                        <p>대화를 선택해주세요</p>
                    </div>
                )}
            </div>

            {/* 미니 프로필 팝업 */}
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
                            <button className="dm-mini-btn profile" onClick={() => { navigate(`/profile/${miniProfile.id}`); setMiniProfile(null); }}>
                                👤 프로필 보기
                            </button>
                            <button className="dm-mini-btn message" onClick={() => { setSelectedPartnerId(miniProfile.id); setMiniProfile(null); }}>
                                💬 쪽지 보내기
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MessagePage;
