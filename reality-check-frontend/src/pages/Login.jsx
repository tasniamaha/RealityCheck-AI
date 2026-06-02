import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Shield, ArrowRight } from 'lucide-react';
import ScrollToTopButton from '../components/ScrollToTopButton';
import { Link } from 'react-router-dom';
import logo from '../assets/logo/logo-removebg.png';

export default function Login() {
  const [username,  setUsername]  = useState('');
  const [password,  setPassword]  = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState('');

  const { login }  = useAuth();
  const navigate   = useNavigate();

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Please enter your username and password.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const user = await login(username, password);
      if (user.role === 'admin')       navigate('/admin-dashboard');
      else if (user.role === 'expert') navigate('/expert-dashboard');
      else                             navigate('/user-dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative flex items-center justify-center">
      <div className="absolute inset-0 bg-[radial-gradient(#22d3ee_0.7px,transparent_1px)] bg-[length:50px_50px] opacity-20 animate-grid"></div>

      <motion.div
        animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 bg-gradient-to-br from-cyan-900/30 via-purple-900/30 to-black bg-[length:400%_400%]"
      />
      <motion.div
        animate={{ x: [0, 80, -60, 0], y: [0, -70, 90, 0], scale: [1, 1.15, 0.95, 1] }}
        transition={{ duration: 18, repeat: Infinity }}
        className="absolute top-20 left-20 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ x: [0, -90, 70, 0], y: [0, 80, -60, 0], scale: [1, 0.9, 1.2, 1] }}
        transition={{ duration: 22, repeat: Infinity, delay: 3 }}
        className="absolute bottom-10 right-10 w-[450px] h-[450px] bg-purple-500/10 rounded-full blur-3xl"
      />

      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.9 }}
        className="relative z-10 glass p-12 rounded-3xl neon-border w-full max-w-lg border border-cyan-400/30 shadow-2xl"
      >
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
           <div className="flex items-center gap-4">
  <img
    src={logo}
    alt="Reality Check Logo"
    className="w-16 h-16 object-contain"
  />

  <h1 className="text-5xl font-bold tracking-tighter">
    REALITY CHECK
  </h1>
</div>
          </div>
        </div>

     <br></br>

        {error && (
          <div className="mb-6 px-5 py-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <div className="mb-6">
          <label className="block text-xs text-slate-400 mb-2 font-mono tracking-widest">USERNAME</label>
          <input
            type="text"
            placeholder="your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-2xl px-6 py-5 text-lg placeholder-slate-500 focus:outline-none transition-all"
          />
        </div>

        <div className="mb-10">
          <label className="block text-xs text-slate-400 mb-2 font-mono tracking-widest">PASSWORD</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-2xl px-6 py-5 text-lg placeholder-slate-500 focus:outline-none transition-all"
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={handleLogin}
          disabled={isLoading}
          className="w-full py-6 bg-cyan-500 rounded-2xl font-bold text-xl flex items-center justify-center gap-3 relative overflow-hidden group disabled:opacity-70"
        >
          {isLoading ? (
            <span className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full" />
              VERIFYING...
            </span>
          ) : (
            <>
              LOGIN
              <ArrowRight className="group-hover:translate-x-3 transition-transform" />
            </>
          )}
          <div className="absolute inset-0 bg-white/20 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-700" />
        </motion.button>

        <div className="text-center mt-8 space-y-2">
  <p className="text-slate-400 text-sm">
    New user?{' '}
    <Link to="/register" className="text-cyan-400 hover:text-cyan-300 underline">
      Create an account
    </Link>
  </p>
 
</div>

        <p className="text-center mt-8 text-slate-400 text-sm">
          New to the network?{' '}
          <a href="/expert-register" className="text-cyan-400 hover:text-cyan-300 underline">
            Apply as Expert
          </a>


        </p>
      </motion.div>
      <ScrollToTopButton />
    </div>
  );
}