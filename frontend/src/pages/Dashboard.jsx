import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Award, Map, ArrowRight, Zap, AlertCircle } from 'lucide-react';

export default function Dashboard({ profile, results }) {
  const navigate = useNavigate();

  const isEvaluated = results !== null && results !== undefined;
  const rawList = Array.isArray(results) ? results : (results?.eligible_programs || results?.programs || []);
  
  const eligibleCount = isEvaluated ? rawList.filter(r => r.eligibility_status === "ELIGIBLE").length : 0;
  const totalScholarships = isEvaluated ? rawList.reduce((acc, curr) => acc + (curr.available_scholarships?.length || 0), 0) : 0;
  
  // Check if roadmap was explicitly reset or if no target career is stored
  const isReset = sessionStorage.getItem('roadmap_is_reset') === 'true';
  const hasTargetCareer = Boolean(sessionStorage.getItem('roadmap_target_career'));
  
  // Dynamic Check: Mark status active only if evaluated, eligible programs exist, not reset, and target career is set
  const roadmapGenerated = isEvaluated && eligibleCount > 0 && !isReset && hasTargetCareer;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '1400px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      
      {/* Welcome Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0 0 0.2rem 0', color: '#f8fafc' }}>
            Welcome back, {(profile?.name || 'Student').split(' ')[0]} 👋
          </h1>
          <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.9rem' }}>
            Here is the current outlook for your journey into {profile?.preferred_field || 'Computer Science'}.
          </p>
        </div>
      </div>

      {!isEvaluated ? (
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '2.5rem 1.5rem', textAlign: 'center' }}>
          <div style={{ background: '#0f172a', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto', border: '1px solid #334155' }}>
            <AlertCircle size={24} color="#38bdf8" />
          </div>
          <h2 style={{ fontSize: '1.25rem', color: '#f8fafc', marginBottom: '0.5rem' }}>Evaluation Required</h2>
          <p style={{ color: '#94a3b8', maxWidth: '450px', margin: '0 auto 1.25rem auto', fontSize: '0.9rem', lineHeight: '1.5' }}>
            Your profile has not been evaluated against our verified dataset yet. Run the evaluation to discover eligible programs, financial aid, and career matches.
          </p>
          <button 
            onClick={() => navigate('/programs')}
            style={{ background: '#059669', color: '#fff', border: 'none', padding: '0.6rem 1.5rem', borderRadius: '8px', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            Evaluate My Profile <ArrowRight size={16} />
          </button>
        </div>
      ) : (
        <>
          {/* KPI Metric Cards (Compact & Balanced Grid) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            
            <div style={{ background: '#1e293b', padding: '1.15rem 1.25rem', borderRadius: '10px', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ margin: '0 0 0.3rem 0', color: '#94a3b8', fontSize: '0.75rem', fontWeight: '600', letterSpacing: '0.05em' }}>ELIGIBLE PROGRAMS</p>
                  <h2 style={{ margin: 0, fontSize: '1.75rem', color: '#f8fafc', fontWeight: 'bold' }}>{eligibleCount}</h2>
                </div>
                <div style={{ background: '#064e3b', padding: '0.5rem', borderRadius: '8px' }}>
                  <GraduationCap size={20} color="#34d399" />
                </div>
              </div>
            </div>

            <div style={{ background: '#1e293b', padding: '1.15rem 1.25rem', borderRadius: '10px', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ margin: '0 0 0.3rem 0', color: '#94a3b8', fontSize: '0.75rem', fontWeight: '600', letterSpacing: '0.05em' }}>FINANCIAL AID OPTIONS</p>
                  <h2 style={{ margin: 0, fontSize: '1.75rem', color: '#f8fafc', fontWeight: 'bold' }}>{totalScholarships}</h2>
                </div>
                <div style={{ background: '#422006', padding: '0.5rem', borderRadius: '8px' }}>
                  <Award size={20} color="#fbbf24" />
                </div>
              </div>
            </div>

            <div style={{ background: '#1e293b', padding: '1.15rem 1.25rem', borderRadius: '10px', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ margin: '0 0 0.3rem 0', color: '#94a3b8', fontSize: '0.75rem', fontWeight: '600', letterSpacing: '0.05em' }}>AI ROADMAP STATUS</p>
                  <h2 style={{ margin: 0, fontSize: '1.2rem', color: roadmapGenerated ? '#34d399' : '#94a3b8', marginTop: '0.3rem', fontWeight: 'bold' }}>
                    {roadmapGenerated ? 'Active' : 'Pending'}
                  </h2>
                </div>
                <div style={{ background: '#172554', padding: '0.5rem', borderRadius: '8px' }}>
                  <Map size={20} color="#60a5fa" />
                </div>
              </div>
            </div>
          </div>

          {/* Recommended Next Actions Banner */}
          <div style={{ background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)', padding: '1.25rem 1.5rem', borderRadius: '12px', border: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#f8fafc' }}>
                <Zap size={16} color="#fbbf24" /> Next Recommended Step
              </h3>
              <p style={{ margin: 0, color: '#cbd5e1', fontSize: '0.85rem' }}>
                {roadmapGenerated 
                  ? "Your roadmap is active. Continue building the required skills for your target career." 
                  : "Generate your AI roadmap to start building the required skills."}
              </p>
            </div>
            <Link to={roadmapGenerated ? "/roadmap" : "/careers"} style={{ background: '#059669', color: '#fff', padding: '0.5rem 1.25rem', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              {roadmapGenerated ? "Go to Roadmap" : "Explore Careers"} <ArrowRight size={15} />
            </Link>
          </div>
        </>
      )}
    </div>
  );
}