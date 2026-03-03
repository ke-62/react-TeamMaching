import React from 'react';

const AlarmPage: React.FC = () => {
    return (
        <div className="recruits-page">
            <div className="recruits-container">
                <div className="page-header">
                    <h1>일정 알리미</h1>
                </div>
                <div style={{ textAlign: 'center', padding: '80px 20px', color: '#aaa' }}>
                    <p style={{ fontSize: '40px', marginBottom: '16px' }}>🔔</p>
                    <p style={{ fontSize: '16px', fontWeight: '600', color: '#888', marginBottom: '8px' }}>준비 중입니다</p>
                    <p style={{ fontSize: '13px' }}>팀 모집 마감, 프로젝트 일정, 해커톤 등 주요 일정 알림 기능이 곧 제공될 예정입니다.</p>
                </div>
            </div>
        </div>
    );
};

export default AlarmPage;
