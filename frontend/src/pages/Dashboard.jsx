import { Link } from 'react-router-dom';
import { GraduationCap, Briefcase, Award, Map, ArrowRight, Zap } from 'lucide-react';

export default function Dashboard({ profile, results }) {
  // Calculate quick stats from the deterministic engine results
  const eligibleCount = results?.filter(r => r.eligibility_status.includes("Eligible")).length || 0;
  const totalScholarships = results?.reduce((acc, curr) => acc + (curr.available_scholarships?.length || 0), 0) || 0;
  const roadmapGenerated = false; // We can wire this to state later

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Welcome Header */}
      <div>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>
          Welcome back, {profile.name.split(' ')[0]} 👋
        </h1>
        <p style={{ color: '#94a3b8', margin: 0, fontSize: '1.1rem' }}>
          Here is the current outlook for your journey into {profile.preferred_field}.
        </p>
      </div>

      {/* KPI Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        
        <div style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '12px', border: '1px solid #334155' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ margin: '0 0 0.5rem 0', color: '#94a3b8', fontSize: '0.9rem', fontWeight: '600' }}>ELIGIBLE PROGRAMS</p>
              <h2 style={{ margin: 0, fontSize: '2.5rem', color: '#f8fafc' }}>{eligibleCount}</h2>
            </div>
            <div style={{ background: '#064e3b', padding: '0.75rem', borderRadius: '12px' }}>
              <GraduationCap size={24} color="#34d399" />
            </div>
          </div>
        </div>

        <div style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '12px', border: '1px solid #334155' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ margin: '0 0 0.5rem 0', color: '#94a3b8', fontSize: '0.9rem', fontWeight: '600' }}>FINANCIAL AID OPTIONS</p>
              <h2 style={{ margin: 0, fontSize: '2.5rem', color: '#f8fafc' }}>{totalScholarships}</h2>
            </div>
            <div style={{ background: '#422006', padding: '0.75rem', borderRadius: '12px' }}>
              <Award size={24} color="#fbbf24" />
            </div>
          </div>
        </div>

        <div style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '12px', border: '1px solid #334155' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ margin: '0 0 0.5rem 0', color: '#94a3b8', fontSize: '0.9rem', fontWeight: '600' }}>AI ROADMAP STATUS</p>
              <h2 style={{ margin: 0, fontSize: '1.5rem', color: roadmapGenerated ? '#38bdf8' : '#94a3b8', marginTop: '0.5rem' }}>
                {roadmapGenerated ? 'Active' : 'Pending'}
              </h2>
            </div>
            <div style={{ background: '#172554', padding: '0.75rem', borderRadius: '12px' }}>
              <Map size={24} color="#60a5fa" />
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Next Actions */}
      <div style={{ background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)', padding: '2rem', borderRadius: '16px', border: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Zap size={20} color="#fbbf24" /> Next Recommended Step
          </h3>
          <p style={{ margin: 0, color: '#cbd5e1' }}>
            {eligibleCount > 0 
              ? "You have eligible programs! Generate your AI roadmap to start building the required skills." 
              : "Update your academic profile to let our rule engine find matching university programs."}
          </p>
        </div>
        <Link to={eligibleCount > 0 ? "/roadmap" : "/profile"} style={{ background: '#2563eb', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'background 0.2s' }}>
          {eligibleCount > 0 ? "Go to Roadmap" : "Update Profile"} <ArrowRight size={18} />
        </Link>
      </div>

    </div>
  );
}