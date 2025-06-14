import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ResearcherProfile from './pages/ResearcherProfile';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/profile/patryk-zywica" element={<ResearcherProfile />} />
      </Routes>
    </Router>
  );
}

export default App;
