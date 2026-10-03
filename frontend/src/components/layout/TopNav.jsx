import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, HelpCircle, Settings, UserCheck, LogOut, ChevronDown } from 'lucide-react';

export default function TopNav({ profile, onSignOut }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header style={{
      height: '64px',
      backgroundColor: '#0f172a',
      borderBottom: '1px solid #1e293b',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 2rem',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      flexShrink: 0
    }}>
      {/* Left side: Sleek status badge instead of plain centered text */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#059669', boxShadow: '0 0 8px #059669' }}></div>
        <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: '500', letterSpacing: '0.025em' }}>
          Verified Opportunity Guidance & Roadmap Engine
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <button title="Help & Documentation" style={{ background: '#1e293b', border: '1px solid #334155', padding: '0.5rem', borderRadius: '50%', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <HelpCircle size={16} />
        </button>
        <button title="Notifications" style={{ background: '#1e293b', border: '1px solid #334155', padding: '0.5rem', borderRadius: '50%', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Bell size={16} />
        </button>

        {/* User Profile Dropdown Container */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button 
            onClick={() => setDropdownOpen(prev => !prev)}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.4rem 0.75rem', 
              background: dropdownOpen ? '#1e293b' : 'transparent', border: '1px solid', borderColor: dropdownOpen ? '#334155' : 'transparent',
              borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s' 
            }}
          >
            <div style={{ width: '36px', height: '36px', minWidth: '36px', borderRadius: '50%', background: '#059669', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: '0' }}>
              {profile?.name ? profile.name[0].toUpperCase() : 'S'}
            </div>
            <div style={{ textAlign: 'left', whiteSpace: 'nowrap' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#f8fafc' }}>{profile?.name || 'Student User'}</div>
              <div style={{ fontSize: '0.7rem', color: '#34d399' }}>{profile?.city || 'Pakistan'}</div>
            </div>
            <ChevronDown size={14} color="#94a3b8" style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: 'calc(100% + 8px)',
              width: '220px',
              backgroundColor: '#090d16',
              border: '1px solid #1e293b',
              borderRadius: '12px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
              overflow: 'hidden',
              zIndex: 100
            }}>
              <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #1e293b' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Signed in as</div>
                <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#f8fafc', overflow: 'hidden', textOverflow: 'ellipsis' }}>{profile?.name || 'User'}</div>
              </div>

              <div style={{ padding: '0.4rem' }}>
                <button 
                  onClick={() => { setDropdownOpen(false); navigate('/profile'); }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.65rem 0.75rem', background: 'transparent', border: 'none',
                    borderRadius: '8px', color: '#e2e8f0', fontSize: '0.85rem', fontWeight: '500',
                    cursor: 'pointer', textAlign: 'left'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1e293b'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <UserCheck size={16} color="#34d399" />
                  Student Profile & Settings
                </button>

                <button 
                  onClick={() => { setDropdownOpen(false); navigate('/dashboard'); }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.65rem 0.75rem', background: 'transparent', border: 'none',
                    borderRadius: '8px', color: '#e2e8f0', fontSize: '0.85rem', fontWeight: '500',
                    cursor: 'pointer', textAlign: 'left'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1e293b'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <Settings size={16} color="#38bdf8" />
                  System Overview
                </button>
              </div>

              <div style={{ borderTop: '1px solid #1e293b', padding: '0.4rem' }}>
                <button 
                  onClick={() => { setDropdownOpen(false); onSignOut(); }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.65rem 0.75rem', background: 'transparent', border: 'none',
                    borderRadius: '8px', color: '#f87171', fontSize: '0.85rem', fontWeight: '500',
                    cursor: 'pointer', textAlign: 'left'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#7f1d1d22'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}