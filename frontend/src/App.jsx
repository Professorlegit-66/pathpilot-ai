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

  // Automatically fetch saved profile from SQLite database on login or refresh
  useEffect(() => {
    if (!token) return;

    fetch('http://127.0.0.1:8000/api/profile/', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data && Object.keys(data).length > 0) {
          setStudentProfile(prev => ({ ...prev, ...data }));
        }
      })
      .catch(err => console.error("Failed to load profile from database:", err));
  }, [token]);

  // If user is not authenticated, show the secure AuthPage
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
          <Route path="roadmap" element={<RoadmapView profile={studentProfile} results={matchingResults} />} />
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