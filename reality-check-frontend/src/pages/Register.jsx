import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ArrowRight, Eye, EyeOff, UserPlus, Check } from 'lucide-react';
import ScrollToTopButton from '../components/ScrollToTopButton';

// ── Defined OUTSIDE Register so React never remounts it on re-render ──────────
const InputField = ({ label, name, type = 'text', placeholder, value, onChange, onKeyDown, fieldError, rightElement }) => (
  <div>
    <label className="block text-xs text-slate-400 mb-2 font-mono tracking-widest">{label}</label>
    <div className="relative">
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        className={`w-full bg-slate-950 border rounded-2xl px-6 py-4 text-base placeholder-slate-500 focus:outline-none transition-all
          ${fieldError
            ? 'border-red-500 focus:border-red-400'
            : 'border-slate-700 focus:border-cyan-400'}`}
      />
      {rightElement && (
        <button type="button" onClick={rightElement.action}
          className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition">
          {rightElement.icon}
        </button>
      )}
    </div>
    {fieldError && (
      <p className="mt-1.5 text-red-400 text-xs flex items-center gap-1">
        <span>⚠</span> {fieldError}
      </p>
    )}
  </div>
);

export default function Register() {
  const [formData, setFormData] = useState({
    name: '', username: '', email: '', password: '', confirmPassword: '',
  });
  const [showPassword,        setShowPassword]        = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading,           setIsLoading]           = useState(false);
  const [error,               setError]               = useState('');
  const [fieldErrors,         setFieldErrors]         = useState({});

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: '' }));
    if (error) setError('');
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim())     errs.name     = 'Full name is required.';
    if (!formData.username.trim()) errs.username = 'Username is required.';
    else if (formData.username.includes(' ')) errs.username = 'Username cannot contain spaces.';
    if (!formData.email.trim())    errs.email    = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errs.email = 'Enter a valid email.';
    if (!formData.password)        errs.password = 'Password is required.';
    else if (formData.password.length < 6) errs.password = 'Password must be at least 6 characters.';
    if (formData.password !== formData.confirmPassword)
      errs.confirmPassword = 'Passwords do not match.';
    return errs;
  };

  const handleRegister = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setFieldErrors(errs); return; }

    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/register/', {
        method:      'POST',
        credentials: 'include',
        headers:     { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:     formData.name,
          username: formData.username,
          email:    formData.email,
          password: formData.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Registration failed.'); return; }
      navigate('/user-dashboard');
    } catch (err) {
      setError('Network error. Make sure the server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter') handleRegister(); };

  const passwordStrength = () => {
    const p = formData.password;
    if (!p) return null;
    if (p.length < 6)  return { label: 'Too short',  color: 'bg-red-500',    width: 'w-1/4' };
    if (p.length < 8)  return { label: 'Weak',       color: 'bg-orange-500', width: 'w-2/4' };
    if (p.length < 12) return { label: 'Good',       color: 'bg-yellow-500', width: 'w-3/4' };
    return               { label: 'Strong',      color: 'bg-emerald-500', width: 'w-full' };
  };
  const strength = passwordStrength();

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative flex items-center justify-center py-12">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(#22d3ee_0.7px,transparent_1px)] bg-[length:50px_50px] opacity-20 animate-grid"></div>
      <motion.div
        animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-0 bg-gradient-to-br from-cyan-900/30 via-purple-900/30 to-black bg-[length:400%_400%]"
      />
      <motion.div
        animate={{ x:[0,80,-60,0], y:[0,-70,90,0], scale:[1,1.15,0.95,1] }}
        transition={{ duration:18, repeat:Infinity }}
        className="absolute top-20 left-20 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ x:[0,-90,70,0], y:[0,80,-60,0], scale:[1,0.9,1.2,1] }}
        transition={{ duration:22, repeat:Infinity, delay:3 }}
        className="absolute bottom-10 right-10 w-[450px] h-[450px] bg-purple-500/10 rounded-full blur-3xl"
      />

      <motion.div
        initial={{ opacity:0, y:50, scale:0.95 }}
        animate={{ opacity:1, y:0, scale:1 }}
        transition={{ duration:0.9 }}
        className="relative z-10 glass p-10 rounded-3xl neon-border w-full max-w-lg border border-cyan-400/30 shadow-2xl mx-4"
      >
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Shield className="w-12 h-12 text-cyan-400" />
              <div className="absolute inset-0 bg-cyan-400/40 blur-xl rounded-full animate-pulse" />
            </div>
            <h1 className="text-4xl font-bold tracking-tighter">
              REALITY CHECK
            </h1>
          </div>
        </div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-cyan-500/10 border border-cyan-400/30 mb-3">
            <UserPlus size={14} className="text-cyan-400" />
            <span className="text-xs font-mono tracking-[3px] text-white">
  CREATE ACCOUNT
