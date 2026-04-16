import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import financeAuthService from '../services/financeAuthService';

const FinanceAuthContext = createContext();

export const FinanceAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('financeToken');
    const storedUser = localStorage.getItem('financeUser');
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('financeToken');
        localStorage.removeItem('financeUser');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await financeAuthService.login(email, password);
    localStorage.setItem('financeToken', data.token);
    localStorage.setItem('financeUser', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('financeToken');
    localStorage.removeItem('financeUser');
    setUser(null);
    navigate('/finance/login');
  };

  // Check if we're on a finance page and not authenticated
  useEffect(() => {
    if (!loading && !user && location.pathname.startsWith('/finance') && location.pathname !== '/finance/login') {
      navigate('/finance/login');
    }
  }, [user, loading, location.pathname, navigate]);

  return (
    <FinanceAuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </FinanceAuthContext.Provider>
  );
};

export const useFinanceAuth = () => {
  const context = useContext(FinanceAuthContext);
  if (!context) throw new Error('useFinanceAuth must be used within FinanceAuthProvider');
  return context;
};