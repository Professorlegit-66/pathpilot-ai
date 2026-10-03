import { useState } from 'react';
import { Save, Loader2, BookOpen, Target, Globe, AlertTriangle, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage({ profile, setProfile, setResults }) {
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const navigate = useNavigate();
  const { token, logout } = useAuth();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setProfile(prev => {
      const updated = {
        ...prev,
        [name]: type === 'checkbox' ? checked : 
                type === 'number' ? parseFloat(value) : value
      };

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

  const handleDeleteAccount = async () => {
    console.log("🔑 Current Auth Token:", token); // <-- Check browser console (F12)

    if (!token) {
      alert("No active session token found. Please log out and log back in.");
      return;
    }

    setDeleteLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/profile/', {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        }
      });
      
      if (res.ok) {
        logout();
        navigate('/');
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.detail || "Failed to delete account.");
      }
    } catch (err) {
      console.error("Delete account error:", err);
    } finally {
      setDeleteLoading(false);
      setShowDeleteModal(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '0.75rem 1rem', background: '#0f172a', border: '1px solid #334155',
    borderRadius: '8px', color: '#f8fafc', fontSize: '1rem', marginTop: '0.5rem', boxSizing: 'border-box'
  };

  const labelStyle = { fontSize: '0.9rem', fontWeight: '500', color: '#cbd5e1', display: 'block' };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', boxSizing: 'border-box', position: 'relative' }}>
      <div style={{ width: '100%', maxWidth: '800px' }}>
        
        <div style={{ marginBottom: '2rem', textAlign: 'left' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0 0 0.5rem 0', color: '#f8fafc' }}>Student Profile & Settings</h1>
          <p style={{ color: '#94a3b8', margin: 0 }}>Configure your profile or manage your account settings.</p>
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

          {/* Section 1: Academic History */}
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

        {/* Danger Zone / Delete Account Section */}
        <div style={{ marginTop: '3rem', background: '#1e293b', border: '1px solid #7f1d1d', borderRadius: '16px', padding: '2rem' }}>
          <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', color: '#f87171', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={20} /> Danger Zone
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
            Permanently delete your account and remove all your saved profile data from PathPilot AI. This action cannot be undone.
          </p>
          <button 
            type="button"
            onClick={() => setShowDeleteModal(true)}
            style={{
              background: '#7f1d1d', color: '#fca5a5', border: 'none', padding: '0.75rem 1.5rem',
              borderRadius: '8px', fontWeight: '600', fontSize: '0.95rem', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem', transition: 'background 0.2s'
            }}
          >
            <Trash2 size={16} /> Delete Account
          </button>
        </div>

      </div>

      {/* Custom In-App Warning Modal */}
      {showDeleteModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          padding: '1rem', boxSizing: 'border-box'
        }}>
          <div style={{
            background: '#1e293b', border: '1px solid #334155', borderRadius: '16px',
            maxWidth: '450px', width: '100%', padding: '2rem', boxSizing: 'border-box',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', display: 'flex', flexDirection: 'column', gap: '1.25rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#f87171' }}>
                <AlertTriangle size={24} />
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#f8fafc' }}>Confirm Account Deletion</h3>
              </div>
              <button 
                onClick={() => setShowDeleteModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.6', margin: 0 }}>
              Are you sure you want to delete your account? All your personal settings, academic records, and custom progress will be <strong style={{ color: '#f8fafc' }}>permanently deleted</strong>.
            </p>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button
                onClick={() => setShowDeleteModal(false)}
                style={{
                  background: '#334155', color: '#f8fafc', border: 'none', padding: '0.65rem 1.25rem',
                  borderRadius: '8px', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
                style={{
                  background: '#dc2626', color: '#fff', border: 'none', padding: '0.65rem 1.25rem',
                  borderRadius: '8px', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '0.5rem'
                }}
              >
                {deleteLoading ? <Loader2 size={16} className="animate-spin" /> : null}
                Yes, Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}