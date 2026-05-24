import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Play, LogOut, Shield, Zap, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import ScrollToTopButton from '../components/ScrollToTopButton';

export default function UserDashboard() {
  const { addNewCase, pollScanStatus } = useApp();
  const { user, logout } = useAuth();

  const [file,        setFile]        = useState(null);
  const [preview,     setPreview]     = useState(null);
  const [fileName,    setFileName]    = useState('');
  const [analyzing,   setAnalyzing]   = useState(false);
  const [results,     setResults]     = useState(null);
  const [scanId,      setScanId]      = useState(null);
  const [verdict,     setVerdict]     = useState(null);   // final after polling
  const [polling,     setPolling]     = useState(false);
  const [error,       setError]       = useState('');
  const pollRef = useRef(null);

  const handleUpload = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setFileName(f.name);
    setPreview(URL.createObjectURL(f));
    setResults(null);
    setScanId(null);
    setVerdict(null);
    setError('');
  };

  const startPolling = (id) => {
    setPolling(true);
    let attempts = 0;
    pollRef.current = setInterval(async () => {
      attempts++;
      try {
        const data = await pollScanStatus(id);
        if (data.status === 'REVIEWED') {
          clearInterval(pollRef.current);
          setPolling(false);
          setVerdict(data);
        }
      } catch (_) {}
      if (attempts >= 60) {   // stop after 5 minutes
        clearInterval(pollRef.current);
        setPolling(false);
      }
    }, 5000);
  };

  const analyzeMedia = async () => {
    if (!file) return;
    setAnalyzing(true);
    setError('');
    try {
      const data = await addNewCase(file);
      setResults(data.model_results);
      setScanId(data.scan_id);
      startPolling(data.scan_id);
    } catch (err) {
      setError(err.message || 'Analysis failed.');
    } finally {
      setAnalyzing(false);
    }
  };

  const verdictColor = (v) => {
    if (!v) return 'text-slate-400';
    if (v === 'FAKE')      return 'text-red-400';
    if (v === 'REAL')      return 'text-emerald-400';
    if (v === 'UNCERTAIN') return 'text-yellow-400';
    return 'text-slate-400';
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(#22d3ee_0.8px,transparent_1px)] bg-[length:60px_60px] opacity-10 animate-grid"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-black via-slate-950 to-black"></div>

      <motion.div animate={{ x:[0,60,-40,0], y:[0,-50,70,0] }} transition={{ duration:18, repeat:Infinity }}
        className="absolute top-20 left-40 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-3xl" />
      <motion.div animate={{ x:[0,-70,50,0], y:[0,60,-40,0] }} transition={{ duration:22, repeat:Infinity, delay:5 }}
        className="absolute bottom-32 right-32 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto p-8">
        <header className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-4">
            <Shield className="w-11 h-11 text-cyan-400" />
            <h1 className="text-5xl font-bold tracking-tighter">
              REALITY<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">CHECK</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="glass px-6 py-3 rounded-2xl text-sm flex items-center gap-2 border border-cyan-400/20">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              Welcome, <span className="text-cyan-400 font-medium">{user?.name || 'Operator'}</span>
            </div>
            <motion.button whileHover={{ scale: 1.05 }} onClick={logout}
              className="flex items-center gap-2 px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-2xl transition-all border border-red-500/20">
              <LogOut size={18} /> DISCONNECT
            </motion.button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Upload Terminal */}
          <motion.div initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }}
            className="glass rounded-3xl p-10 neon-border h-fit relative overflow-hidden">
            <div className="flex items-center gap-3 mb-8">
              <Zap className="text-yellow-400" />
              <h2 className="text-3xl font-bold">MEDIA VERIFICATION TERMINAL</h2>
            </div>

            <label className="border-2 border-dashed border-slate-600 hover:border-cyan-400 transition-all rounded-3xl p-16 flex flex-col items-center cursor-pointer group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-cyan-400/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all"></div>
              <Upload className="w-16 h-16 mb-4 text-cyan-400 group-hover:scale-110 transition-transform" />
              <p className="text-xl mb-2 tracking-wider">DROP MEDIA HERE</p>
              <p className="text-slate-400 text-center text-sm">Image • Video • JPG, PNG, MP4, MOV</p>
              <input type="file" className="hidden" onChange={handleUpload} accept="image/*,video/*" />
            </label>

            {error && (
              <div className="mt-4 px-5 py-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}

            {preview && (
              <div className="mt-8">
                <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-black">
                  <img src={preview} className="w-full max-h-72 object-contain" alt="preview" />
                </div>
                <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}
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
          </motion.div>

          {/* Results Panel */}
          <AnimatePresence>
            {results && (
              <motion.div initial={{ opacity:0, y:40 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                className="space-y-6">

                {/* Final Verdict Card */}
                <div className="glass rounded-3xl p-8 neon-border">
                  {verdict ? (
                    <>
                      <p className="text-xs font-mono text-slate-400 tracking-widest mb-2">FINAL VERDICT</p>
                      <p className={`text-5xl font-bold ${verdictColor(verdict.final_verdict)}`}>
                        {verdict.final_verdict}
                      </p>
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

                <div className="text-center py-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-2xl border border-amber-500/30">
                  <p className="text-amber-400 font-mono tracking-widest text-xs">
                    PRELIMINARY AI SCAN COMPLETE — AWAITING HUMAN OVERRIDE
                  </p>
                </div>

                {/* Per-model results */}
                <div className="space-y-4">
                  {results.map((res, i) => (
                    <motion.div key={i} initial={{ opacity:0, x:-40 }} animate={{ opacity:1, x:0 }}
                      transition={{ delay: i * 0.1 }}
                      className="glass rounded-3xl p-6 neon-border hover:border-cyan-400/50 transition-all group">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-cyan-400 font-mono text-xs tracking-[2px]">{res.model_name}</p>
                          <p className={`text-3xl font-bold mt-1 ${verdictColor(res.verdict)}`}>
                            {res.verdict}
                          </p>
                        </div>
                        <div className={`text-5xl font-mono font-bold ${verdictColor(res.verdict)}`}>
                          {res.fake_prob != null ? res.fake_prob.toFixed(1) : '—'}
                          <span className="text-xl align-super font-normal">%</span>
                        </div>
                      </div>
                      <div className="mt-3 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-1000
                          ${res.verdict === 'FAKE' ? 'bg-red-500' : res.verdict === 'REAL' ? 'bg-emerald-500' : 'bg-yellow-500'}`}
                          style={{ width: `${res.fake_prob ?? 0}%` }} />
                      </div>
                    </motion.div>
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