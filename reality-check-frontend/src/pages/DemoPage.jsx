import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const STEPS = [
  { pct: 15, msg: 'Initializing analysis engine...' },
  { pct: 32, msg: 'Extracting visual features...' },
  { pct: 54, msg: 'Running deepfake models...' },
  { pct: 71, msg: 'Cross-validating signals...' },
  { pct: 88, msg: 'Computing confidence score...' },
  { pct: 100, msg: 'Analysis complete.' },
];

const DEMO_SCENARIOS = [
  {
    id: 'real',
    icon: '',
    label: 'Authentic Content',
    tagline: 'Show a real, unmanipulated result',
    accentColor: '#7A2AB8',
    result: {
      verdict: 'AUTHENTIC',
      confidence: 94,
      verdictColor: '#196F42',
      signals: [
        { label: 'Lighting consistency',    score: 97, ok: true  },
        { label: 'Texture consistency', score: 93, ok: true  },
        { label: 'Pixel-level artifacts',    score: 4,  ok: true  },
      ],
      summary: 'Example of a result where both models give a low fake score. This is scripted sample data, not a real analysis.',
    },
  },
  {
    id: 'deepfake',
    icon: '',
    label: 'Deepfake Detected',
    tagline: 'Show a manipulated / AI-generated result',
    accentColor: '#B9281B',
    result: {
      verdict: 'MANIPULATED',
      confidence: 87,
      verdictColor: '#B9281B',
      signals: [
        { label: 'Lighting consistency',    score: 38, ok: false },
        { label: 'Texture consistency', score: 29, ok: false },
        { label: 'Pixel-level artifacts',    score: 82, ok: false },
      ],
      summary: 'Example of a result where both models give a high fake score. This is scripted sample data, not a real analysis.',
    },
  },
  {
    id: 'uncertain',
    icon: '',
    label: 'Uncertain',
    tagline: 'Show an inconclusive, borderline result',
    accentColor: '#8A5C00',
    result: {
      verdict: 'INCONCLUSIVE',
      confidence: 61,
      verdictColor: '#8A5C00',
      signals: [
        { label: 'Lighting consistency',    score: 72, ok: true  },
        { label: 'Texture consistency', score: 55, ok: null  },
        { label: 'Edge consistency',           score: 63, ok: null  },
        { label: 'Pixel-level artifacts',    score: 41, ok: false },
      ],
      summary: 'Example of a result where the models disagree, so it is left for expert review. This is scripted sample data, not a real analysis.',
    },
  },
];

