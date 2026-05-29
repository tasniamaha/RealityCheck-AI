import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ArrowRight, Upload, Zap, Users, Eye, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';

import heroImage1 from '../assets/Include_image.jpg';
import heroImage2 from '../assets/include_2.jpg';

import heroImage3 from '../assets/hero_3.png';
import heroImage4 from '../assets/hero4.jpg';
import Navbar from '../components/Navbar';

export default function LandingPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [currentImage, setCurrentImage] = useState(0);

 const images = [heroImage1, heroImage2, heroImage3, heroImage4];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleRoleLogin = (role) => {
    let email = '';
    if (role === 'admin') email = 'admin@realitycheck.ai';
    else if (role === 'expert') email = 'expert@realitycheck.ai';
    else email = 'user@realitycheck.ai';

    login(email, '', role);

    if (role === 'admin') navigate('/admin-dashboard');
    else if (role === 'expert') navigate('/expert-dashboard');
    else navigate('/user-dashboard');
  };

  const timelineSteps = [
    { icon: Upload,      title: 'Upload',             desc: 'Submit Image or Video' },
    { icon: Eye,         title: 'Preprocess',          desc: 'Frame Extraction & Normalization' },
    { icon: Zap,         title: 'AI Analysis',         desc: 'Multi-Model Deepfake Detection' },
    { icon: Users,       title: 'Model Comparison',    desc: 'Cross-Validation of Results' },
    { icon: CheckCircle, title: 'Authenticity Score',  desc: 'Confidence Metrics Generated' },
    { icon: Shield,      title: 'Expert Verdict',      desc: 'Human Expert Final Decision' },
  ];

  const dotColors = [
    { cls: 'bg-cyan-400',   glow: 'rgba(34,211,238,0.5)' },
    { cls: 'bg-purple-400', glow: 'rgba(192,38,211,0.5)' },
    { cls: 'bg-cyan-400',   glow: 'rgba(34,211,238,0.5)' },
    { cls: 'bg-green-400',  glow: 'rgba(74,222,128,0.5)' },
    { cls: 'bg-yellow-400', glow: 'rgba(250,204,21,0.5)' },
    { cls: 'bg-red-400',    glow: 'rgba(248,113,113,0.5)' },
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">

      {/* ── NAVBAR ── */}
      <Navbar />

      {/* ── HERO SECTION ── */}
      <section className="relative min-h-screen flex flex-col overflow-hidden bg-black">

        {/* Full-bleed image mosaic background */}
        <div className="absolute inset-0 z-0">

          {/* Image 1 – top-left */}
          <motion.div
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 2, ease: 'easeOut' }}
            className="absolute top-0 left-0 w-[55%] h-[60%]"
          >
            <img src={heroImage1} className="w-full h-full object-cover" alt="" />
            <div className="absolute inset-0 bg-gradient-to-br from-black/10 via-transparent to-black/80" />
          </motion.div>

          {/* Image 2 – bottom-right */}
          <motion.div
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 2, delay: 0.3, ease: 'easeOut' }}
            className="absolute bottom-0 right-0 w-[55%] h-[60%]"
          >
            <img src={heroImage2} className="w-full h-full object-cover" alt="" />
            <div className="absolute inset-0 bg-gradient-to-tl from-black/10 via-transparent to-black/80" />
          </motion.div>

          {/* Cross-fade – top-right */}
         {/* Cross-fade – top-right */}
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 2, delay: 0.6 }}
  className="absolute top-0 right-0 w-[45%] h-[40%]"
>
  <AnimatePresence mode="wait">
    <motion.img
      key={currentImage}
      src={images[currentImage]}
      initial={{ opacity: 0, scale: 1.05 }}
      animate={{ opacity: 0.55, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.5 }}
      className="w-full h-full object-cover grayscale contrast-125 brightness-75"
      alt=""
    />
  </AnimatePresence>

  <div className="absolute inset-0 bg-gradient-to-bl from-black/20 via-black/30 to-black/80" />
</motion.div>

          {/* Cross-fade – bottom-left */}
    \
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 2, delay: 0.9 }}
  className="absolute bottom-0 left-0 w-[45%] h-[40%]"
>
  <AnimatePresence mode="wait">
    <motion.img
      key={(currentImage + 1) % images.length}
      src={images[(currentImage + 1) % images.length]}
      initial={{ opacity: 0, scale: 1.05 }}
      animate={{ opacity: 0.45, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.5 }}
      className="w-full h-full object-cover grayscale contrast-125 brightness-50"
      alt=""
    />
  </AnimatePresence>

  <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-black/30 to-black/80" />
