import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RecruitsPage from './pages/RecruitsPage';
import CreateRecruitPage from './pages/CreateRecruitPage';
import RecruitDetailPage from './pages/RecruitDetailPage';
import ProfilePage from './pages/ProfilePage';
import './App.css';
import AlarmPage from './pages/AlarmPage';
import OpenMyPage from './pages/OpenMyPage';
import MessagePage from './pages/MessagePage';
import MyApplicationsPage from './pages/MyApplicationsPage';
import MyPostsPage from './pages/MyPostsPage';

function AppContent() {
  const location = useLocation();
  // 사이드바를 숨길 경로 정의
  const hideSidebarRoutes = ['/login', '/register', '/'];
  const showSidebar = !hideSidebarRoutes.includes(location.pathname);

  return (
    <div className="App">
      {showSidebar && <Sidebar />}
      <div className={showSidebar ? 'main-content with-sidebar' : 'main-content'}>
        {showSidebar && <Header />}
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/recruits" element={<RecruitsPage />} />
            <Route path="/recruits/new" element={<CreateRecruitPage />} />
            <Route path="/recruits/:id" element={<RecruitDetailPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/:userId" element={<ProfilePage />} />
            <Route path="/alarm" element={<AlarmPage />} />
            <Route path="/openmypage" element={<OpenMyPage />} />
            <Route path="/messages" element={<MessagePage />} />
            <Route path="/my-applications" element={<MyApplicationsPage />} />
            <Route path="/my-posts" element={<MyPostsPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;