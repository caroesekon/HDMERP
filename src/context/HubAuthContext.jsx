import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import hubAuthService from '../services/hubAuthService';

const HubAuthContext = createContext();

export const HubAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('hubToken');
    const storedUser = localStorage.getItem('hubUser');
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('hubToken');
        localStorage.removeItem('hubUser');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await hubAuthService.login(email, password);
    localStorage.setItem('hubToken', data.token);
    localStorage.setItem('hubUser', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const register = async (name, email, password) => {
    const data = await hubAuthService.register(name, email, password);
    localStorage.setItem('hubToken', data.token);
    localStorage.setItem('hubUser', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('hubToken');
    localStorage.removeItem('hubUser');
    setUser(null);
    navigate('/');
  };

  return (
    <HubAuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </HubAuthContext.Provider>
  );
};

export const useHubAuth = () => {
  const context = useContext(HubAuthContext);
  if (!context) throw new Error('useHubAuth must be used within HubAuthProvider');
  return context;
};