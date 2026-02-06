import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './RecruitsPage.css';

interface Message {
    id: number;
    senderId: number;
    senderName: string;
    receiverId: number;
    content: string;
    createdAt: string;
    isRead: boolean;
}

const MessagePage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
    const [showCompose, setShowCompose] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
    const [newMessage, setNewMessage] = useState({ to: '', content: '' });

    // Mock 데이터
    const mockReceivedMessages: Message[] = [
        {
            id: 1,
            senderId: 2,
            senderName: '김철수',
            receiverId: user?.id || 1,
            content: '안녕하세요! 해커톤 프로젝트에 관심이 있어서 연락드립니다.',
            createdAt: '2026-01-05T10:30:00',
            isRead: false,
        },
        {
            id: 2,
            senderId: 3,
            senderName: '이영희',
            receiverId: user?.id || 1,
            content: '캡스톤 프로젝트 함께 하고 싶습니다. 가능할까요?',
            createdAt: '2026-01-04T15:20:00',
            isRead: true,
        },
    ];

    const mockSentMessages: Message[] = [
        {
            id: 3,
            senderId: user?.id || 1,
            senderName: user?.name || '나',
            receiverId: 4,
            content: '프로젝트 제안 감사합니다. 자세한 내용 논의하고 싶습니다.',
            createdAt: '2026-01-03T09:15:00',
            isRead: true,
        },
    ];

    const messages = activeTab === 'received' ? mockReceivedMessages : mockSentMessages;

    const handleSendMessage = () => {
        if (!newMessage.to || !newMessage.content) {
            alert('받는 사람과 내용을 입력해주세요.');
            return;
        }
        alert('쪽지가 전송되었습니다!');
        setShowCompose(false);
        setNewMessage({ to: '', content: '' });
    };

    return (
        <div className="recruits-page">
            <div className="recruits-container">
                <div className="page-header">
                    <h1>💌 쪽지함</h1>
                    <button
                        onClick={() => setShowCompose(true)}
                        style={{
                            padding: '10px 20px',
                            background: '#8B1538',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        ✉️ 쪽지 쓰기
                    </button>
                </div>

                {/* 탭 */}
                <div className="tabs" style={{ marginBottom: '20px' }}>
                    <button
                        className={`tab ${activeTab === 'received' ? 'active' : ''}`}
                        onClick={() => setActiveTab('received')}
                    >
                        받은 쪽지 ({mockReceivedMessages.length})
                    </button>
                    <button
                        className={`tab ${activeTab === 'sent' ? 'active' : ''}`}
                        onClick={() => setActiveTab('sent')}
                    >
                        보낸 쪽지 ({mockSentMessages.length})
                    </button>
                </div>

                {/* 쪽지 목록 */}
                <div>
                    {messages.length === 0 ? (
                        <div className="recruit-card" style={{ textAlign: 'center', padding: '40px' }}>
                            <p>쪽지가 없습니다.</p>
                        </div>
                    ) : (
                        messages.map((msg) => (
                            <div
                                key={msg.id}
                                className="recruit-card"
                                style={{
                                    marginBottom: '10px',
                                    cursor: 'pointer',
                                    background: !msg.isRead && activeTab === 'received' ? '#fff8f0' : 'white'
                                }}
                                onClick={() => setSelectedMessage(msg)}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h4 style={{ margin: 0 }}>
                                            {!msg.isRead && activeTab === 'received' && (
                                                <span style={{ color: '#8B1538', marginRight: '5px' }}>●</span>
                                            )}
                                            {activeTab === 'received' ? `From: ${msg.senderName}` : `To: User ${msg.receiverId}`}
                                        </h4>
                                        <p style={{ margin: '10px 0 0 0', color: '#666' }}>
                                            {msg.content.substring(0, 50)}
                                            {msg.content.length > 50 ? '...' : ''}
                                        </p>
                                    </div>
                                    <span style={{ fontSize: '0.85rem', color: '#999' }}>
                                        {new Date(msg.createdAt).toLocaleDateString('ko-KR')}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* 쪽지 상세 모달 */}
                {selectedMessage && (
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
                            width: '90%'
                        }}>
                            <h3>
                                {activeTab === 'received' ? `From: ${selectedMessage.senderName}` : `To: User ${selectedMessage.receiverId}`}
                            </h3>
                            <p style={{ color: '#999', fontSize: '0.9rem' }}>
                                {new Date(selectedMessage.createdAt).toLocaleString('ko-KR')}
                            </p>
                            <div style={{
                                marginTop: '20px',
                                padding: '20px',
                                background: '#f9f9f9',
                                borderRadius: '4px',
                                minHeight: '100px'
                            }}>
                                {selectedMessage.content}
                            </div>
                            <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                                {activeTab === 'received' && (
                                    <button
                                        onClick={() => {
                                            setNewMessage({ to: selectedMessage.senderName, content: '' });
                                            setSelectedMessage(null);
                                            setShowCompose(true);
                                        }}
                                        style={{
                                            flex: 1,
                                            padding: '10px',
                                            background: '#8B1538',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        답장하기
                                    </button>
                                )}
                                <button
                                    onClick={() => setSelectedMessage(null)}
                                    style={{
                                        flex: 1,
                                        padding: '10px',
                                        background: '#6c757d',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    닫기
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 쪽지 작성 모달 */}
                {showCompose && (
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
                            width: '90%'
                        }}>
                            <h3>새 쪽지 작성</h3>
                            <div style={{ marginTop: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                                    받는 사람
                                </label>
                                <input
                                    type="text"
                                    value={newMessage.to}
                                    onChange={(e) => setNewMessage({ ...newMessage, to: e.target.value })}
                                    placeholder="사용자 이름 또는 ID"
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        marginBottom: '15px'
                                    }}
                                />
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                                    내용
                                </label>
                                <textarea
                                    value={newMessage.content}
                                    onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
                                    placeholder="쪽지 내용을 입력하세요"
                                    rows={6}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        resize: 'vertical'
                                    }}
                                />
                            </div>
                            <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                                <button
                                    onClick={handleSendMessage}
                                    style={{
                                        flex: 1,
                                        padding: '10px',
                                        background: '#8B1538',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    전송
                                </button>
                                <button
                                    onClick={() => {
                                        setShowCompose(false);
                                        setNewMessage({ to: '', content: '' });
                                    }}
                                    style={{
                                        flex: 1,
                                        padding: '10px',
                                        background: '#6c757d',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    취소
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessagePage;
