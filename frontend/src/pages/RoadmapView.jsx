import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Map, ArrowDown, Target, GraduationCap, Building2, 
  CheckCircle2, XCircle, AlertCircle, Banknote, Brain, Rocket, ArrowRight, Edit2, RotateCcw, Check, Loader2 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import CustomDropdown from '../components/CustomDropdown';

const API_URL = import.meta.env.VITE_API_URL || 'https://pathpilot-ai-exln.onrender.com';

const ALL_10_CAREERS = [
  'Computer Science',
  'Software Engineer',
  'Cloud / DevOps Engineer',
  'Cybersecurity',
  'AI / Machine Learning Engineer',
  'Data Scientist / Analyst',
  'Full Stack Developer',
  'Mobile App Developer',
  'UI/UX Designer',
  'Database Administrator'
];

const getSkillsForCareer = (careerTitle) => {
  const lower = (careerTitle || "").toLowerCase();
  if (lower.includes('ml') || lower.includes('machine learning') || lower.includes('ai') || lower.includes('artificial intelligence')) {
    return ['Python', 'PyTorch / TensorFlow', 'Machine Learning', 'Statistics', 'Linear Algebra', 'Model Deployment'];
  } else if (lower.includes('cyber') || lower.includes('security') || lower.includes('infosec')) {
    return ['Network Security', 'Ethical Hacking', 'Cryptography', 'Linux & Bash', 'Risk Assessment', 'SIEM Tools'];
  } else if (lower.includes('cloud') || lower.includes('devops')) {
    return ['AWS / Azure', 'Docker & Kubernetes', 'CI/CD Pipelines', 'Terraform', 'Linux Administration', 'Microservices'];
  } else if (lower.includes('data scientist') || lower.includes('data analyst') || lower.includes('analytics')) {
    return ['SQL & NoSQL', 'Pandas & NumPy', 'Data Visualization', 'Tableau / PowerBI', 'ETL Pipelines', 'Statistics'];
  } else if (lower.includes('database') || lower.includes('dba') || lower.includes('data engineer')) {
    return ['PostgreSQL & MySQL', 'Database Indexing', 'ETL Pipeline Design', 'Query Optimization', 'Data Warehousing', 'Redis & Caching'];
  } else if (lower.includes('full stack') || lower.includes('web')) {
    return ['React / Next.js', 'Node.js / FastAPI', 'TypeScript', 'REST & GraphQL APIs', 'Database Design', 'Web Security'];
  } else if (lower.includes('mobile') || lower.includes('app')) {
    return ['React Native / Flutter', 'iOS & Android SDKs', 'State Management', 'Mobile UI/UX Design', 'App Store Deployment', 'API Integration'];
  } else if (lower.includes('ui') || lower.includes('ux') || lower.includes('design')) {
    return ['Figma & Wireframing', 'User Research', 'Information Architecture', 'Prototyping', 'Design Systems', 'Usability Testing'];
  } else {
    return ['Data Structures & Algorithms', 'System Design', 'Git & Version Control', 'REST APIs', 'Object-Oriented Programming', 'Agile Methodologies'];
  }
};

