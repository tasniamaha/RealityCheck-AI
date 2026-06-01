import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, ArrowRight } from 'lucide-react';
import DemoPreviewSection from "../components/common/DemoPreviewSection";
import LiveStatsBar from '../components/LiveStatsBar';
import HowItWorksSection from '../components/HowItWorksSection';

import heroImage1 from '../assets/Include_image.jpg';
import heroImage2 from '../assets/include_2.jpg';
import heroImage3 from '../assets/hero_3.png';
import heroImage4 from '../assets/hero4.jpg';

export default function LandingPage() {
  const navigate = useNavigate();
  const [currentImage, setCurrentImage] = useState(0);
  const images = [heroImage1, heroImage2, heroImage3, heroImage4];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    { icon: '', title: 'Multi Model Analysis',   description: '3 expertisd models, in different fields are combined with the accuracy of 87%' },
    { icon: '', title: 'Facial Expression AI',       description: 'Advanced neural networks analyze micro-expressions and natural movement patterns' },
    { icon: '', title: 'Continuous Learning',        description: 'Self-improving AI model that learns from every verification' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', overflowX: 'hidden' }}>

      {/* ── HERO ── */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#000' }}>

        {/* Image mosaic background */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>

          <motion.div initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 2 }}
            style={{ position: 'absolute', top: 0, left: 0, width: '55%', height: '60%' }}>
            <img src={heroImage1} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(0,0,0,0.1), transparent, rgba(0,0,0,0.8))' }} />
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 2, delay: 0.3 }}
            style={{ position: 'absolute', bottom: 0, right: 0, width: '55%', height: '60%' }}>
            <img src={heroImage2} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(315deg, rgba(0,0,0,0.1), transparent, rgba(0,0,0,0.8))' }} />
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2, delay: 0.6 }}
            style={{ position: 'absolute', top: 0, right: 0, width: '45%', height: '40%' }}>
            <AnimatePresence mode="wait">
              <motion.img key={currentImage} src={images[currentImage]}
                initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 0.55, scale: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 1.5 }}
                style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(1) contrast(1.25) brightness(0.75)' }} alt="" />
            </AnimatePresence>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(225deg, rgba(0,0,0,0.2), rgba(0,0,0,0.3), rgba(0,0,0,0.8))' }} />
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2, delay: 0.9 }}
            style={{ position: 'absolute', bottom: 0, left: 0, width: '45%', height: '40%' }}>
            <AnimatePresence mode="wait">
              <motion.img key={(currentImage + 1) % images.length} src={images[(currentImage + 1) % images.length]}
                initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 0.45, scale: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 1.5 }}
                style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(1) contrast(1.25) brightness(0.5)' }} alt="" />
            </AnimatePresence>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(45deg, rgba(0,0,0,0.2), rgba(0,0,0,0.3), rgba(0,0,0,0.8))' }} />
          </motion.div>

          {/* Central vignette */}
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(0,0,0,0.75) 0%, transparent 100%)' }} />

          {/* Floating tiny circles */}
          {[...Array(18)].map((_, i) => (
            <motion.div key={i}
              style={{
                position: 'absolute', borderRadius: '50%',
                width: `${3 + (i % 4) * 2}px`, height: `${3 + (i % 4) * 2}px`,
                background: i % 2 === 0 ? 'rgba(34,211,238,0.5)' : 'rgba(168,85,247,0.4)',
                left: `${(i * 43 + 5) % 94}%`, top: `${(i * 61 + 9) % 88}%`,
                zIndex: 2, pointerEvents: 'none', filter: 'blur(0.4px)',
              }}
              animate={{ y: [0, -(12 + (i % 5) * 8), 0], x: [0, (i % 2 === 0 ? 1 : -1) * (6 + (i % 4) * 4), 0], opacity: [0.3, 0.9, 0.3], scale: [1, 1.4, 1] }}
              transition={{ duration: 3.5 + (i % 5) * 1.1, repeat: Infinity, delay: (i * 0.35) % 3, ease: 'easeInOut' }}
            />
          ))}
        </div>

        {/* Hero text */}
        <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', textAlign: 'center', padding: '0 24px' }}>

          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
            <div style={{ height: '1px', width: '64px', background: 'linear-gradient(90deg, transparent, rgba(34,211,238,0.6))' }} />
            <div style={{ height: '1px', width: '64px', background: 'linear-gradient(270deg, transparent, rgba(34,211,238,0.6))' }} />
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.15 }}
            style={{ fontSize: 'clamp(4rem, 9vw, 11rem)', fontWeight: 900, lineHeight: 1, letterSpacing: '-0.04em', marginBottom: '8px', userSelect: 'none' }}>
            REALITY
          </motion.h1>

          <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.8, delay: 0.5 }}
            style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px', width: '100%', maxWidth: '600px' }}>
            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(34,211,238,0.5))' }} />
            <Eye style={{ width: '24px', height: '24px', color: '#22d3ee', flexShrink: 0 }} />
            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(270deg, transparent, rgba(34,211,238,0.5))' }} />
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.3 }}
            style={{ fontSize: 'clamp(4rem, 9vw, 11rem)', fontWeight: 900, lineHeight: 1, letterSpacing: '-0.04em', marginBottom: '40px', userSelect: 'none', backgroundImage: 'linear-gradient(90deg, #22d3ee, #a5b4fc, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            CHECK
          </motion.h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            style={{ color: '#cbd5e1', fontSize: 'clamp(1rem, 2vw, 1.2rem)', maxWidth: '420px', marginBottom: '48px', lineHeight: 1.7 }}>
            In a world of synthetic media,{' '}
            <span style={{ color: '#fff', fontWeight: 600 }}>trust needs verification.</span>
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75 }}
            style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/login')}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '16px 40px', borderRadius: '14px',
                background: 'linear-gradient(135deg, rgba(34,211,238,0.15), rgba(168,85,247,0.15))',
                border: '1px solid rgba(34,211,238,0.4)',
                color: '#fff', fontSize: '15px', fontWeight: 700,
                letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer',
              }}>
              Enter Platform <ArrowRight style={{ width: '18px', height: '18px' }} />
            </motion.button>
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/demo')}
              style={{
                padding: '16px 40px', borderRadius: '14px',
                background: 'transparent',
                border: '1px solid rgba(148,163,184,0.3)',
                color: '#94a3b8', fontSize: '15px', fontWeight: 600,
                letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer',
              }}>
              Interactive Demo
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* ── LIVE STATS BAR ── */}
      <LiveStatsBar />

      {/* ── FEATURES ── */}
      <section style={{ padding: '100px 24px', background: 'rgba(2,8,23,0.9)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <motion.h2 initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }}
              style={{ fontSize: 'clamp(1.8rem, 3vw, 2.8rem)', fontWeight: 800, color: '#f1f5f9', marginBottom: '16px' }}>
              Advanced Detection Technology
            </motion.h2>
           
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
            {features.map((f, i) => (
              <motion.div key={f.title}
                initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                style={{
                  background: 'rgba(15,23,42,0.7)', border: '1px solid rgba(34,211,238,0.12)',
                  borderRadius: '20px', padding: '28px 24px', backdropFilter: 'blur(10px)',
                }}>
                <div style={{ fontSize: '32px', marginBottom: '16px' }}>{f.icon}</div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#e2e8f0', marginBottom: '10px' }}>{f.title}</h3>
                <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.7 }}>{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DEMO PREVIEW ── */}
      <DemoPreviewSection />

      {/* ── HOW IT WORKS ── */}
      <HowItWorksSection />

      {/* ── CTA ── */}
      <section style={{ padding: '100px 24px', background: '#000', textAlign: 'center' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <motion.h2 initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }}
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, color: '#f1f5f9', marginBottom: '16px' }}>
            Ready to Verify Reality?
          </motion.h2>
          <motion.p initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            style={{ color: '#64748b', fontSize: '16px', lineHeight: 1.7, marginBottom: '40px' }}>
            Join thousands of organizations protecting themselves from synthetic media.
          </motion.p>
          <motion.div initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
            style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/register')}
              style={{ padding: '14px 36px', borderRadius: '14px', background: 'linear-gradient(135deg, #22d3ee, #a855f7)', border: 'none', color: '#000', fontSize: '14px', fontWeight: 700, letterSpacing: '0.06em', cursor: 'pointer' }}>
              Create Free Account
            </motion.button>
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/expert-register')}
              style={{ padding: '14px 36px', borderRadius: '14px', background: 'transparent', border: '1px solid rgba(148,163,184,0.3)', color: '#94a3b8', fontSize: '14px', fontWeight: 600, letterSpacing: '0.06em', cursor: 'pointer' }}>
              Apply as Expert
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#000', borderTop: '1px solid rgba(30,41,59,0.8)', padding: '48px 24px', textAlign: 'center' }}>
        <p style={{ color: '#64748b', fontSize: '16px', marginBottom: '12px' }}>
          Created by <span style={{ color: '#22d3ee' }}>Noshin Syara</span>,{' '}
          <span style={{ color: '#22d3ee' }}>Tasnia Rahman Maha</span> and{' '}
          <span style={{ color: '#22d3ee' }}>Maliha Mehnaj</span>
        </p>
        <p style={{ color: '#334155', fontSize: '13px' }}>
          © 2026 Reality Check • Ethical AI Verification Platform • Innovation World Cup 2026
        </p>
      </footer>

    </div>
  );
}