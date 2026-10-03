import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Award, Map, ArrowRight, Zap, AlertCircle } from 'lucide-react';

export default function Dashboard({ profile, results }) {
  const navigate = useNavigate();

  // PRD Rule 5: Distinguish "Not Evaluated" from an actual zero-result evaluation.
  // App.jsx initializes results as `null`. Once evaluated, it becomes an array (even if empty).
  const isEvaluated = results !== null && results !== undefined;
  
  // Safely normalize results
  const rawList = Array.isArray(results) ? results : (results?.eligible_programs || results?.programs || []);
  
  // Calculate deterministic metrics
  const eligibleCount = isEvaluated ? rawList.filter(r => r.eligibility_status === "ELIGIBLE").length : 0;
  const totalScholarships = isEvaluated ? rawList.reduce((acc, curr) => acc + (curr.available_scholarships?.length || 0), 0) : 0;
  const roadmapGenerated = false; 

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      
      {/* Welcome Header */}
      <div>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0 0 0.5rem 0', color: '#f8fafc' }}>
          Welcome back, {(profile?.name || 'Student').split(' ')[0]} 👋
        </h1>
        <p style={{ color: '#94a3b8', margin: 0, fontSize: '1.1rem' }}>
          Here is the current outlook for your journey into {profile?.preferred_field || 'your chosen field'}.
        </p>
      </div>

      {/* PRD Rule 5 & 6: Honest Empty States & Primary CTA */}
      {!isEvaluated ? (
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '3rem 2rem', textAlign: 'center' }}>
          <div style={{ background: '#0f172a', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', border: '1px solid #334155' }}>
            <AlertCircle size={32} color="#38bdf8" />
          </div>
          <h2 style={{ fontSize: '1.5rem', color: '#f8fafc', marginBottom: '0.75rem' }}>Evaluation Required</h2>
          <p style={{ color: '#94a3b8', maxWidth: '500px', margin: '0 auto 2rem auto', lineHeight: '1.5' }}>
            Your profile has not been evaluated against our verified dataset yet. Run the evaluation to discover eligible programs, financial aid, and career matches.
          </p>
          <button 
            onClick={() => navigate('/programs')}
            style={{ background: '#059669', color: '#fff', border: 'none', padding: '0.85rem 2rem', borderRadius: '8px', fontWeight: '600', fontSize: '1rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)' }}
          >
            Evaluate My Profile <ArrowRight size={18} />
          </button>
        </div>
      ) : (
        <>
          {/* KPI Metric Cards (Only shown AFTER evaluation) */}
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
                  <h2 style={{ margin: 0, fontSize: '1.5rem', color: roadmapGenerated ? '#34d399' : '#94a3b8', marginTop: '0.5rem' }}>
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
          <div style={{ background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)', padding: '2rem', borderRadius: '16px', border: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f8fafc' }}>
                <Zap size={20} color="#fbbf24" /> Next Recommended Step
              </h3>
              <p style={{ margin: 0, color: '#cbd5e1' }}>
                {eligibleCount > 0 
                  ? "You have eligible programs! Generate your AI roadmap to start building the required skills." 
                  : "Review your matching results or adjust your profile to find better opportunities."}
              </p>
            </div>
            <Link to={eligibleCount > 0 ? "/roadmap" : "/programs"} style={{ background: '#059669', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'background 0.2s' }}>
              {eligibleCount > 0 ? "Go to Roadmap" : "View Recommendations"} <ArrowRight size={18} />
            </Link>
          </div>
        </>
      )}
    </div>
  );
}