/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import { checkAndRefreshToken, isAuthenticated, removeToken } from '../utils/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(isAuthenticated());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      const isValid = await checkAndRefreshToken();
      setIsLoggedIn(isValid);
      setLoading(false);
    };

    checkAuth();

    // Listen for auth changes
    const handleAuthChange = () => {
      setIsLoggedIn(isAuthenticated());
    };

    window.addEventListener('auth-change', handleAuthChange);
    window.addEventListener('unauthorized', () => {
      removeToken();
      setIsLoggedIn(false);
    });

    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
      window.removeEventListener('unauthorized', handleAuthChange);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);