</span>
          </div>
         
        </div>

        {/* Global error */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
              className="mb-5 px-5 py-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-5">
          <InputField
            label="FULL NAME" name="name" placeholder="Maliha Mehnaj"
            value={formData.name} onChange={handleChange} onKeyDown={handleKeyDown}
            fieldError={fieldErrors.name}
          />
          <InputField
            label="USERNAME" name="username" placeholder="malihamehnaj"
            value={formData.username} onChange={handleChange} onKeyDown={handleKeyDown}
            fieldError={fieldErrors.username}
          />
          <InputField
            label="EMAIL ADDRESS" name="email" type="email" placeholder="you@gmail.com"
            value={formData.email} onChange={handleChange} onKeyDown={handleKeyDown}
            fieldError={fieldErrors.email}
          />

          {/* Password with strength meter */}
          <div>
            <label className="block text-xs text-slate-400 mb-2 font-mono tracking-widest">PASSWORD</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Min. 6 characters"
                value={formData.password}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                className={`w-full bg-slate-950 border rounded-2xl px-6 py-4 text-base placeholder-slate-500 focus:outline-none transition-all pr-14
                  ${fieldErrors.password ? 'border-red-500' : 'border-slate-700 focus:border-cyan-400'}`}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {strength && (
              <div className="mt-2">
                <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    className={`h-full rounded-full transition-all duration-500 ${strength.color} ${strength.width}`}
                  />
                </div>
                <p className={`text-xs mt-1 ${
                  strength.label === 'Strong' ? 'text-emerald-400' :
                  strength.label === 'Good'   ? 'text-yellow-400'  :
                  strength.label === 'Weak'   ? 'text-orange-400'  : 'text-red-400'
                }`}>{strength.label}</p>
              </div>
            )}
            {fieldErrors.password && (
              <p className="mt-1.5 text-red-400 text-xs">⚠ {fieldErrors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs text-slate-400 mb-2 font-mono tracking-widest">CONFIRM PASSWORD</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="Repeat your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                className={`w-full bg-slate-950 border rounded-2xl px-6 py-4 text-base placeholder-slate-500 focus:outline-none transition-all pr-14
                  ${fieldErrors.confirmPassword ? 'border-red-500' :
                    formData.confirmPassword && formData.password === formData.confirmPassword
                      ? 'border-emerald-500' : 'border-slate-700 focus:border-cyan-400'}`}
              />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition">
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              {formData.confirmPassword && formData.password === formData.confirmPassword && (
                <Check size={16} className="absolute right-12 top-1/2 -translate-y-1/2 text-emerald-400" />
              )}
            </div>
            {fieldErrors.confirmPassword && (
              <p className="mt-1.5 text-red-400 text-xs">⚠ {fieldErrors.confirmPassword}</p>
            )}
          </div>
        </div>

        {/* Submit */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleRegister}
          disabled={isLoading}
          className="mt-8 w-full py-5 bg-cyan-500 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 relative overflow-hidden group disabled:opacity-60"
        >
          {isLoading ? (
            <span className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full" />
              CREATING ACCOUNT...
            </span>
          ) : (
            <>
              CREATE ACCOUNT
              <ArrowRight className="group-hover:translate-x-2 transition-transform" />
            </>
          )}
          <div className="absolute inset-0 bg-white/10 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-700" />
        </motion.button>

        {/* Links */}
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