import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RecruitsPage from './pages/RecruitsPage';
import CreateRecruitPage from './pages/CreateRecruitPage';
import './App.css';

function AppContent() {
  const location = useLocation();
  const showSidebar = !['/login', '/'].includes(location.pathname);

  return (
    <div className="App">
      {showSidebar && <Sidebar />}
      <div className={showSidebar ? 'main-content with-sidebar' : 'main-content'}>
        {showSidebar && <Header />}
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/recruits" element={<RecruitsPage />} />
            <Route path="/recruits/new" element={<CreateRecruitPage />} />
            {/* 추가 라우트는 여기에 작성 */}
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
