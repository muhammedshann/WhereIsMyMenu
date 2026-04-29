import React, { createContext, useContext, useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logoutUser, fetchCurrentUser } from '../features/auth/store/authSlice';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await dispatch(fetchCurrentUser()).unwrap();
        const userData = response.user || response;
        setUser(userData);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const loginContext = (userData) => {
    setUser(userData);
  };

  const logoutContext = () => {
    dispatch(logoutUser());
    setUser(null);
  };

  const value = {
    user,
    setUser,
    loginContext,
    logoutContext,
    loading,
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-gray-400">
        <Loader2 size={28} className="animate-spin text-orange-500" />
        <p className="text-sm font-semibold">Please wait..</p>
      </div>
    </div>
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
