import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  GraduationCap, MapPin, CheckCircle2, XCircle, HelpCircle, 
  ChevronDown, ChevronUp, Award, Banknote, PlusCircle, RefreshCw, X, Navigation
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ProgramMatcher({ results, profile, setResults }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [expandedCard, setExpandedCard] = useState(null);
  const [filter, setFilter] = useState('ALL'); 
  
  const [radiusMode, setRadiusMode] = useState(() => {
    return sessionStorage.getItem('radius_mode') || profile?.radius_mode || 'ALL';
  });
  
  const [selectedDetailProgram, setSelectedDetailProgram] = useState(null);

  const targetCareer = location.state?.selectedCareer || profile?.target_career || sessionStorage.getItem('roadmap_target_career') || profile?.preferred_field || "Software Engineering";

  const handleRecheck = async (selectedRadius = radiusMode) => {
    setLoading(true);
    try {
      const payload = {
        ...(profile || {}),
        target_career: targetCareer,
        radius_mode: selectedRadius
      };
      const response = await fetch('http://127.0.0.1:8000/api/programs/match', {
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
      alert("Could not connect to backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedRadius = sessionStorage.getItem('radius_mode') || 'ALL';
    if (savedRadius !== radiusMode) {
      setRadiusMode(savedRadius);
    }
    if ((!results || results.length === 0) && !loading) {
      handleRecheck(savedRadius);
    }
  }, []);

  const handleRadiusToggle = (mode) => {
    setRadiusMode(mode);
    sessionStorage.setItem('radius_mode', mode);
    handleRecheck(mode);
  };

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1000px', margin: '0 auto', width: '100%', paddingBottom: '3rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f8fafc', margin: '0 0 0.5rem 0' }}>Program Matcher</h1>
          <p style={{ color: '#94a3b8', margin: 0 }}>
            Evaluating options in <strong style={{ color: '#38bdf8' }}>{profile?.country || 'United States'}</strong> for <strong style={{ color: '#38bdf8' }}>{profile?.city || 'Boston'}</strong>.
          </p>
          
          {targetCareer && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#1e293b', border: '1px solid #38bdf8', color: '#e0f2fe', padding: '0.5rem 1rem', borderRadius: '8px', marginTop: '1rem', fontSize: '0.9rem' }}>
              <span style={{ color: '#38bdf8', fontWeight: '600' }}>Exploring programs for:</span> {targetCareer}
              <button onClick={() => navigate('/careers')} style={{ background: 'transparent', border: 'none', color: '#38bdf8', textDecoration: 'underline', cursor: 'pointer', padding: '0 0 0 0.5rem', fontSize: '0.85rem' }}>Change career</button>
            </div>
          )}
        </div>
        
        <button 
          onClick={() => handleRecheck(radiusMode)} 
          disabled={loading}
          style={{ background: '#059669', color: '#fff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          {loading ? 'Evaluating...' : 'Re-Run Rule Engine'}
        </button>
      </div>

      {/* Radius Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#0f172a', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #334155', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.85rem' }}>
          <Navigation size={16} color="#38bdf8" />
          <span>Location Radius Filter:</span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => handleRadiusToggle('100KM')}
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
            📍 Within 100km of {profile?.city || 'Boston'}
          </button>
          <button
            onClick={() => handleRadiusToggle('ALL')}
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
            🌐 All {profile?.country || 'United States'} Programs
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
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
              fontSize: '0.9rem',
              transition: 'background 0.15s ease, color 0.15s ease'
            }}
          >
            {tab === 'ALL' ? `All Programs (${rawList.length})` : tab === 'ELIGIBLE' ? 'Eligible Only' : 'Not Eligible'}
          </button>
        ))}
      </div>

      {/* List Container */}
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
                        <button 
                          onClick={() => setSelectedDetailProgram(prog)}
                          style={{ background: 'transparent', border: '1px solid #334155', color: '#f8fafc', padding: '0.6rem 1.25rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s' }} 
                        >
                          View Details
                        </button>
                        <button 
                          onClick={() => {
                            sessionStorage.removeItem('roadmap_is_reset');
                            sessionStorage.setItem('roadmap_selected_program', JSON.stringify(prog));
                            sessionStorage.setItem('roadmap_target_career', targetCareer);
                            navigate('/roadmap', { state: { selectedProgram: prog, selectedCareer: targetCareer } });
                          }}
                          style={{ background: '#059669', color: '#fff', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }} 
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

      {/* Detail Modal */}
      {selectedDetailProgram && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(3, 7, 18, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
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
                      <li key={rIdx}>{reason.substring(1).trim()}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button 
                onClick={() => setSelectedDetailProgram(null)}
                style={{ background: '#334155', color: '#fff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
              >
                Close Modal
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}