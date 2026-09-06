import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    const raw = localStorage.getItem('agrilink_session');
    return raw ? JSON.parse(raw) : null;
  });

  useEffect(() => {
    if (session) localStorage.setItem('agrilink_session', JSON.stringify(session));
    else localStorage.removeItem('agrilink_session');
  }, [session]);

  const login = async (role) => {
    const data = await api.post('/auth/login', { role });
    setSession({ role, user: data.user, profile: data.profile });
    return data;
  };

  const logout = () => setSession(null);

  return (
    <AuthContext.Provider value={{ session, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
