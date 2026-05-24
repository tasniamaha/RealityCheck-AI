import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ArrowRight, ArrowLeft, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ExpertRegister() {
  const [step,    setStep]    = useState(1);
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', username: '', password: '', confirmPassword: '',
    experience: '', education: '', q1: '', q2: '', q3: '',
  });

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const errs = [];
    
    // Step 1
    if (!formData.name.trim()) errs.push('Full name is required.');
    if (!formData.email.trim()) errs.push('Email is required.');
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errs.push('Enter a valid email.');
    if (!formData.username.trim()) errs.push('Username is required.');
    else if (formData.username.includes(' ')) errs.push('Username cannot contain spaces.');
    
    // Step 2
    if (!formData.password) errs.push('Password is required.');
    else if (formData.password.length < 6) errs.push('Password must be at least 6 characters.');
    if (formData.password !== formData.confirmPassword) errs.push('Passwords do not match.');
    
    // Step 3
    if (!formData.q1.trim()) errs.push('Q1 answer is required.');
    if (!formData.q2.trim()) errs.push('Q2 answer is required.');
    
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (errs.length > 0) {
      setError(errs.join(' '));
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/expert-register/', {
        method:      'POST',
        credentials: 'include',
        headers:     { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:       formData.name,
          email:      formData.email,
          username:   formData.username,
          password:   formData.password,
          experience: formData.experience,
          education:  formData.education,
          q1:         formData.q1,
          q2:         formData.q2,
          q3:         formData.q3,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed. Try again.');
        setLoading(false);
        return;
      }

      // Success — application submitted, pending admin approval
      alert('✅ Application submitted! Your account is active but expert access is pending admin approval.');
      navigate('/user-dashboard');
    } catch (err) {
      setError(err.message || 'Network error. Make sure the server is running.');
      setLoading(false);
    }
  };

  const steps = ['Credentials', 'Background & Experience', 'Assessment Questions'];

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative flex items-center justify-center">
      <div className="absolute inset-0 bg-[radial-gradient(#22d3ee_0.7px,transparent_1px)] bg-[length:50px_50px] opacity-10"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-black via-slate-950 to-black"></div>
      <motion.div animate={{ scale:[1,1.08,1] }} transition={{ duration:12, repeat:Infinity }}
        className="absolute top-20 left-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      <motion.div animate={{ scale:[1,1.12,1] }} transition={{ duration:15, repeat:Infinity, delay:4 }}
        className="absolute bottom-20 right-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-3xl px-6 py-12">
        <motion.div initial={{ opacity:0, y:40 }} animate={{ opacity:1, y:0 }}
          className="glass rounded-3xl p-12 neon-border">
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-4">
              <Shield className="w-12 h-12 text-cyan-400" />
              <h1 className="text-5xl font-bold tracking-tighter">
                BECOME A<span className="text-cyan-400"> VERIFIER</span>
              </h1>
            </div>
          </div>
          <p className="text-center text-slate-400 mb-10 max-w-md mx-auto">
            Join our elite network of human experts defending digital truth
          </p>

          {/* Step indicators */}
          <div className="flex justify-between mb-12 relative">
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-slate-700"></div>
            {[1,2,3].map(s => (
              <motion.div key={s} initial={{ scale:0.8 }} animate={{ scale: step===s ? 1.15 : 1 }}
                className={`relative z-10 w-11 h-11 rounded-full flex items-center justify-center font-mono text-sm transition-all
                  ${step===s ? 'bg-cyan-400 text-black shadow-lg shadow-cyan-400/60' : 'bg-slate-800 border border-slate-600'}`}>
                {s}
              </motion.div>
            ))}
          </div>

          <h3 className="text-xl font-semibold text-cyan-400 mb-8 text-center">{steps[step-1]}</h3>

          {error && (
            <div className="mb-6 px-5 py-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity:0, x:-30 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:30 }} className="space-y-6">
                <div>
                  <label className="block text-xs text-slate-400 mb-2 font-mono tracking-widest">FULL NAME *</label>
                  <input name="name" placeholder="Jane Doe" onChange={handleChange} value={formData.name} className="input-field" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-2 font-mono tracking-widest">EMAIL *</label>
                  <input name="email" type="email" placeholder="you@example.com" onChange={handleChange} value={formData.email} className="input-field" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-2 font-mono tracking-widest">USERNAME *</label>
                  <input name="username" placeholder="janedoe" onChange={handleChange} value={formData.username} className="input-field" />
                </div>
                <button onClick={() => setStep(2)} className="btn-primary w-full flex items-center justify-center gap-2">
                  Continue <ArrowRight />
                </button>
              </motion.div>
            )}
            {step === 2 && (
              <motion.div key="s2" initial={{ opacity:0, x:-30 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:30 }} className="space-y-6">
                <div>
                  <label className="block text-xs text-slate-400 mb-2 font-mono tracking-widest">PASSWORD *</label>
                  <input name="password" type="password" placeholder="Min. 6 characters" onChange={handleChange} value={formData.password} className="input-field" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-2 font-mono tracking-widest">CONFIRM PASSWORD *</label>
                  <input name="confirmPassword" type="password" placeholder="Repeat your password" onChange={handleChange} value={formData.confirmPassword} className="input-field" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-2 font-mono tracking-widest">YEARS OF EXPERIENCE</label>
                  <textarea name="experience" placeholder="AI, Digital Forensics, Cybersecurity, etc." onChange={handleChange} value={formData.experience} className="input-field h-24" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-2 font-mono tracking-widest">EDUCATION BACKGROUND</label>
                  <textarea name="education" placeholder="Degree, Institution, Year" onChange={handleChange} value={formData.education} className="input-field h-24" />
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setStep(1)} className="btn-secondary flex-1 flex items-center justify-center gap-2"><ArrowLeft /> Back</button>
                  <button onClick={() => setStep(3)} className="btn-primary flex-1 flex items-center justify-center gap-2">Next <ArrowRight /></button>
                </div>
              </motion.div>
            )}
            {step === 3 && (
              <motion.div key="s3" initial={{ opacity:0, x:-30 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:30 }} className="space-y-8">
                <div>
                  <label className="block text-cyan-400 text-sm font-medium mb-2">1. How do you personally detect manipulated or synthetic media? *</label>
                  <textarea name="q1" placeholder="Share your methodology…" onChange={handleChange} value={formData.q1} className="input-field h-32" />
                </div>
                <div>
                  <label className="block text-cyan-400 text-sm font-medium mb-2">2. What is your approach when dealing with uncertain or conflicting AI outputs? *</label>
                  <textarea name="q2" placeholder="Explain your decision-making process…" onChange={handleChange} value={formData.q2} className="input-field h-32" />
                </div>
                <div>
                  <label className="block text-cyan-400 text-sm font-medium mb-2">3. What biases can exist in AI-based detection systems and how do you mitigate them?</label>
                  <textarea name="q3" placeholder="Share your thoughts…" onChange={handleChange} value={formData.q3} className="input-field h-32" />
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setStep(2)} className="btn-secondary flex-1">Back</button>
                  <button onClick={handleSubmit} disabled={loading}
                    className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50">
                    {loading ? 'CREATING ACCOUNT...' : <><UserCheck /> REGISTER AS EXPERT</>}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}