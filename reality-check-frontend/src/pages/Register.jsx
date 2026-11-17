import { useState } from 'react';
import BrandLogo from '../components/BrandLogo';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Eye, EyeOff, UserPlus, Check, X } from 'lucide-react';
import ScrollToTopButton from '../components/ScrollToTopButton';
import { useAuth, useFieldCheck } from '../context/AuthContext';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Note({ ok, children }) {
  return (
    <p className={`mt-1.5 text-xs flex items-start gap-1 ${ok ? 'text-emerald-400' : 'text-red-400'}`}>
      <span className="mt-0.5 shrink-0">{ok ? <Check size={12} /> : <X size={12} />}</span>
      <span>{children}</span>
    </p>
  );
}

// state: null (nothing to say yet), true (good), false (problem)
const borderFor = (state) =>
  state === false ? 'border-red-500 focus:border-red-400'
  : state === true ? 'border-emerald-500'
  : 'border-slate-700 focus:border-cyan-400';

// Defined outside Register so React never remounts it on re-render.
function Field({ label, state, children, note }) {
  return (
    <div>
      <label className="block text-xs text-slate-400 mb-2 font-mono tracking-widest">{label}</label>
      {children(borderFor(state))}
      {note}
    </div>
  );
}

export default function Register() {
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '', confirm: '' });
  const [touched, setTouched]   = useState({});
  const [server, setServer]     = useState({});      // field errors returned on submit
  const [error, setError]       = useState('');
  const [isLoading, setLoading] = useState(false);
  const [show, setShow]         = useState({ password: false, confirm: false });

  const { register } = useAuth();
  const navigate = useNavigate();

  const set = (name) => (e) => {
    const value = e.target.value;
    setForm(f => ({ ...f, [name]: value }));
    setTouched(t => ({ ...t, [name]: true }));
    setServer(s => ({ ...s, [name]: '' }));
    setError('');
  };

  // Ask the server while the user types: is the username free and the password strong
  // enough. The email is checked when you submit, so the form never reveals who has an account.
  // is the password strong enough (the same rules the server enforces).
  const emailLooksRight = EMAIL_RE.test(form.email.trim());
  const { result, checking } = useFieldCheck({
    mode: 'register',
    username: form.username.trim() || undefined,
    password: form.password || undefined,
  });

  // -- Per-field state and message ---------------------------------------------
  const name = (() => {
    if (server.name) return { state: false, msg: server.name };
    if (!touched.name) return { state: null };
    return form.name.trim() ? { state: true } : { state: false, msg: 'Enter your full name.' };
  })();

  const username = (() => {
    if (server.username) return { state: false, msg: server.username };
    if (!touched.username || !form.username.trim()) return { state: touched.username ? false : null, msg: touched.username ? 'Enter a username.' : '' };
    if (/\s/.test(form.username)) return { state: false, msg: 'Usernames cannot contain spaces.' };
    const r = result.username;
    if (!r) return { state: null, msg: '' };
    return { state: r.ok, msg: r.message };
  })();

  const email = (() => {
    if (server.email) return { state: false, msg: server.email };
    if (!touched.email) return { state: null };
    if (!form.email.trim()) return { state: false, msg: 'Enter your email.' };
    if (!emailLooksRight) return { state: false, msg: 'This does not look like an email address.' };
    return { state: true, msg: '' };
  })();

  const password = (() => {
    if (server.password) return { state: false, msgs: [server.password] };
    if (!touched.password) return { state: null, msgs: [] };
    if (!form.password) return { state: false, msgs: ['Enter a password.'] };
    const r = result.password;
    if (!r) return { state: null, msgs: [] };
    return { state: r.ok, msgs: r.messages || [] };
  })();

  const confirm = (() => {
    if (!touched.confirm || !form.confirm) return { state: null };
    return form.confirm === form.password
      ? { state: true, msg: 'Passwords match.' }
      : { state: false, msg: 'Passwords do not match yet.' };
  })();

  const allGood = [name, username, email, password, confirm].every(f => f.state === true);

  const strength = (() => {
    const p = form.password;
    if (!p) return null;
    let s = 0;
    if (p.length >= 8) s++;
    if (p.length >= 12) s++;
    if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++;
    if (/\d/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return [
      { label: 'Very weak', color: 'bg-red-500',     width: '20%' },
      { label: 'Weak',      color: 'bg-red-500',     width: '35%' },
      { label: 'Fair',      color: 'bg-amber-500',   width: '55%' },
      { label: 'Good',      color: 'bg-emerald-500', width: '75%' },
      { label: 'Strong',    color: 'bg-emerald-500', width: '90%' },
      { label: 'Very strong', color: 'bg-emerald-500', width: '100%' },
    ][s];
  })();

  const handleRegister = async () => {
    setTouched({ name: true, username: true, email: true, password: true, confirm: true });
    if (!allGood) { setError('Please fix the fields marked in red.'); return; }
    setLoading(true);
    setError('');
    try {
      await register({ name: form.name.trim(), username: form.username.trim(),
                       email: form.email.trim(), password: form.password });
      navigate('/user-dashboard');
    } catch (err) {
      setServer(err.fields || {});
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const onEnter = (e) => { if (e.key === 'Enter') handleRegister(); };
  const input = 'w-full bg-slate-950 border rounded-2xl px-6 py-4 text-base placeholder-slate-500 focus:outline-none transition-all';

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative flex items-center justify-center py-12">
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
        className="relative z-10 glass p-10 rounded-3xl w-full max-w-lg border border-cyan-400/30 shadow-2xl mx-4"
      >
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-4">
            <BrandLogo size={48} />
          </div>
        </div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-cyan-500/10 border border-cyan-400/30">
            <UserPlus size={14} className="text-cyan-400" />
            <span className="text-xs font-mono tracking-[3px] text-white">CREATE ACCOUNT</span>
          </div>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mb-5 px-5 py-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-5">
          <Field label="FULL NAME" state={name.state} note={name.msg && <Note ok={false}>{name.msg}</Note>}>
            {(b) => <input className={`${input} ${b}`} placeholder="Maliha Mehnaj" autoComplete="name"
                           value={form.name} onChange={set('name')} onKeyDown={onEnter} />}
          </Field>

          <Field label="USERNAME" state={username.state}
                 note={checking && form.username.trim() && !username.msg
                   ? <p className="mt-1.5 text-slate-500 text-xs">Checking...</p>
                   : username.msg && <Note ok={username.state}>{username.msg}</Note>}>
            {(b) => <input className={`${input} ${b}`} placeholder="malihamehnaj" autoComplete="username"
                           value={form.username} onChange={set('username')} onKeyDown={onEnter} />}
          </Field>

          <Field label="EMAIL ADDRESS" state={email.state}
                 note={email.msg && <Note ok={email.state}>{email.msg}</Note>}>
            {(b) => <input className={`${input} ${b}`} type="email" placeholder="you@gmail.com" autoComplete="email"
                           value={form.email} onChange={set('email')} onKeyDown={onEnter} />}
          </Field>

          <Field label="PASSWORD" state={password.state}
                 note={<>
                   {strength && (
                     <div className="mt-2">
                       <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                         <div className={`h-full rounded-full transition-all duration-500 ${strength.color}`}
                              style={{ width: strength.width }} />
                       </div>
                       <p className="text-xs mt-1 text-slate-400">{strength.label}</p>
                     </div>
                   )}
                   {password.msgs.map(m => <Note key={m} ok={password.state}>{m}</Note>)}
                 </>}>
            {(b) => (
              <div className="relative">
                <input className={`${input} ${b} pr-14`} type={show.password ? 'text' : 'password'}
                       placeholder="At least 8 characters" autoComplete="new-password"
                       value={form.password} onChange={set('password')} onKeyDown={onEnter} />
                <button type="button" onClick={() => setShow(s => ({ ...s, password: !s.password }))}
                        aria-label={show.password ? 'Hide password' : 'Show password'}
                        className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition">
                  {show.password ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            )}
          </Field>

          <Field label="CONFIRM PASSWORD" state={confirm.state}
                 note={confirm.msg && <Note ok={confirm.state}>{confirm.msg}</Note>}>
            {(b) => (
              <div className="relative">
                <input className={`${input} ${b} pr-14`} type={show.confirm ? 'text' : 'password'}
                       placeholder="Type it again" autoComplete="new-password"
                       value={form.confirm} onChange={set('confirm')} onKeyDown={onEnter} />
                <button type="button" onClick={() => setShow(s => ({ ...s, confirm: !s.confirm }))}
                        aria-label={show.confirm ? 'Hide password' : 'Show password'}
                        className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition">
                  {show.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            )}
          </Field>
        </div>

        <motion.button
          onClick={handleRegister}
          disabled={isLoading}
          className={`mt-8 w-full py-5 bg-cyan-500 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 relative overflow-hidden group disabled:opacity-60 ${allGood ? '' : 'opacity-60'} hover:bg-cyan-400 transition-colors`}
        >
          {isLoading ? 'CREATING ACCOUNT...' : <>CREATE ACCOUNT <ArrowRight /></>}
        </motion.button>

        <div className="mt-6 text-center space-y-2">
          <p className="text-slate-400 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-cyan-400 hover:text-cyan-300 underline">Sign in</Link>
          </p>
          <p className="text-slate-500 text-xs">
            Want to be an expert reviewer?{' '}
            <Link to="/expert-register" className="text-purple-400 hover:text-purple-300 underline">Apply here</Link>
          </p>
        </div>
      </motion.div>
      <ScrollToTopButton />
    </div>
  );
}