export default function DemoPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [selected,  setSelected]  = useState('real');
  const [phase,     setPhase]     = useState('pick');   // pick | running | result | login
  const [stepIdx,   setStepIdx]   = useState(0);
  const [progress,  setProgress]  = useState(0);
  const [statusMsg, setStatusMsg] = useState('');

  const scenario = DEMO_SCENARIOS.find(s => s.id === selected);

  const runDemo = () => {
    setPhase('running');
    setStepIdx(0);
    setProgress(0);

    STEPS.forEach((step, i) => {
      setTimeout(() => {
        setProgress(step.pct);
        setStatusMsg(step.msg);
        setStepIdx(i);
        if (i === STEPS.length - 1) {
          setTimeout(() => setPhase('result'), 600);
        }
      }, i * 700);
    });
  };

  const reset = () => {
    setPhase('pick');
    setProgress(0);
    setStatusMsg('');
  };

  /* ── helpers ── */
  const signalColor = (ok) => {
    if (ok === true)  return '#196F42';
    if (ok === false) return '#B9281B';
    return '#8A5C00';
  };

  const barBg = (ok) => {
    if (ok === true)  return 'rgba(25,111,66,0.2)';
    if (ok === false) return 'rgba(185,40,27,0.2)';
    return 'rgba(138,92,0,0.2)';
  };

  /* ── styles ── */
  const card = {
    background: 'rgba(255,255,255,0.7)',
    border: '1px solid rgba(23,19,31,0.12)',
    borderRadius: '16px',
    backdropFilter: 'blur(12px)',
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#ECEBF1',
      color: '#17131F',
      padding: '40px 20px 80px',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Background orbs */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
      }}>
        <div style={{
          position: 'absolute', top: '10%', left: '15%',
          width: '500px', height: '500px', borderRadius: '50%',
          background: 'transparent',
        }} />
        <div style={{
          position: 'absolute', bottom: '10%', right: '10%',
          width: '400px', height: '400px', borderRadius: '50%',
          background: 'transparent',
        }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '720px', margin: '0 auto' }}>

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', marginBottom: '48px' }}
        >
          <div style={{
            display: 'inline-block',
            padding: '4px 16px',
            border: '1px solid rgba(122,42,184,0.35)',
            borderRadius: '20px',
            fontSize: '11px',
            color: '#7A2AB8',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            marginBottom: '20px',
          }}>
            No login required
          </div>
          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3.2rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            margin: '0 0 12px',
          }}>
            Scripted Demo (simulated results)
          </h1>
          <p style={{ color: '#777283', fontSize: '15px', maxWidth: '440px', margin: '0 auto' }}>
            Choose a scenario and step through each stage of the detection pipeline. Every result on this page is a scripted example, not a live analysis.
          </p>
        </motion.div>

        {/* ── PHASE: PICK ── */}
        <AnimatePresence mode="wait">
          {phase === 'pick' && (
            <motion.div
              key="pick"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Scenario cards */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
                gap: '12px',
                marginBottom: '32px',
              }}>
                {DEMO_SCENARIOS.map((s, i) => (
                  <motion.button
                    key={s.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    onClick={() => setSelected(s.id)}
                    style={{
                      ...card,
                      padding: '20px 16px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      border: selected === s.id
                        ? `1px solid ${s.accentColor}`
                        : '1px solid rgba(23,19,31,0.12)',
                      background: selected === s.id
                        ? `rgba(${s.id === 'real' ? '34,211,238' : s.id === 'deepfake' ? '248,113,113' : '251,191,36'},0.06)`
                        : 'rgba(255,255,255,0.7)',
                      transition: 'all 0.2s',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    {selected === s.id && (
                      <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0,
                        height: '2px',
                        background: `${s.accentColor}`,
                      }} />
                    )}
                    <div style={{ fontSize: '28px', marginBottom: '10px' }}>{s.icon}</div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#17131F', marginBottom: '4px' }}>
                      {s.label}
                    </div>
                    <div style={{ fontSize: '12px', color: '#777283', lineHeight: 1.5 }}>
                      {s.tagline}
                    </div>
                    {selected === s.id && (
                      <div style={{
                        position: 'absolute', top: '12px', right: '12px',
                        width: '18px', height: '18px', borderRadius: '50%',
                        background: s.accentColor,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '10px', color: '#ECEBF1', fontWeight: 800,
                      }}>✓</div>
                    )}
                  </motion.button>
                ))}
              </div>

              {/* Run button */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                style={{ textAlign: 'center' }}
              >
                <button
                  onClick={runDemo}
                  style={{
                    padding: '14px 48px',
                    background: 'rgba(122,42,184,0.15)',
                    border: '1px solid rgba(122,42,184,0.4)',
                    borderRadius: '12px',
                    color: '#17131F',
                    fontSize: '15px',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textTransform: 'uppercase',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(122,42,184,0.25)';
                    e.currentTarget.style.borderColor = 'rgba(122,42,184,0.7)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(122,42,184,0.15)';
                    e.currentTarget.style.borderColor = 'rgba(122,42,184,0.4)';
                  }}
                >
                  Run Demo 
                </button>
                
              </motion.div>
            </motion.div>
          )}

          {/* ── PHASE: RUNNING ── */}
          {phase === 'running' && (
            <motion.div
              key="running"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ ...card, padding: '40px 32px', textAlign: 'center' }}
            >
              <div style={{ fontSize: '40px', marginBottom: '24px' }}>
                {scenario.icon}
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px', color: '#17131F' }}>
                Analysing…
              </h2>
              <p style={{ color: '#777283', fontSize: '13px', marginBottom: '32px', letterSpacing: '0.02em' }}>
                {statusMsg}
              </p>

              {/* Progress bar */}
              <div style={{
                height: '6px', background: 'rgba(23,19,31,0.1)',
                borderRadius: '3px', overflow: 'hidden', marginBottom: '24px',
              }}>
                <motion.div
                  style={{
                    height: '100%',
                    background: `${scenario.accentColor}`,
                    borderRadius: '3px',
                  }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>

              {/* Steps */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
                {STEPS.map((step, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    opacity: i <= stepIdx ? 1 : 0.25,
                    transition: 'opacity 0.3s',
                  }}>
                    <div style={{
                      width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
                      background: i < stepIdx ? '#196F42' : i === stepIdx ? scenario.accentColor : '#E2E0E8',
                      boxShadow: i === stepIdx ? `0 0 8px ${scenario.accentColor}` : 'none',
                      transition: 'all 0.3s',
                    }} />
                    <span style={{ fontSize: '12px', color: i <= stepIdx ? '#575262' : '#E2E0E8' }}>
                      {step.msg}
                    </span>
                    {i < stepIdx && (
                      <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#196F42' }}>✓</span>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── PHASE: RESULT ── */}
          {phase === 'result' && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Verdict banner */}
              <div style={{
                ...card,
                padding: '28px 28px 24px',
                marginBottom: '16px',
                borderColor: `${scenario.result.verdictColor}40`,
                position: 'relative',
                overflow: 'hidden',
              }}>
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0,
                  height: '3px',
                  background: `${scenario.result.verdictColor}`,
                }} />

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <div style={{ fontSize: '11px', letterSpacing: '0.15em', color: '#CDCAD5', textTransform: 'uppercase', marginBottom: '6px' }}>
                      Verdict
                    </div>
                    <div style={{
                      fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
                      fontWeight: 800,
                      letterSpacing: '-0.02em',
                      color: scenario.result.verdictColor,
                    }}>
                      {scenario.result.verdict}
                    </div>
                  </div>

                  {/* Confidence ring */}
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', letterSpacing: '0.1em', color: '#CDCAD5', textTransform: 'uppercase', marginBottom: '6px' }}>
                      Confidence
                    </div>
                    <div style={{
                      width: '72px', height: '72px', borderRadius: '50%',
                      border: `3px solid ${scenario.result.verdictColor}40`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: `${scenario.result.verdictColor}0d`,
                      position: 'relative',
                    }}>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        style={{ fontSize: '20px', fontWeight: 800, color: scenario.result.verdictColor }}
                      >
                        {scenario.result.confidence}%
                      </motion.div>
                    </div>
                  </div>
                </div>

                <p style={{ marginTop: '16px', fontSize: '13px', color: '#777283', lineHeight: 1.7 }}>
                  {scenario.result.summary}
                </p>
              </div>

              {/* Signal breakdown */}
              <div style={{ ...card, padding: '24px 28px', marginBottom: '16px' }}>
                <div style={{ fontSize: '11px', letterSpacing: '0.15em', color: '#CDCAD5', textTransform: 'uppercase', marginBottom: '16px' }}>
                  Signal Breakdown
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {scenario.result.signals.map((sig, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                        <span style={{ fontSize: '13px', color: '#575262' }}>{sig.label}</span>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: signalColor(sig.ok) }}>
                          {sig.ok === true ? 'OK' : sig.ok === false ? 'ANOMALY' : 'REVIEW'}
                          {' '}· {sig.score}%
                        </span>
                      </div>
                      <div style={{ height: '5px', background: 'rgba(23,19,31,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${sig.score}%` }}
                          transition={{ delay: 0.1 + i * 0.08, duration: 0.6, ease: 'easeOut' }}
                          style={{ height: '100%', background: barBg(sig.ok), borderRadius: '3px',
                            boxShadow: `0 0 6px ${signalColor(sig.ok)}60` }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Demo disclaimer */}
              <div style={{
                display: 'flex', gap: '10px',
                padding: '12px 16px',
                background: 'rgba(138,92,0,0.04)',
                border: '1px solid rgba(138,92,0,0.15)',
                borderRadius: '10px',
                marginBottom: '32px',
              }}>
                <span style={{ fontSize: '14px', flexShrink: 0 }}></span>
                <p style={{ fontSize: '12px', color: '#777283', margin: 0, lineHeight: 1.6 }}>
                  This is a simulated result for demonstration only. No real AI analysis was performed.
                </p>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <button
                  onClick={reset}
                  style={{
                    padding: '11px 28px',
                    border: '1px solid rgba(23,19,31,0.2)',
                    borderRadius: '10px', background: 'transparent',
                    color: '#777283', fontSize: '13px', cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(23,19,31,0.4)'; e.currentTarget.style.color = '#575262'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(23,19,31,0.2)'; e.currentTarget.style.color = '#777283'; }}
                >
                  Run another
                </button>

                {!user && (
                  <button
                    onClick={() => setPhase('login')}
                    style={{
                      padding: '11px 28px',
                      background: 'rgba(122,42,184,0.15)',
                      border: '1px solid rgba(122,42,184,0.4)',
                      borderRadius: '10px', color: '#17131F',
                      fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                      letterSpacing: '0.04em', transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(122,42,184,0.25)';
                      e.currentTarget.style.borderColor = 'rgba(122,42,184,0.7)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'rgba(122,42,184,0.15)';
                      e.currentTarget.style.borderColor = 'rgba(122,42,184,0.4)';
                    }}
                  >
                    Use with real files 
                  </button>
                )}

                {user && (
                  <button
                    onClick={() => navigate('/user-dashboard')}
                    style={{
                      padding: '11px 28px',
                      background: 'rgba(122,42,184,0.15)',
                      border: '1px solid rgba(122,42,184,0.4)',
                      borderRadius: '10px', color: '#17131F',
                      fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    Go to Dashboard 
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* ── PHASE: LOGIN PROMPT ── */}
          {phase === 'login' && (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ ...card, padding: '48px 36px', textAlign: 'center', borderColor: 'rgba(122,42,184,0.2)' }}
            >
              <div style={{ fontSize: '48px', marginBottom: '20px' }}></div>
              <h2 style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '10px', color: '#17131F' }}>
                Ready for real analysis?
              </h2>
              <p style={{ color: '#777283', fontSize: '14px', maxWidth: '380px', margin: '0 auto 32px', lineHeight: 1.7 }}>
                Create a free account to upload your own images and videos, access your full scan history, and get expert reviews.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '320px', margin: '0 auto' }}>
                <button
                  onClick={() => navigate('/register')}
                  style={{
                    padding: '14px',
                    background: '#7A2AB8',
                    border: 'none', borderRadius: '12px',
                    color: '#ECEBF1', fontSize: '14px', fontWeight: 800,
                    letterSpacing: '0.06em', cursor: 'pointer',
                    textTransform: 'uppercase', transition: 'opacity 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                >
                  Create Free Account
                </button>

                <button
                  onClick={() => navigate('/login')}
                  style={{
                    padding: '14px',
                    border: '1px solid rgba(122,42,184,0.3)',
                    borderRadius: '12px', background: 'transparent',
                    color: '#7A2AB8', fontSize: '14px', fontWeight: 600,
                    letterSpacing: '0.04em', cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(122,42,184,0.08)';
                    e.currentTarget.style.borderColor = 'rgba(122,42,184,0.6)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = 'rgba(122,42,184,0.3)';
                  }}
                >
                  Sign In
                </button>

                <button
                  onClick={reset}
                  style={{
                    padding: '10px', border: 'none',
                    background: 'transparent', color: '#CDCAD5',
                    fontSize: '12px', cursor: 'pointer',
                    letterSpacing: '0.04em', transition: 'color 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#777283')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#CDCAD5')}
                >
                  Back to demo
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}