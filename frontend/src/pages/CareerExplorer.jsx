import { useState, useEffect } from 'react';
import { Compass, Briefcase, Loader2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'https://pathpilot-ai-exln.onrender.com';

export default function CareerExplorer({ profile }) {
  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { token } = useAuth();

  useEffect(() => {
    const fetchCareers = async () => {
      try {
        let res = await fetch(`${API_URL}/api/data/careers`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        
        if (!res.ok) {
          res = await fetch(`${API_URL}/api/careers/`, {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
          });
        }

        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : (data.data || data.careers || []);
          setCareers(list);
        }
      } catch (err) {
        console.error("Failed to fetch careers dataset:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCareers();
  }, [token]);

  const handleExplorePath = async (title) => {
    sessionStorage.removeItem('roadmap_is_reset');
    sessionStorage.removeItem('roadmap_selected_program');
    sessionStorage.setItem('roadmap_target_career', title);

    if (token) {
      try {
        await fetch(`${API_URL}/api/profile/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            ...(profile || {}),
            target_career: title,
            selected_program: null
          })
        });
      } catch (err) {
        console.error("Failed to persist target career to profile:", err);
      }
    }

    navigate('/programs', { state: { selectedCareer: title } });
  };

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
          {careers.map((career, index) => {
            const title = career.title || career.career_title || career.name || career.role || "Career Track";
            const category = career.field_category || career.field || career.category || "Technology";
            const description = career.description || career.summary || "";
            const skills = career.top_skills || career.skills || [];

            return (
              <div key={career.career_id || index} style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '16px', border: '1px solid #334155', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <h3 style={{ margin: 0, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem' }}>
                      <Briefcase size={20} color="#10b981" /> {title}
                    </h3>
                    {category && (
                      <span style={{ fontSize: '0.75rem', background: '#0f172a', color: '#38bdf8', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid #334155', fontWeight: '600' }}>
                        {category}
                      </span>
                    )}
                  </div>

                  {description && (
                    <p style={{ margin: '0 0 1rem 0', color: '#cbd5e1', fontSize: '0.88rem', lineHeight: '1.5' }}>
                      {description}
                    </p>
                  )}

                  {skills.length > 0 && (
                    <div style={{ marginBottom: '1.5rem' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600', display: 'block', marginBottom: '0.4rem' }}>REQUIRED SKILLS</span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {skills.map((skill, sIdx) => (
                          <span key={sIdx} style={{ background: '#0f172a', color: '#34d399', border: '1px solid #10b98140', padding: '0.25rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem' }}>
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <button 
                  onClick={() => handleExplorePath(title)}
                  className="interactive-btn"
                  style={{ background: '#059669', color: '#fff', border: 'none', padding: '0.75rem', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}
                >
                  Explore Path <ArrowRight size={16} />
                </button>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}