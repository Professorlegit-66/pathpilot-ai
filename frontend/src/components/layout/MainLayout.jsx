import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNav from './TopNav';

export default function MainLayout({ profile }) {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#020617', color: '#f8fafc' }}>
      <Sidebar />
      <TopNav profile={profile} />
      <main style={{ marginLeft: '260px', padding: '2rem', minHeight: 'calc(100vh - 64px)' }}>
        <Outlet />
      </main>
    </div>
  );
}