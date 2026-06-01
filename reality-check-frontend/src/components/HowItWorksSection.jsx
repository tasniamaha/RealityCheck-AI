import { motion } from 'framer-motion';
import { Upload, Eye, Zap, Users, CheckCircle, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const timelineSteps = [
  { icon: Upload,      title: 'Upload',            desc: 'Submit Image or Video' },
  { icon: Eye,         title: 'Preprocess',         desc: 'Frame Extraction & Normalization' },
  { icon: Zap,         title: 'AI Analysis',        desc: 'Multi-Model Deepfake Detection' },
  { icon: Users,       title: 'Model Comparison',   desc: 'Cross-Validation of Results' },
  { icon: CheckCircle, title: 'Authenticity Score', desc: 'Confidence Metrics Generated' },
  { icon: Shield,      title: 'Expert Verdict',     desc: 'Human Expert Final Decision' },
];

const dotColors = [
  { bg: '#22d3ee', glow: 'rgba(34,211,238,0.5)' },
  { bg: '#c026d3', glow: 'rgba(192,38,211,0.5)' },
  { bg: '#22d3ee', glow: 'rgba(34,211,238,0.5)' },
  { bg: '#4ade80', glow: 'rgba(74,222,128,0.5)' },
  { bg: '#facc15', glow: 'rgba(250,204,21,0.5)'  },
  { bg: '#f87171', glow: 'rgba(248,113,113,0.5)' },
];

// ✅ Floating background particles
const FloatingParticles = () => {
  const particles = Array.from({ length: 20 });

  const colors = [
    'rgba(34,211,238,0.5)',
    'rgba(192,38,211,0.5)',
    'rgba(74,222,128,0.5)',
  ];

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      {particles.map((_, i) => {
        const size = Math.random() * 6 + 4;
        const left = Math.random() * 100;
        const duration = Math.random() * 15 + 15;

        return (
          <motion.div
            key={i}
            initial={{ y: 0, opacity: 0 }}
            animate={{
              y: [-20, -250],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: 'linear',
            }}
            style={{
              position: 'absolute',
              bottom: '-20px',
              left: `${left}%`,
              width: `${size}px`,
              height: `${size}px`,
              borderRadius: '50%',
              background: colors[i % colors.length],
              boxShadow: `0 0 10px ${colors[i % colors.length]}`,
              filter: 'blur(1px)',
            }}
          />
        );
      })}
    </div>
  );
};

export default function HowItWorksSection() {
  const navigate = useNavigate();

  return (
    <section
      style={{
        padding: '100px 24px',
        background: 'rgba(15,23,42,0.7)',
        position: 'relative',   // ✅ important
        overflow: 'hidden',     // ✅ keep particles inside
      }}
    >
      {/* ✅ Background particles */}
      <FloatingParticles />

      <div style={{ maxWidth: '860px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
          <p style={{ fontSize: '11px', letterSpacing: '0.3em', color: 'rgba(34,211,238,0.7)', fontFamily: 'monospace', textTransform: 'uppercase', marginBottom: '16px' }}>
            Process Architecture
          </p>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 800, color: '#f1f5f9', marginBottom: '16px' }}>
            How Reality Check <span style={{ color: '#22d3ee' }}>Works</span>
          </h2>
          <p style={{ color: '#64748b', fontSize: '16px' }}>A six-stage forensic pipeline</p>
        </div>

        <div style={{ position: 'relative' }}>
          <div style={{
            position: 'absolute',
            left: '50%',
            top: 0,
            bottom: 0,
            width: '1px',
            background: 'linear-gradient(to bottom, rgba(34,211,238,0.1), rgba(168,85,247,0.2), rgba(34,211,238,0.1))',
            transform: 'translateX(-50%)'
          }} />

          {timelineSteps.map((step, i) => {
            const isLeft = i % 2 === 0;
            const dot = dotColors[i];

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: isLeft ? -40 : 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  flexDirection: isLeft ? 'row' : 'row-reverse',
                  marginBottom: '24px'
                }}
              >
                <div style={{ width: 'calc(50% - 40px)' }}>
                  <div
                    style={{
                      background: 'rgba(15,23,42,0.8)',
                      border: '1px solid rgba(100,116,139,0.3)',
                      borderRadius: '16px',
                      padding: '24px',
                      transition: 'border-color 0.3s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(34,211,238,0.4)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(100,116,139,0.3)'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: 'rgba(34,211,238,0.08)',
                        border: '1px solid rgba(34,211,238,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <step.icon style={{ width: '18px', height: '18px', color: '#22d3ee' }} />
                      </div>
                      <span style={{
                        fontSize: '3rem',
                        fontWeight: 900,
                        color: 'rgba(30,41,59,0.8)',
                        lineHeight: 1
                      }}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#e2e8f0', marginBottom: '6px' }}>
                      {step.title}
                    </h3>
                    <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6 }}>
                      {step.desc}
                    </p>
                  </div>
                </div>

                <div style={{
                  width: '80px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: dot.bg,
                    boxShadow: `0 0 10px 2px ${dot.glow}`
                  }} />
                </div>

                <div style={{ width: 'calc(50% - 40px)' }} />
              </motion.div>
            );
          })}
        </div>

        <div style={{ textAlign: 'center', marginTop: '64px' }}>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/user-dashboard')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '16px',
              padding: '20px 48px',
              borderRadius: '20px',
              background: 'transparent',
              border: '1px solid rgba(100,116,139,0.4)',
              color: '#fff',
              fontSize: '15px',
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(34,211,238,0.5)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(100,116,139,0.4)'}
          >
            <Upload style={{ width: '16px', height: '16px', color: '#22d3ee' }} />
            Try It — Upload Image or Video
            <Upload style={{ width: '16px', height: '16px', color: '#22d3ee' }} />
          </motion.button>

          <p style={{
            fontSize: '11px',
            letterSpacing: '0.15em',
            color: '#334155',
            fontFamily: 'monospace',
            marginTop: '12px'
          }}>
            NO ACCOUNT REQUIRED FOR DEMO
          </p>
        </div>
      </div>
    </section>
  );
}