</motion.div>

          {/* Central vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,rgba(0,0,0,0.75)_0%,transparent_100%)]" />
        </div>

        {/* Foreground content */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-6">

          {/* Top label */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mb-8 flex items-center gap-3"
          >
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-cyan-400/60" />
            
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-cyan-400/60" />
          </motion.div>

          {/* REALITY */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.15 }}
            className="mb-2"
          >
            <h1
              className="font-black leading-none tracking-tighter select-none"
              style={{ fontSize: 'clamp(4rem, 9vw, 11rem)' }}
            >
              REALITY
            </h1>
          </motion.div>

          {/* Divider with eye */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex items-center gap-4 mb-2 w-full max-w-2xl"
          >
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-cyan-500/50" />
            <Eye className="w-6 h-6 text-cyan-400 shrink-0" />
            <div className="flex-1 h-px bg-gradient-to-l from-transparent via-cyan-500/50 to-cyan-500/50" />
          </motion.div>

          {/* CHECK */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3 }}
            className="mb-10"
          >
            <h1
              className="font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-cyan-300 to-purple-400 select-none"
              style={{ fontSize: 'clamp(4rem, 9vw, 11rem)' }}
            >
              CHECK
            </h1>
          </motion.div>

          {/* Sub-headline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-slate-300 text-lg md:text-xl max-w-md mb-12 leading-relaxed"
          >
            In a world of synthetic media,{' '}
            <span className="text-white font-semibold">trust needs verification.</span>
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75 }}
            className="flex flex-col items-center gap-6"
          >
            <button
              onClick={() => navigate('/login')}
              className="group relative px-12 py-5 rounded-2xl text-base font-bold tracking-widest uppercase overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(34,211,238,0.15) 0%, rgba(192,38,211,0.15) 100%)',
                border: '1px solid rgba(34,211,238,0.4)',
              }}
            >
              <span className="relative z-10 flex items-center gap-3 text-white">
                Enter Platform
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <motion.div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* ── ROLE LOGIN ── */}
      <div className="flex flex-col items-center justify-center gap-4 text-center py-16 bg-black">
        <span className="text-[20px] text-white tracking-[0.25em] uppercase font-mono">
          Login as
        </span>
        <div className="flex items-center justify-center gap-4">
          {['user', 'expert', 'admin'].map((role) => (
            <button
              key={role}
              onClick={() => handleRoleLogin(role)}
              className="px-7 py-3 text-sm font-mono tracking-widest uppercase border border-white/40 hover:border-cyan-400/60 hover:text-cyan-400 text-white rounded-xl transition-all"
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* ── TIMELINE — HOW IT WORKS ── */}
      <section className="py-24 bg-slate-950/70">
        <div className="max-w-5xl mx-auto px-8">

          {/* Section header */}
          <div className="text-center mb-20">
            <p className="text-xs tracking-[0.3em] text-cyan-400/70 font-mono mb-4">
              PROCESS ARCHITECTURE
            </p>
            <h2 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight">
              How Reality Check{' '}
              <span className="text-cyan-400">Works</span>
            </h2>
            <p className="mt-5 text-slate-400 text-lg max-w-xl mx-auto">
              A six-stage forensic pipeline
            </p>
          </div>

          {/* Zigzag timeline */}
          <div className="relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-cyan-500/10 via-purple-500/20 to-cyan-500/10 -translate-x-1/2" />

            <div className="flex flex-col gap-0">
              {timelineSteps.map((step, index) => {
                const isLeft = index % 2 === 0;
                const dot = dotColors[index];

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: isLeft ? -40 : 40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    viewport={{ once: true }}
                    className={`relative flex items-center gap-0 ${isLeft ? 'flex-row' : 'flex-row-reverse'} mb-6`}
                  >
                    {/* Card */}
                    <div className="w-[calc(50%-2.5rem)]">
                      <div className="glass rounded-2xl p-6 border border-slate-700/50 hover:border-cyan-400/40 transition-all duration-300 group">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl glass border border-slate-600 flex items-center justify-center group-hover:border-cyan-400/50 transition-all">
                              <step.icon className="w-5 h-5 text-cyan-400" />
                            </div>
                          </div>
                          <span className="text-5xl font-black text-slate-800 select-none leading-none">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold mb-1 group-hover:text-cyan-400 transition-colors">
                          {step.title}
                        </h3>
                        <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
                      </div>
                    </div>

                    {/* Centre dot */}
                    <div className="w-20 flex items-center justify-center relative shrink-0">
                      <div
                        className={`w-3 h-3 rounded-full ${dot.cls} shadow-lg z-10`}
                        style={{ boxShadow: `0 0 10px 2px ${dot.glow}` }}
                      />
                    </div>

                    {/* Empty opposite side */}
                    <div className="w-[calc(50%-2.5rem)]" />
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Demo upload CTA */}
          <div className="text-center mt-20">
            <button
              onClick={() => navigate('/user-dashboard')}
              className="inline-flex items-center gap-4 px-12 py-6 glass border border-slate-600 hover:border-cyan-400 rounded-3xl text-lg font-semibold hover:bg-cyan-500/10 transition-all group"
            >
              <div className="w-6 h-6 rounded glass border border-slate-500 group-hover:border-cyan-400 flex items-center justify-center transition-all">
                <Upload className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              TRY IT — UPLOAD IMAGE OR VIDEO
              <div className="w-6 h-6 rounded glass border border-slate-500 group-hover:border-cyan-400 flex items-center justify-center transition-all">
                <Upload className="w-3.5 h-3.5 text-cyan-400" />
              </div>
            </button>
            <p className="text-xs tracking-widest text-slate-600 font-mono mt-3">
              NO ACCOUNT REQUIRED FOR DEMO
            </p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-black border-t border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-8 text-center">
          <p className="text-slate-400 text-lg mb-4">
            Created by{' '}
            <span className="text-cyan-400">Noshin Syara</span>,{' '}
            <span className="text-cyan-400">Tasnia Rahman Maha</span> and{' '}
            <span className="text-cyan-400">Maliha Mehnaj</span>
          </p>
          <p className="text-sm text-slate-500">
            © 2026 Reality Check • Ethical AI Verification Platform • Innovation World Cup 2026
          </p>
        </div>
      </footer>

    </div>
  );
}