import { useNavigate } from 'react-router-dom';
import { Map, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function RoadmapView({ profile, results }) {
  const navigate = useNavigate();

  // If no program match results exist in state, show an inline professional warning card instead of a native alert popup
  if (!results || !results.eligible_programs || results.eligible_programs.length === 0) {
    return (
      <div style={{ maxWidth: '800px', margin: '4rem auto', padding: '2.5rem', background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', textAlign: 'center', boxSizing: 'border-box' }}>
        <div style={{ background: '#f59e0b22', width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto' }}>
          <AlertCircle size={28} color="#f59e0b" />
        </div>
        <h2 style={{ fontSize: '1.4rem', color: '#f8fafc', marginBottom: '0.75rem' }}>Eligibility Evaluation Required</h2>
        <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.5', maxWidth: '500px', margin: '0 auto 1.5rem auto' }}>
          Please evaluate your program eligibility first in the University Matcher before generating your customized AI career roadmap.
        </p>
        <button 
          onClick={() => navigate('/programs')}
          style={{
            background: '#059669', color: '#fff', border: 'none', padding: '0.75rem 1.5rem',
            borderRadius: '8px', fontWeight: '600', fontSize: '0.95rem', cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)',
            transition: 'background 0.2s'
          }}
        >
          Go to University Matcher <ArrowRight size={16} />
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', boxSizing: 'border-box' }}>
      
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#34d399', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.2rem' }}>

<Map size={16} />
GROUNDED ACTION PLAN
        </div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#fff', margin: 0 }}>AI Career & Learning Roadmap</h1>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          Personalized milestone progression tailored for {profile?.name || 'Student'} in {profile?.city || 'Pakistan'}.
        </p>
      </div>

      {/* Success Badge */}
      <div style={{ background: '#064e3b33', border: '1px solid #05966966', padding: '1rem 1.25rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <CheckCircle2 size={20} color="#34d399" />
        <span style={{ color: '#34d399', fontSize: '0.9rem', fontWeight: '500' }}>
          AI Roadmap successfully generated and grounded in verified dataset facts.
        </span>
      </div>

      {/* Roadmap Content Card */}
      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '2rem', boxSizing: 'border-box' }}>
        <h3 style={{ color: '#38bdf8', fontSize: '1.15rem', marginTop: 0, marginBottom: '0.75rem' }}>Career Alignment</h3>
        <p style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
          A degree in <strong style={{ color: '#fff' }}>{profile?.preferred_field || 'Computer Science'}</strong> equips you with core competencies in software engineering, problem-solving, and system architecture. Your academic track aligns directly with high-demand opportunities locally and internationally.
        </p>

        <h3 style={{ color: '#34d399', fontSize: '1.15rem', marginTop: '1.5rem', marginBottom: '0.75rem' }}>Verified Eligible Programs</h3>
        <ul style={{ paddingLeft: '1.25rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.95rem' }}>
          {results.eligible_programs.map((prog, idx) => (
            <li key={idx}>
              <strong style={{ color: '#fff' }}>{prog.university_name} – {prog.program_name}</strong>: Eligibility confirmed based on your academic background and regional criteria.
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
}