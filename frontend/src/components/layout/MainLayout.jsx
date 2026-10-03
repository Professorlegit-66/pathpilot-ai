import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNav from './TopNav';

export default function MainLayout({ profile, onSignOut }) {
  const location = useLocation(); 
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
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', backgroundColor: '#070b14' }}> 
      
      <Sidebar 
        onSignOut={onSignOut} 
        isCollapsed={isCollapsed} 
        toggleSidebar={toggleSidebar} 
      /> 
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}> 
        <TopNav profile={profile} onSignOut={onSignOut} />
        
        {/* Main Content Area: Animate ONLY when location.pathname changes */}
        <main style={{ 
          flex: 1, 
          overflowY: 'scroll', 
          padding: '1.5rem 2rem', 
          boxSizing: 'border-box', 
          width: '100%',
          scrollbarGutter: 'stable' 
        }}>
          <div key={location.pathname} className="animate-fade-slide-in" style={{ width: '100%' }}>
            <Outlet />
          </div>
        </main>
      </div>
      
    </div>
  );
}