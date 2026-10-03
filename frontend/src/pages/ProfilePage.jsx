import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, MapPin, BookOpen, Target, AlertTriangle, Save, Trash2, CheckCircle, ShieldAlert, ArrowUpDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import CustomDropdown from '../components/CustomDropdown';

export default function ProfilePage({ profile, setProfile, setResults }) {
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const [formData, setFormData] = useState(profile || {
    name: '',
    country: 'Pakistan',
    region: 'Khyber Pakhtunkhwa',
    city: '',
    desired_degree: "Bachelor's Degree (BS / BSc)",
    current_education_level: 'HSSC (Intermediate)',
    hssc_group: 'Pre-Engineering',
    ssc_percentage: 75.0,
    hssc_percentage: 75.0,
    mathematics_background: true,
    preferred_field: 'Computer Science',
    budget: 'Rs. 300,000 / year',
    financial_need_status: true
  });

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');

    try {
      const saveRes = await fetch('http://127.0.0.1:8000/api/profile/', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (!saveRes.ok) {
        throw new Error("Failed to save profile to backend.");
      }

      const savedData = await saveRes.json();
      setProfile(prev => ({ ...prev, ...savedData }));
      
      const res = await fetch('http://127.0.0.1:8000/api/programs/match', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      setResults(data);

      setSuccessMsg('Profile successfully saved to database and programs evaluated!');
      setTimeout(() => {
        navigate('/programs');
      }, 1200);
    } catch (err) {
      console.error("Failed to save profile:", err);
      alert("Failed to connect to backend server.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/profile/', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        localStorage.clear();
        window.location.href = '/auth';
      } else {
        alert("Failed to delete account.");
      }
    } catch (err) {
      console.error("Error deleting account:", err);
    }
  };

  const inputStyle = {
    width: '100%',
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '8px',
    padding: '0.75rem 1rem',
    color: '#f8fafc',
    fontSize: '0.95rem',
    outline: 'none',
    boxSizing: 'border-box'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#94a3b8',
    marginBottom: '0.4rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  };

  return (
    <div className="fluid-page-container" style={{ paddingBottom: '4rem' }}>
      
      <div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 'bold', color: '#f8fafc', margin: '0 0 0.5rem 0' }}>
          Student Profile & Settings
        </h1>
        <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.95rem' }}>
          Configure your academic profile to power deterministic program matching and career advisory engines.
        </p>
      </div>

      {successMsg && (
        <div style={{ background: '#064e3b', border: '1px solid #059669', color: '#34d399', padding: '1rem 1.25rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: '500' }}>
          <CheckCircle size={20} /> {successMsg}
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* SECTION 1: Location & Context */}
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '1.75rem', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#38bdf8', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #334155' }}>
            <MapPin size={20} />
            <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 'bold', color: '#f8fafc' }}>Location & Context</h2>
          </div>

          <div className="fluid-grid">
            <div>
              <label style={labelStyle}>Full Name</label>
              <input 
                type="text" 
                value={formData.name || ''} 
                onChange={e => handleChange('name', e.target.value)} 
                style={inputStyle}
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <label style={labelStyle}>Country of Education / Residence</label>
              <CustomDropdown 
                value={formData.country || 'Pakistan'}
                options={[{ label: 'Pakistan', value: 'Pakistan' }]}
                onChange={val => handleChange('country', val)}
                icon={<ArrowUpDown size={14} />}
              />
            </div>
            <div>
              <label style={labelStyle}>City / Region</label>
              <input 
                type="text" 
                value={formData.city || ''} 
                onChange={e => handleChange('city', e.target.value)} 
                style={inputStyle}
                placeholder="e.g. Kohat, Islamabad, Peshawar"
              />
            </div>
            <div>
              <label style={labelStyle}>Desired Degree Level</label>
              <CustomDropdown 
                value={formData.desired_degree || "Bachelor's Degree (BS / BSc)"}
                options={[
                  { label: "Bachelor's Degree (BS / BSc)", value: "Bachelor's Degree (BS / BSc)" },
                  { label: "Master's Degree (MS / MSc)", value: "Master's Degree (MS / MSc)" }
                ]}
                onChange={val => handleChange('desired_degree', val)}
                icon={<ArrowUpDown size={14} />}
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: Academic History */}
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '1.75rem', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#34d399', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #334155' }}>
            <BookOpen size={20} />
            <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 'bold', color: '#f8fafc' }}>Academic History (Pakistan System)</h2>
          </div>

          <div className="fluid-grid" style={{ marginBottom: '1.25rem' }}>
            <div>
              <label style={labelStyle}>Current Education Level</label>
              <CustomDropdown 
                value={formData.current_education_level || 'HSSC (Intermediate)'}
                options={[
                  { label: 'HSSC (Intermediate)', value: 'HSSC (Intermediate)' },
                  { label: 'SSC (Matric)', value: 'SSC (Matric)' },
                  { label: "Bachelor's", value: "Bachelor's" }
                ]}
                onChange={val => handleChange('current_education_level', val)}
                icon={<ArrowUpDown size={14} />}
              />
            </div>
            <div>
              <label style={labelStyle}>HSSC Group / Specialization</label>
              <CustomDropdown 
                value={formData.hssc_group || 'Pre-Engineering'}
                options={[
                  { label: 'Pre-Engineering', value: 'Pre-Engineering' },
                  { label: 'ICS (Computer Science)', value: 'ICS' },
                  { label: 'Pre-Medical', value: 'Pre-Medical' },
                  { label: 'General Science', value: 'General Science' }
                ]}
                onChange={val => handleChange('hssc_group', val)}
                icon={<ArrowUpDown size={14} />}
              />
            </div>
            <div>
              <label style={labelStyle}>SSC (Matric) %</label>
              <input 
                type="number" 
                step="0.1" 
                min="0" 
                max="100" 
                value={formData.ssc_percentage ?? 75} 
                onChange={e => handleChange('ssc_percentage', parseFloat(e.target.value))} 
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>HSSC (Intermediate) %</label>
              <input 
                type="number" 
                step="0.1" 
                min="0" 
                max="100" 
                value={formData.hssc_percentage ?? 75} 
                onChange={e => handleChange('hssc_percentage', parseFloat(e.target.value))} 
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#0f172a', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid #334155' }}>
            <input 
              type="checkbox" 
              id="math_bg"
              checked={formData.mathematics_background ?? true} 
              onChange={e => handleChange('mathematics_background', e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: '#059669', cursor: 'pointer' }}
            />
            <label htmlFor="math_bg" style={{ color: '#e2e8f0', fontSize: '0.9rem', cursor: 'pointer', fontWeight: '500' }}>
              I have a formal mathematics background in my coursework
            </label>
          </div>
        </div>

        {/* SECTION 3: Targets & Financial Constraints */}
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '1.75rem', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#a855f7', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #334155' }}>
            <Target size={20} />
            <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 'bold', color: '#f8fafc' }}>Targets & Financial Constraints</h2>
          </div>

          <div className="fluid-grid" style={{ marginBottom: '1.25rem' }}>
            <div>
              <label style={labelStyle}>Preferred Field of Study</label>
              <CustomDropdown 
                value={formData.preferred_field || 'Computer Science'}
                options={[
                  { label: 'Computer Science', value: 'Computer Science' },
                  { label: 'Software Engineering', value: 'Software Engineering' },
                  { label: 'Artificial Intelligence', value: 'Artificial Intelligence' },
                  { label: 'Cyber Security', value: 'Cyber Security' }
                ]}
                onChange={val => handleChange('preferred_field', val)}
                icon={<ArrowUpDown size={14} />}
              />
            </div>
            <div>
              <label style={labelStyle}>Financial Need Status</label>
              <CustomDropdown 
                value={formData.financial_need_status ? "true" : "false"}
                options={[
                  { label: 'Yes (Evaluate Financial Aid / Need-Based Loans)', value: 'true' },
                  { label: 'No', value: 'false' }
                ]}
                onChange={val => handleChange('financial_need_status', val === "true")}
                icon={<ArrowUpDown size={14} />}
              />
            </div>
          </div>
        </div>

        {/* Primary Action Button */}
        <button 
          type="submit" 
          disabled={saving}
          style={{
            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            color: '#fff',
            border: 'none',
            padding: '1rem 2rem',
            borderRadius: '12px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            boxShadow: '0 4px 14px rgba(5, 150, 105, 0.4)',
            marginTop: '0.5rem',
            width: 'fit-content'
          }}
        >
          <Save size={18} /> {saving ? 'Saving to Database...' : 'Save Profile & Evaluate Programs'}
        </button>

      </form>

      {/* SECTION 4: Danger Zone */}
      <div style={{ background: '#1e293b', border: '1px solid #7f1d1d', borderRadius: '16px', padding: '1.75rem', boxSizing: 'border-box', marginTop: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#ef4444', marginBottom: '0.75rem' }}>
          <ShieldAlert size={20} />
          <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 'bold', color: '#f8fafc' }}>Danger Zone</h2>
        </div>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: '0 0 1.25rem 0', lineHeight: '1.5' }}>
          Permanently delete your account and remove all saved profile records and chat history from PathPilot AI. This action cannot be undone.
        </p>

        {!showDeleteConfirm ? (
          <button 
            type="button" 
            onClick={() => setShowDeleteConfirm(true)}
            style={{
              background: 'transparent',
              border: '1px solid #ef4444',
              color: '#ef4444',
              padding: '0.65rem 1.25rem',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'background 0.2s'
            }}
          >
            <Trash2 size={16} /> Delete Account
          </button>
        ) : (
          <div style={{ background: '#0f172a', padding: '1.25rem', borderRadius: '10px', border: '1px solid #7f1d1d' }}>
            <p style={{ color: '#fca5a5', fontSize: '0.9rem', fontWeight: '600', margin: '0 0 1rem 0' }}>
              Are you absolutely sure you want to delete your account? All data will be lost permanently.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button 
                type="button" 
                onClick={handleDeleteAccount}
                style={{
                  background: '#dc2626', color: '#fff', border: 'none', padding: '0.5rem 1rem',
                  borderRadius: '6px', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer'
                }}
              >
                Yes, Delete Permanently
              </button>
              <button 
                type="button" 
                onClick={() => setShowDeleteConfirm(false)}
                style={{
                  background: 'transparent', border: '1px solid #334155', color: '#cbd5e1',
                  padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}