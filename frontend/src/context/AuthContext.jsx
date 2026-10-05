import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();
const API_URL = import.meta.env.VITE_API_URL || 'https://pathpilot-ai-zo6r.onrender.com';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  const fetchUserProfile = async (authToken) => {
    if (!authToken) return null;
    try {
      const res = await fetch(`${API_URL}/api/profile/`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) {
        const profileData = await res.json();
        setUser(profileData);
        return profileData;
      } else if (res.status === 401) {
        localStorage.removeItem('token');
        sessionStorage.clear();
        setToken(null);
        setUser(null);
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
    }
    return null;
  };

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      fetchUserProfile(token);
    } else {
      localStorage.removeItem('token');
      setUser(null);
    }
  }, [token]);

  const login = async (email, password) => {
    try {
      sessionStorage.clear();

      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Invalid credentials');
      }

      const data = await response.json();
      
      // FIX: Fetch and populate the user profile FIRST before setting the token
      // This prevents the router from redirecting to the dashboard while the profile is still empty.
      const profileData = await fetchUserProfile(data.access_token);
      
      if (profileData && profileData.target_career) {
        sessionStorage.setItem('roadmap_target_career', profileData.target_career);
      }
      
      localStorage.setItem('token', data.access_token);
      setToken(data.access_token);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (fullName, email, password, country, region, city) => {
    try {
      sessionStorage.clear();

      if (fullName) {
        localStorage.setItem('user_full_name', fullName);
      }

      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          name: fullName,
          email,
          password,
          country: country || 'Pakistan',
          region: region || '',
          city: city || ''
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Registration failed');
      }

      const data = await response.json();
      
      // FIX: Fetch profile FIRST
      const profile = await fetchUserProfile(data.access_token);
      
      if (profile && profile.target_career) {
        sessionStorage.setItem('roadmap_target_career', profile.target_career);
      }
      
      localStorage.setItem('token', data.access_token);
      setToken(data.access_token);
      
      return { success: true, profile };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    sessionStorage.clear();
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, fetchUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);