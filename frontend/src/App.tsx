import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ResearcherProfile from './pages/ResearcherProfile';
import ChatWithDatabasePage from './pages/ChatWithDatabasePage';  // Новый компонент

function App() {
  return (
    <Router>
      <Routes>
        {/* Главная страница */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Страница профиля исследователя */}
        <Route path="/profile/patryk-zywica" element={<ResearcherProfile />} />
        
        {/* Страница с чатом и базой данных ученых */}
        <Route path="/grant-sector-2" element={<ChatWithDatabasePage />} />  {/* Новый путь */}
      </Routes>
    </Router>
  );
}

export default App;
