import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, BookOpen, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  architectureSteps,
  methodologyPhases,
  economicStats,
  economicNarrative,
} from '../data/researchPapersData';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.65, delay },
});

export default function Methodology() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Background grid */}
      <div className="fixed inset-0 bg-[radial-gradient(#22d3ee_0.5px,transparent_1px)] bg-[length:48px_48px] opacity-[0.07] pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(34,211,238,0.06),transparent)] pointer-events-none" />

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-cyan-500/20">
        <div className="max-w-7xl mx-auto px-8 py-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Shield className="w-9 h-9 text-cyan-400" />
            <h1 className="text-4xl font-bold tracking-tighter">
              REALITY<span className="text-cyan-400">CHECK</span>
            </h1>
          </div>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-400 transition-colors"
          >
            <ArrowLeft size={16} /> Back to Home
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-8 pt-32 pb-24 relative z-10">

        {/* ── PAGE TITLE ── */}
        <motion.div {...fadeUp(0)} className="text-center mb-20">
          <h1 className="text-6xl md:text-7xl font-black tracking-tighter leading-none mb-6">
            Project{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
              Methodology
            </span>
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto leading-relaxed">
            A six-stage forensic pipeline combining state-of-the-art deep learning with certified human oversight.
          </p>
        </motion.div>

        {/* ── SYSTEM ARCHITECTURE DIAGRAM ── */}
        <motion.div {...fadeUp(0.1)} className="mb-24">
          <div className="flex items-center gap-3 mb-10">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-cyan-500/30" />
            <span className="text-xs tracking-[0.3em] font-mono text-cyan-400 uppercase">System Architecture</span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-cyan-500/30" />
          </div>

          <div className="relative glass rounded-3xl border border-cyan-500/15 p-10 neon-border overflow-hidden">
            {/* Subtle grid pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.03)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

            {/* Step nodes */}
            <div className="relative flex items-start justify-between gap-2">
              {architectureSteps.map((step, i) => (
                <div key={step.id} className="flex items-start gap-0 flex-1">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + i * 0.1 }}
                    className="flex flex-col items-center text-center flex-1 group"
                  >
                    {/* Node box */}
                    <div
                      className="relative w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                      style={{
                        background: `linear-gradient(135deg, ${step.color}18, ${step.color}08)`,
                        border: `1px solid ${step.color}40`,
                        boxShadow: `0 0 20px ${step.color}15`,
                      }}
                    >
                      <span className="text-lg font-black font-mono" style={{ color: step.color }}>
                        {step.id}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-white mb-1 group-hover:text-cyan-300 transition-colors">
                      {step.label}
                    </p>
                    <p className="text-[10px] text-slate-500 leading-relaxed font-mono">{step.sub}</p>
                  </motion.div>

                  {/* Connector arrow */}
                  {i < architectureSteps.length - 1 && (
                    <div className="flex items-center mt-8 shrink-0 w-4">
                      <div className="flex-1 h-px bg-gradient-to-r from-cyan-500/40 to-purple-500/40" />
                      <div
                        className="w-0 h-0"
                        style={{
                          borderTop: '4px solid transparent',
                          borderBottom: '4px solid transparent',
                          borderLeft: '6px solid rgba(34,211,238,0.4)',
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Bottom animated flow line */}
            <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between">
              <motion.div
                animate={{ scaleX: [0.97, 1.01, 0.97] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="flex-1 mx-6 h-px bg-gradient-to-r from-cyan-500/20 via-purple-500/30 to-cyan-500/20"
              />
            </div>
          </div>
        </motion.div>

        {/* ── DEVELOPMENT PHASES ── */}
        <motion.div {...fadeUp(0.2)} className="mb-24">
          <div className="flex items-center gap-3 mb-10">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-purple-500/30" />
            <span className="text-xs tracking-[0.3em] font-mono text-purple-400 uppercase">Development Phases</span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-purple-500/30" />
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {methodologyPhases.map((item, i) => (
              <motion.div
                key={item.num}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + i * 0.08 }}
                className="glass rounded-2xl p-7 border border-slate-700/40 hover:border-cyan-400/30 transition-all duration-300 group"
              >
                <div className="flex items-start gap-4">
                  <span className="text-3xl font-black font-mono text-slate-700 group-hover:text-cyan-400/40 transition-colors leading-none shrink-0">
                    {item.num}
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{item.body}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── ECONOMIC VALUE ── */}
        <motion.div {...fadeUp(0.3)} className="mb-24">
          <div className="flex items-center gap-3 mb-10">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-cyan-500/30" />
            <span className="text-xs tracking-[0.3em] font-mono text-cyan-400 uppercase">Economic Value</span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-cyan-500/30" />
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {economicStats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.35 + i * 0.08 }}
                className="glass rounded-2xl p-6 border border-slate-700/40 hover:border-cyan-400/20 transition-all text-center group"
              >
                <stat.icon className={`w-6 h-6 ${stat.color} mx-auto mb-3 opacity-80`} />
                <div className={`text-3xl font-black font-mono ${stat.color} mb-2`}>{stat.value}</div>
                <p className="text-slate-500 text-xs leading-relaxed">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Narrative */}
          <div className="glass rounded-2xl p-8 border border-slate-700/40">
            <h3 className="text-xl font-bold text-white mb-6">Why This Matters Economically</h3>
            <div className="grid md:grid-cols-3 gap-6 text-sm text-slate-400 leading-relaxed">
              {economicNarrative.map(item => (
                <div key={item.heading}>
                  <p className={`${item.color} font-semibold mb-2 text-xs tracking-widest uppercase`}>
                    {item.heading}
                  </p>
                  {item.body}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── RESEARCH PAPERS TEASER ── */}
        <motion.div {...fadeUp(0.4)}>
          <div className="flex items-center gap-3 mb-10">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-purple-500/30" />
            <span className="text-xs tracking-[0.3em] font-mono text-purple-400 uppercase">Research Foundation</span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-purple-500/30" />
          </div>

          <div
            className="glass rounded-3xl p-10 border border-purple-500/20 text-center relative overflow-hidden"
            style={{ boxShadow: '0 0 60px rgba(192,132,252,0.06)' }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_100%,rgba(192,132,252,0.07),transparent)] pointer-events-none" />
            <BookOpen className="w-10 h-10 text-purple-400 mx-auto mb-5 opacity-80" />
            <h3 className="text-2xl font-bold text-white mb-3">Foundational Research</h3>
            <p className="text-slate-400 max-w-lg mx-auto mb-8 text-sm leading-relaxed">
              Reality Check is grounded in peer-reviewed research across deep learning, media forensics,
              and explainable AI. Explore the full curated paper library.
            </p>
            <button
              onClick={() => navigate('/research-papers')}
              className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl font-semibold text-sm tracking-wider transition-all hover:brightness-110 hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, rgba(192,132,252,0.25), rgba(34,211,238,0.15))',
                border: '1px solid rgba(192,132,252,0.4)',
              }}
            >
              <BookOpen className="w-5 h-5 text-purple-300" />
              View Research Papers
              <ExternalLink className="w-4 h-4 text-purple-300" />
            </button>
          </div>
        </motion.div>

      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-10 relative z-10">
        <div className="max-w-6xl mx-auto px-8 text-center">
          <p className="text-slate-400 text-sm mb-2">
            Created by <span className="text-cyan-400">Noshin Syara</span>,{' '}
            <span className="text-cyan-400">Tasnia Rahman Maha</span> and{' '}
            <span className="text-cyan-400">Maliha Mehnaj</span>
          </p>
          <p className="text-xs text-slate-600">
            © 2026 Reality Check · Innovation World Cup 2026
          </p>
        </div>
      </footer>
    </div>
  );
}