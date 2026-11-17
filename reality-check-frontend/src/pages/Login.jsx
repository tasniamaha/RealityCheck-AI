import { useState } from 'react';
import BrandLogo from '../components/BrandLogo';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Eye, EyeOff, Check, X } from 'lucide-react';
import ScrollToTopButton from '../components/ScrollToTopButton';
import { useAuth, useFieldCheck } from '../context/AuthContext';

function FieldNote({ ok, text, checking }) {
  if (checking) return <p className="mt-1.5 text-slate-500 text-xs">Checking...</p>;
  if (!text) return null;
  return (
    <p className={`mt-1.5 text-xs flex items-center gap-1 ${ok ? 'text-emerald-400' : 'text-red-400'}`}>
      {ok ? <Check size={12} /> : <X size={12} />} {text}
    </p>
  );
}

export default function Login() {
  const [username,     setUsername]     = useState('');
  const [password,     setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading,    setIsLoading]    = useState(false);
  const [error,        setError]        = useState('');
  const [fields,       setFields]       = useState({});

  const { login } = useAuth();
  const navigate  = useNavigate();

  // No live username check: the login form never reveals whether an account exists.
  const result = {};
  const checking = false;
  const userCheck = username.trim() ? result.username : null;

  const usernameError = fields.username || (userCheck && !userCheck.ok ? userCheck.message : '');
  const passwordError = fields.password;

  const handleLogin = async () => {
    const local = {};
    if (!username.trim()) local.username = 'Enter your username.';
    if (!password)        local.password = 'Enter your password.';
    if (Object.keys(local).length) { setFields(local); return; }

    setIsLoading(true);
    setError('');
    setFields({});
    try {
      const user = await login(username.trim(), password);
      if (user.role === 'admin')       navigate('/admin-dashboard');
      else if (user.role === 'expert') navigate('/expert-dashboard');
      else                             navigate('/user-dashboard');
    } catch (err) {
      setFields(err.fields || {});
      if (!err.fields || !Object.keys(err.fields).length) setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = (bad, good) =>
    `w-full bg-slate-950 border rounded-2xl px-6 py-5 text-lg placeholder-slate-500 focus:outline-none transition-all ${
      bad ? 'border-red-500 focus:border-red-400' : good ? 'border-emerald-500' : 'border-slate-700 focus:border-cyan-400'}`;

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative flex items-center justify-center">
      <div className="absolute inset-0 opacity-20"></div>
      <motion.div
        animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-0 bg-cyan-900/30"
      />

      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.9 }}
        className="relative z-10 glass p-12 rounded-3xl w-full max-w-lg border border-cyan-400/30 shadow-2xl mx-4"
      >
        <div className="flex justify-center mb-10">
          <div className="flex items-center gap-4">
            <BrandLogo size={64} />
          </div>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mb-6 px-5 py-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mb-6">
          <label className="block text-xs text-slate-400 mb-2 font-mono tracking-widest">USERNAME</label>
          <input
            type="text"
            placeholder="your username"
            autoComplete="username"
            value={username}
            onChange={(e) => { setUsername(e.target.value); setFields(f => ({ ...f, username: '' })); setError(''); }}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            className={inputClass(usernameError, userCheck?.ok)}
          />
          <FieldNote
            checking={checking && !!username.trim()}
            ok={!usernameError && userCheck?.ok}
            text={usernameError || (userCheck?.ok ? userCheck.message : '')}
          />
        </div>

        <div className="mb-10">
          <label className="block text-xs text-slate-400 mb-2 font-mono tracking-widest">PASSWORD</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="********"
              autoComplete="current-password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setFields(f => ({ ...f, password: '' })); setError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              className={inputClass(passwordError, false) + ' pr-14'}
            />
            <button type="button" onClick={() => setShowPassword(s => !s)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <FieldNote ok={false} text={passwordError} />
        </div>

        <motion.button
          onClick={handleLogin}
          disabled={isLoading}
          className="w-full py-6 bg-cyan-500 rounded-2xl font-bold text-xl flex items-center justify-center gap-3 relative overflow-hidden group disabled:opacity-70 hover:bg-cyan-400 transition-colors"
        >
          {isLoading ? 'CHECKING...' : <>LOGIN <ArrowRight /></>}
        </motion.button>

        <div className="text-center mt-8 space-y-3 text-sm text-slate-400">
          <p>
            New user?{' '}
            <Link to="/register" className="text-cyan-400 hover:text-cyan-300 underline">Create an account</Link>
          </p>
          <p>
            Want to review files?{' '}
            <Link to="/expert-register" className="text-cyan-400 hover:text-cyan-300 underline">Apply as an expert</Link>
          </p>
        </div>
      </motion.div>
      <ScrollToTopButton />
    </div>
  );
}
