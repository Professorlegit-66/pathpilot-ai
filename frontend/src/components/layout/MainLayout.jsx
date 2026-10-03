import { useState } from 'react';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import { Outlet } from 'react-router-dom';

export default function MainLayout({ profile, onSignOut }) {
  // Initialize collapse state from localStorage so it persists across refreshes and logins
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('pathpilot_sidebar_collapsed') === 'true';
  });

  const toggleSidebar = () => {
    setIsCollapsed(prev => {
      const newState = !prev;
      localStorage.setItem('pathpilot_sidebar_collapsed', newState);
      return newState;
    });
  };

  return (
    // Outer container: Locks to viewport, prevents white gaps
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', backgroundColor: '#070b14' }}> 
      
      {/* Sidebar with smooth width transition */}
      <Sidebar 
        onSignOut={onSignOut} 
        isCollapsed={isCollapsed} 
        toggleSidebar={toggleSidebar} 
      /> 
      
      {/* Right side container: Holds TopNav and Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}> 
        <TopNav profile={profile} onSignOut={onSignOut} />
        
        {/* Scrollable Main Content Area */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '2rem', boxSizing: 'border-box' }}>
          <Outlet />
        </main>
      </div>
      
    </div>
  );
}