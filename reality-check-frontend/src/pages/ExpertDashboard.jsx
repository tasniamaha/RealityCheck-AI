import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, CheckCircle, AlertTriangle, HelpCircle, LogOut, RefreshCw, X, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import ScrollToTopButton from '../components/ScrollToTopButton';

export default function ExpertDashboard() {
  const { pendingCases, reviewedCases, fetchExpertQueue, submitVerdict } = useApp();
  const { user, logout } = useAuth();
  const [selectedCase,  setSelectedCase]  = useState(null);
  const [confidence,    setConfidence]    = useState(3);
  const [reasoning,     setReasoning]     = useState('');
  const [submitting,    setSubmitting]    = useState(false);
  const [error,         setError]         = useState('');

  useEffect(() => { fetchExpertQueue(); }, [fetchExpertQueue]);

  const handleVerdict = async (verdict) => {
    setSubmitting(true);
    setError('');
    try {
      await submitVerdict(selectedCase.id, verdict, confidence, reasoning);
      setSelectedCase(null);
      setConfidence(3);
      setReasoning('');
      // Refresh the queue to show updated cases
      fetchExpertQueue();
    } catch (err) {
      setError(err.message || 'Submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(#22d3ee_0.8px,transparent_1px)] bg-[length:60px_60px] opacity-10"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-black via-slate-950 to-black"></div>

      <div className="relative z-10 p-8 max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-4">
            <Shield className="w-10 h-10 text-cyan-400" />
            <h1 className="text-5xl font-bold tracking-tighter">
              EXPERT REVIEW<span className="text-cyan-400"> PORTAL</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="glass px-6 py-3 rounded-2xl text-sm flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              {user?.name || 'Expert'}
            </div>
            <motion.button whileHover={{ scale:1.05 }}
              onClick={fetchExpertQueue}
              className="flex items-center gap-2 px-4 py-3 glass rounded-2xl text-cyan-400 border border-cyan-400/20 hover:border-cyan-400/50 transition-all">
              <RefreshCw size={16} /> Refresh
            </motion.button>
            <motion.button whileHover={{ scale:1.05 }} onClick={logout}
              className="flex items-center gap-2 px-5 py-3 bg-red-500/10 text-red-400 rounded-2xl border border-red-500/20">
              <LogOut size={16} /> DISCONNECT
            </motion.button>
          </div>
        </header>

        <h2 className="text-2xl font-semibold mb-8 text-slate-300">
          Pending Cases —{' '}
          <span className="text-cyan-400">{pendingCases.length}</span> awaiting review
        </h2>

        {pendingCases.length === 0 ? (
          <div className="glass rounded-3xl p-20 text-center">
            <p className="text-2xl text-slate-400">No pending cases at this moment.</p>
            <p className="text-slate-500 mt-2">New submissions will appear here automatically.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingCases.map((c) => (
              <motion.div key={c.id} whileHover={{ scale:1.03, y:-4 }}
                transition={{ type:'spring', stiffness:300 }}
                className="glass rounded-3xl p-6 cursor-pointer neon-border group overflow-hidden"
                onClick={() => { setSelectedCase(c); setError(''); }}>
                <StatusBadge status={c.status} />
                <div className="relative mt-4 mb-4 rounded-2xl overflow-hidden border border-slate-700 bg-black h-48 flex items-center justify-center">
                  {c.media_url ? (
                    c.media_type === 'video' ? (
                      <video 
                        src={c.media_url} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        controls
                        muted
                      />
                    ) : (
                      <img 
                        src={c.media_url} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        alt="Case preview" 
                      />
                    )
                  ) : (
                    <p className="text-slate-500 text-sm">No preview available</p>
                  )}
                </div>
                <p className="font-mono text-sm text-slate-400 truncate">{c.file_name}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {new Date(c.uploaded_at).toLocaleDateString()}
                </p>
              </motion.div>
            ))}
          </div>
        )}

        {/* Recently reviewed */}
        {reviewedCases.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-semibold mb-6 text-slate-300">Recently Reviewed</h2>
            <div className="glass rounded-3xl overflow-hidden border border-slate-700">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700 bg-slate-900/50 text-slate-400">
                    <th className="p-4 text-left">File</th>
                    <th className="p-4 text-left">Final Verdict</th>
                    <th className="p-4 text-left">Confidence</th>
                    <th className="p-4 text-left">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {reviewedCases.map(c => (
                    <tr key={c.id} className="border-b border-slate-800 hover:bg-slate-900/40 transition-colors cursor-pointer"
                      onClick={() => setSelectedCase(c)}>
                      <td className="p-4 font-mono text-slate-300">{c.file_name}</td>
                      <td className={`p-4 font-bold
                        ${c.final_verdict === 'FAKE' ? 'text-red-400' :
                          c.final_verdict === 'REAL' ? 'text-emerald-400' : 'text-yellow-400'}`}>
                        {c.final_verdict}
                      </td>
                      <td className="p-4 text-slate-400">{c.final_confidence?.toFixed(1)}%</td>
                      <td className="p-4 text-slate-500">{new Date(c.uploaded_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Review Modal with Full Preview */}
      <AnimatePresence>
        {selectedCase && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale:0.88, opacity:0 }} animate={{ scale:1, opacity:1 }}
              exit={{ scale:0.88, opacity:0 }} transition={{ duration:0.35 }}
              className="glass max-w-4xl w-full rounded-3xl p-10 neon-border relative max-h-[95vh] overflow-y-auto">

              <button onClick={() => setSelectedCase(null)}
                className="absolute top-6 right-6 p-2 hover:bg-slate-800 rounded-full transition-all">
                <X size={24} className="text-slate-400 hover:text-white" />
              </button>

              <h2 className="text-3xl font-bold mb-6">
                CASE REVIEW <span className="text-cyan-400 text-lg font-mono">#{selectedCase.id}</span>
              </h2>

              {/* Media Preview - Full sized */}
              <div className="mb-8 rounded-2xl overflow-hidden border border-slate-700 bg-black flex items-center justify-center min-h-64 max-h-96">
                {selectedCase.media_url ? (
                  selectedCase.media_type === 'video' ? (
                    <video 
                      src={selectedCase.media_url} 
                      className="w-full h-full object-contain"
                      controls
                      autoPlay
                    />
                  ) : (
                    <img 
                      src={selectedCase.media_url} 
                      className="w-full h-full object-contain" 
                      alt="Case evidence"
                    />
                  )
                ) : (
                  <p className="text-slate-500">No preview available</p>
                )}
              </div>

              {/* File info */}
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-mono mb-1">FILE:</p>
                  <p className="font-mono text-white">{selectedCase.file_name}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 text-sm font-mono mb-1">TYPE:</p>
                  <p className="font-mono text-cyan-400 uppercase">{selectedCase.media_type}</p>
                </div>
              </div>

              {/* Cached result indicator */}
              {selectedCase.is_cached_result && (
                <div className="mb-6 px-4 py-3 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center gap-3">
                  <Zap className="text-purple-400" size={18} />
                  <div>
                    <p className="text-purple-400 font-semibold">CACHED RESULT</p>
                    <p className="text-purple-300 text-sm">This image was previously analyzed. Using stored results.</p>
                  </div>
                </div>
              )}

              {/* AI Model Results (reference) */}
              <div className="mb-8">
                <p className="text-slate-400 text-xs font-mono tracking-widest mb-3">AI MODEL REFERENCE SCORES</p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700">
                    <p className="text-xs text-slate-500 mb-1">SigLIP</p>
                    <p className="text-2xl font-mono text-cyan-400">—</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700">
                    <p className="text-xs text-slate-500 mb-1">Xception</p>
                    <p className="text-2xl font-mono text-cyan-400">—</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700">
                    <p className="text-xs text-slate-500 mb-1">EfficientNet</p>
                    <p className="text-2xl font-mono text-cyan-400">—</p>
                  </div>
                </div>
              </div>

              {/* Your Confidence */}
              <div className="mb-6">
                <label className="text-xs text-slate-400 font-mono tracking-widest block mb-3">
                  YOUR CONFIDENCE LEVEL: <span className="text-cyan-400">{confidence}/5</span>
                </label>
                <div className="flex gap-2">
                  {[1,2,3,4,5].map(n => (
                    <button key={n} onClick={() => setConfidence(n)}
                      className={`flex-1 py-3 rounded-xl font-bold transition-all
                        ${confidence === n ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/40' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                      {n}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-slate-500 mt-1 px-1">
                  <span>Very Low</span><span>Very High</span>
                </div>
              </div>

              {/* Reasoning */}
              <div className="mb-8">
                <label className="text-xs text-slate-400 font-mono tracking-widest block mb-2">
                  REASONING (OPTIONAL)
                </label>
                <textarea
                  value={reasoning}
                  onChange={e => setReasoning(e.target.value)}
                  placeholder="Notes on your decision, observations, concerns..."
                  className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-2xl px-5 py-4 text-sm text-white placeholder-slate-500 focus:outline-none resize-none h-28 transition-all"
                />
              </div>

              {error && (
                <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <p className="text-center text-slate-400 text-xs tracking-widest mb-6">
                AS A VERIFIED EXPERT, YOUR INDEPENDENT DECISION IS FINAL
              </p>

              {/* Verdict Buttons */}
              <div className="flex gap-4">
                <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
                  onClick={() => handleVerdict('REAL')} disabled={submitting}
                  className="flex-1 py-5 text-lg font-bold bg-emerald-600 hover:bg-emerald-500 rounded-2xl flex items-center justify-center gap-3 disabled:opacity-50 transition-all">
                  <CheckCircle size={20} /> REAL
                </motion.button>
                <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
                  onClick={() => handleVerdict('UNCERTAIN')} disabled={submitting}
                  className="flex-1 py-5 text-lg font-bold bg-yellow-600 hover:bg-yellow-500 rounded-2xl flex items-center justify-center gap-3 disabled:opacity-50 transition-all">
                  <HelpCircle size={20} /> UNCERTAIN
                </motion.button>
                <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
                  onClick={() => handleVerdict('FAKE')} disabled={submitting}
                  className="flex-1 py-5 text-lg font-bold bg-red-600 hover:bg-red-500 rounded-2xl flex items-center justify-center gap-3 disabled:opacity-50 transition-all">
                  <AlertTriangle size={20} /> FAKE
                </motion.button>
              </div>

              {submitting && (
                <div className="mt-4 flex items-center justify-center gap-2 text-cyan-400">
                  <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent animate-spin rounded-full" />
                  <span className="font-mono text-sm">SUBMITTING VERDICT...</span>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <ScrollToTopButton />
    </div>
  );
}