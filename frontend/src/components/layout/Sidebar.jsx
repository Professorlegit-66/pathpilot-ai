import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  UserCheck, 
  Compass, 
  GraduationCap, 
  Award, 
  Map, 
  LogOut, 
  Sparkles 
} from 'lucide-react';

export default function Sidebar() {
  const navItems = [
    { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Student Profile', path: '/profile', icon: UserCheck },
    { label: 'University Matcher', path: '/programs', icon: GraduationCap },
    { label: 'Career & Roadmap', path: '/roadmap', icon: Map },
  ];

  return (
    <aside style={{
      width: '260px',
      height: '100vh',
      backgroundColor: '#0f172a',
      color: '#f8fafc',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      left: 0,
      top: 0,
      borderRight: '1px solid #1e293b',
      zIndex: 50
    }}>
      {/* Brand Header */}
      <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid #1e293b' }}>
        <div style={{ background: '#059669', padding: '0.5rem', borderRadius: '8px', display: 'flex' }}>
          <Sparkles size={20} color="#fff" />
        </div>
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: 0, color: '#fff' }}>PathPilot AI</h2>
          <span style={{ fontSize: '0.7rem', background: '#3b82f633', color: '#60a5fa', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>HACKATHON EDITION</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: '500',
                fontSize: '0.95rem',
                color: isActive ? '#ffffff' : '#94a3b8',
                backgroundColor: isActive ? '#1e293b' : 'transparent',
                borderLeft: isActive ? '4px solid #10b981' : '4px solid transparent',
                transition: 'all 0.2s ease'
              })}
            >
              <Icon size={18} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer / User Session */}
      <div style={{ padding: '1rem', borderTop: '1px solid #1e293b' }}>
        <button style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.6rem 1rem',
          borderRadius: '8px',
          background: 'transparent',
          border: '1px solid #334155',
          color: '#ef4444',
          cursor: 'pointer'
        }}>
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}