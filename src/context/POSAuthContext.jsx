import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import posAuthService from '../services/posAuthService';

const POSAuthContext = createContext();

export const POSAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('posToken');
    const storedUser = localStorage.getItem('posUser');
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('posToken');
        localStorage.removeItem('posUser');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await posAuthService.login(email, password);
    localStorage.setItem('posToken', data.token);
    localStorage.setItem('posUser', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('posToken');
    localStorage.removeItem('posUser');
    setUser(null);
    navigate('/pos/login');
  };

  return (
    <POSAuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </POSAuthContext.Provider>
  );
};

export const usePOSAuth = () => {
  const context = useContext(POSAuthContext);
  if (!context) throw new Error('usePOSAuth must be used within POSAuthProvider');
  return context;
};