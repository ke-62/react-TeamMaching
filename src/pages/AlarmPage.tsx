import React from 'react';

const AlarmPage: React.FC = () => {
    // 임시 일정 알리미 화면
    return (
        <div className="recruits-page">
            <div className="recruits-container">
                <div className="recruit-card" style={{ textAlign: 'center', padding: '40px' }}>
                    <h2>일정 알리미</h2>
                    <p>팀 모집 마감, 프로젝트 일정, 해커톤 등 주요 일정을 한눈에 확인하세요!</p>
                    <ul style={{ marginTop: '30px', textAlign: 'left' }}>
                        <li>2026-01-10: 창의학기제 모집 마감</li>
                        <li>2026-01-15: 해커톤 예비모임</li>
                        <li>2026-02-01: 캡스톤 프로젝트 시작</li>
                        <li>2026-02-20: 해커톤 본 행사</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default AlarmPage;
