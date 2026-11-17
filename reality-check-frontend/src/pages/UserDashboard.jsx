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
    role: 'Vision transformer, public real/fake checkpoint',
    color: 'cyan',
    icon: '',
    specialty: 'vision transformer fine-tuned on real vs. fake images',
  },
  'EfficientNet-B0 (Custom)': {
    shortName: 'EfficientNet',
    role: 'Convolutional network, custom-trained',
    color: 'cyan',
    icon: '',
    specialty: 'convolutional network trained on real vs. fake images',
  },
  'AI-vs-Human (SigLIP)': {
    shortName: 'AI-vs-Human',
    role: 'Vision transformer, trained on AI-generated vs. human images',
    color: 'cyan',
    icon: '',
    specialty: 'SigLIP classifier fine-tuned on 60k AI-generated and 60k human images',
  },
  'Expert-trained (from reviews)': {
    shortName: 'Expert-trained',
    role: 'Learned from files your experts reviewed',
    color: 'cyan',
    icon: '',
    specialty: 'classifier trained on expert verdicts and their reasons',
  },
};

const COLOR_MAP = {
  violet: { border: 'border-violet-500/40', shadow: 'shadow-violet-500/10', text: 'text-violet-400', dot: 'bg-violet-400' },
  rose:   { border: 'border-rose-500/40',   shadow: 'shadow-rose-500/10',   text: 'text-rose-400',   dot: 'bg-rose-400' },
  amber:  { border: 'border-amber-500/40',  shadow: 'shadow-amber-500/10',  text: 'text-amber-400',  dot: 'bg-amber-400' },
  cyan:   { border: 'border-cyan-500/40',   shadow: 'shadow-cyan-500/10',   text: 'text-cyan-400',   dot: 'bg-cyan-400' },
};

