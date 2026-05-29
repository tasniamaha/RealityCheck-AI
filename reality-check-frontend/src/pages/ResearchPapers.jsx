import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, BookOpen, Shield, Search, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { papers, allTags, tagColor } from '../data/researchPapersData';

export default function ResearchPapers() {
  const navigate = useNavigate();
  const [search, setSearch]     = useState('');
  const [activeTag, setActiveTag] = useState(null);

  const filtered = papers.filter(p => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.authors.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q));
    const matchTag = !activeTag || p.tags.includes(activeTag);
    return matchSearch && matchTag;
  });

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 bg-[radial-gradient(#22d3ee_0.5px,transparent_1px)] bg-[length:48px_48px] opacity-[0.06] pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(192,132,252,0.07),transparent)] pointer-events-none" />

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
            onClick={() => navigate('/methodology')}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-400 transition-colors"
          >
            <ArrowLeft size={16} /> Back to Methodology
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-8 pt-32 pb-24 relative z-10">

        {/* ── HEADER ── */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65 }}
          className="text-center mb-16"
        >
          <p className="text-[10px] tracking-[0.4em] font-mono text-purple-400/70 mb-4 uppercase">
            Academic Foundation
          </p>
          <h1 className="text-6xl md:text-7xl font-black tracking-tighter leading-none mb-5">
            Research{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
              Papers
            </span>
          </h1>
          
        </motion.div>

        {/* ── SEARCH + FILTER ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-10 space-y-4"
        >
          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by title, author, or topic…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-11 pr-5 py-3.5 rounded-2xl bg-slate-950 border border-slate-700 focus:border-cyan-400/60 focus:outline-none text-sm text-white placeholder-slate-600 transition-all"
            />
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => setActiveTag(null)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all border ${
                !activeTag
                  ? 'border-cyan-400/50 text-cyan-400 bg-cyan-400/10'
                  : 'border-slate-700 text-slate-500 hover:border-slate-500'
              }`}
            >
              All
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all border ${
                  activeTag === tag
                    ? 'border-purple-400/50 text-purple-400 bg-purple-400/10'
                    : 'border-slate-700 text-slate-500 hover:border-slate-600'
                }`}
              >
                <Tag className="w-2.5 h-2.5" />
                {tag}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ── RESULTS COUNT ── */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-xs text-slate-600 font-mono text-center mb-8"
        >
          SHOWING {filtered.length} OF {papers.length} PAPERS
        </motion.p>

        {/* ── PAPER CARDS ── */}
        <div className="grid md:grid-cols-2 gap-5">
          {filtered.map((paper, i) => {
            const c = tagColor[paper.color];
            return (
              <motion.div
                key={paper.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.06 }}
                className="group glass rounded-2xl p-7 border border-slate-700/40 hover:border-opacity-60 transition-all duration-300 flex flex-col"
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[10px] font-mono tracking-widest px-2 py-0.5 rounded-md border ${c.border} ${c.text} ${c.bg}`}>
                        {paper.venue}
                      </span>
                      <span className="text-[10px] font-mono text-slate-600">{paper.year}</span>
                    </div>
                    <h3 className={`text-base font-bold text-white leading-snug group-hover:${c.text} transition-colors`}>
                      {paper.title}
                    </h3>
                  </div>
                  <BookOpen className={`w-5 h-5 shrink-0 mt-0.5 opacity-30 group-hover:opacity-70 ${c.text} transition-opacity`} />
                </div>

                {/* Authors */}
                <p className="text-xs text-slate-500 font-mono mb-3">{paper.authors}</p>

                {/* Abstract */}
                <p className="text-slate-400 text-sm leading-relaxed mb-5 flex-1">{paper.abstract}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {paper.tags.map(tag => (
                    <span
                      key={tag}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-500 border border-slate-700 font-mono"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Link */}
                <a
                  href={paper.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2 text-xs font-mono tracking-wider transition-all ${c.text} opacity-60 hover:opacity-100`}
                >
                  View on arXiv <ExternalLink className="w-3 h-3" />
                </a>
              </motion.div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-slate-600 font-mono text-sm">
            No papers match your search.
          </div>
        )}
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
            © 2026 Reality Check · Ethical AI Verification Platform · Innovation World Cup 2026
          </p>
        </div>
      </footer>
    </div>
  );
}