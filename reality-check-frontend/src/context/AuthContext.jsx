import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

// Thrown when the server says which fields are wrong: { username: '...', password: '...' }
export class FieldError extends Error {
  constructor(message, fields) {
    super(message);
    this.fields = fields || {};
  }
}

async function readJson(res) {
  const text = await res.text();
  try { return JSON.parse(text); } catch {
    throw new Error('The server did not answer properly. Make sure the backend is running.');
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, check if the session is still alive
  useEffect(() => {
    fetch('/api/auth/me/', { credentials: 'include' })
      .then(async r => (r.ok ? readJson(r) : null))
      .then(data => { if (data && data.id) setUser(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const post = async (url, body) => {
    const res = await fetch(url, {
      method:      'POST',
      credentials: 'include',
      headers:     { 'Content-Type': 'application/json' },
      body:        JSON.stringify(body),
    });
    const data = await readJson(res);
    if (!res.ok) throw new FieldError(data.error || 'Something went wrong.', data.fields);
    setUser(data);
    return data;   // { id, username, email, name, role }
  };

  const login    = (username, password) => post('/api/auth/login/', { username, password });
  const register = (form) => post('/api/auth/register/', form);

  const logout = async () => {
    await fetch('/api/auth/logout/', { method: 'POST', credentials: 'include' });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Live check of form fields against the server, a moment after the user stops typing.
export function useFieldCheck(params, delay = 400) {
  const [result, setResult]   = useState({});
  const [checking, setChecking] = useState(false);
  const key = JSON.stringify(params);

  useEffect(() => {
    const query = Object.entries(params).filter(([, v]) => v !== undefined && v !== '');
    if (query.length <= (params.mode ? 1 : 0)) { setResult({}); return; }
    setChecking(true);
    const ctrl = new AbortController();
    const t = setTimeout(() => {
      fetch('/api/auth/check/', {
        method: 'POST', credentials: 'include', signal: ctrl.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(query)),
      })
        .then(r => (r.ok ? r.json() : {}))
        .then(setResult)
        .catch(() => {})
        .finally(() => setChecking(false));
    }, delay);
    return () => { clearTimeout(t); ctrl.abort(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, delay]);

  return { result, checking };
}
