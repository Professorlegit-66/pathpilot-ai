import { NavLink } from 'react-router-dom';
import { LayoutDashboard, UserCheck, GraduationCap, Briefcase, MessageSquare, Map, LogOut, Rocket } from 'lucide-react';

export default function Sidebar({ onSignOut }) {
  const navItems = [
    { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Student Profile', path: '/profile', icon: UserCheck },
    { label: 'University Matcher', path: '/programs', icon: GraduationCap },
    { label: 'Career Explorer', path: '/careers', icon: Briefcase },
    { label: 'AI Roadmap', path: '/roadmap', icon: Map },
    { label: 'Career Counselor', path: '/counselor', icon: MessageSquare },
  ];

  return (
    <div style={{ width: '260px', background: '#090d16', borderRight: '1px solid #1e293b', display: 'flex', flexDirection: 'column', height: '100%', flexShrink: 0 }}>
      
      {/* Brand Header */}
      <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid #1e293b' }}>
        <div style={{ background: '#059669', padding: '0.5rem', borderRadius: '8px', display: 'flex' }}>
          <Rocket size={20} color="#fff" />
        </div>
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: 0, color: '#fff' }}>PathPilot AI</h2>
          <span style={{ fontSize: '0.65rem', background: '#05966933', color: '#34d399', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: '600' }}>HACKATHON EDITION</span>
        </div>
      </div>

      {/* Navigation Links */}
      <div style={{ padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
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
                fontWeight: '600',
                fontSize: '0.9rem',
                color: isActive ? '#ffffff' : '#94a3b8',
                backgroundColor: isActive ? '#1e293b' : 'transparent',
                borderLeft: isActive ? '4px solid #059669' : '4px solid transparent',
                transition: 'all 0.2s ease'
              })}
            >
              <Icon size={18} />
              {item.label}
            </NavLink>
          );
        })}
      </div>

      {/* Footer / Sign Out */}
      <div style={{ padding: '1rem', borderTop: '1px solid #1e293b' }}>
        <button 
          onClick={onSignOut}
          style={{ 
            width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', 
            padding: '0.75rem 1rem', background: 'transparent', border: '1px solid #334155', 
            borderRadius: '8px', color: '#f87171', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem' 
          }}
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>

    </div>
  );
}