export default function RoadmapView({ profile, results, setResults }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [availableCareers, setAvailableCareers] = useState(ALL_10_CAREERS);

  useEffect(() => {
    const fetchCareersDataset = async () => {
      try {
        const activeToken = token || localStorage.getItem('token');
        const res = await fetch(`${API_URL}/api/data/careers`, {
          headers: activeToken ? { 'Authorization': `Bearer ${activeToken}` } : {}
        });
        if (res.ok) {
          const data = await res.json();
          const list = data.careers || data || [];
          const parsed = list.map(c => typeof c === 'string' ? c : (c.title || c.name || c.career_title || c.target_career)).filter(Boolean);
          if (parsed.length > 0) {
            const combined = Array.from(new Set([...parsed, ...ALL_10_CAREERS]));
            setAvailableCareers(combined);
          }
        }
      } catch (err) {
        console.error("Failed to load careers dataset, using default list:", err);
      }
    };
    fetchCareersDataset();
  }, [token]);

  if (location.state?.selectedProgram || location.state?.selectedCareer) {
    sessionStorage.removeItem('roadmap_is_reset');
  }

  const [selectedProgram, setSelectedProgram] = useState(() => {
    if (location.state?.selectedProgram) {
      sessionStorage.setItem('roadmap_selected_program', JSON.stringify(location.state.selectedProgram));
      return location.state.selectedProgram;
    }
    const saved = sessionStorage.getItem('roadmap_selected_program');
    if (saved) return JSON.parse(saved);
    if (profile?.selected_program) {
      return typeof profile.selected_program === 'string' ? JSON.parse(profile.selected_program) : profile.selected_program;
    }
    return null;
  });

  const [targetCareer, setTargetCareer] = useState(() => {
    if (location.state?.selectedCareer) {
      const selected = location.state.selectedCareer;
      const normalized = selected === "Cyber Security" ? "Cybersecurity" : selected;
      sessionStorage.setItem('roadmap_target_career', normalized);
      return normalized;
    }
    const saved = sessionStorage.getItem('roadmap_target_career');
    if (saved) return saved === "Cyber Security" ? "Cybersecurity" : saved;
    if (profile?.target_career) return profile.target_career === "Cyber Security" ? "Cybersecurity" : profile.target_career;
    return null; 
  });

  useEffect(() => {
    if (profile?.target_career && !targetCareer) {
      const norm = profile.target_career === "Cyber Security" ? "Cybersecurity" : profile.target_career;
      setTargetCareer(norm);
      sessionStorage.setItem('roadmap_target_career', norm);
    }
  }, [profile?.target_career]);

  useEffect(() => {
    if (profile?.selected_program && !selectedProgram) {
      try {
        const progObj = typeof profile.selected_program === 'string' ? JSON.parse(profile.selected_program) : profile.selected_program;
        setSelectedProgram(progObj);
        sessionStorage.setItem('roadmap_selected_program', JSON.stringify(progObj));
      } catch (e) {
        console.error("Failed to sync selected_program from profile:", e);
      }
    }
  }, [profile?.selected_program]);

  const [isEditingCareer, setIsEditingCareer] = useState(false);
  const [tempCareer, setTempCareer] = useState(targetCareer || "");

  useEffect(() => {
    if (targetCareer) {
      sessionStorage.setItem('roadmap_target_career', targetCareer);
    }
  }, [targetCareer]);

  useEffect(() => {
    if (selectedProgram) {
      sessionStorage.setItem('roadmap_selected_program', JSON.stringify(selectedProgram));
    }
  }, [selectedProgram]);

  const [isReset, setIsReset] = useState(() => {
    if (location.state?.selectedProgram || location.state?.selectedCareer) {
      return false;
    }
    return sessionStorage.getItem('roadmap_is_reset') === 'true';
  });

  const rawList = Array.isArray(results) ? results : (results?.eligible_programs || results?.programs || []);
  
  const isEvaluated = !isReset && Boolean(targetCareer) && Boolean(selectedProgram);

  useEffect(() => {
    const fetchProgramsForCareer = async () => {
      const activeToken = token || localStorage.getItem('token');
      if ((!results || rawList.length === 0) && targetCareer && !loading && !isReset && activeToken) {
        setLoading(true);
        try {
          const payload = {
            ...(profile || {}),
            target_career: targetCareer,
            preferred_field: profile?.preferred_field || "Computer Science"
          };
          const response = await fetch(`${API_URL}/api/programs/match`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${activeToken}`
            },
            body: JSON.stringify(payload)
          });
          const data = await response.json();
          if (setResults) setResults(data);
        } catch (err) {
          console.error("Auto-fetch failed:", err);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchProgramsForCareer();
  }, [targetCareer, isReset]);

  const handleSaveCareer = async () => {
    if (tempCareer && tempCareer.trim()) {
      const trimmed = tempCareer.trim();
      const newCareer = trimmed === "Cyber Security" ? "Cybersecurity" : trimmed;
      
      setSelectedProgram(null);
      sessionStorage.removeItem('roadmap_selected_program');
      
      setTargetCareer(newCareer);
      sessionStorage.setItem('roadmap_target_career', newCareer);
      sessionStorage.removeItem('roadmap_is_reset');
      setIsReset(false);

      const activeToken = token || localStorage.getItem('token');
      if (activeToken) {
        try {
          await fetch(`${API_URL}/api/profile/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${activeToken}`
            },
            body: JSON.stringify({
              ...(profile || {}),
              target_career: newCareer,
              selected_program: null
            })
          });
        } catch (err) {
          console.error("Failed to persist target career to database profile:", err);
        }
      }
      
      navigate('/programs', { state: { selectedCareer: newCareer } });
    }
    setIsEditingCareer(false);
  };

  const handleResetRoadmap = async () => {
    sessionStorage.removeItem('roadmap_target_career');
    sessionStorage.removeItem('roadmap_selected_program');
    sessionStorage.setItem('roadmap_is_reset', 'true');
    setIsReset(true);
    setSelectedProgram(null);
    setTargetCareer(null); 
    if (setResults) {
      setResults(null);
    }

    const activeToken = token || localStorage.getItem('token');
    if (activeToken) {
      try {
        await fetch(`${API_URL}/api/profile/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${activeToken}`
          },
          body: JSON.stringify({
            ...(profile || {}),
            target_career: null,
            selected_program: null
          })
        });
      } catch (err) {
        console.error("Failed to clear backend roadmap profile state:", err);
      }
    }

    navigate('/roadmap', { replace: true, state: {} });
  };

  if (!isEvaluated || loading || !targetCareer || !selectedProgram) {
    return (
      <div style={{ maxWidth: '800px', margin: '4rem auto', padding: '3rem 2rem', background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', textAlign: 'center', boxSizing: 'border-box' }}>
        <div style={{ background: '#0f172a', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', border: '1px solid #334155' }}>
          {loading ? <Loader2 className="animate-spin" size={32} color="#38bdf8" /> : <AlertCircle size={32} color="#38bdf8" />}
        </div>
        <h2 style={{ fontSize: '1.5rem', color: '#f8fafc', marginBottom: '0.75rem' }}>Personalized Career Roadmap</h2>
        <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.5', maxWidth: '520px', margin: '0 auto 2rem auto' }}>
          {loading 
            ? "Evaluating career requirements and matching options..." 
            : !targetCareer 
              ? "No career selected. Please select a verified career path from the Career Explorer to begin." 
              : `Target career set to "${targetCareer}". Please select a university program from the Program Matcher and click "Add to My Roadmap" to build your milestone progression.`}
        </p>
        {!loading && (
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {!targetCareer ? (
              <button 
                onClick={() => navigate('/careers')}
                className="interactive-btn"
                style={{
                  background: '#059669', color: '#fff', border: 'none', padding: '0.85rem 2rem',
                  borderRadius: '8px', fontWeight: '600', fontSize: '1rem', cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)'
                }}
              >
                Explore Careers <ArrowRight size={18} />
              </button>
            ) : (
              <button 
                onClick={() => navigate('/programs', { state: { selectedCareer: targetCareer } })}
                className="interactive-btn"
                style={{
                  background: '#059669', color: '#fff', border: 'none', padding: '0.85rem 2rem',
                  borderRadius: '8px', fontWeight: '600', fontSize: '1rem', cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)'
                }}
              >
                Match Programs <ArrowRight size={18} />
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  const activeProg = selectedProgram;
  const alternativePrograms = rawList.filter(p => p.program_id !== activeProg?.program_id && p.university_name !== activeProg?.university_name);
  const currentSkills = getSkillsForCareer(targetCareer);

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
  const dropdownOptions = availableCareers.map(cTitle => ({ label: cTitle, value: cTitle }));

  return (
    <div style={{ maxWidth: '950px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', boxSizing: 'border-box', paddingBottom: '4rem' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.5rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#34d399', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.5rem', letterSpacing: '0.1em' }}>

<Map size={16} />
END-TO-END STUDENT JOURNEY
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 'bold', color: '#fff', margin: '0 0 0.5rem 0' }}>Personalized Career Roadmap</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: '0 0 0.5rem 0' }}>
            Grounded milestone progression for <strong>{profile?.name || profile?.full_name || localStorage.getItem('user_full_name') || 'Student'}</strong> based on verified institutional datasets.
          </p>
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: '#cbd5e1' }}>
            <span>Target career: <strong style={{ color: '#38bdf8' }}>{targetCareer}</strong></span>
            <span>•</span>
            <span>Preferred field: <strong style={{ color: '#34d399' }}>{profile?.preferred_field || 'Computer Science'}</strong></span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            onClick={() => navigate('/careers')}
            className="interactive-btn"
            style={{ background: '#1e293b', border: '1px solid #334155', color: '#38bdf8', padding: '0.6rem 1rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer' }}
          >
            Explore Careers
          </button>
          <button 
            onClick={handleResetRoadmap}
            className="interactive-btn"
            style={{ background: '#7f1d1d', border: '1px solid #991b1b', color: '#fca5a5', padding: '0.6rem 1rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <RotateCcw size={14} /> Reset Roadmap
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>

        <div style={{ width: '100%', maxWidth: '650px', background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '1.5rem', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#38bdf8', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <Target size={18} /> Target Career
            </div>
            {!isEditingCareer ? (
              <button 
                onClick={() => { setTempCareer(targetCareer || ""); setIsEditingCareer(true); }}
                className="interactive-btn"
                style={{ background: 'transparent', border: 'none', color: '#38bdf8', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: '600' }}
              >
                <Edit2 size={14} /> Edit Career
              </button>
            ) : null}
          </div>

          {!isEditingCareer ? (
            <>
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.3rem', color: '#f8fafc' }}>{targetCareer}</h3>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.5' }}>
                Aligned with verified career dataset in regional context of {profile?.city || 'Kohat'}.
              </p>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '0.5rem' }}>
              <CustomDropdown
                value={tempCareer}
                options={dropdownOptions}
                onChange={(val) => setTempCareer(val)}
                placeholder="Select a career from dataset..."
                icon={<Target size={16} />}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button 
                  onClick={() => setIsEditingCareer(false)}
                  className="interactive-btn"
                  style={{ background: 'transparent', border: '1px solid #334155', color: '#94a3b8', padding: '0.45rem 0.9rem', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveCareer}
                  className="interactive-btn"
                  style={{ background: '#059669', border: 'none', color: '#fff', padding: '0.45rem 0.9rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                >
                  <Check size={14} /> Save Target
                </button>
              </div>
            </div>
          )}
        </div>

        <ArrowDown size={24} color="#475569" style={{ margin: '0.5rem 0' }} />

        <div style={{ width: '100%', maxWidth: '650px', background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '1.5rem', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: '#a855f7', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <GraduationCap size={18} /> Education / Program
          </div>
          <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.3rem', color: '#f8fafc' }}>{activeProg?.program_name || 'BS Degree Program'}</h3>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem' }}>
            Bachelor's degree program bridging foundational software principles with modern computing tracks.
          </p>
        </div>

        <ArrowDown size={24} color="#475569" style={{ margin: '0.5rem 0' }} />

        <div style={{ width: '100%', maxWidth: '650px', background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '1.5rem', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#f43f5e', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <Building2 size={18} /> University Options & Selection
          </div>

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
                  HEC Recognized
                </span>
              </div>
              <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #334155', fontSize: '0.8rem', color: '#94a3b8' }}>
                {activeProg.accreditation || "Program accreditation information is not available in the current dataset."}
              </div>
            </div>
          )}

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
                      className="interactive-btn"
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
              No matching financial-aid records found in the current dataset.
            </p>
          )}
        </div>

        <ArrowDown size={24} color="#475569" style={{ margin: '0.5rem 0' }} />

        <div style={{ width: '100%', maxWidth: '650px', background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '1.5rem', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: '#6366f1', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <Brain size={18} /> Skills to Develop
          </div>
          <p style={{ margin: '0 0 0.75rem 0', color: '#94a3b8', fontSize: '0.9rem' }}>
            Core competencies associated with <strong style={{ color: '#e2e8f0' }}>{targetCareer}</strong> from verified career mapping records:
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {currentSkills.map((skill, skIdx) => (
              <span key={skIdx} style={{ background: '#0f172a', color: '#34d399', border: '1px solid #10b98140', padding: '0.3rem 0.75rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '500' }}>
                {skill}
              </span>
            ))}
          </div>
        </div>

        <ArrowDown size={24} color="#475569" style={{ margin: '0.5rem 0' }} />

        <div style={{ width: '100%', maxWidth: '650px', background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', borderRadius: '16px', padding: '1.75rem', boxSizing: 'border-box', boxShadow: '0 10px 25px -5px rgba(5, 150, 105, 0.4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#fff', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <Rocket size={18} /> Next Steps
          </div>
          <ol style={{ margin: 0, paddingLeft: '1.25rem', color: '#ecfdf5', fontSize: '0.95rem', lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li>Review matched program options for <strong>{activeProg?.university_name}</strong>.</li>
            <li>Confirm your deterministic eligibility status (<strong>{eligBadge.text}</strong>).</li>
            <li>Examine available financial-aid and scholarship records.</li>
            <li>Continue building technical skills aligned with your target career track: <strong>{targetCareer}</strong>.</li>
            <li>Use the AI Career Counselor for profile-grounded guidance anytime.</li>
          </ol>
        </div>

      </div>
    </div>
  );
}