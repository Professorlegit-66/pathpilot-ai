import { useState } from 'react';
import { Save, Loader2, BookOpen, Target, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Added AuthContext import

export default function ProfilePage({ profile, setProfile, setResults }) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { token } = useAuth(); // Retrieve JWT token

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setProfile(prev => {
      const updated = {
        ...prev,
        [name]: type === 'checkbox' ? checked : 
                type === 'number' ? parseFloat(value) : value
      };

      // Dynamically adjust defaults when Country changes
      if (name === 'country') {
        if (value === 'Pakistan') {
          updated.city = 'Islamabad';
          updated.current_education_level = 'HSSC';
          updated.hssc_group = 'Pre-Engineering';
        } else {
          updated.city = 'New York';
          updated.current_education_level = 'High School Diploma';
          updated.gpa_score = '3.5 / 4.0';
        }
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // 1. Securely save profile data to the SQLite database
      if (token) {
        const saveResponse = await fetch('http://127.0.0.1:8000/api/profile/', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          },
          body: JSON.stringify(profile)
        });
        
        if (!saveResponse.ok) {
          console.warn("Failed to save profile to database, but continuing to evaluation...");
        }
      }

      // 2. Trigger the existing eligibility rule engine
      const evalResponse = await fetch('http://127.0.0.1:8000/api/eligibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });
      
      if (!evalResponse.ok) throw new Error("Eligibility engine failed");

      const data = await evalResponse.json();
      setResults(data);
      navigate('/programs');
    } catch (error) {
      console.error("API Error:", error);
      alert("Could not process your request. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '0.75rem 1rem', background: '#0f172a', border: '1px solid #334155',
    borderRadius: '8px', color: '#f8fafc', fontSize: '1rem', marginTop: '0.5rem', boxSizing: 'border-box'
  };

  const labelStyle = { fontSize: '0.9rem', fontWeight: '500', color: '#cbd5e1', display: 'block' };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: '100%', maxWidth: '800px' }}>
        
        {/* Page Header */}
        <div style={{ marginBottom: '2rem', textAlign: 'left' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0 0 0.5rem 0', color: '#f8fafc' }}>Student Profile & Onboarding</h1>
          <p style={{ color: '#94a3b8', margin: 0 }}>Configure your location-aware profile to power the deterministic matching engine.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Section 0: Location & Context */}
          <div style={{ background: '#1e293b', padding: '2rem', borderRadius: '16px', border: '1px solid #334155' }}>
            <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#38bdf8' }}>
              <Globe size={20} /> Location & Context
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <label style={labelStyle}>Full Name</label>
                <input type="text" name="name" value={profile.name || ''} onChange={handleInputChange} style={inputStyle} required />
              </div>
              
              <div>
                <label style={labelStyle}>Country of Education / Residence</label>
                <select name="country" value={profile.country || 'Pakistan'} onChange={handleInputChange} style={inputStyle}>
                  <option value="Pakistan">Pakistan</option>
                  <option value="International">International / Other</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>City / Region</label>
                <input type="text" name="city" value={profile.city || 'Islamabad'} onChange={handleInputChange} style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Desired Degree Level</label>
                <select name="desired_degree" value={profile.desired_degree || 'Bachelor'} onChange={handleInputChange} style={inputStyle}>
                  <option value="Bachelor">Bachelor's Degree (BS / BSc)</option>
                  <option value="Master">Master's Degree (MS / MSc)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 1: Dynamic Academic Background */}
          <div style={{ background: '#1e293b', padding: '2rem', borderRadius: '16px', border: '1px solid #334155' }}>
            <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#34d399' }}>
              <BookOpen size={20} /> Academic History ({profile.country === 'International' ? 'International System' : 'Pakistan System'})
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <label style={labelStyle}>Current Education Level</label>
                <select name="current_education_level" value={profile.current_education_level || 'HSSC'} onChange={handleInputChange} style={inputStyle}>
                  {profile.country === 'Pakistan' ? (
                    <>
                      <option value="HSSC">HSSC (Intermediate)</option>
                      <option value="A-Levels">A-Levels</option>
                    </>
                  ) : (
                    <>
                      <option value="High School Diploma">High School Diploma</option>
                      <option value="IB Diploma">IB Diploma</option>
                      <option value="Undergraduate">Undergraduate / Associate</option>
                    </>
                  )}
                </select>
              </div>

              {profile.country === 'Pakistan' ? (
                <>
                  <div>
                    <label style={labelStyle}>HSSC Group / Specialization</label>
                    <select name="hssc_group" value={profile.hssc_group || 'Pre-Engineering'} onChange={handleInputChange} style={inputStyle}>
                      <option value="Pre-Engineering">Pre-Engineering</option>
                      <option value="ICS">ICS (Computer Science)</option>
                      <option value="Pre-Medical">Pre-Medical</option>
                    </select>
                  </div>

                  <div>
                    <label style={labelStyle}>SSC (Matric) %</label>
                    <input type="number" name="ssc_percentage" value={profile.ssc_percentage ?? 75} onChange={handleInputChange} step="0.1" style={inputStyle} />
                  </div>

                  <div>
                    <label style={labelStyle}>HSSC (Intermediate) %</label>
                    <input type="number" name="hssc_percentage" value={profile.hssc_percentage ?? 85} onChange={handleInputChange} step="0.1" style={inputStyle} />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label style={labelStyle}>High School GPA / Score</label>
                    <input type="text" name="gpa_score" value={profile.gpa_score || '3.5 / 4.0'} onChange={handleInputChange} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Standardized Test (SAT / ACT etc.)</label>
                    <input type="text" name="standardized_test" value={profile.standardized_test || '1350 SAT'} onChange={handleInputChange} style={inputStyle} />
                  </div>
                </>
              )}

              {/* Checkbox spanning full width */}
              <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', paddingTop: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', ...labelStyle }}>
                  <input 
                    type="checkbox" 
                    name="mathematics_background" 
                    checked={profile.mathematics_background ?? true} 
                    onChange={handleInputChange} 
                    style={{ width: '1.25rem', height: '1.25rem', accentColor: '#059669', flexShrink: 0, margin: 0 }}
                  />
                  <span style={{ lineHeight: '1.2', color: '#f8fafc' }}>I have a formal mathematics background in my coursework</span>
                </label>
              </div>
            </div>
          </div>

          {/* Section 2: Targets & Preferences */}
          <div style={{ background: '#1e293b', padding: '2rem', borderRadius: '16px', border: '1px solid #334155' }}>
            <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#a78bfa' }}>
              <Target size={20} /> Targets & Financial Constraints
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <label style={labelStyle}>Preferred Field of Study</label>
                <select name="preferred_field" value={profile.preferred_field || 'Computer Science'} onChange={handleInputChange} style={inputStyle}>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Artificial Intelligence">Artificial Intelligence</option>
                  <option value="Data Science">Data Science</option>
                  <option value="Software Engineering">Software Engineering</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Annual Tuition Budget</label>
                <input type="text" name="budget" value={profile.budget || (profile.country === 'Pakistan' ? 'Rs. 300,000 / year' : '$10,000 / year')} onChange={handleInputChange} style={inputStyle} />
              </div>

              {/* Checkbox spanning full width */}
              <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', paddingTop: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', ...labelStyle }}>
                  <input 
                    type="checkbox" 
                    name="financial_need_status" 
                    checked={profile.financial_need_status ?? true} 
                    onChange={handleInputChange} 
                    style={{ width: '1.25rem', height: '1.25rem', accentColor: '#059669', flexShrink: 0, margin: 0 }}
                  />
                  <span style={{ lineHeight: '1.2', color: '#f8fafc' }}>Evaluate Financial Aid and Scholarship Opportunities</span>
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
                background: '#059669', color: 'white', border: 'none', padding: '1rem 2rem', 
                borderRadius: '8px', cursor: 'pointer', fontSize: '1.1rem', fontWeight: '600',
                display: 'flex', alignItems: 'center', gap: '0.75rem', transition: 'background 0.2s',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
              {loading ? 'Evaluating Rules...' : 'Save Profile & Evaluate Programs'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}