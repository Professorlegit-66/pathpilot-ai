import { useState, useEffect } from 'react';
import { Compass, Briefcase, Loader2 } from 'lucide-react';

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
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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
            <div key={index} className="interactive-card" style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '16px', border: '1px solid #334155' }}>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Briefcase size={20} color="#10b981" /> {career.title || career.name}
              </h3>
              <p style={{ margin: '0 0 1rem 0', color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.5' }}>
                {career.description || "Directly linked to software engineering and emerging technical domains."}
              </p>
              {career.relevant_skills && career.relevant_skills.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {career.relevant_skills.map((skill, sIdx) => (
                    <span key={sIdx} style={{ background: '#0f172a', color: '#34d399', border: '1px solid #10b98140', padding: '0.25rem 0.75rem', borderRadius: '6px', fontSize: '0.85rem' }}>
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}