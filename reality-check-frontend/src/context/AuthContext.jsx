import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, check if session is still alive
  useEffect(() => {
    fetch('/api/auth/me/', { credentials: 'include' })
      .then(async r => {
        if (!r.ok) return null;
        const text = await r.text();
        if (!text) return null;
        try { return JSON.parse(text); } catch { return null; }
      })
      .then(data => {
        if (data && data.id) setUser(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const login = async (username, password) => {
    const res = await fetch('/api/auth/login/', {
      method:      'POST',
      credentials: 'include',
      headers:     { 'Content-Type': 'application/json' },
      body:        JSON.stringify({ username, password }),
    });
    const text = await res.text();
    let data = {};
    try { data = JSON.parse(text); } catch {
      throw new Error('Server returned an invalid response. Make sure the backend is running.');
    }
    if (!res.ok) throw new Error(data.error || 'Login failed');
    setUser(data);
    return data;   // contains { id, username, email, name, role }
  };

  const logout = async () => {
    await fetch('/api/auth/logout/', { method: 'POST', credentials: 'include' });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};