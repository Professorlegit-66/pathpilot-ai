import { useState, useEffect } from 'react';
import { Compass, Briefcase, Loader2, Sparkles } from 'lucide-react';

export default function CareerExplorer() {
  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(true);

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
    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Compass color="#38bdf8" /> Career & Opportunity Explorer
        </h1>
        <p style={{ color: '#94a3b8', margin: 0 }}>
          Explore professional pathways, required skills, and industry demands aligned with verified opportunity datasets.
        </p>
      </div>

      {/* Content Section */}
      {loading ? (
        <div style={{ background: '#1e293b', padding: '3rem', borderRadius: '16px', border: '1px solid #334155', textAlign: 'center', color: '#94a3b8' }}>
          <Loader2 className="animate-spin" size={32} style={{ margin: '0 auto 1rem auto' }} color="#38bdf8" />
          Loading verified career pathways...
        </div>
      ) : careers.length === 0 ? (
        <div style={{ background: '#1e293b', padding: '2rem', borderRadius: '12px', border: '1px solid #334155', textAlign: 'center', color: '#94a3b8' }}>
          No career tracks found in the current dataset.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {careers.map((career, index) => (
            <div 
              key={index}
              style={{
                background: '#1e293b', padding: '1.5rem', borderRadius: '16px',
                border: '1px solid #334155', display: 'flex', flexDirection: 'column', gap: '1rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            >
              {/* Career Title & Description */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.25rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Briefcase size={20} color="#38bdf8" /> {career.title || career.name}
                  </h3>
                  <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.5' }}>
                    {career.description || "Directly linked to software engineering and emerging technical domains."}
                  </p>
                </div>
              </div>

              {/* Skills Tags */}
              {career.relevant_skills && career.relevant_skills.length > 0 && (
                <div style={{ background: '#0f172a', padding: '1rem', borderRadius: '10px', border: '1px solid #334155' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
                    REQUIRED SKILLS & COMPETENCIES (FROM DATASET)
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {career.relevant_skills.map((skill, sIdx) => (
                      <span 
                        key={sIdx} 
                        style={{ 
                          background: '#1e293b', color: '#38bdf8', border: '1px solid #334155', 
                          padding: '0.25rem 0.75rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '500' 
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            </div>
          ))}
        </div>
      )}

    </div>
  );
}