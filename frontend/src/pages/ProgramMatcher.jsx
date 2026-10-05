import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { 
  GraduationCap, MapPin, CheckCircle2, XCircle, HelpCircle, 
  ChevronDown, ChevronUp, Award, Banknote, PlusCircle, RefreshCw, X, Navigation, AlertCircle, ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'https://pathpilot-ai-exln.onrender.com';

export default function ProgramMatcher({ results, profile, setResults }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [expandedCard, setExpandedCard] = useState(null);
  const [filter, setFilter] = useState('ALL'); 
  
  const [radiusMode, setRadiusMode] = useState(() => {
    return sessionStorage.getItem('radius_mode') || profile?.radius_mode || '100KM';
  });
  
  const [selectedDetailProgram, setSelectedDetailProgram] = useState(null);

  const targetCareer = location.state?.selectedCareer || sessionStorage.getItem('roadmap_target_career') || profile?.target_career || null;

  const handleRecheck = async (selectedRadius = radiusMode) => {
    if (!targetCareer) return;

    setLoading(true);
    try {
      const payload = {
        ...(profile || {}),
        target_career: targetCareer,
        preferred_field: profile?.preferred_field || "Computer Science",
        radius_mode: selectedRadius,
        location_scope: selectedRadius
      };
      const response = await fetch(`${API_URL}/api/programs/match`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Failed to re-check eligibility:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedRadius = sessionStorage.getItem('radius_mode') || '100KM';
    if (savedRadius !== radiusMode) {
      setRadiusMode(savedRadius);
    }
    if (targetCareer && (!results || results.length === 0) && !loading) {
      handleRecheck(savedRadius);
    }
  }, [targetCareer]);

  const handleRadiusToggle = (mode) => {
    setRadiusMode(mode);
    sessionStorage.setItem('radius_mode', mode);
    if (targetCareer) handleRecheck(mode);
  };

  const rawList = (targetCareer && Array.isArray(results)) ? results : (targetCareer && (results?.eligible_programs || results?.programs)) || [];
  
  const filteredResults = rawList.filter(item => {
    if (radiusMode === '100KM') {
      const dist = item.distance_km ?? item.distance ?? 0;
      if (dist > 100.0) return false;
    }
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1000px', margin: '0 auto', width: '100%', paddingBottom: '3rem' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f8fafc', margin: '0 0 0.5rem 0' }}>University Matcher</h1>
          <p style={{ color: '#94a3b8', margin: 0 }}>
            Evaluating options in <strong style={{ color: '#38bdf8' }}>{profile?.country || 'Pakistan'}</strong> for <strong style={{ color: '#38bdf8' }}>{profile?.city || 'Kohat'}</strong>.
          </p>
          
          {targetCareer ? (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#1e293b', border: '1px solid #38bdf8', color: '#e0f2fe', padding: '0.5rem 1rem', borderRadius: '8px', marginTop: '1rem', fontSize: '0.9rem' }}>
              <span style={{ color: '#38bdf8', fontWeight: '600' }}>Exploring programs for:</span> {targetCareer}
              <button onClick={() => navigate('/careers')} className="interactive-btn" style={{ background: 'transparent', border: 'none', color: '#38bdf8', textDecoration: 'underline', cursor: 'pointer', padding: '0 0 0 0.5rem', fontSize: '0.85rem' }}>Change career</button>
            </div>
          ) : (
            <div style={{ marginTop: '0.75rem', background: '#7f1d1d33', border: '1px solid #ef444455', padding: '0.5rem 1rem', borderRadius: '8px', display: 'inline-block' }}>
              <span style={{ color: '#fca5a5', fontSize: '0.85rem' }}>No career selected. </span>
              <button onClick={() => navigate('/careers')} className="interactive-btn" style={{ background: 'transparent', border: 'none', color: '#34d399', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' }}>
                Choose from Career Explorer
              </button>
            </div>
          )}
        </div>
        
        {targetCareer && (
          <button 
            onClick={() => handleRecheck(radiusMode)} 
            disabled={loading}
            className="interactive-btn"
            style={{ background: '#059669', color: '#fff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            {loading ? 'Evaluating...' : 'Re-Run Rule Engine'}
          </button>
        )}
      </div>

      {!targetCareer ? (
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '3.5rem 2rem', textAlign: 'center' }}>
          <div style={{ background: '#0f172a', width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto', border: '1px solid #334155' }}>
            <AlertCircle size={28} color="#38bdf8" />
          </div>
          <h2 style={{ fontSize: '1.35rem', color: '#f8fafc', marginBottom: '0.5rem' }}>Target Career Required</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.92rem', maxWidth: '480px', margin: '0 auto 1.75rem auto', lineHeight: '1.5' }}>
            Please select a target career track from the Career Explorer to run the deterministic evaluation engine against verified university program criteria.
          </p>
          <button 
            onClick={() => navigate('/careers')}
            className="interactive-btn"
            style={{ background: '#059669', color: '#fff', border: 'none', padding: '0.75rem 1.75rem', borderRadius: '8px', fontWeight: '600', fontSize: '0.95rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)' }}
          >
            Explore Careers <ArrowRight size={18} />
          </button>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#0f172a', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #334155', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.85rem' }}>
              <Navigation size={16} color="#38bdf8" />
              <span>Location Radius Filter:</span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => handleRadiusToggle('100KM')}
                className="interactive-btn"
                style={{
                  background: radiusMode === '100KM' ? '#059669' : '#1e293b',
                  color: radiusMode === '100KM' ? '#fff' : '#94a3b8',
                  border: '1px solid #334155',
                  padding: '0.4rem 0.85rem',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                📍 Within 100km of {profile?.city || 'Kohat'}
              </button>
              <button
                onClick={() => handleRadiusToggle('ALL')}
                className="interactive-btn"
                style={{
                  background: radiusMode === 'ALL' ? '#059669' : '#1e293b',
                  color: radiusMode === 'ALL' ? '#fff' : '#94a3b8',
                  border: '1px solid #334155',
                  padding: '0.4rem 0.85rem',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                🌐 All {profile?.country || 'Pakistan'} Programs
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #334155', paddingBottom: '1rem' }}>
            {['ALL', 'ELIGIBLE', 'NOT_ELIGIBLE'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className="interactive-btn"
                style={{
                  background: filter === tab ? '#334155' : 'transparent',
                  color: filter === tab ? '#f8fafc' : '#94a3b8',
                  border: '1px solid #334155',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  fontSize: '0.9rem',
                  transition: 'background 0.15s ease, color 0.15s ease'
                }}
              >
                {tab === 'ALL' ? `All Programs (${filteredResults.length})` : tab === 'ELIGIBLE' ? 'Eligible Only' : 'Not Eligible'}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', minHeight: '200px' }}>
            {filteredResults.length === 0 ? (
              <div style={{ background: '#1e293b', padding: '2.5rem 2rem', borderRadius: '12px', border: '1px solid #334155', textAlign: 'center', color: '#94a3b8' }}>
                No programs match the selected filter criteria.
              </div>
            ) : (
              filteredResults.map((prog, idx) => {
                const isExpanded = expandedCard === idx;
                const elig = getEligibilityConfig(prog.eligibility_status);

                return (
                  <div key={prog.program_id || `${prog.program_name}-${idx}`} style={{ background: '#1e293b', border: `1px solid ${elig.bg}`, borderRadius: '12px', overflow: 'hidden' }}>
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
                            {prog.distance_km !== undefined && prog.distance_km > 0 && (
                              <>
                                <span>•</span>
                                <span style={{ color: '#38bdf8', fontWeight: '600', fontSize: '0.85rem' }}>~{prog.distance_km} km away</span>
                              </>
                            )}
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
                          <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0 0 0.2rem 0', fontWeight: '600' }}>RECOGNITION / STATUS</p>
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

                      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                        <button 
                          onClick={() => setSelectedDetailProgram(prog)}
                          className="interactive-btn"
                          style={{ background: 'transparent', border: '1px solid #334155', color: '#f8fafc', padding: '0.55rem 1.15rem', borderRadius: '8px', fontSize: '0.88rem', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s' }} 
                        >
                          View Details
                        </button>
                        <button 
                          onClick={async () => {
                            sessionStorage.removeItem('roadmap_is_reset');
                            sessionStorage.setItem('roadmap_selected_program', JSON.stringify(prog));
                            if (targetCareer) sessionStorage.setItem('roadmap_target_career', targetCareer);

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
                                    target_career: targetCareer,
                                    selected_program: prog
                                  })
                                });
                              } catch (err) {
                                console.error("Failed to persist selected program to profile database:", err);
                              }
                            }

                            navigate('/roadmap', { state: { selectedProgram: prog, selectedCareer: targetCareer } });
                          }}
                          className="interactive-btn"
                          style={{ background: '#059669', color: '#fff', border: 'none', padding: '0.55rem 1.15rem', borderRadius: '8px', fontSize: '0.88rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }} 
                        >
                          <PlusCircle size={16} /> Add to My Roadmap
                        </button>
                      </div>
                    </div>

                    <div style={{ borderTop: '1px solid #334155' }}>
                      <button 
                        onClick={() => setExpandedCard(isExpanded ? null : idx)}
                        className="interactive-btn"
                        style={{ width: '100%', background: 'transparent', border: 'none', padding: '0.75rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8', fontSize: '0.9rem', cursor: 'pointer', fontWeight: '500' }}
                      >
                        Why this appears
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      
                      {isExpanded && (
                        <div style={{ padding: '0 1.5rem 1.5rem 1.5rem' }}>
                          <ul style={{ margin: '0.5rem 0 1.5rem 0', paddingLeft: '1.5rem', color: '#cbd5e1', fontSize: '0.9rem', lineHeight: '1.6' }}>
                            {prog.why_this_appears && prog.why_this_appears.map((reason, rIdx) => {
                              const text = reason.replace(/^[✓✕⚠]\s*/, '').trim();
                              const iconColor = reason.startsWith('✕') ? '#fca5a5' : reason.startsWith('⚠') ? '#fcd34d' : reason.startsWith('📍') ? '#38bdf8' : '#a7f3d0';
                              return (
                                <li key={rIdx} style={{ color: iconColor }}>
                                  <span style={{ color: '#e2e8f0' }}>{text}</span>
                                </li>
                              );
                            })}
                          </ul>

                          {prog.available_scholarships?.length > 0 && (
                            <div>
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
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {selectedDetailProgram && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(3, 7, 18, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem', boxSizing: 'border-box' }}>
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', maxWidth: '650px', width: '100%', padding: '2rem', boxSizing: 'border-box', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)', maxHeight: '90vh', overflowY: 'auto' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <span style={{ background: '#064e3b', color: '#34d399', fontSize: '0.7rem', fontWeight: '700', padding: '0.2rem 0.5rem', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Verified Program Record
                </span>
                <h2 style={{ color: '#fff', fontSize: '1.4rem', margin: '0.4rem 0 0.2rem 0' }}>{selectedDetailProgram.program_name}</h2>
                <p style={{ color: '#38bdf8', fontSize: '0.95rem', fontWeight: '600', margin: 0 }}>
                  {selectedDetailProgram.university_name} • {selectedDetailProgram.city} ({selectedDetailProgram.country || 'Pakistan'})
                </p>
              </div>
              <button 
                onClick={() => setSelectedDetailProgram(null)}
                className="interactive-btn"
                style={{ background: '#0f172a', border: '1px solid #334155', color: '#94a3b8', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: '#0f172a', padding: '1.25rem', borderRadius: '12px', border: '1px solid #334155', marginBottom: '1.5rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '600' }}>Recognition / Status</span>
                <p style={{ color: '#fff', margin: '0.2rem 0 0 0', fontSize: '0.9rem' }}>{selectedDetailProgram.hec_recognition}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '600' }}>Program Accreditation Body</span>
                <p style={{ color: '#fff', margin: '0.2rem 0 0 0', fontSize: '0.9rem' }}>{selectedDetailProgram.accreditation}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '600' }}>Deterministic Eligibility</span>
                <p style={{ 
                  color: selectedDetailProgram.eligibility_status === 'ELIGIBLE' ? '#34d399' : '#f87171', 
                  margin: '0.2rem 0 0 0', 
                  fontSize: '0.9rem', 
                  fontWeight: '600' 
                }}>
                  {selectedDetailProgram.eligibility_status === 'ELIGIBLE' ? 'Eligible' : 
                   selectedDetailProgram.eligibility_status === 'NOT_ELIGIBLE' ? 'Not Eligible' : 
                   selectedDetailProgram.eligibility_status}
                </p>
              </div>
              
              {selectedDetailProgram.why_this_appears && selectedDetailProgram.why_this_appears.length > 0 && (
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '600' }}>Evaluation Criteria Breakdown</span>
                  <ul style={{ margin: '0.4rem 0 0 0', paddingLeft: '1.25rem', color: '#cbd5e1', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    {selectedDetailProgram.why_this_appears.map((reason, rIdx) => (
                      <li key={rIdx}>{reason.replace(/^[✓✕⚠]\s*/, '').trim()}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button 
                onClick={() => setSelectedDetailProgram(null)}
                className="interactive-btn"
                style={{ background: '#334155', color: '#fff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
              >
                Close Modal
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}