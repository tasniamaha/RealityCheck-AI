import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Users, AlertTriangle, LogOut, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import ScrollToTopButton from '../components/ScrollToTopButton';

function ExpertRow({ app, onAction, loading }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr className="border-b border-slate-800 hover:bg-slate-900/60 transition-colors">
        <td className="p-5 font-medium">{app.name}</td>
        <td className="p-5 text-slate-400 text-sm">{app.email}</td>
        <td className="p-5 text-slate-400 text-sm max-w-xs truncate">{app.experience || '—'}</td>
        <td className="p-5"><StatusBadge status={app.status} /></td>
        <td className="p-5 text-center">
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => setExpanded(v => !v)}
              className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs border border-cyan-500/30 text-cyan-400 bg-cyan-500/8 hover:bg-cyan-500/15 transition-all"
            >
              {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              Q&amp;A
            </button>
            {app.status === 'Pending' && (
              <>
                <motion.button whileHover={{ scale: 1.05 }}
                  disabled={loading}
                  onClick={() => onAction(app.id, 'approve')}
                  className="bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-xl text-xs font-medium transition disabled:opacity-50">
                  Approve
                </motion.button>
                <motion.button whileHover={{ scale: 1.05 }}
                  disabled={loading}
                  onClick={() => onAction(app.id, 'reject')}
                  className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-xl text-xs font-medium transition disabled:opacity-50">
                  Reject
                </motion.button>
              </>
            )}
            {app.status !== 'Pending' && (
              <span className="text-slate-500 text-sm">{app.status}</span>
            )}
          </div>
        </td>
      </tr>

      {/* Q&A Expanded Row */}
      <AnimatePresence>
        {expanded && (
          <tr key={`qa-${app.id}`}>
            <td colSpan="5" className="px-6 pb-5 bg-slate-900/40">
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-4 space-y-4 border-t border-slate-800 mt-1">
                  {app.education && (
                    <div>
                      <p className="text-xs font-mono text-slate-500 tracking-widest mb-1">EDUCATION</p>
                      <p className="text-slate-300 text-sm bg-slate-950/50 rounded-xl px-4 py-3">{app.education}</p>
                    </div>
                  )}
                  {app.q1 && (
                    <div>
                      <p className="text-xs font-mono text-cyan-500/70 tracking-widest mb-1">Q1 — How do you personally detect manipulated or synthetic media?</p>
                      <p className="text-slate-300 text-sm bg-slate-950/50 rounded-xl px-4 py-3 leading-relaxed">{app.q1}</p>
                    </div>
                  )}
                  {app.q2 && (
                    <div>
                      <p className="text-xs font-mono text-cyan-500/70 tracking-widest mb-1">Q2 — What is your approach when dealing with uncertain or conflicting AI outputs?</p>
                      <p className="text-slate-300 text-sm bg-slate-950/50 rounded-xl px-4 py-3 leading-relaxed">{app.q2}</p>
                    </div>
                  )}
                  {app.q3 && (
                    <div>
                      <p className="text-xs font-mono text-cyan-500/70 tracking-widest mb-1">Q3 — What biases can exist in AI-based detection systems and how do you mitigate them?</p>
                      <p className="text-slate-300 text-sm bg-slate-950/50 rounded-xl px-4 py-3 leading-relaxed">{app.q3}</p>
                    </div>
                  )}
                  {!app.q1 && !app.q2 && !app.q3 && (
                    <p className="text-slate-600 text-sm italic">No assessment answers on record.</p>
                  )}
                </div>
              </motion.div>
            </td>
          </tr>
        )}
      </AnimatePresence>
    </>
  );
}

