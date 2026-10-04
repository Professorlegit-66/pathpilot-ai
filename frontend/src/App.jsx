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
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || 'https://pathpilot-ai-exln.onrender.com';

function AppContent() {
  const { token, logout } = useAuth();

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
    name: localStorage.getItem('user_full_name') || '',
    country: 'Pakistan',
    region: 'Khyber Pakhtunkhwa',
    city: 'Kohat',
    current_education_level: 'HSSC',
    ssc_percentage: 75.0,
    hssc_percentage: 85.0,
    hssc_group: 'Pre-Engineering',
    mathematics_background: true,
    preferred_field: 'Computer Science',
    target_career: sessionStorage.getItem('roadmap_target_career') || null,
    selected_program: sessionStorage.getItem('roadmap_selected_program') ? JSON.parse(sessionStorage.getItem('roadmap_selected_program')) : null,
    financial_need_status: true
  });

  const [matchingResults, setMatchingResults] = useState(null);

  useEffect(() => {
    if (!token) {
      setMatchingResults(null);
      return;
    }

    fetch(`${API_URL}/api/profile/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (data && Object.keys(data).length > 0) {
          const resolvedName = data.name || data.full_name || localStorage.getItem('user_full_name') || '';
          
          if (resolvedName) {
            localStorage.setItem('user_full_name', resolvedName);
          }

          const activeCareer = data.target_career || sessionStorage.getItem('roadmap_target_career') || null;

          if (activeCareer) {
            sessionStorage.setItem('roadmap_target_career', activeCareer);
            sessionStorage.removeItem('roadmap_is_reset');
          }

          let restoredProgram = null;
          if (data.selected_program) {
            try {
              restoredProgram = typeof data.selected_program === 'string' ? JSON.parse(data.selected_program) : data.selected_program;
              sessionStorage.setItem('roadmap_selected_program', JSON.stringify(restoredProgram));
            } catch (e) {
              console.error("Failed to parse persisted selected_program:", e);
            }
          }

          setStudentProfile(prev => ({ 
            ...prev, 
            ...data, 
            name: resolvedName,
            target_career: activeCareer,
            selected_program: restoredProgram !== null ? restoredProgram : prev.selected_program
          }));

          if (!activeCareer) {
            setMatchingResults(null);
            return null;
          }
          
          const savedRadius = sessionStorage.getItem('radius_mode') || '100KM';

          return fetch(`${API_URL}/api/programs/match`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json', 
              'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({
              ...data,
              name: resolvedName,
              target_career: activeCareer,
              preferred_field: data.preferred_field || 'Computer Science',
              radius_mode: savedRadius,
              location_scope: savedRadius
            })
          });
        }
      })
      .then(res => res ? res.json() : null)
      .then(matchData => {
        if (matchData) {
          setMatchingResults(matchData);
        }
      })
      .catch(err => console.error("Profile sync bypassed:", err.message));
  }, [token]);

  return (
    <Router>
      <Routes>
        <Route 
          path="/auth" 
          element={!token ? <AuthPage /> : <Navigate to="/dashboard" replace />} 
        />

        <Route 
          path="/" 
          element={token ? <MainLayout profile={studentProfile} onSignOut={logout} /> : <Navigate to="/auth" replace />}
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard profile={studentProfile} results={matchingResults} setProfile={setStudentProfile} />} />
          <Route path="profile" element={<ProfilePage profile={studentProfile} setProfile={setStudentProfile} setResults={setMatchingResults} />} />
          <Route path="programs" element={<ProgramMatcher results={matchingResults} profile={studentProfile} setProfile={setStudentProfile} setResults={setMatchingResults} />} />
          <Route path="careers" element={<CareerExplorer profile={studentProfile} setProfile={setStudentProfile} setMatchingResults={setMatchingResults} />} />
          <Route path="roadmap" element={<RoadmapView profile={studentProfile} setProfile={setStudentProfile} results={matchingResults} setResults={setMatchingResults} />} />
          <Route path="counselor" element={<CareerCounselor profile={studentProfile} />} />
        </Route>

        <Route path="*" element={<Navigate to={token ? "/dashboard" : "/auth"} replace />} />
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