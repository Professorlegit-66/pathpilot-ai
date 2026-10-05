import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Rocket, Mail, Lock, User, Globe, MapPin, ShieldCheck, ArrowLeft, AlertCircle } from 'lucide-react';
import CustomDropdown from '../components/CustomDropdown';

export default function AuthPage({ onLogin }) {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');

  const [regStep, setRegStep] = useState('form');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [mockSentOtp, setMockSentOtp] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    country: '',
    region: '',
    city: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCountryChange = (value) => {
    setFormData(prev => ({ ...prev, country: value }));
  };

  const handleRequestOtp = (e) => {
    e.preventDefault();
    setError('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!formData.country || !formData.region || !formData.city) {
        setError("Please fill out all location fields to continue.");
        return;
    }

    const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setMockSentOtp(randomOtp);
    alert(`[Demo Mode] Verification OTP sent to ${formData.email}\nYour OTP Code is: ${randomOtp}`);
    setRegStep('verify');
  };

  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (enteredOtp.trim() !== mockSentOtp.trim()) {
      setError("Invalid OTP code. Please check the code and try again.");
      return;
    }

    if (formData.name) {
      localStorage.setItem('user_full_name', formData.name);
    }

    const result = await register(
      formData.name,
      formData.email,
      formData.password,
      formData.country,
      formData.region,
      formData.city
    );

    if (result.success) {
      if (typeof onLogin === 'function') {
        onLogin({ ...formData, name: formData.name });
      }
      // Removed window.location.reload() - React Router handles navigation automatically via auth state!
    } else {
      setError(result.error);
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    const result = await login(formData.email, formData.password);

    if (result.success) {
      if (typeof onLogin === 'function') {
        onLogin(formData);
      }
      // Removed window.location.reload() - React Router handles navigation automatically via auth state!
    } else {
      setError(result.error);
    }
  };

  const inputWrapperStyle = { position: 'relative', display: 'flex', alignItems: 'center', marginTop: '0.35rem' };
  const iconStyle = { position: 'absolute', left: '1rem', color: '#64748b', pointerEvents: 'none', zIndex: 10 };
  const inputStyle = { width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', background: '#090d16', border: '1px solid #334155', borderRadius: '10px', color: '#f8fafc', fontSize: '0.9rem', boxSizing: 'border-box', outline: 'none', position: 'relative' };
  const labelStyle = { fontSize: '0.8rem', fontWeight: '500', color: '#cbd5e1', display: 'block', textAlign: 'left', marginTop: '0.75rem' };

  return (
    <div style={{ minHeight: '100vh', width: '100%', background: '#070b14', display: 'flex', alignItems: 'center', justifyContent: 'center', overflowY: 'auto', padding: '3rem 1rem', boxSizing: 'border-box' }}>
      <div style={{ width: '100%', maxWidth: '460px', background: '#0f172a', border: '1px solid #1e293b', borderRadius: '20px', padding: '2.25rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)', margin: 'auto' }}>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '1.25rem' }}>
          <div style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', padding: '0.65rem', borderRadius: '12px', display: 'flex', boxShadow: '0 10px 15px -3px rgba(5, 150, 105, 0.3)', marginBottom: '0.5rem' }}>
            <Rocket size={26} color="#fff" />
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#fff', margin: 0, letterSpacing: '-0.025em' }}>PathPilot AI</h1>
          <span style={{ fontSize: '0.65rem', background: '#05966933', color: '#34d399', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: '600', marginTop: '0.3rem' }}>GLOBAL OPPORTUNITY NAVIGATOR</span>
        </div>

        {error && (
          <div style={{ background: '#7f1d1d33', border: '1px solid #ef444455', color: '#fca5a5', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {!isRegister && (
          <>
            <h2 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#e2e8f0', textAlign: 'center', marginBottom: '1.25rem' }}>Sign in to your account</h2>
            <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column' }}>
              <div>
                <div style={inputWrapperStyle}>
                  <Mail size={18} style={iconStyle} />
                  <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email address" style={inputStyle} required />
                </div>
              </div>
              <div>
                <div style={{ ...inputWrapperStyle, marginTop: '0.75rem' }}>
                  <Lock size={18} style={iconStyle} />
                  <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Password" style={inputStyle} required />
                </div>
              </div>
              <button type="submit" className="interactive-btn" style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', color: '#fff', border: 'none', padding: '0.8rem', borderRadius: '10px', fontWeight: '600', fontSize: '0.95rem', cursor: 'pointer', marginTop: '1.25rem' }}>
                Sign In
              </button>
            </form>
          </>
        )}

        {isRegister && regStep === 'form' && (
          <>
            <h2 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#e2e8f0', textAlign: 'center', marginBottom: '1.25rem' }}>Create a new account</h2>
            <form onSubmit={handleRequestOtp} style={{ display: 'flex', flexDirection: 'column' }}>
              <div>
                <label style={labelStyle}>Full Name</label>
                <div style={inputWrapperStyle}>
                  <User size={18} style={iconStyle} />
                  <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Full Name" style={inputStyle} required />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Email Address (Real Email)</label>
                <div style={inputWrapperStyle}>
                  <Mail size={18} style={iconStyle} />
                  <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="name@example.com" style={inputStyle} required />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Password</label>
                <div style={inputWrapperStyle}>
                  <Lock size={18} style={iconStyle} />
                  <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Create Password" style={inputStyle} required />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Country</label>
                <div style={{ marginTop: '0.35rem' }}>
                  <CustomDropdown
                    value={formData.country || ''}
                    options={[
                      { label: 'Pakistan', value: 'Pakistan' },
                      { label: 'India', value: 'India' },
                      { label: 'United States', value: 'United States' },
                      { label: 'International / Other', value: 'International' }
                    ]}
                    onChange={handleCountryChange}
                    placeholder="Select your country..."
                    icon={<Globe size={18} />}
                    background="#090d16"
                    padding="0.75rem 1rem 0.75rem 2.75rem"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={labelStyle}>Region / Province</label>
                  <div style={inputWrapperStyle}>
                    <MapPin size={18} style={iconStyle} />
                    <input type="text" name="region" value={formData.region} onChange={handleChange} placeholder="e.g. KPK" style={inputStyle} required />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>City</label>
                  <div style={inputWrapperStyle}>
                    <MapPin size={18} style={iconStyle} />
                    <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="e.g. Kohat" style={inputStyle} required />
                  </div>
                </div>
              </div>

              <button type="submit" className="interactive-btn" style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', color: '#fff', border: 'none', padding: '0.8rem', borderRadius: '10px', fontWeight: '600', fontSize: '0.95rem', cursor: 'pointer', marginTop: '1.25rem' }}>
                Send Verification OTP Code
              </button>
            </form>
          </>
        )}

        {isRegister && regStep === 'verify' && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '1rem' }}>
              <div style={{ background: '#34d3991a', padding: '0.65rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                <ShieldCheck size={36} color="#34d399" />
              </div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#e2e8f0', margin: 0 }}>Verify Your Email</h2>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                We sent a 6-digit verification code to <span style={{ color: '#34d399', fontWeight: '600' }}>{formData.email}</span>
              </p>
            </div>

            <form onSubmit={handleVerifyAndRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Enter 6-Digit OTP Code</label>
                <div style={inputWrapperStyle}>
                  <ShieldCheck size={18} style={iconStyle} />
                  <input
                    type="text"
                    maxLength="6"
                    value={enteredOtp}
                    onChange={(e) => setEnteredOtp(e.target.value)}
                    placeholder="123456"
                    style={{ ...inputStyle, letterSpacing: '0.25rem', textAlign: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="interactive-btn" style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', color: '#fff', border: 'none', padding: '0.8rem', borderRadius: '10px', fontWeight: '600', fontSize: '0.95rem', cursor: 'pointer', marginTop: '0.5rem' }}>
                Verify & Create Account
              </button>

              <button
                type="button"
                className="interactive-btn"
                onClick={() => setRegStep('form')}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.85rem', marginTop: '0.5rem' }}
              >
                <ArrowLeft size={14} /> Back to registration details
              </button>
            </form>
          </>
        )}

        <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
            {isRegister ? 'Already have an account? ' : "Don't have an account? "}
            <button
              type="button"
              className="interactive-btn"
              onClick={() => { setIsRegister(!isRegister); setRegStep('form'); setError(''); }}
              style={{ background: 'transparent', border: 'none', color: '#34d399', fontWeight: '600', cursor: 'pointer', padding: 0, fontSize: '0.85rem' }}
            >
              {isRegister ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', borderTop: '1px solid #1e293b', paddingTop: '1rem' }}>
          <p style={{ color: '#64748b', fontSize: '0.7rem', lineHeight: '1.4', margin: 0 }}>
            PathPilot AI is under active development — some features may change or behave unexpectedly.
          </p>
        </div>

      </div>
    </div>
  );
}