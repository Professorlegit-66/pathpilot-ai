import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Map, ArrowDown, Target, GraduationCap, Building2, 
  CheckCircle2, XCircle, AlertCircle, Banknote, Brain, Rocket, ArrowRight 
} from 'lucide-react';

export default function RoadmapView({ profile, results }) {
  const location = useLocation();
  const navigate = useNavigate();
  
  // State for selected program (can be passed via location state or selected from alternatives)
  const [selectedProgram, setSelectedProgram] = useState(location.state?.selectedProgram || null);
  
  // Target career from location state, profile, or fallback
  const targetCareer = location.state?.selectedCareer || profile?.target_career || "Software Engineering / ML Track";

  // Check if evaluation has occurred
  const isEvaluated = results !== null && results !== undefined;
  const rawList = Array.isArray(results) ? results : (results?.eligible_programs || results?.programs || []);

  // Default to the first eligible/matched program if none explicitly selected
  useEffect(() => {
    if (!selectedProgram && rawList.length > 0) {
      const bestMatch = rawList.find(p => p.eligibility_status === "ELIGIBLE") || rawList[0];
      setSelectedProgram(bestMatch);
    }
  }, [rawList, selectedProgram]);

  // Initial / Empty State (PRD Rule 18)
  if (!isEvaluated || rawList.length === 0) {
    return (
      <div style={{ maxWidth: '800px', margin: '4rem auto', padding: '3rem 2rem', background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', textAlign: 'center', boxSizing: 'border-box' }}>
        <div style={{ background: '#0f172a', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', border: '1px solid #334155' }}>
          <AlertCircle size={32} color="#38bdf8" />
        </div>
        <h2 style={{ fontSize: '1.5rem', color: '#f8fafc', marginBottom: '0.75rem' }}>Your Roadmap</h2>
        <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.5', maxWidth: '500px', margin: '0 auto 2rem auto' }}>
          Complete your profile and evaluate your options to generate your personalized roadmap.
        </p>
        <button 
          onClick={() => navigate('/programs')}
          style={{
            background: '#059669', color: '#fff', border: 'none', padding: '0.85rem 2rem',
            borderRadius: '8px', fontWeight: '600', fontSize: '1rem', cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)'
          }}
        >
          Evaluate My Profile <ArrowRight size={18} />
        </button>
      </div>
    );
  }

  // Active Program (either user-selected or default)
  const activeProg = selectedProgram || rawList[0];
  const alternativePrograms = rawList.filter(p => p.program_id !== activeProg?.program_id && p.university_name !== activeProg?.university_name);

  // Eligibility config mapping
  const getEligibilityBadge = (status) => {
    switch(status) {
      case 'ELIGIBLE':
        return { icon: <CheckCircle2 size={18} color="#10b981" />, text: 'Eligible', color: '#34d399', bg: '#064e3b' };
      case 'NOT_ELIGIBLE':
        return { icon: <XCircle size={18} color="#ef4444" />, text: 'Not Eligible', color: '#fca5a5', bg: '#7f1d1d' };
      case 'UNKNOWN':
      default:
        return { icon: <AlertCircle size={18} color="#f59e0b" />, text: 'Eligibility Cannot Be Determined', color: '#fcd34d', bg: '#78350f' };
    }
  };

  const eligBadge = getEligibilityBadge(activeProg?.eligibility_status);

  return (
    <div style={{ maxWidth: '950px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', boxSizing: 'border-box', paddingBottom: '4rem' }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#34d399', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.5rem', letterSpacing: '0.1em' }}>

<Map size={16} />
END-TO-END STUDENT JOURNEY
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 'bold', color: '#fff', margin: '0 0 0.5rem 0' }}>Personalized Career Roadmap</h1>
        <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
          Grounded milestone progression for <strong>{profile?.name || 'Student'}</strong> based on verified institutional datasets.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>

        {/* 1. TARGET CAREER */}
        <div style={{ width: '100%', maxWidth: '650px', background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '1.5rem', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: '#38bdf8', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <Target size={18} /> Target Career
          </div>
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.3rem', color: '#f8fafc' }}>{targetCareer}</h3>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.5' }}>
            Aligned with your profile interests in <strong style={{ color: '#cbd5e1' }}>{profile?.preferred_field || 'Computer Science'}</strong> and regional context in {profile?.city || 'Pakistan'}.
          </p>
        </div>

        <ArrowDown size={24} color="#475569" style={{ margin: '0.5rem 0' }} />

        {/* 2. EDUCATION / PROGRAM */}
        <div style={{ width: '100%', maxWidth: '650px', background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '1.5rem', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: '#a855f7', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <GraduationCap size={18} /> Education / Program
          </div>
          <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.3rem', color: '#f8fafc' }}>BS Computer Science</h3>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem' }}>
            Bachelor's degree program bridging foundational software principles with modern computing tracks.
          </p>
        </div>

        <ArrowDown size={24} color="#475569" style={{ margin: '0.5rem 0' }} />

        {/* 3. UNIVERSITY OPTIONS */}
        <div style={{ width: '100%', maxWidth: '650px', background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '1.5rem', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#f43f5e', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <Building2 size={18} /> University Options & Selection
          </div>

          {/* Selected Program Card */}
          {activeProg && (
            <div style={{ background: '#0f172a', border: '1px solid #059669', borderRadius: '12px', padding: '1.25rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <div>
                  <span style={{ background: '#064e3b', color: '#34d399', fontSize: '0.7rem', fontWeight: '700', padding: '0.2rem 0.5rem', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Selected Program Option
                  </span>
                  <h4 style={{ margin: '0.4rem 0 0.2rem 0', fontSize: '1.15rem', color: '#fff' }}>{activeProg.university_name}</h4>
                  <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem' }}>{activeProg.program_name} • {activeProg.city}</p>
                </div>
                <span style={{ color: '#38bdf8', fontSize: '0.85rem', fontWeight: '600', background: '#172554', padding: '0.3rem 0.6rem', borderRadius: '6px' }}>
                  {activeProg.hec_recognition}
                </span>
              </div>
            </div>
          )}

          {/* Alternative Programs */}
          {alternativePrograms.length > 0 && (
            <div>
              <p style={{ fontSize: '0.8rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.5rem 0' }}>
                Alternative Matched Options
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {alternativePrograms.map((alt, aIdx) => (
                  <div key={aIdx} style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ color: '#e2e8f0', fontSize: '0.9rem' }}>{alt.university_name}</strong>
                      <span style={{ color: '#94a3b8', fontSize: '0.85rem', marginLeft: '0.5rem' }}>({alt.city})</span>
                    </div>
                    <button 
                      onClick={() => setSelectedProgram(alt)}
                      style={{ background: 'transparent', border: '1px solid #334155', color: '#38bdf8', padding: '0.3rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer' }}
                    >
                      Make Selected
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <ArrowDown size={24} color="#475569" style={{ margin: '0.5rem 0' }} />

        {/* 4. ELIGIBILITY */}
        <div style={{ width: '100%', maxWidth: '650px', background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '1.5rem', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: '#10b981', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <CheckCircle2 size={18} /> Deterministic Eligibility Engine
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: eligBadge.bg, color: eligBadge.color, padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: '600', fontSize: '0.95rem', width: 'fit-content', marginBottom: '0.75rem' }}>
            {eligBadge.icon} {eligBadge.text}
          </div>

          {activeProg?.why_this_appears && activeProg.why_this_appears.length > 0 && (
            <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#cbd5e1', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              {activeProg.why_this_appears.map((reason, rIdx) => (
                <li key={rIdx}>{reason.replace(/^[✓✕⚠]\s*/, '')}</li>
              ))}
            </ul>
          )}
        </div>

        <ArrowDown size={24} color="#475569" style={{ margin: '0.5rem 0' }} />

        {/* 5. FINANCIAL AID */}
        <div style={{ width: '100%', maxWidth: '650px', background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '1.5rem', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: '#fbbf24', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <Banknote size={18} /> Financial Aid & Scholarships
          </div>

          {activeProg?.available_scholarships && activeProg.available_scholarships.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {activeProg.available_scholarships.map((sch, sIdx) => (
                <div key={sIdx} style={{ background: '#0f172a', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid #334155' }}>
                  <strong style={{ color: '#34d399', fontSize: '0.95rem', display: 'block', marginBottom: '0.2rem' }}>{sch.name}</strong>
                  <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{sch.type} • {sch.coverage}</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem', fontStyle: 'italic' }}>
              No matching financial-aid record was found in the current dataset.
            </p>
          )}
        </div>

        <ArrowDown size={24} color="#475569" style={{ margin: '0.5rem 0' }} />

        {/* 6. SKILLS */}
        <div style={{ width: '100%', maxWidth: '650px', background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '1.5rem', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: '#6366f1', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <Brain size={18} /> Skills to Develop
          </div>
          <p style={{ margin: '0 0 0.75rem 0', color: '#94a3b8', fontSize: '0.9rem' }}>
            Core competencies associated with <strong style={{ color: '#e2e8f0' }}>{targetCareer}</strong> from verified career mapping records:
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {['Python', 'Machine Learning', 'Statistics', 'Linear Algebra', 'Model Deployment', 'Software Engineering'].map((skill, skIdx) => (
              <span key={skIdx} style={{ background: '#0f172a', color: '#34d399', border: '1px solid #10b98140', padding: '0.3rem 0.75rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '500' }}>
                {skill}
              </span>
            ))}
          </div>
        </div>

        <ArrowDown size={24} color="#475569" style={{ margin: '0.5rem 0' }} />

        {/* 7. NEXT STEPS */}
        <div style={{ width: '100%', maxWidth: '650px', background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', borderRadius: '16px', padding: '1.75rem', boxSizing: 'border-box', boxShadow: '0 10px 25px -5px rgba(5, 150, 105, 0.4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#fff', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <Rocket size={18} /> Next Steps
          </div>
          <ol style={{ margin: 0, paddingLeft: '1.25rem', color: '#ecfdf5', fontSize: '0.95rem', lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li>Review matched program options for <strong>{activeProg?.university_name}</strong>.</li>
            <li>Confirm your deterministic eligibility status (<strong>{eligBadge.text}</strong>).</li>
            <li>Examine available financial-aid and scholarship records.</li>
            <li>Continue building technical skills aligned with your target career track.</li>
            <li>Use the AI Career Counselor for profile-grounded guidance anytime.</li>
          </ol>
        </div>

      </div>
    </div>
  );
}