import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Play, LogOut, Shield, Zap, Clock, MessageSquare, AlertTriangle, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import ScrollToTopButton from '../components/ScrollToTopButton';

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

// ─── Call YOUR Django backend proxy (avoids CORS entirely) ─────────────────
// Backend reads image from disk using scan_id — no base64 in the request body.
// This eliminates "Unexpected end of JSON input" from oversized image payloads.
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

  // Metadata-only payload — image bytes never cross the wire from browser
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

// ─── Typing indicator ─────────────────────────────────────────────────────
function TypingDots({ colorClass }) {
  return (
    <span className="inline-flex items-center gap-1 ml-1">
      {[0, 1, 2].map(i => (
        <motion.span key={i} className={`inline-block w-1.5 h-1.5 rounded-full ${colorClass}`}
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
      {/* Top row */}
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

      {/* Probability bar */}
      <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden mb-5">
        <motion.div
          className={`h-full rounded-full ${verdictBar(res.verdict)}`}
          initial={{ width: 0 }}
          animate={{ width: `${res.fake_prob ?? 0}%` }}
          transition={{ duration: 1.3, ease: 'easeOut', delay: index * 0.1 + 0.2 }}
        />
      </div>

      {/* Voice box */}
      <div className="rounded-2xl bg-black/40 border border-slate-800 p-4">
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare size={12} className={c.text} />
          <span className={`text-xs font-mono tracking-widest ${c.text}`}>{persona.shortName} ANALYSIS:</span>
          {loading && <TypingDots colorClass={c.dot} />}
        </div>

        {loading && (
          <p className="text-slate-500 text-sm italic">Generating forensic analysis...</p>
        )}

        {!loading && error && (
          <p className="text-red-400/70 text-sm italic">⚠ {error}</p>
        )}

        {!loading && !error && voice && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-slate-200 text-sm leading-relaxed"
          >
            "{voice}"
          </motion.p>
        )}
      </div>

      {/* Verdict badge */}
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
  const { addNewCase, pollScanStatus } = useApp();
  const { user, logout } = useAuth();

  const [file,      setFile]      = useState(null);
  const [preview,   setPreview]   = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [results,   setResults]   = useState(null);
  const [scanId,    setScanId]    = useState(null);
  const [verdict,   setVerdict]   = useState(null);
  const [error,     setError]     = useState('');

  // Per-model voice state
  const [voices,        setVoices]        = useState({});  // { model_name: string }
  const [voiceLoading,  setVoiceLoading]  = useState({});  // { model_name: bool }
  const [voiceErrors,   setVoiceErrors]   = useState({});  // { model_name: string }

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

  const generateVoices = async (modelResults, scanId) => {
    // Mark all as loading
    const init = {};
    modelResults.forEach(r => { init[r.model_name] = true; });
    setVoiceLoading(init);

    // Fire all 3 in parallel — backend loads image from disk using scanId
    await Promise.all(modelResults.map(async (res) => {
      try {
        const voice = await fetchModelVoice(res, scanId, modelResults);
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
      // Fire voice generation without blocking UI
      generateVoices(data.model_results, data.scan_id);
    } catch (err) {
      setError(err.message || 'Analysis failed.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Backgrounds */}
      <div className="absolute inset-0 bg-[radial-gradient(#22d3ee_0.8px,transparent_1px)] bg-[length:60px_60px] opacity-10 animate-grid" />
      <div className="absolute inset-0 bg-gradient-to-br from-black via-slate-950 to-black" />
      <motion.div animate={{ x: [0,60,-40,0], y: [0,-50,70,0] }} transition={{ duration: 18, repeat: Infinity }}
        className="absolute top-20 left-40 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-3xl" />
      <motion.div animate={{ x: [0,-70,50,0], y: [0,60,-40,0] }} transition={{ duration: 22, repeat: Infinity, delay: 5 }}
        className="absolute bottom-32 right-32 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto p-8">

        {/* Header */}
        <header className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-4">
            <Shield className="w-11 h-11 text-cyan-400" />
            <h1 className="text-5xl font-bold tracking-tighter">
              REALITY<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">CHECK</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="glass px-6 py-3 rounded-2xl text-sm flex items-center gap-2 border border-cyan-400/20">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              Welcome, <span className="text-cyan-400 font-medium">{user?.name || 'Operator'}</span>
            </div>
            <motion.button whileHover={{ scale: 1.05 }} onClick={logout}
              className="flex items-center gap-2 px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-2xl transition-all border border-red-500/20">
              <LogOut size={18} /> DISCONNECT
            </motion.button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* ── Upload Terminal ── */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            className="glass rounded-3xl p-10 neon-border h-fit relative overflow-hidden">
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
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={analyzeMedia} disabled={analyzing}
                  className="mt-6 w-full py-5 bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-500 rounded-2xl font-bold text-lg disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl shadow-cyan-500/30">
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

            {/* Model legend */}
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

          {/* ── Results Panel ── */}
          <AnimatePresence>
            {results && (
              <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="space-y-6">

                {/* Final verdict */}
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

                <div className="text-center py-3 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-2xl border border-amber-500/30">
                  <p className="text-amber-400 font-mono tracking-widest text-xs">
                    PRELIMINARY AI SCAN COMPLETE — AWAITING HUMAN OVERRIDE
                  </p>
                </div>

                {/* Voice section header */}
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