import Sidebar from './Sidebar';
import TopNav from './TopNav';
import { Outlet } from 'react-router-dom';

export default function MainLayout({ profile }) {
  return (
    // Outer container: Locks to viewport, prevents white gaps
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', backgroundColor: '#0f172a' }}>     
      <Sidebar />    
      {/* Right side container: Holds TopNav and Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>     
        <TopNav profile={profile} />
        {/* Scrollable Main Content Area */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
          <Outlet />
        </main>

      </div>
    </div>
  );
}