import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('careerforge_token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize and verify user on mount
  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.user);
        } catch (err) {
          console.error('Session expired or invalid:', err);
          logout();
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, [token]);

  // Step 1: Initiate login with email and password -> returns requireOtp
  const initiateLogin = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  };

  // Step 2: Verify 6-digit OTP code -> issues JWT token
  const verifyOtp = async (email, otp) => {
    const res = await api.post('/auth/verify-otp', { email, otp });
    const { token: receivedToken, user: receivedUser } = res.data;
    localStorage.setItem('careerforge_token', receivedToken);
    localStorage.setItem('careerforge_user', JSON.stringify(receivedUser));
    setToken(receivedToken);
    setUser(receivedUser);
    return receivedUser;
  };

  // Resend OTP code for login
  const resendOtp = async (email) => {
    const res = await api.post('/auth/resend-otp', { email });
    return res.data;
  };

  // Step 1 for Registration: Submit details & dispatch OTP to respective mail
  const initiateRegister = async (userData) => {
    const res = await api.post('/auth/register', userData);
    return res.data;
  };

  // Step 2 for Registration: Verify OTP & activate account
  const verifyRegisterOtp = async (email, otp) => {
    const res = await api.post('/auth/verify-register-otp', { email, otp });
    const { token: receivedToken, user: receivedUser } = res.data;
    localStorage.setItem('careerforge_token', receivedToken);
    localStorage.setItem('careerforge_user', JSON.stringify(receivedUser));
    setToken(receivedToken);
    setUser(receivedUser);
    return receivedUser;
  };

  // Resend OTP for registration
  const resendRegisterOtp = async (email) => {
    const res = await api.post('/auth/resend-register-otp', { email });
    return res.data;
  };

  // Admin Quick Access Trigger -> dispatches OTP to Producer
  const demoLogin = async (role) => {
    const res = await api.post('/auth/demo', { role });
    return res.data;
  };

  const register = async (userData) => {
    return await initiateRegister(userData);
  };

  const logout = () => {
    localStorage.removeItem('careerforge_token');
    localStorage.removeItem('careerforge_user');
    setToken(null);
    setUser(null);
  };

  const updateUserProfile = async (updatedData) => {
    const res = await api.put('/auth/profile', updatedData);
    setUser(res.data.user);
    localStorage.setItem('careerforge_user', JSON.stringify(res.data.user));
    return res.data.user;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        initiateLogin,
        verifyOtp,
        resendOtp,
        initiateRegister,
        verifyRegisterOtp,
        resendRegisterOtp,
        demoLogin,
        register,
        logout,
        updateUserProfile,
        isAuthenticated: !!user,
        isStudent: user?.role === 'student',
        isRecruiter: user?.role === 'recruiter',
        isAdmin: user?.role === 'admin'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
