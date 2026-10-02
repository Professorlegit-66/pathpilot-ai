import { User, Bell, HelpCircle } from 'lucide-react';

export default function TopNav({ profile }) {
  return (
    <header style={{
      height: '64px',
      marginLeft: '260px',
      backgroundColor: '#0f172a',
      borderBottom: '1px solid #1e293b',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 2rem',
      position: 'sticky',
      top: 0,
      zIndex: 40
    }}>
      <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
        Verified Opportunity Guidance & Roadmap Engine
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <button style={{ background: '#1e293b', border: 'none', padding: '0.5rem', borderRadius: '50%', color: '#94a3b8', cursor: 'pointer' }}>
          <HelpCircle size={18} />
        </button>
        <button style={{ background: '#1e293b', border: 'none', padding: '0.5rem', borderRadius: '50%', color: '#94a3b8', cursor: 'pointer' }}>
          <Bell size={18} />
        </button>

        {/* User Card */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingLeft: '1rem', borderLeft: '1px solid #1e293b' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
            {profile?.name ? profile.name[0] : 'S'}
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#f8fafc' }}>{profile?.name || 'Student User'}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{profile?.city || 'Pakistan'}</div>
          </div>
        </div>
      </div>
    </header>
  );
}