import { useState, useEffect } from 'react';
import { Compass, Briefcase, Loader2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CareerExplorer() {
  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/careers')
      .then(res => res.json())
      .then(data => {
        setCareers(data.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch careers dataset:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#f8fafc' }}>
          <Compass color="#059669" /> Career & Opportunity Explorer
        </h1>
        <p style={{ color: '#94a3b8', margin: 0 }}>
          Explore professional pathways, required skills, and industry demands aligned with verified opportunity datasets.
        </p>
      </div>

      {loading ? (
        <div style={{ background: '#1e293b', padding: '3rem', borderRadius: '16px', border: '1px solid #334155', textAlign: 'center', color: '#94a3b8' }}>
          <Loader2 className="animate-spin" size={32} style={{ margin: '0 auto 1rem auto' }} color="#059669" />
          Loading verified career pathways...
        </div>
      ) : careers.length === 0 ? (
        <div style={{ background: '#1e293b', padding: '2rem', borderRadius: '12px', border: '1px solid #334155', textAlign: 'center', color: '#94a3b8' }}>
          No career tracks found in the current dataset.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.25rem' }}>
          {careers.map((career, index) => (
            <div key={index} className="interactive-card" style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '16px', border: '1px solid #334155', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              
              <div>
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Briefcase size={20} color="#10b981" /> {career.name}
                </h3>
                
                {career.related_fields && career.related_fields.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600', display: 'block', marginBottom: '0.2rem' }}>RELATED FIELDS</span>
                    <p style={{ margin: 0, color: '#cbd5e1', fontSize: '0.85rem' }}>{career.related_fields.join(', ')}</p>
                  </div>
                )}

                {career.skills && career.skills.length > 0 && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600', display: 'block', marginBottom: '0.4rem' }}>REQUIRED SKILLS</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {career.skills.map((skill, sIdx) => (
                        <span key={sIdx} style={{ background: '#0f172a', color: '#34d399', border: '1px solid #10b98140', padding: '0.25rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem' }}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* PRD Rule 14: Carry selected career into Program Matcher */}
              <button 
                onClick={() => navigate('/programs', { state: { selectedCareer: career.name } })}
                style={{ background: '#059669', color: '#fff', border: 'none', padding: '0.75rem', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', transition: 'background 0.2s' }}
                onMouseEnter={e => e.target.style.background = '#047857'}
                onMouseLeave={e => e.target.style.background = '#059669'}
              >
                Explore Path <ArrowRight size={16} />
              </button>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}