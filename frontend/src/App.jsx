import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import ProfilePage from './pages/ProfilePage';
import ProgramMatcher from './pages/ProgramMatcher';
import CareerExplorer from './pages/CareerExplorer';
import RoadmapView from './pages/RoadmapView';
import AuthPage from './pages/AuthPage';
import CareerCounselor from './pages/CareerCounselor';

function AppContent() {
  const { token, logout } = useAuth();

  // Automatically adjust application scale based on window size/resolution like StudyVault AI
  useEffect(() => {
    const updateAppScale = () => {
      const height = window.innerHeight;
      const width = window.innerWidth;
      
      let scale = height / 900; 
      if (width < 1200) scale = width / 1440;
      
      const clampedScale = Math.min(Math.max(scale, 0.78), 1);
      document.documentElement.style.fontSize = `${clampedScale * 100}%`;
    };

    updateAppScale();
    window.addEventListener('resize', updateAppScale);
    return () => window.removeEventListener('resize', updateAppScale);
  }, []);

  const [studentProfile, setStudentProfile] = useState({
    name: '',
    country: 'Pakistan',
    region: 'Khyber Pakhtunkhwa',
    city: 'Kohat',
    current_education_level: 'HSSC',
    ssc_percentage: 75.0,
    hssc_percentage: 85.0,
    hssc_group: 'Pre-Engineering',
    mathematics_background: true,
    preferred_field: 'Computer Science',
    financial_need_status: true
  });

  const [matchingResults, setMatchingResults] = useState(null);

  // Automatically fetch saved profile and run program match on login or refresh
  useEffect(() => {
    if (!token) return;

    // 1. Fetch Profile
    fetch('http://127.0.0.1:8000/api/profile/', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data && Object.keys(data).length > 0) {
          setStudentProfile(prev => ({ ...prev, ...data }));
          
          // 2. Automatically compute matching results based on restored profile
          return fetch('http://127.0.0.1:8000/api/programs/match', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(data)
          });
        }
      })
      .then(res => res ? res.json() : null)
      .then(matchData => {
        if (matchData) setMatchingResults(matchData);
      })
      .catch(err => console.error("Failed to sync profile/matches:", err));
  }, [token]);

  if (!token) {
    return <AuthPage />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout profile={studentProfile} onSignOut={logout} />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard profile={studentProfile} results={matchingResults} />} />
          <Route path="profile" element={<ProfilePage profile={studentProfile} setProfile={setStudentProfile} setResults={setMatchingResults} />} />
          <Route path="programs" element={<ProgramMatcher results={matchingResults} profile={studentProfile} setResults={setMatchingResults} />} />
          <Route path="careers" element={<CareerExplorer />} />
          <Route path="roadmap" element={<RoadmapView profile={studentProfile} results={matchingResults} setResults={setMatchingResults} />} />
          <Route path="counselor" element={<CareerCounselor profile={studentProfile} />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}