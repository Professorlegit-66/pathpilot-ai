import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import ProfilePage from './pages/ProfilePage';
import ProgramMatcher from './pages/ProgramMatcher';
import CareerExplorer from './pages/CareerExplorer';
import RoadmapView from './pages/RoadmapView';

export default function App() {
  const [studentProfile, setStudentProfile] = useState({
    name: 'Talha Ahmad',
    country: 'Pakistan',
    city: 'Islamabad',
    current_education_level: 'HSSC',
    ssc_percentage: 75.0,
    hssc_percentage: 85.0,
    hssc_group: 'Pre-Engineering',
    mathematics_background: true,
    preferred_field: 'Computer Science',
    financial_need_status: true
  });

  const [matchingResults, setMatchingResults] = useState(null);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout profile={studentProfile} />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard profile={studentProfile} results={matchingResults} />} />
          <Route path="profile" element={<ProfilePage profile={studentProfile} setProfile={setStudentProfile} setResults={setMatchingResults} />} />
          <Route path="programs" element={<ProgramMatcher results={matchingResults} profile={studentProfile} setResults={setMatchingResults} />} />
          <Route path="careers" element={<CareerExplorer />} />
          <Route path="roadmap" element={<RoadmapView profile={studentProfile} results={matchingResults} />} />
        </Route>
      </Routes>
    </Router>
  );
}