import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import {
  Upload, Play, LogOut, Clock,
  MessageSquare, AlertTriangle, CheckCircle, Zap, FileWarning
} from 'lucide-react';
import ScrollToTopButton from '../components/ScrollToTopButton';
import StatusBadge from '../components/StatusBadge';
import ComplaintModal from '../components/ComplaintModal';

// ─── Model persona definitions ─────────────────────────────────────────────
const MODEL_PERSONAS = {
  'SigLIP (HuggingFace)': {
    shortName: 'SigLIP',
    role: 'Vision-Language Contrastive Model',
    color: 'violet',
    icon: '',
    specialty: 'semantic coherence and visual-text alignment',
    fakeSignals: ['semantic inconsistency between objects', 'unnatural object relationships in the scene', 'impossible scene compositions'],
    realSignals: ['consistent scene semantics', 'plausible object placement', 'natural environmental context'],
  },
  'Xception-FaceForensics': {
    shortName: 'Xception',
    role: 'Face Forensics Specialist',
    color: 'rose',
    icon: '',
    specialty: 'facial manipulation and splicing artifacts',
    fakeSignals: ['boundary artifacts around facial regions', 'unnatural skin texture frequency response', 'lighting direction mismatch on the face'],
    realSignals: ['consistent facial texture gradients', 'natural pore and skin structure', 'coherent lighting falloff across the face'],
  },
  'EfficientNet-B0 (Custom)': {
    shortName: 'EfficientNet',
    role: 'Generative Artifact Detector',
    color: 'amber',
    icon: '',
    specialty: 'GAN/diffusion fingerprints and pixel statistics',
    fakeSignals: ['frequency domain anomalies in pixel statistics', 'over-smoothed regions typical of neural generators', 'unrealistic shadow directionality'],
    realSignals: ['natural pixel noise distribution', 'authentic grain structure and sensor noise', 'physically plausible lighting and shadows'],
  },
};

const COLOR_MAP = {
  violet: { border: 'border-violet-500/40', shadow: 'shadow-violet-500/10', text: 'text-violet-400', dot: 'bg-violet-400' },
  rose:   { border: 'border-rose-500/40',   shadow: 'shadow-rose-500/10',   text: 'text-rose-400',   dot: 'bg-rose-400' },
  amber:  { border: 'border-amber-500/40',  shadow: 'shadow-amber-500/10',  text: 'text-amber-400',  dot: 'bg-amber-400' },
  cyan:   { border: 'border-cyan-500/40',   shadow: 'shadow-cyan-500/10',   text: 'text-cyan-400',   dot: 'bg-cyan-400' },
};

// ─── Call YOUR Django backend proxy ────────────────────────────────────────
async function fetchModelVoice(modelResult, scanId, allResults) {
  const persona = MODEL_PERSONAS[modelResult.model_name] || {
    shortName: modelResult.model_name,
    specialty: 'image authenticity analysis',
    fakeSignals: ['visual anomalies', 'statistical inconsistencies'],
    realSignals: ['natural signal distribution', 'consistent pixel statistics'],
  };

  const otherModels = allResults
    .filter(r => r.model_name !== modelResult.model_name)
    .map(r => `${r.model_name}: ${r.verdict} (${r.fake_prob?.toFixed(1)}% fake)`)
    .join(', ');

  const payload = {
    scan_id:      scanId,
    model_name:   modelResult.model_name,
    short_name:   persona.shortName,
    verdict:      modelResult.verdict,
    fake_prob:    modelResult.fake_prob,
    fake_signals: persona.fakeSignals,
    real_signals: persona.realSignals,
    specialty:    persona.specialty,
    other_models: otherModels,
  };

  const res = await fetch('/api/model-voice/', {
    method:      'POST',
    credentials: 'include',
    headers:     { 'Content-Type': 'application/json' },
    body:        JSON.stringify(payload),
  });

  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error(`Server error (status ${res.status}) — check Django logs`);
  }

  if (!res.ok) throw new Error(data.error || `Voice API failed (${res.status})`);
  return data.voice;
}

// ─── Color/verdict helpers ─────────────────────────────────────────────────
const verdictColor = (v) => {
  if (v === 'FAKE')      return 'text-red-400';
  if (v === 'REAL')      return 'text-emerald-400';
  if (v === 'UNCERTAIN') return 'text-yellow-400';
  return 'text-slate-400';
};
const verdictBar = (v) => {
  if (v === 'FAKE') return 'bg-red-500';
  if (v === 'REAL') return 'bg-emerald-500';
  return 'bg-yellow-500';
};

