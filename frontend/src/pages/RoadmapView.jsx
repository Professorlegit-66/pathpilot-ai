import { useState } from 'react';
import { Map, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function RoadmapView({ profile, results }) {
  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState(null);

  const handleGenerateRoadmap = async () => {
    if (!results || results.length === 0) {
      alert("Please evaluate your program eligibility first in the University Matcher.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, results })
      });
      const data = await response.json();
      setRoadmap(data.roadmap);
    } catch (error) {
      console.error("AI Roadmap Generation Error:", error);
      alert("Failed to connect to the AI roadmap service.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Map color="#059669" /> AI Career & Learning Roadmap
        </h1>
        <p style={{ color: '#94a3b8', margin: 0 }}>
          Grounded explanation layer powered by Groq, constrained strictly to verified datasets.
        </p>
      </div>

      {!roadmap ? (
        <div style={{ background: '#1e293b', padding: '4rem 2rem', borderRadius: '16px', border: '1px solid #334155', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ background: '#05966920', padding: '1rem', borderRadius: '50%', border: '1px solid #05966950' }}>
            <Sparkles size={32} color="#10b981" />
          </div>
          <div>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#f8fafc', fontSize: '1.5rem' }}>Ready to generate your path forward?</h3>
            <p style={{ color: '#94a3b8', maxWidth: '500px', margin: '0 auto', fontSize: '1rem' }}>
              Our rule engine has verified your eligibility. Click below to synthesize your eligible programs and career goals into a personalized roadmap.
            </p>
          </div>
          <button 
            onClick={handleGenerateRoadmap}
            disabled={loading}
            style={{ background: '#059669', color: '#fff', border: 'none', padding: '1rem 2.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1rem' }}
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : <Map size={20} />}
            {loading ? 'Synthesizing Roadmap...' : 'Generate AI Action Plan'}
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ background: '#05966920', padding: '1rem 1.25rem', borderRadius: '10px', border: '1px solid #059669', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#34d399' }}>
            <CheckCircle2 size={20} />
            <span style={{ fontWeight: '500' }}>AI Roadmap successfully generated and grounded in verified dataset facts.</span>
          </div>
          <div style={{ background: '#1e293b', padding: '2.5rem', borderRadius: '16px', border: '1px solid #334155', color: '#f8fafc', lineHeight: '1.7', fontSize: '1rem' }}>
            <ReactMarkdown>{roadmap}</ReactMarkdown>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={() => setRoadmap(null)} style={{ background: '#334155', color: '#f8fafc', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}>
              Regenerate Roadmap
            </button>
          </div>
        </div>
      )}
    </div>
  );
}