export default function AdminDashboard() {
  const { expertApplications, fetchApplications, updateApplication, complaints, fetchComplaints, updateComplaint } = useApp();
  const { user, logout } = useAuth();
  const [actionMsg,       setActionMsg]       = useState('');
  const [loading,         setLoading]         = useState(false);
  const [complaintMsg,    setComplaintMsg]     = useState('');
  const [complaintLoading, setComplaintLoading] = useState(false);
  const [expandedComplaint, setExpandedComplaint] = useState(null);

  useEffect(() => {
    fetchApplications();
    fetchComplaints();
  }, [fetchApplications, fetchComplaints]);

  const handleAction = async (id, action) => {
    setLoading(true);
    setActionMsg('');
    try {
      const data = await updateApplication(id, action);
      setActionMsg(action === 'approve'
        ? `✅ Approved! ${data.username} now has expert access.`
        : 'Application rejected.');
    } catch (err) {
      setActionMsg(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleComplaintAction = async (id, action) => {
    setComplaintLoading(true);
    setComplaintMsg('');
    try {
      await updateComplaint(id, action);
      setComplaintMsg(action === 'resolved' ? '✅ Complaint marked as resolved.' : 'Complaint dismissed.');
    } catch (err) {
      setComplaintMsg(`Error: ${err.message}`);
    } finally {
      setComplaintLoading(false);
    }
  };

  const complaintStatusColor = (s) => {
    if (s === 'resolved') return 'text-emerald-400';
    if (s === 'dismissed') return 'text-slate-500';
    return 'text-amber-400';
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(#22d3ee_0.8px,transparent_1px)] bg-[length:60px_60px] opacity-10" />
      <div className="absolute inset-0 bg-gradient-to-br from-black via-slate-950 to-black" />

      <div className="relative z-10 p-8 max-w-7xl mx-auto">

        {/* Header */}
        <header className="flex justify-between items-center mb-12 flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Shield className="w-11 h-11 text-cyan-400" />
            <h1 className="text-5xl font-bold tracking-tighter">
              ADMIN<span className="text-cyan-400"> CONTROL</span>
            </h1>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="glass px-6 py-3 rounded-2xl text-sm flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              {user?.name || 'Administrator'}
            </div>
            <motion.button whileHover={{ scale: 1.05 }}
              onClick={() => { fetchApplications(); fetchComplaints(); }}
              className="flex items-center gap-2 px-4 py-3 glass rounded-2xl text-cyan-400 border border-cyan-400/20">
              <RefreshCw size={16} /> Refresh
            </motion.button>
            <motion.button whileHover={{ scale: 1.05 }} onClick={logout}
              className="flex items-center gap-2 px-5 py-3 bg-red-500/10 text-red-400 rounded-2xl border border-red-500/20">
              <LogOut size={16} /> LOGOUT
            </motion.button>
          </div>
        </header>

        {/* Action messages */}
        {actionMsg && (
          <div className="mb-6 px-6 py-4 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-sm font-mono">
            {actionMsg}
          </div>
        )}

        {/* ── Expert Applications ── */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <Users className="w-8 h-8 text-cyan-400" />
            <h2 className="text-3xl font-semibold">Expert Applications</h2>
            <span className="ml-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/20 text-cyan-400 text-sm font-mono">
              {expertApplications.filter(a => a.status === 'Pending').length} pending
            </span>
          </div>

          <div className="glass rounded-3xl overflow-hidden border border-cyan-400/10">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-900/50 text-slate-400 text-sm">
                  <th className="p-5 text-left">Name</th>
                  <th className="p-5 text-left">Email</th>
                  <th className="p-5 text-left">Experience</th>
                  <th className="p-5 text-left">Status</th>
                  <th className="p-5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {expertApplications.length > 0 ? (
                  expertApplications.map(app => (
                    <ExpertRow key={app.id} app={app} onAction={handleAction} loading={loading} />
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="p-16 text-center text-slate-500">No expert applications yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Complaints ── */}
        <div>
          <div className="flex items-center gap-3 mb-8">
            <AlertTriangle className="w-8 h-8 text-amber-400" />
            <h2 className="text-3xl font-semibold">User Complaints & Appeals</h2>
            <span className="ml-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/20 text-amber-400 text-sm font-mono">
              {complaints.filter(c => c.status === 'pending').length} pending
            </span>
          </div>

          {complaintMsg && (
            <div className="mb-6 px-6 py-4 rounded-2xl bg-amber-500/10 border border-amber-400/30 text-amber-300 text-sm font-mono">
              {complaintMsg}
            </div>
          )}

          <div className="glass rounded-3xl overflow-hidden border border-amber-400/10">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-900/50 text-slate-400 text-sm">
                  <th className="p-5 text-left">Reporter</th>
                  <th className="p-5 text-left">Case ID</th>
                  <th className="p-5 text-left">Reason</th>
                  <th className="p-5 text-left">Date</th>
                  <th className="p-5 text-left">Status</th>
                  <th className="p-5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {complaints.length > 0 ? (
                  complaints.map(c => (
                    <>
                      <tr key={c.id} className="border-b border-slate-800 hover:bg-slate-900/60 transition-colors">
                        <td className="p-5 text-sm">{c.reporter || c.username || '—'}</td>
                        <td className="p-5 font-mono text-amber-400 text-sm">#{c.scan_id}</td>
                        <td className="p-5 text-slate-300 text-sm">{c.reason?.replace(/_/g, ' ')}</td>
                        <td className="p-5 text-slate-400 text-sm">{c.date || c.created_at?.slice(0, 10)}</td>
                        <td className={`p-5 text-sm font-mono capitalize ${complaintStatusColor(c.status)}`}>{c.status}</td>
                        <td className="p-5 text-center">
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => setExpandedComplaint(expandedComplaint === c.id ? null : c.id)}
                              className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs border border-slate-600 text-slate-400 hover:bg-slate-800 transition-all"
                            >
                              {expandedComplaint === c.id ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                              Details
                            </button>
                            {c.status === 'pending' && (
                              <>
                                <button
                                  disabled={complaintLoading}
                                  onClick={() => handleComplaintAction(c.id, 'resolved')}
                                  className="bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-xl text-xs font-medium transition disabled:opacity-50">
                                  Resolve
                                </button>
                                <button
                                  disabled={complaintLoading}
                                  onClick={() => handleComplaintAction(c.id, 'dismissed')}
                                  className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-xl text-xs transition disabled:opacity-50">
                                  Dismiss
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Expanded details */}
                      <AnimatePresence>
                        {expandedComplaint === c.id && (
                          <tr key={`detail-${c.id}`}>
                            <td colSpan="6" className="px-6 pb-5 bg-slate-900/40">
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="pt-4 border-t border-slate-800 mt-1">
                                  <p className="text-xs font-mono text-amber-500/70 tracking-widest mb-2">USER'S DETAILS</p>
                                  <p className="text-slate-300 text-sm bg-slate-950/50 rounded-xl px-4 py-3 leading-relaxed">
                                    {c.details || <span className="text-slate-600 italic">No additional details provided.</span>}
                                  </p>
                                </div>
                              </motion.div>
                            </td>
                          </tr>
                        )}
                      </AnimatePresence>
                    </>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="p-16 text-center text-slate-500">No complaints filed yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
      <ScrollToTopButton />
    </div>
  );
}