// ─── Typing indicator ──────────────────────────────────────────────────────
function TypingDots({ colorClass }) {
  return (
    <span className="inline-flex items-center gap-1 ml-1">
      {[0, 1, 2].map(i => (
        <motion.span
          key={i}
          className={`inline-block w-1.5 h-1.5 rounded-full ${colorClass}`}
          animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.1, 0.8] }}
          transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18 }}
        />
      ))}
    </span>
  );
}

// ─── Single model voice card ───────────────────────────────────────────────
function ModelVoiceCard({ res, voice, loading, error, index }) {
  const persona = MODEL_PERSONAS[res.model_name] || {
    shortName: res.model_name, role: 'Detector', icon: '🔍', color: 'cyan',
  };
  const c = COLOR_MAP[persona.color] || COLOR_MAP.cyan;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`rounded-3xl p-6 border ${c.border} shadow-lg ${c.shadow} bg-slate-950/70 backdrop-blur-xl`}
    >
      <div className="flex items-start justify-between mb-4 gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-2xl shrink-0">{persona.icon}</span>
          <div className="min-w-0">
            <p className={`font-mono text-xs tracking-[2px] truncate ${c.text}`}>{res.model_name}</p>
            <p className="text-slate-500 text-xs">{persona.role}</p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className={`text-2xl font-bold leading-tight ${verdictColor(res.verdict)}`}>{res.verdict}</p>
          <p className={`text-lg font-mono font-bold ${verdictColor(res.verdict)}`}>
            {res.fake_prob != null ? res.fake_prob.toFixed(1) : '—'}
            <span className="text-xs font-normal text-slate-400">% fake</span>
          </p>
        </div>
      </div>

      <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden mb-5">
        <motion.div
          className={`h-full rounded-full ${verdictBar(res.verdict)}`}
          initial={{ width: 0 }}
          animate={{ width: `${res.fake_prob ?? 0}%` }}
          transition={{ duration: 1.3, ease: 'easeOut', delay: index * 0.1 + 0.2 }}
        />
      </div>

      <div className="rounded-2xl bg-black/40 border border-slate-800 p-4">
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare size={12} className={c.text} />
          <span className={`text-xs font-mono tracking-widest ${c.text}`}>{persona.shortName} ANALYSIS:</span>
          {loading && <TypingDots colorClass={c.dot} />}
        </div>
        {loading && <p className="text-slate-500 text-sm italic">Generating forensic analysis...</p>}
        {!loading && error && <p className="text-red-400/70 text-sm italic">⚠ {error}</p>}
        {!loading && !error && voice && (
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}
            className="text-slate-200 text-sm leading-relaxed"
          >
            "{voice}"
          </motion.p>
        )}
      </div>

      <div className="flex justify-end mt-3">
        {res.verdict === 'FAKE' && (
          <span className="flex items-center gap-1.5 text-xs text-red-400 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
            <AlertTriangle size={11} /> Manipulation Detected
          </span>
        )}
        {res.verdict === 'REAL' && (
          <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            <CheckCircle size={11} /> Authenticated
          </span>
        )}
        {res.verdict === 'UNCERTAIN' && (
          <span className="flex items-center gap-1.5 text-xs text-yellow-400 bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/20">
            <Zap size={11} /> Inconclusive
          </span>
        )}
      </div>
    </motion.div>
  );
}

