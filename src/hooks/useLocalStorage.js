import { useState, useEffect, useCallback } from 'react';

export const useLocalStorage = (key, initialValue) => {
  // State to store our value
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = useCallback((value) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      setStoredValue(valueToStore);
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // Remove item from localStorage
  const removeItem = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  // Sync state across tabs/windows
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch {
          setStoredValue(e.newValue);
        }
      } else if (e.key === key && e.newValue === null) {
        setStoredValue(initialValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, initialValue]);

  return [storedValue, setValue, removeItem];
};

// Specialized hooks for auth tokens
export const useAuthToken = (system = 'hub') => {
  const tokenKey = `${system}Token`;
  return useLocalStorage(tokenKey, null);
};

export const useAuthUser = (system = 'hub') => {
  const userKey = `${system}User`;
  return useLocalStorage(userKey, null);
};

// Combined auth hook for a system
export const useSystemAuth = (system = 'hub') => {
  const [token, setToken] = useAuthToken(system);
  const [user, setUser] = useAuthUser(system);

  const login = useCallback((newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
  }, [setToken, setUser]);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, [setToken, setUser]);

  const isAuthenticated = !!token && !!user;

  return {
    token,
    user,
    isAuthenticated,
    login,
    logout
  };
};