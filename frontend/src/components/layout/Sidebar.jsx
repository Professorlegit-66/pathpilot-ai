import { NavLink } from 'react-router-dom';
import { LayoutDashboard, GraduationCap, Briefcase, MessageSquare, Map, LogOut, Rocket, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Sidebar({ onSignOut, isCollapsed, toggleSidebar }) {
  const navItems = [
    { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { label: 'University Matcher', path: '/programs', icon: GraduationCap },
    { label: 'Career Explorer', path: '/careers', icon: Briefcase },
    { label: 'AI Roadmap', path: '/roadmap', icon: Map },
    { label: 'Career Counselor', path: '/counselor', icon: MessageSquare },
  ];

  return (
    <div style={{ 
      width: isCollapsed ? '80px' : '260px', 
      minWidth: isCollapsed ? '80px' : '260px',
      background: '#090d16', 
      borderRight: '1px solid #1e293b', 
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'flex-start',
      height: '100%', 
      flexShrink: 0,
      transition: 'width 0.3s ease, min-width 0.3s ease',
      position: 'relative',
      boxSizing: 'border-box',
      overflow: 'visible' // Allows the absolute toggle button to sit cleanly on the border without clipping
    }}>
      
      {/* Brand Header */}
      <div style={{ 
        height: '76px',
        padding: '0 1rem', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: isCollapsed ? 'center' : 'flex-start', 
        borderBottom: '1px solid #1e293b', 
        overflow: 'hidden',
        boxSizing: 'border-box',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
          <div style={{ background: '#059669', padding: '0.5rem', borderRadius: '8px', display: 'flex', flexShrink: 0 }}>
            <Rocket size={20} color="#fff" />
          </div>
          {!isCollapsed && (
            <div style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: 0, color: '#fff' }}>PathPilot AI</h2>
              <span style={{ fontSize: '0.62rem', background: '#05966933', color: '#34d399', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: '600' }}>HACKATHON EDITION</span>
            </div>
          )}
        </div>
      </div>

      {/* Collapse Toggle Button (Fully unclipped and centered on the border edge) */}
      <button 
        onClick={toggleSidebar}
        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        style={{
          position: 'absolute',
          top: '26px',
          right: '-12px',
          width: '26px',
          height: '26px',
          borderRadius: '50%',
          backgroundColor: '#1e293b',
          border: '1px solid #334155',
          color: '#38bdf8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 100,
          boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
          transition: 'background 0.2s, transform 0.2s'
        }}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#334155'}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = '#1e293b'}
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Navigation Links */}
      <div style={{ 
        padding: '1.5rem 0.75rem', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '0.5rem', 
        overflowX: 'hidden',
        flexShrink: 0 
      }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              title={isCollapsed ? item.label : ''}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '0.9rem',
                color: isActive ? '#ffffff' : '#94a3b8',
                backgroundColor: isActive ? '#1e293b' : 'transparent',
                borderLeft: isActive ? '4px solid #059669' : '4px solid transparent',
                transition: 'background-color 0.2s ease, color 0.2s ease',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                boxSizing: 'border-box'
              })}
            >
              <Icon size={18} style={{ flexShrink: 0 }} />
              {!isCollapsed && <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>}
            </NavLink>
          );
        })}
      </div>

      {/* Footer / Sign Out */}
      <div style={{ padding: '1rem 0.75rem', borderTop: '1px solid #1e293b', marginTop: 'auto', flexShrink: 0 }}>
        <button 
          onClick={onSignOut}
          title={isCollapsed ? "Sign Out" : ""}
          style={{ 
            width: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: isCollapsed ? 'center' : 'flex-start', 
            gap: '0.75rem', 
            padding: '0.75rem', 
            background: 'transparent', 
            border: '1px solid #334155', 
            borderRadius: '8px', 
            color: '#f87171', 
            cursor: 'pointer', 
            fontWeight: '600', 
            fontSize: '0.9rem',
            whiteSpace: 'nowrap', 
            overflow: 'hidden', 
            boxSizing: 'border-box'
          }}
        >
          <LogOut size={18} style={{ flexShrink: 0 }} />
          {!isCollapsed && <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>Sign Out</span>}
        </button>
      </div>

    </div>
  );
}