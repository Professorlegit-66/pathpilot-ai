import { useState } from 'react';
import { Rocket, Globe, ArrowRight } from 'lucide-react';

export default function AuthPage({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: 'Talha Ahmad',
    email: 'talha@example.com',
    password: '••••••••',
    country: 'Pakistan',
    region: 'Khyber Pakhtunkhwa',
    city: 'Kohat'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(formData);
  };

  const inputStyle = {
    width: '100%', padding: '0.75rem 1rem', background: '#0f172a', border: '1px solid #334155',
    borderRadius: '8px', color: '#f8fafc', fontSize: '0.95rem', marginTop: '0.3rem', boxSizing: 'border-box'
  };

  const labelStyle = { fontSize: '0.85rem', fontWeight: '500', color: '#cbd5e1', display: 'block', textAlign: 'left' };

  return (
    <div style={{ height: '100vh', width: '100vw', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', overflowY: 'auto', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: '480px', background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '2.5rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}>
        
        {/* Brand Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{ background: '#059669', padding: '0.5rem', borderRadius: '8px', display: 'flex' }}>
            <Rocket size={24} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', margin: 0 }}>PathPilot AI</h1>
            <span style={{ fontSize: '0.7rem', background: '#05966933', color: '#34d399', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: '600' }}>GLOBAL OPPORTUNITY NAVIGATOR</span>
          </div>
        </div>

        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.4' }}>
          {isRegister ? 'Create your account and set your location. The system will adapt to your regional education system automatically.' : 'Welcome back! Enter your credentials to access your session.'}
        </p>

        {/* Tab Switcher - Sign In first, Register second */}
        <div style={{ display: 'flex', background: '#0f172a', padding: '0.25rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
          <button 
            type="button" 
            onClick={() => setIsRegister(false)}
            style={{ flex: 1, background: !isRegister ? '#1e293b' : 'transparent', color: !isRegister ? '#fff' : '#94a3b8', border: 'none', padding: '0.5rem', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}
          >
            Sign In
          </button>
          <button 
            type="button" 
            onClick={() => setIsRegister(true)}
            style={{ flex: 1, background: isRegister ? '#1e293b' : 'transparent', color: isRegister ? '#fff' : '#94a3b8', border: 'none', padding: '0.5rem', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Full Name only shows during Register */}
          {isRegister && (
            <div>
              <label style={labelStyle}>Full Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} style={inputStyle} required />
            </div>
          )}

          <div>
            <label style={labelStyle}>Email Address</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} style={inputStyle} required />
          </div>

          <div>
            <label style={labelStyle}>Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} style={inputStyle} required />
          </div>

          {/* Location details only show during Register */}
          {isRegister && (
            <>
              <div>
                <label style={labelStyle}>Country</label>
                <select name="country" value={formData.country} onChange={handleChange} style={inputStyle}>
                  <option value="Pakistan">Pakistan</option>
                  <option value="International">International / Other</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Region / Province</label>
                  <input type="text" name="region" value={formData.region} onChange={handleChange} placeholder="e.g. KPK / Punjab" style={inputStyle} required />
                </div>
                <div>
                  <label style={labelStyle}>City</label>
                  <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="e.g. Kohat" style={inputStyle} required />
                </div>
              </div>
            </>
          )}

          <button 
            type="submit"
            style={{ 
              background: '#059669', color: '#fff', border: 'none', padding: '0.875rem', 
              borderRadius: '8px', fontWeight: '600', fontSize: '1rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem'
            }}
          >
            {isRegister ? 'Create Account & Continue' : 'Sign In to Session'} <ArrowRight size={18} />
          </button>
        </form>

      </div>
    </div>
  );
}