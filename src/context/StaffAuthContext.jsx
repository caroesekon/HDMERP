import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import staffAuthService from '../services/staffAuthService';

const StaffAuthContext = createContext();

export const StaffAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('staffToken');
    const storedUser = localStorage.getItem('staffUser');
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('staffToken');
        localStorage.removeItem('staffUser');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await staffAuthService.login(email, password);
    localStorage.setItem('staffToken', data.token);
    localStorage.setItem('staffUser', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('staffToken');
    localStorage.removeItem('staffUser');
    setUser(null);
    navigate('/staff/login');
  };

  return (
    <StaffAuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </StaffAuthContext.Provider>
  );
};

export const useStaffAuth = () => {
  const context = useContext(StaffAuthContext);
  if (!context) throw new Error('useStaffAuth must be used within StaffAuthProvider');
  return context;
};