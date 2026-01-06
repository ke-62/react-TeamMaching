# 팀 프로젝트 모집 플랫폼

AI 기반 팀원 모집 지원과 동료 평가 이력 활용을 위한 대학생 팀 프로젝트 모집 플랫폼

## 프로젝트 개요

대학생들이 팀 프로젝트(창의학기제, 캡스톤디자인, 해커톤 등)를 진행할 때 겪는 팀원 모집의 어려움을 해결하기 위한 웹 플랫폼입니다.

### 주요 기능

- 🎯 **AI 기반 팀원 추천**: 기술 스택, 관심 분야, 프로젝트 경험을 분석하여 최적의 팀원 추천
- 📊 **동료 평가 이력 관리**: 프로젝트 종료 후 동료 평가를 AI로 요약하여 다음 팀 모집에 활용
- 💻 **GitHub 연동**: 실제 프로젝트 결과물 기반 프로필 구성
- 📅 **일정 알림**: 주요 프로젝트 공모 일정 관리

## 기술 스택

### Frontend
- React 18
- TypeScript
- React Router v6
- Axios

### Backend (별도 구현 필요)
- Spring Boot
- Spring Security (JWT)
- JPA/Hibernate
- PostgreSQL/MySQL

## 시작하기

### 사전 요구사항

- Node.js 16 이상
- npm 또는 yarn

### 설치

1. 저장소 클론
```bash
git clone [repository-url]
cd team-recruit-platform
```

2. 의존성 설치
```bash
npm install
```

3. 환경 변수 설정
```bash
cp .env.example .env
# .env 파일에서 API 서버 주소 등을 설정
```

4. 개발 서버 실행
```bash
npm start
```

브라우저에서 http://localhost:3000 으로 접속

## 프로젝트 구조

```
team-recruit-platform/
├── public/              # 정적 파일
├── src/
│   ├── components/      # 재사용 가능한 컴포넌트
│   │   └── Header.tsx
│   ├── pages/           # 페이지 컴포넌트
│   │   ├── HomePage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   └── RecruitsPage.tsx
│   ├── services/        # API 서비스
│   │   ├── api.ts
│   │   ├── authService.ts
│   │   ├── recruitService.ts
│   │   └── userService.ts
│   ├── hooks/           # Custom Hooks
│   │   └── useAuth.tsx
│   ├── types/           # TypeScript 타입 정의
│   │   └── index.ts
│   ├── App.tsx          # 메인 App 컴포넌트
│   └── index.tsx        # 엔트리 포인트
└── package.json
```

## 구현된 페이지

### 완료
- ✅ 메인 페이지 (HomePage)
- ✅ 로그인 페이지 (LoginPage)
- ✅ 회원가입 페이지 (RegisterPage)
- ✅ 모집 공고 목록 페이지 (RecruitsPage)

### 추가 구현 필요
- ⬜ 모집 공고 상세 페이지
- ⬜ 모집 공고 작성/수정 페이지
- ⬜ 내 지원 내역 페이지
- ⬜ 사용자 프로필 페이지
- ⬜ 프로젝트 이력 페이지
- ⬜ 동료 평가 페이지

## 개발 일정

- 3월 9일: 서비스 전체 기획 및 구조 설계
- 3월 16일: 프론트엔드 화면 구조 및 UX 설계
- 3월 23일: 프론트엔드 기본 구현 (완료)
- 3월 30일: 백엔드 기본 구조 및 인증 기능 구현
- 4월 6일: 팀원 모집 기능 구현
- 4월 27일: AI 기반 모집 지원 로직 구현
- 5월 4일: 프로젝트 일정 알림 기능
- 5월 11일: GitHub 연동 및 프로필 기능
- 5월 18일: 동료 평가 및 AI 요약 기능
- 5월 25일: 통합 테스트 및 최종 수정
- 6월 1일: 최종 결과물 정리 및 배포

## 팀 구성

- **이고은**: 팀장, 프론트엔드 + 백엔드
- **황채영**: AI 기능 + 백엔드

## 라이선스

This project is licensed under the MIT License.
