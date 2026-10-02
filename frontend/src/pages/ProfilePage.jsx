import { useState } from 'react';
import { Save, Loader2, BookOpen, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage({ profile, setProfile, setResults }) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
              type === 'number' ? parseFloat(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Connect to our FastAPI deterministic engine
      const response = await fetch('http://127.0.0.1:8000/api/eligibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });
      const data = await response.json();
      setResults(data);
      
      // Auto-navigate to programs view after successful evaluation
      navigate('/programs');
    } catch (error) {
      console.error("API Error:", error);
      alert("Could not connect to the eligibility engine.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '0.75rem 1rem', background: '#0f172a', border: '1px solid #334155',
    borderRadius: '8px', color: '#f8fafc', fontSize: '1rem', marginTop: '0.5rem', boxSizing: 'border-box'
  };

  const labelStyle = { fontSize: '0.9rem', fontWeight: '500', color: '#cbd5e1' };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>Academic Profile</h1>
        <p style={{ color: '#94a3b8', margin: 0 }}>Configure your academic history and career goals to power the matching engine.</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Section 1: Academic Background */}
        <div style={{ background: '#1e293b', padding: '2rem', borderRadius: '16px', border: '1px solid #334155' }}>
          <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#38bdf8' }}>
            <BookOpen size={20} /> Academic History
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label style={labelStyle}>Full Name</label>
              <input type="text" name="name" value={profile.name} onChange={handleInputChange} style={inputStyle} required />
            </div>
            
            <div>
              <label style={labelStyle}>Current Education Level</label>
              <select name="current_education_level" value={profile.current_education_level} onChange={handleInputChange} style={inputStyle}>
                <option value="HSSC">HSSC (Intermediate)</option>
                <option value="A-Levels">A-Levels</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>HSSC Group</label>
              <select name="hssc_group" value={profile.hssc_group} onChange={handleInputChange} style={inputStyle}>
                <option value="Pre-Engineering">Pre-Engineering</option>
                <option value="ICS">ICS</option>
                <option value="Pre-Medical">Pre-Medical</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', ...labelStyle }}>
                <input 
                  type="checkbox" 
                  name="mathematics_background" 
                  checked={profile.mathematics_background} 
                  onChange={handleInputChange} 
                  style={{ width: '1.2rem', height: '1.2rem', accentColor: '#2563eb' }}
                />
                I have a mathematics background
              </label>
            </div>

            <div>
              <label style={labelStyle}>SSC (Matric) %</label>
              <input type="number" name="ssc_percentage" value={profile.ssc_percentage} onChange={handleInputChange} step="0.1" style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>HSSC (Inter) %</label>
              <input type="number" name="hssc_percentage" value={profile.hssc_percentage} onChange={handleInputChange} step="0.1" style={inputStyle} />
            </div>
          </div>
        </div>

        {/* Section 2: Goals & Preferences */}
        <div style={{ background: '#1e293b', padding: '2rem', borderRadius: '16px', border: '1px solid #334155' }}>
          <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#a78bfa' }}>
            <Target size={20} /> Targets & Preferences
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label style={labelStyle}>Preferred Field of Study</label>
              <select name="preferred_field" value={profile.preferred_field} onChange={handleInputChange} style={inputStyle}>
                <option value="Computer Science">Computer Science</option>
                <option value="Artificial Intelligence">Artificial Intelligence</option>
                <option value="Data Science">Data Science</option>
                <option value="Software Engineering">Software Engineering</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', ...labelStyle }}>
                <input 
                  type="checkbox" 
                  name="financial_need_status" 
                  checked={profile.financial_need_status} 
                  onChange={handleInputChange} 
                  style={{ width: '1.2rem', height: '1.2rem', accentColor: '#2563eb' }}
                />
                Evaluate Financial Aid Eligibility
              </label>
            </div>
          </div>
        </div>

        {/* Submit Action */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            type="submit" 
            disabled={loading} 
            style={{ 
              background: '#2563eb', color: 'white', border: 'none', padding: '1rem 2rem', 
              borderRadius: '8px', cursor: 'pointer', fontSize: '1.1rem', fontWeight: '600',
              display: 'flex', alignItems: 'center', gap: '0.75rem', transition: 'background 0.2s',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
            {loading ? 'Evaluating Rules...' : 'Save & Evaluate Programs'}
          </button>
        </div>

      </form>
    </div>
  );
}