// ─── Main Dashboard ────────────────────────────────────────────────────────
export default function UserDashboard() {
  const { user, logout } = useAuth();
  const { addNewCase, pollScanStatus, submitComplaint } = useApp(); // ← single, correct destructure

  // Upload / analysis state
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [file,           setFile]           = useState(null);
  const [preview,        setPreview]        = useState(null);
  const [analyzing,      setAnalyzing]      = useState(false);
  const [results,        setResults]        = useState(null);
  const [scanId,         setScanId]         = useState(null);
  const [verdict,        setVerdict]        = useState(null);
  const [error,          setError]          = useState('');

  // Voice state
  const [voices,       setVoices]       = useState({});
  const [voiceLoading, setVoiceLoading] = useState({});
  const [voiceErrors,  setVoiceErrors]  = useState({});

  // Complaint state
  const [showComplaint,    setShowComplaint]    = useState(false);
  const [complaintReason,  setComplaintReason]  = useState('');
  const [complaintDetails, setComplaintDetails] = useState('');
  const [complaintSending, setComplaintSending] = useState(false);
  const [complaintDone,    setComplaintDone]    = useState(false);
  const [complaintError,   setComplaintError]   = useState('');

  const pollRef = useRef(null);

  const handleUpload = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResults(null); setScanId(null); setVerdict(null);
    setVoices({}); setVoiceLoading({}); setVoiceErrors({});
    setError('');
  };

  const startPolling = (id) => {
    let attempts = 0;
    pollRef.current = setInterval(async () => {
      attempts++;
      try {
        const data = await pollScanStatus(id);
        if (data.status === 'REVIEWED') {
          clearInterval(pollRef.current);
          setVerdict(data);
        }
      } catch (_) {}
      if (attempts >= 60) clearInterval(pollRef.current);
    }, 5000);
  };

  const generateVoices = async (modelResults, id) => {
    const init = {};
    modelResults.forEach(r => { init[r.model_name] = true; });
    setVoiceLoading(init);
    await Promise.all(modelResults.map(async (res) => {
      try {
        const voice = await fetchModelVoice(res, id, modelResults);
        setVoices(prev => ({ ...prev, [res.model_name]: voice }));
      } catch (err) {
        setVoiceErrors(prev => ({ ...prev, [res.model_name]: err.message || 'Voice unavailable' }));
      } finally {
        setVoiceLoading(prev => ({ ...prev, [res.model_name]: false }));
      }
    }));
  };

  const analyzeMedia = async () => {
    if (!file) return;
    setAnalyzing(true);
    setError('');
    setVoices({}); setVoiceLoading({}); setVoiceErrors({});
    try {
      const data = await addNewCase(file);
      setResults(data.model_results);
      setScanId(data.scan_id);
      startPolling(data.scan_id);
      generateVoices(data.model_results, data.scan_id);
    } catch (err) {
      setError(err.message || 'Analysis failed.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleComplaintSubmit = async () => {
    if (!complaintReason) { setComplaintError('Please select a reason.'); return; }
    setComplaintSending(true);
    setComplaintError('');
    try {
      await submitComplaint(scanId, complaintReason, complaintDetails);
      setComplaintDone(true);
    } catch (err) {
      setComplaintError(err.message || 'Failed to submit complaint.');
    } finally {
      setComplaintSending(false);
    }
  };

  const openComplaint = () => {
    setShowComplaint(true);
    setComplaintDone(false);
    setComplaintReason('');
    setComplaintDetails('');
    setComplaintError('');
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(#22d3ee_0.8px,transparent_1px)] bg-[length:60px_60px] opacity-10 animate-grid" />
      <div className="absolute inset-0 bg-gradient-to-br from-black via-slate-950 to-black" />
      <motion.div
        animate={{ x: [0, 60, -40, 0], y: [0, -50, 70, 0] }}
        transition={{ duration: 18, repeat: Infinity }}
        className="absolute top-20 left-40 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ x: [0, -70, 50, 0], y: [0, 60, -40, 0] }}
        transition={{ duration: 22, repeat: Infinity, delay: 5 }}
        className="absolute bottom-32 right-32 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-3xl"
      />

      <div className="relative z-10 max-w-7xl mx-auto p-8">

        {/* Header */}
        <header className="flex justify-between items-center mb-12 flex-wrap gap-4">
          <h1 className="text-5xl font-bold tracking-tighter">
            User<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Dashboard</span>
          </h1>
          <div className="flex items-center gap-3 flex-wrap">
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
              onClick={() => setShowHowItWorks(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-medium transition-all border border-purple-500/30 hover:bg-purple-500/15 hover:border-purple-400/50"
              style={{ color: '#c084fc' }}
            >
              <span>💡</span> How It Works
            </motion.button>
            <div className="glass px-6 py-3 rounded-2xl text-sm flex items-center gap-2 border border-cyan-400/20">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              Welcome, <span className="text-cyan-400 font-medium">{user?.name || 'Operator'}</span>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }} onClick={logout}
              className="flex items-center gap-2 px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-2xl transition-all border border-red-500/20"
            >
              <LogOut size={18} /> DISCONNECT
            </motion.button>
          </div>
        </header>

        {/* How It Works Modal */}
        <AnimatePresence>
          {showHowItWorks && (
            <>
              <motion.div
                key="hiw-backdrop"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setShowHowItWorks(false)}
                style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 2000 }}
              />
              <motion.div
                key="hiw-modal"
                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 20 }}
                transition={{ type: 'spring', damping: 26, stiffness: 220 }}
                style={{
                  position: 'fixed', top: '50%', left: '50%',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 2100, width: '90%', maxWidth: '620px',
                  maxHeight: '85vh', overflowY: 'auto',
                  background: 'rgba(2,6,23,0.97)',
                  border: '1px solid rgba(34,211,238,0.2)',
                  borderRadius: '24px', padding: '36px 32px',
                }}
              >
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, #22d3ee, #a855f7)', borderRadius: '24px 24px 0 0' }} />
                <button
                  onClick={() => setShowHowItWorks(false)}
                  style={{ position: 'absolute', top: '16px', right: '16px', width: '30px', height: '30px', borderRadius: '8px', border: '1px solid rgba(148,163,184,0.15)', background: 'rgba(148,163,184,0.05)', color: '#64748b', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >✕</button>

                <div style={{ marginBottom: '24px' }}>
                  <div style={{ fontSize: '10px', letterSpacing: '0.2em', color: '#334155', textTransform: 'uppercase', marginBottom: '8px' }}>Guide</div>
                  <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em', margin: 0 }}>
                    How Reality<span style={{ color: '#22d3ee' }}>Check</span> Works
                  </h2>
                  <p style={{ fontSize: '13px', color: '#475569', marginTop: '6px', lineHeight: 1.6 }}>
                    A six-stage forensic pipeline that analyses media authenticity end-to-end.
                  </p>
                </div>

                {[
                  { icon: '📤', step: '01', title: 'Upload Media',           color: '#22d3ee', desc: 'Drop any image or video file into the terminal. Supported formats: JPG, PNG, MP4, MOV. Your file is sent securely to the analysis backend.' },
                  { icon: '⚙️', step: '02', title: 'Preprocessing',          color: '#a855f7', desc: 'Frames are extracted and normalised. For video, key frames are sampled at regular intervals to ensure comprehensive coverage.' },
                  { icon: '🧠', step: '03', title: 'Multi-Model AI Analysis', color: '#a855f7', desc: 'Three specialist models run in parallel — SigLIP checks semantic coherence, Xception detects facial splicing, and EfficientNet hunts GAN/diffusion fingerprints.' },
                  { icon: '📊', step: '04', title: 'Cross-Validation',        color: '#10b981', desc: 'Model verdicts are weighted and cross-referenced. Disagreements between models flag edge cases for deeper scrutiny.' },
                  { icon: '🎯', step: '05', title: 'Authenticity Score',      color: '#fbbf24', desc: 'A final confidence percentage is computed with a REAL / FAKE / UNCERTAIN verdict, alongside per-signal breakdowns you can inspect.' },
                  { icon: '👨‍⚖️', step: '06', title: 'Expert Review',          color: '#f87171', desc: 'For borderline or high-stakes cases, a human expert can review the AI findings and issue a binding verdict.' },
                ].map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                    style={{ display: 'flex', gap: '16px', marginBottom: '16px', padding: '16px', borderRadius: '14px', background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(148,163,184,0.08)' }}
                  >
                    <div style={{ flexShrink: 0, textAlign: 'center' }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: `${s.color}18`, border: `1px solid ${s.color}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', marginBottom: '4px' }}>{s.icon}</div>
                      <div style={{ fontSize: '9px', fontWeight: 700, color: s.color, letterSpacing: '0.1em' }}>{s.step}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#e2e8f0', marginBottom: '4px' }}>{s.title}</div>
                      <div style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.7 }}>{s.desc}</div>
                    </div>
                  </motion.div>
                ))}

                <div style={{ marginTop: '8px', padding: '14px 16px', background: 'rgba(34,211,238,0.04)', border: '1px solid rgba(34,211,238,0.12)', borderRadius: '12px', textAlign: 'center' }}>
                  <p style={{ fontSize: '12px', color: '#475569', margin: 0 }}>
                    Ready?{' '}
                    <span style={{ color: '#22d3ee', cursor: 'pointer', fontWeight: 600 }} onClick={() => setShowHowItWorks(false)}>
                      Drop a file in the terminal above ↑
                    </span>
                  </p>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

       <ComplaintModal
  show={showComplaint}
  onClose={() => setShowComplaint(false)}
  scanId={scanId}
  onSubmit={handleComplaintSubmit}
  sending={complaintSending}
  done={complaintDone}
  error={complaintError}
  reason={complaintReason}
  setReason={setComplaintReason}
  details={complaintDetails}
  setDetails={setComplaintDetails}
/>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* Upload Terminal */}
          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            className="glass rounded-3xl p-10 neon-border h-fit relative overflow-hidden"
          >
            <h2 className="text-3xl font-bold mb-8">MEDIA VERIFICATION TERMINAL</h2>

            <label className="border-2 border-dashed border-slate-600 hover:border-cyan-400 transition-all rounded-3xl p-16 flex flex-col items-center cursor-pointer group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-cyan-400/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all" />
              <Upload className="w-16 h-16 mb-4 text-cyan-400 group-hover:scale-110 transition-transform" />
              <p className="text-xl mb-2 tracking-wider">DROP MEDIA HERE</p>
              <p className="text-slate-400 text-center text-sm">Image • Video • JPG, PNG, MP4, MOV</p>
              <input type="file" className="hidden" onChange={handleUpload} accept="image/*,video/*" />
            </label>

            {error && (
              <div className="mt-4 px-5 py-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>
            )}

            {preview && (
              <div className="mt-8">
                <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-black">
                  <img src={preview} className="w-full max-h-72 object-contain" alt="preview" />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={analyzeMedia} disabled={analyzing}
                  className="mt-6 w-full py-5 bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-500 rounded-2xl font-bold text-lg disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl shadow-cyan-500/30"
                >
                  {analyzing ? (
                    <span className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full" />
                      NEURAL ANALYSIS IN PROGRESS...
                    </span>
                  ) : (
                    <>ACTIVATE ANALYSIS PROTOCOL <Play size={20} /></>
                  )}
                </motion.button>
              </div>
            )}

            {!results && (
              <div className="mt-8 space-y-2.5">
                <p className="text-xs text-slate-500 font-mono tracking-widest mb-3">ACTIVE DETECTION MODELS:</p>
                {Object.values(MODEL_PERSONAS).map(p => {
                  const c = COLOR_MAP[p.color] || COLOR_MAP.cyan;
                  return (
                    <div key={p.shortName} className="flex items-center gap-3 text-xs">
                      <span className="text-base">{p.icon}</span>
                      <span className={`font-mono ${c.text}`}>{p.shortName}</span>
                      <span className="text-slate-700">—</span>
                      <span className="text-slate-500">{p.specialty}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* Results Panel */}
          <AnimatePresence>
            {results && (
              <motion.div
                initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Verdict card */}
                <div className="glass rounded-3xl p-8 neon-border">
                  {verdict ? (
                    <>
                      <p className="text-xs font-mono text-slate-400 tracking-widest mb-2">FINAL VERDICT</p>
                      <p className={`text-5xl font-bold ${verdictColor(verdict.final_verdict)}`}>{verdict.final_verdict}</p>
                      <p className="text-slate-400 text-sm mt-2">
                        Confidence score: <span className="text-white font-mono">{verdict.final_confidence?.toFixed(1)}%</span>
                      </p>
                    </>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Clock className="text-amber-400 animate-pulse" size={20} />
                      <div>
                        <StatusBadge status="Awaiting Expert Review" />
                        <p className="text-slate-400 text-xs font-mono mt-2 tracking-widest">
                          CASE #{scanId} — POLLING FOR EXPERT VERDICT...
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Status banner */}
                <div className="text-center py-3 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-2xl border border-amber-500/30">
                  <p className="text-amber-400 font-mono tracking-widest text-xs">
                    PRELIMINARY AI SCAN COMPLETE — AWAITING HUMAN OVERRIDE
                  </p>
                </div>

                {/* Complaint button */}
                <div className="flex justify-end">
                  <motion.button
                    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                    onClick={openComplaint}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-medium border border-amber-500/30 hover:bg-amber-500/15 hover:border-amber-400/50 transition-all"
                    style={{ color: '#fbbf24' }}
                  >
                    <FileWarning size={15} /> File a Complaint
                  </motion.button>
                </div>

                {/* Model findings label */}
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/60 border border-slate-700/60">
                  <MessageSquare size={13} className="text-cyan-400" />
                  <p className="text-slate-400 text-xs font-mono tracking-wider">
                    EACH MODEL EXPLAINS ITS OWN FINDINGS BELOW
                  </p>
                </div>

                {/* Model voice cards */}
                <div className="space-y-4">
                  {results.map((res, i) => (
                    <ModelVoiceCard
                      key={res.model_name}
                      res={res}
                      index={i}
                      voice={voices[res.model_name]}
                      loading={voiceLoading[res.model_name] ?? false}
                      error={voiceErrors[res.model_name]}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
      <ScrollToTopButton />
    </div>
  );
}