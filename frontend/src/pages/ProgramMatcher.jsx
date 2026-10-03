import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  GraduationCap, MapPin, CheckCircle2, XCircle, HelpCircle, 
  ChevronDown, ChevronUp, Award, Banknote, PlusCircle, ArrowRight, RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ProgramMatcher({ results, profile, setResults }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [expandedCard, setExpandedCard] = useState(null);
  const [filter, setFilter] = useState('ALL'); 

  const targetCareer = location.state?.selectedCareer || profile?.target_career;

  const handleRecheck = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/programs/match', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profile)
      });
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Failed to re-check eligibility:", error);
      alert("Could not connect to backend.");
    } finally {
      setLoading(false);
    }
  };

  if (!results || results.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#0f172a', borderRadius: '16px', border: '1px solid #334155' }}>
        <GraduationCap size={48} color="#64748b" style={{ marginBottom: '1rem' }} />
        <h2 style={{ color: '#f8fafc', fontSize: '1.5rem', marginBottom: '0.5rem' }}>No matching programs found</h2>
        <p style={{ color: '#94a3b8', maxWidth: '500px', margin: '0 auto 1.5rem auto', lineHeight: '1.5' }}>
          No matching programs were found in the current dataset based on your profile credentials. 
          Try adjusting your academic details or exploring different fields.
        </p>
        <button 
          onClick={() => navigate('/profile')}
          style={{ background: '#059669', color: '#fff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
        >
          Update Profile
        </button>
      </div>
    );
  }

  const rawList = Array.isArray(results) ? results : (results?.eligible_programs || results?.programs || []);
  
  const filteredResults = rawList.filter(item => {
    if (filter === 'ELIGIBLE') return item.eligibility_status === "ELIGIBLE";
    if (filter === 'NOT_ELIGIBLE') return item.eligibility_status === "NOT_ELIGIBLE";
    return true;
  });

  const getEligibilityConfig = (status) => {
    switch(status) {
      case 'ELIGIBLE':
        return { icon: <CheckCircle2 size={18} />, color: '#10b981', bg: '#064e3b', text: 'Eligible', subtext: '✓ Meets available requirements' };
      case 'NOT_ELIGIBLE':
        return { icon: <XCircle size={18} />, color: '#ef4444', bg: '#7f1d1d', text: 'Not eligible', subtext: '✕ Does not meet available requirements' };
      case 'UNKNOWN':
      default:
        return { icon: <HelpCircle size={18} />, color: '#f59e0b', bg: '#78350f', text: 'Unknown', subtext: '⚠ More information required' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f8fafc', margin: '0 0 0.5rem 0' }}>Program Matcher</h1>
          <p style={{ color: '#94a3b8', margin: 0 }}>Verified university programs evaluated against your academic profile.</p>
          
          {targetCareer && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#1e293b', border: '1px solid #38bdf8', color: '#e0f2fe', padding: '0.5rem 1rem', borderRadius: '8px', marginTop: '1rem', fontSize: '0.9rem' }}>
              <span style={{ color: '#38bdf8', fontWeight: '600' }}>Exploring programs for:</span> {targetCareer}
              <button onClick={() => navigate('/careers')} style={{ background: 'transparent', border: 'none', color: '#38bdf8', textDecoration: 'underline', cursor: 'pointer', padding: '0 0 0 0.5rem', fontSize: '0.85rem' }}>Change career</button>
            </div>
          )}
        </div>
        
        <button 
          onClick={handleRecheck} 
          disabled={loading}
          style={{ background: '#059669', color: '#fff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          {loading ? 'Evaluating...' : 'Re-Run Rule Engine'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #334155', paddingBottom: '1rem' }}>
        {['ALL', 'ELIGIBLE', 'NOT_ELIGIBLE'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            style={{
              background: filter === tab ? '#334155' : 'transparent',
              color: filter === tab ? '#f8fafc' : '#94a3b8',
              border: '1px solid #334155',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '0.9rem'
            }}
          >
            {tab === 'ALL' ? `All Programs (${rawList.length})` : tab === 'ELIGIBLE' ? 'Eligible Only' : 'Not Eligible'}
          </button>
        ))}
      </div>

      {filteredResults.length === 0 ? (
        <div style={{ background: '#1e293b', padding: '2rem', borderRadius: '12px', border: '1px solid #334155', textAlign: 'center', color: '#94a3b8' }}>
          No programs match the selected filter criteria.
        </div>
      ) : (
        filteredResults.map((prog, idx) => {
          const isExpanded = expandedCard === idx;
          const elig = getEligibilityConfig(prog.eligibility_status);

          return (
            <div key={idx} style={{ background: '#1e293b', border: `1px solid ${elig.bg}`, borderRadius: '12px', overflow: 'hidden', transition: 'all 0.2s' }}>
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#f8fafc', margin: '0 0 0.25rem 0' }}>
                      {prog.program_name}
                    </h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.95rem' }}>
                      <span style={{ fontWeight: '600', color: '#e2e8f0' }}>{prog.university_name}</span>
                      <span>•</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}><MapPin size={14} /> {prog.city}</span>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: elig.bg, color: elig.color, padding: '0.4rem 0.8rem', borderRadius: '6px', fontWeight: '600', fontSize: '0.9rem' }}>
                      {elig.icon} {elig.text}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>{elig.subtext}</span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '0.5rem', padding: '1rem', background: '#0f172a', borderRadius: '8px', border: '1px solid #334155' }}>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0 0 0.2rem 0', fontWeight: '600' }}>HEC RECOGNITION</p>
                    <p style={{ fontSize: '0.9rem', color: '#e2e8f0', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Award size={14} color="#38bdf8" /> {prog.hec_recognition}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0 0 0.2rem 0', fontWeight: '600' }}>PROGRAM ACCREDITATION</p>
                    <p style={{ fontSize: '0.9rem', color: '#e2e8f0', margin: 0 }}>{prog.accreditation}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0 0 0.2rem 0', fontWeight: '600' }}>FINANCIAL AID</p>
                    <p style={{ fontSize: '0.9rem', color: prog.available_scholarships?.length ? '#34d399' : '#94a3b8', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Banknote size={14} /> 
                      {prog.available_scholarships?.length ? `${prog.available_scholarships.length} opportunities found` : 'Not available in dataset'}
                    </p>
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #334155' }}>
                <button 
                  onClick={() => setExpandedCard(isExpanded ? null : idx)}
                  style={{ width: '100%', background: 'transparent', border: 'none', padding: '0.75rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8', fontSize: '0.9rem', cursor: 'pointer', fontWeight: '500' }}
                >
                  Why this appears
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                
                {isExpanded && (
                  <div style={{ padding: '0 1.5rem 1.5rem 1.5rem' }}>
                    <ul style={{ margin: '0.5rem 0 1.5rem 0', paddingLeft: '1.5rem', color: '#cbd5e1', fontSize: '0.9rem', lineHeight: '1.6' }}>
                      {prog.why_this_appears && prog.why_this_appears.map((reason, rIdx) => (
                        <li key={rIdx} style={{ color: reason.startsWith('✕') ? '#fca5a5' : reason.startsWith('⚠') ? '#fcd34d' : '#a7f3d0' }}>
                          <span style={{ color: '#e2e8f0' }}>{reason.substring(1).trim()}</span>
                        </li>
                      ))}
                    </ul>

                    {prog.available_scholarships?.length > 0 && (
                      <div style={{ marginBottom: '1.5rem' }}>
                        <h4 style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0 0 0.5rem 0' }}>Matching Financial Aid Records:</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {prog.available_scholarships.map((sch, sIdx) => (
                            <div key={sIdx} style={{ background: '#0f172a', padding: '0.75rem', borderRadius: '6px', border: '1px solid #334155', fontSize: '0.85rem' }}>
                              <strong style={{ color: '#34d399', display: 'block' }}>{sch.name}</strong>
                              <span style={{ color: '#64748b' }}>{sch.type} - {sch.coverage}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                      <button style={{ background: 'transparent', border: '1px solid #334155', color: '#f8fafc', padding: '0.6rem 1.25rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={e => e.target.style.background = '#334155'} onMouseLeave={e => e.target.style.background = 'transparent'}>
                        View Details
                      </button>
                      <button 
                        onClick={() => navigate('/roadmap', { state: { selectedProgram: prog } })}
                        style={{ background: '#059669', color: '#fff', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', transition: 'opacity 0.2s' }} onMouseEnter={e => e.target.style.opacity = 0.8} onMouseLeave={e => e.target.style.opacity = 1}
                      >
                        <PlusCircle size={16} /> Add to My Roadmap
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}