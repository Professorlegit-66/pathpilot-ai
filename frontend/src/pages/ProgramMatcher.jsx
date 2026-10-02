import { useState } from 'react';
import { CheckCircle2, XCircle, AlertCircle, GraduationCap, Award, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ProgramMatcher({ results, profile, setResults }) {
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('ALL'); // ALL, ELIGIBLE, NOT_ELIGIBLE

  const handleRecheck = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/eligibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Failed to re-check eligibility:", error);
      alert("Could not connect to FastAPI backend.");
    } finally {
      setLoading(false);
    }
  };

  const filteredResults = results?.filter(item => {
    if (filter === 'ELIGIBLE') return item.eligibility_status.includes("Eligible");
    if (filter === 'NOT_ELIGIBLE') return item.eligibility_status.includes("Not eligible");
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      
      {/* Header & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>Program Matcher & Eligibility</h1>
          <p style={{ color: '#94a3b8', margin: 0 }}>Deterministic evaluation of your credentials against verified institutional datasets.</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button 
            onClick={handleRecheck} 
            disabled={loading}
            style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
          >
            {loading ? 'Evaluating...' : 'Re-Run Rule Engine'}
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      {results && results.length > 0 && (
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
              {tab === 'ALL' ? 'All Programs' : tab === 'ELIGIBLE' ? 'Eligible Only' : 'Not Eligible'}
            </button>
          ))}
        </div>
      )}

      {/* Results View */}
      {!results ? (
        <div style={{ background: '#1e293b', padding: '3rem', borderRadius: '16px', border: '1px solid #334155', textAlign: 'center' }}>
          <GraduationCap size={48} color="#64748b" style={{ marginBottom: '1rem' }} />
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#f8fafc' }}>No Eligibility Results Found</h3>
          <p style={{ color: '#94a3b8', margin: '0 0 1.5rem 0' }}>Configure your profile credentials to initiate deterministic evaluation.</p>
          <Link to="/profile" style={{ background: '#2563eb', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '8px', textDecoration: 'none', fontWeight: '600' }}>
            Go to Profile Setup
          </Link>
        </div>
      ) : filteredResults.length === 0 ? (
        <div style={{ background: '#1e293b', padding: '2rem', borderRadius: '12px', border: '1px solid #334155', textAlign: 'center', color: '#94a3b8' }}>
          No programs match the selected filter criteria.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {filteredResults.map((item, index) => {
            const isEligible = item.eligibility_status.includes("Eligible");
            const isNotEligible = item.eligibility_status.includes("Not eligible");

            return (
              <div 
                key={index} 
                style={{ 
                  background: '#1e293b', 
                  padding: '1.5rem', 
                  borderRadius: '16px', 
                  border: '1px solid #334155',
                  borderLeft: `6px solid ${isEligible ? '#22c55e' : isNotEligible ? '#ef4444' : '#f59e0b'}`,
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '1rem' 
                }}
              >
                {/* Header Information */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.25rem', color: '#f8fafc' }}>{item.program_name}</h3>
                    <span style={{ fontSize: '0.95rem', fontWeight: '500', color: '#94a3b8' }}>{item.university_name}</span>
                  </div>
                  
                  {/* Recognition & Accreditation Badges */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ padding: '0.25rem 0.6rem', background: item.hec_recognized ? '#064e3b' : '#7f1d1d', color: item.hec_recognized ? '#34d399' : '#fca5a5', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600' }}>
                      HEC: {item.hec_recognized ? "Recognized" : "Unverified"}
                    </span>
                    <span style={{ padding: '0.25rem 0.6rem', background: '#172554', color: '#60a5fa', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600' }}>
                      {item.accreditation?.body || "Accreditation"}: {item.accreditation?.status || "Pending"}
                    </span>
                  </div>
                </div>

                {/* Verdict Box */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {isEligible && <CheckCircle2 color="#22c55e" size={20} />}
                  {isNotEligible && <XCircle color="#ef4444" size={20} />}
                  {!isEligible && !isNotEligible && <AlertCircle color="#f59e0b" size={20} />}
                  <span style={{ fontWeight: '600', color: isEligible ? '#34d399' : isNotEligible ? '#fca5a5' : '#fbbf24' }}>
                    {item.eligibility_status}
                  </span>
                </div>

                {/* Rule Justification Breakdown */}
                <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#cbd5e1', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  {item.reasoning.map((reason, i) => (
                    <li key={i}>{reason}</li>
                  ))}
                </ul>

                {/* Financial Aid Sub-section */}
                {item.available_scholarships && item.available_scholarships.length > 0 && (
                  <div style={{ marginTop: '0.25rem', padding: '0.8rem 1rem', background: '#0f172a', borderRadius: '10px', border: '1px solid #334155' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <Award size={16} color="#fbbf24" />
                      <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#fbbf24' }}>Available Financial Aid & Scholarships</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {item.available_scholarships.map((sch, sIdx) => (
                        <div key={sIdx} style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                          • <strong style={{ color: '#e2e8f0' }}>{sch.name}</strong> ({sch.type}) — <em>{sch.coverage}</em>
                          <div style={{ paddingLeft: '0.8rem', fontSize: '0.8rem', color: '#64748b' }}>{sch.eligibility_logic}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}