// ─── Call YOUR Django backend proxy ────────────────────────────────────────
async function fetchModelVoice(modelResult, scanId) {
  const res = await fetch('/api/model-voice/', {
    method:      'POST',
    credentials: 'include',
    headers:     { 'Content-Type': 'application/json' },
    body:        JSON.stringify({ scan_id: scanId, model_name: modelResult.model_name }),
  });

  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error(`Server error (status ${res.status}) - check Django logs`);
  }

  if (!res.ok) throw new Error(data.error || `Explanation failed (${res.status})`);
  return data;   // { voice, heatmap }
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
    shortName: res.model_name, role: 'Detector', icon: '', color: 'cyan',
  };
  const c = COLOR_MAP[persona.color] || COLOR_MAP.cyan;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`rounded-3xl p-6 border ${c.border} shadow-lg ${c.shadow} bg-slate-950/70 band ${res.verdict === 'FAKE' ? 'band-fake' : res.verdict === 'REAL' ? 'band-real' : res.verdict === 'UNCERTAIN' ? 'band-unsure' : ''}`}
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
          <span className={`text-xs font-mono tracking-widest ${c.text}`}>{persona.shortName} SCORE DETAILS:</span>
          {loading && <TypingDots colorClass={c.dot} />}
        </div>
        {loading && <p className="text-slate-500 text-sm italic">Computing heatmap...</p>}
        {!loading && error && <p className="text-red-400/70 text-sm italic">{error}</p>}
        {!loading && !error && voice && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
            {voice.heatmap && (
              <img
                src={voice.heatmap}
                alt={`Regions that influenced the ${persona.shortName} score`}
                className="w-full max-h-64 object-contain rounded-xl border border-slate-800 mb-3 bg-black"
              />
            )}
            <p className="text-slate-200 text-sm leading-relaxed">{voice.voice}</p>
          </motion.div>
        )}
      </div>

      <div className="flex justify-end mt-3">
        {res.verdict === 'FAKE' && (
          <span className="flex items-center gap-1.5 text-xs text-red-400 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
            <AlertTriangle size={11} /> Scored likely fake
          </span>
        )}
        {res.verdict === 'REAL' && (
          <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            <CheckCircle size={11} /> Scored likely real
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
  const { addNewCase, pollScanStatus, submitComplaint } = useApp(); // single, correct destructure

  // Upload / analysis state
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [file,           setFile]           = useState(null);
  const [preview,        setPreview]        = useState(null);
  const [analyzing,      setAnalyzing]      = useState(false);
  const [results,        setResults]        = useState(null);
  const [scanId,         setScanId]         = useState(null);
  const [verdict,        setVerdict]        = useState(null);
  const [error,          setError]          = useState('');
  const [aiSummary,      setAiSummary]      = useState(null);

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
    setResults(null); setScanId(null); setVerdict(null); setAiSummary(null);
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
      setAiSummary({ label: data.ai_label, prob: data.ensemble?.fake_prob, method: data.ensemble?.method, provenance: data.provenance });
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
      <div className="absolute inset-0   opacity-10 animate-grid" />
      <div className="absolute inset-0 bg-black " />
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
            Check a file
          </h1>
          <div className="flex items-center gap-3 flex-wrap">
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
              onClick={() => setShowHowItWorks(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-medium transition-all border border-purple-500/30 hover:bg-purple-500/15 hover:border-purple-400/50"
              style={{ color: '#7A2AB8' }}
            >
              <span></span> How It Works
            </motion.button>
            <div className="glass px-6 py-3 rounded-2xl text-sm flex items-center gap-2 border border-cyan-400/20">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              Welcome, <span className="text-cyan-400 font-medium">{user?.name || 'Operator'}</span>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }} onClick={logout}
              className="flex items-center gap-2 px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-2xl transition-all border border-red-500/20"
            >
              <LogOut size={18} /> Sign out
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
                style={{ position: 'fixed', inset: 0, background: 'rgba(236,235,241,0.7)', backdropFilter: 'blur(8px)', zIndex: 2000 }}
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
                  background: 'rgba(255,255,255,0.97)',
                  border: '1px solid rgba(122,42,184,0.2)',
                  borderRadius: '24px', padding: '36px 32px',
                }}
              >
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: '#7A2AB8', borderRadius: '24px 24px 0 0' }} />
                <button
                  onClick={() => setShowHowItWorks(false)}
                  style={{ position: 'absolute', top: '16px', right: '16px', width: '30px', height: '30px', borderRadius: '8px', border: '1px solid rgba(23,19,31,0.15)', background: 'rgba(23,19,31,0.05)', color: '#777283', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >×</button>

                <div style={{ marginBottom: '24px' }}>
                  <div style={{ fontSize: '10px', letterSpacing: '0.2em', color: '#CDCAD5', textTransform: 'uppercase', marginBottom: '8px' }}>Guide</div>
                  <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#17131F', letterSpacing: '-0.02em', margin: 0 }}>
                    How Reality<span style={{ color: '#7A2AB8' }}>Check</span> Works
                  </h2>
                  <p style={{ fontSize: '13px', color: '#777283', marginTop: '6px', lineHeight: 1.6 }}>
                    A six-stage forensic pipeline that analyses media authenticity end-to-end.
                  </p>
                </div>

                {[
                  { icon: '', step: '01', title: 'Upload Media',           color: '#7A2AB8', desc: 'Drop any image or video file into the terminal. Supported formats: JPG, PNG, MP4, MOV. Your file is sent securely to the analysis backend.' },
                  { icon: '', step: '02', title: 'Preprocessing',          color: '#7A2AB8', desc: 'Frames are extracted and normalised. For video, key frames are sampled at regular intervals to ensure comprehensive coverage.' },
                  { icon: '', step: '03', title: 'Multi-Model AI Analysis', color: '#7A2AB8', desc: 'Three detection models (SigLIP, EfficientNet-B0 and AI-vs-Human) each give the file a fake-probability score. The scores are shown separately.' },
                  { icon: '', step: '04', title: 'Cross-Validation',        color: '#196F42', desc: 'The three scores are averaged. When the models disagree, the result is marked low confidence.' },
                  { icon: '', step: '05', title: 'Authenticity Score',      color: '#8A5C00', desc: 'The average gives a provisional REAL / FAKE / UNCERTAIN label, with a heatmap per model showing where it looked.' },
                  { icon: '', step: '06', title: 'Expert Review',          color: '#B9281B', desc: 'A human expert reviews the scan and makes the final decision. The AI label is provisional until then.' },
                ].map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                    style={{ display: 'flex', gap: '16px', marginBottom: '16px', padding: '16px', borderRadius: '14px', background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(23,19,31,0.08)' }}
                  >
                    <div style={{ flexShrink: 0, textAlign: 'center' }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: `${s.color}18`, border: `1px solid ${s.color}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', marginBottom: '4px' }}>{s.icon}</div>
                      <div style={{ fontSize: '9px', fontWeight: 700, color: s.color, letterSpacing: '0.1em' }}>{s.step}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#17131F', marginBottom: '4px' }}>{s.title}</div>
                      <div style={{ fontSize: '12px', color: '#777283', lineHeight: 1.7 }}>{s.desc}</div>
                    </div>
                  </motion.div>
                ))}

                <div style={{ marginTop: '8px', padding: '14px 16px', background: 'rgba(122,42,184,0.04)', border: '1px solid rgba(122,42,184,0.12)', borderRadius: '12px', textAlign: 'center' }}>
                  <p style={{ fontSize: '12px', color: '#777283', margin: 0 }}>
                    Ready?{' '}
                    <span style={{ color: '#7A2AB8', cursor: 'pointer', fontWeight: 600 }} onClick={() => setShowHowItWorks(false)}>
                      Drop a file in the terminal above 
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
            <h2 className="text-3xl font-bold mb-8">Upload</h2>

            <label className="border-2 border-dashed border-slate-600 hover:border-cyan-400 transition-all rounded-3xl p-16 flex flex-col items-center cursor-pointer group relative overflow-hidden">
              <div className="absolute inset-0 bg-cyan-400/10 opacity-0 group-hover:opacity-100 transition-all" />
              <Upload className="w-16 h-16 mb-4 text-cyan-400 group-hover:scale-110 transition-transform" />
              <p className="text-xl mb-2 tracking-wider">Drop a file here</p>
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
                  className="mt-6 w-full py-5 bg-ink text-print rounded-2xl font-bold text-lg disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl shadow-cyan-500/30"
                >
                  {analyzing ? (
                    <span className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full" />
                      Checking...
                    </span>
                  ) : (
                    <>Check this file <Play size={20} /></>
                  )}
                </motion.button>
              </div>
            )}

            {!results && (
              <div className="mt-8 space-y-2.5">
                <p className="text-xs text-slate-500 font-mono tracking-widest mb-3">Detectors that will score your file</p>
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
                      <p className="text-xs font-mono text-slate-400 tracking-widest mb-2">Final verdict</p>
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
                          CASE #{scanId} — waiting for the expert verdict
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Status banner */}
                <div className="text-center py-3 bg-amber-500/10 rounded-2xl border border-amber-500/30">
                  <p className="text-amber-400 font-mono tracking-widest text-xs">
                    AI check done. Waiting for an expert to review.
                  </p>
                </div>

                {/* AI summary */}
                {aiSummary && (
                  <div className="glass rounded-3xl p-6 border border-slate-700/60 space-y-3">
                    <p className="text-xs font-mono text-slate-400 tracking-widest">AI label before expert review</p>
                    <p className={`text-3xl font-bold ${verdictColor(aiSummary.label)}`}>{aiSummary.label || '-'}</p>
                    {aiSummary.prob != null && (
                      <p className="text-slate-400 text-sm">
                        Detectors' combined fake score: <span className="text-white font-mono">{aiSummary.prob.toFixed(1)}%</span>
                        {' '}({aiSummary.method === 'calibrated' ? 'weighted by measured accuracy' : 'average of the models'})
                      </p>
                    )}
                    {aiSummary.provenance && aiSummary.provenance.note && (
                      <p className={`text-sm rounded-xl px-4 py-3 border ${aiSummary.provenance.ai_generated
                        ? 'text-red-300 bg-red-500/10 border-red-500/30'
                        : 'text-slate-300 bg-slate-800/40 border-slate-700'}`}>
                        {aiSummary.provenance.note}
                      </p>
                    )}
                  </div>
                )}

                {/* Complaint button */}
                <div className="flex justify-end">
                  <motion.button
                    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                    onClick={openComplaint}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-medium border border-amber-500/30 hover:bg-amber-500/15 hover:border-amber-400/50 transition-all"
                    style={{ color: '#8A5C00' }}
                  >
                    <FileWarning size={15} /> File a Complaint
                  </motion.button>
                </div>

                {/* Model findings label */}
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/60 border border-slate-700/60">
                  <MessageSquare size={13} className="text-cyan-400" />
                  <p className="text-slate-400 text-xs font-mono tracking-wider">
                    Scores and heatmaps from each detector
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