import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, AlertTriangle, LogOut, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import ScrollToTopButton from '../components/ScrollToTopButton';

export default function AdminDashboard() {
  const { expertApplications, fetchApplications, updateApplication } = useApp();
  const { user, logout } = useAuth();
  const [actionMsg,  setActionMsg]  = useState('');
  const [loading,    setLoading]    = useState(false);

  useEffect(() => { fetchApplications(); }, [fetchApplications]);

  const handleAction = async (id, action) => {
    setLoading(true);
    setActionMsg('');
    try {
      const data = await updateApplication(id, action);
      if (action === 'approve') {
        setActionMsg(`✅ Approved! ${data.username} now has expert access and can log in immediately.`);
      } else {
        setActionMsg(`Application rejected.`);
      }
    } catch (err) {
      setActionMsg(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const complaints = [
    { id: 101, reporter: 'User123',     caseId: '#4782', reason: 'Disagree with expert verdict - suspected bias',   status: 'Pending', date: '2026-05-23' },
    { id: 102, reporter: 'JournalistX', caseId: '#4751', reason: 'Media was wrongly marked as Fake',                status: 'Pending', date: '2026-05-22' },
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(#22d3ee_0.8px,transparent_1px)] bg-[length:60px_60px] opacity-10"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-black via-slate-950 to-black"></div>

      <div className="relative z-10 p-8 max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-4">
            <Shield className="w-11 h-11 text-cyan-400" />
            <h1 className="text-5xl font-bold tracking-tighter">
              ADMIN<span className="text-cyan-400"> CONTROL</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="glass px-6 py-3 rounded-2xl text-sm flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              {user?.name || 'Administrator'}
            </div>
            <motion.button whileHover={{ scale:1.05 }} onClick={fetchApplications}
              className="flex items-center gap-2 px-4 py-3 glass rounded-2xl text-cyan-400 border border-cyan-400/20">
              <RefreshCw size={16} /> Refresh
            </motion.button>
            <motion.button whileHover={{ scale:1.05 }} onClick={logout}
              className="flex items-center gap-2 px-5 py-3 bg-red-500/10 text-red-400 rounded-2xl border border-red-500/20">
              <LogOut size={16} /> LOGOUT
            </motion.button>
          </div>
        </header>

        {actionMsg && (
          <div className="mb-8 px-6 py-4 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-sm font-mono">
            {actionMsg}
          </div>
        )}

        {/* Expert Applications */}
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
                    <tr key={app.id} className="border-b border-slate-800 hover:bg-slate-900/60 transition-colors">
                      <td className="p-5 font-medium">{app.name}</td>
                      <td className="p-5 text-slate-400 text-sm">{app.email}</td>
                      <td className="p-5 text-slate-400 text-sm max-w-xs truncate">{app.experience || '—'}</td>
                      <td className="p-5"><StatusBadge status={app.status} /></td>
                      <td className="p-5 text-center">
                        {app.status === 'Pending' ? (
                          <div className="flex gap-3 justify-center">
                            <motion.button whileHover={{ scale:1.05 }}
                              disabled={loading}
                              onClick={() => handleAction(app.id, 'approve')}
                              className="bg-emerald-600 hover:bg-emerald-500 px-5 py-2 rounded-xl text-sm font-medium transition disabled:opacity-50">
                              Approve
                            </motion.button>
                            <motion.button whileHover={{ scale:1.05 }}
                              disabled={loading}
                              onClick={() => handleAction(app.id, 'reject')}
                              className="bg-red-600 hover:bg-red-500 px-5 py-2 rounded-xl text-sm font-medium transition disabled:opacity-50">
                              Reject
                            </motion.button>
                          </div>
                        ) : (
                          <span className="text-slate-500 text-sm">{app.status}</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="p-16 text-center text-slate-400">
                      No expert applications yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Complaints */}
        <div>
          <div className="flex items-center gap-3 mb-8">
            <AlertTriangle className="w-8 h-8 text-amber-400" />
            <h2 className="text-3xl font-semibold">User Complaints & Appeals</h2>
          </div>
          <div className="glass rounded-3xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-900/50 text-slate-400 text-sm">
                  <th className="p-5 text-left">Reporter</th>
                  <th className="p-5 text-left">Case ID</th>
                  <th className="p-5 text-left">Reason</th>
                  <th className="p-5 text-left">Date</th>
                  <th className="p-5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map(c => (
                  <tr key={c.id} className="border-b border-slate-800 hover:bg-slate-900/60 transition-colors">
                    <td className="p-5">{c.reporter}</td>
                    <td className="p-5 font-mono text-cyan-400">{c.caseId}</td>
                    <td className="p-5 text-slate-300 text-sm">{c.reason}</td>
                    <td className="p-5 text-slate-400 text-sm">{c.date}</td>
                    <td className="p-5 text-center">
                      <div className="flex gap-3 justify-center">
                        <button className="bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-xl text-sm transition">Review</button>
                        <button className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-xl text-sm transition">Dismiss</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <ScrollToTopButton />
    </div>
  );
}