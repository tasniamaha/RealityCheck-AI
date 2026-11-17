import { motion } from 'framer-motion';
import BrandLogo from '../components/BrandLogo';
import { ArrowLeft, ExternalLink, BookOpen, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  architectureSteps,
  methodologyPhases,
  economicNarrative,
} from '../data/researchPapersData';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.65, delay },
});

// Measured with `python manage.py evaluate testset` and `python manage.py calibrate`
// on 221 labelled images (110 real, 111 fake). Update after re-running both.
const TEST_SET_PARTS = [
  '100 real photos and 100 fakes from the DeepFakeFace dataset, none of them used for training',
  'the fakes: 34 text-to-image (Stable Diffusion 1.5), 33 inpainting, 33 face swaps (InsightFace)',
  '21 images collected by the team: 10 real photos and 11 AI-generated images',
];
const MODEL_RESULTS = [
  { name: 'SigLIP',          source: 'public checkpoint',                     auc: 55.3, acc: 52.0 },
  { name: 'Xception',        source: 'face-swap model, scores faces only',    auc: 55.8, acc: 55.7 },
  { name: 'EfficientNet-B0', source: 'our model, re-trained on DeepFakeFace', auc: 62.6, acc: 60.2 },
  { name: 'AI-vs-Human',     source: 'public checkpoint',                     auc: 65.7, acc: 64.3 },
  { name: 'OpenFake SwinV2', source: 'public checkpoint, recent generators',  auc: 82.4, acc: 75.6 },
];
// Signals rule (OpenFake >= 50 or Xception >= 90); the app never labels a file REAL on its own.
const APP_LABELS = {
  fake: { right: 70, unsure: 41, wrong: 0 },
  real: { right: 0, unsure: 102, wrong: 8 },
};

export default function Methodology() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Background grid */}
      <div className="fixed inset-0 opacity-[0.07] pointer-events-none" />
      <div className="fixed inset-0 pointer-events-none" />

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-cyan-500/20">
        <div className="max-w-7xl mx-auto px-8 py-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <BrandLogo size={40} />
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
            <span className="text-cyan-400">
              Methodology
            </span>
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto leading-relaxed">
            Five detectors score every upload, an AI label in the file overrides them, and a human expert gives the final verdict.
          </p>
          <p className="text-slate-500 text-sm max-w-xl mx-auto leading-relaxed mt-4">
            When experts have marked at least 50 images fake for the same reason, the system trains an
            extra expert-trained detector from their reviews. It is switched on only if it improves
            the results on the labelled test set below.
          </p>
        </motion.div>

        {/* ── SYSTEM ARCHITECTURE DIAGRAM ── */}
        <motion.div {...fadeUp(0.1)} className="mb-24">
          <div className="flex items-center gap-3 mb-10">
            <div className="h-px flex-1 bg-cyan-500/30" />
            <span className="text-xs tracking-[0.3em] font-mono text-cyan-400 uppercase">System Architecture</span>
            <div className="h-px flex-1 bg-cyan-500/30" />
          </div>

          <div className="relative glass rounded-3xl border border-cyan-500/15 p-10 overflow-hidden">
            {/* Subtle grid pattern */}
            <div className="absolute inset-0 pointer-events-none" />

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
                      className="relative w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors duration-300"
                      style={{
                        background: `${step.color}18`,
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
                      <div className="flex-1 h-px bg-cyan-500/40" />
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
                className="flex-1 mx-6 h-px bg-cyan-500/20"
              />
            </div>
          </div>
        </motion.div>
        {/* -- MEASURED ACCURACY -- */}
        <motion.div {...fadeUp(0.15)} className="mb-24">
          <div className="flex items-center gap-3 mb-10">
            <div className="h-px flex-1 bg-cyan-500/30" />
            <span className="text-xs tracking-[0.3em] font-mono text-cyan-400 uppercase">Measured Accuracy</span>
            <div className="h-px flex-1 bg-cyan-500/30" />
          </div>

          <div className="glass rounded-2xl p-8 border border-slate-700/40 mb-6">
            <h3 className="text-xl font-bold text-white mb-3">The test set: 221 labelled images (110 real, 111 fake)</h3>
            <ul className="list-disc pl-5 space-y-1 text-slate-400 text-sm">
              {TEST_SET_PARTS.map(p => <li key={p}>{p}</li>)}
            </ul>
          </div>

          <div className="glass rounded-2xl p-8 border border-slate-700/40 mb-6 overflow-x-auto">
            <h3 className="text-xl font-bold text-white mb-1">Each detector on its own</h3>
            <p className="text-slate-500 text-sm mb-6">
              AUC: 50 means guessing, 100 means it always ranks a fake above a real image. Accuracy uses one cut-off at 50.
            </p>
            <table className="w-full text-sm min-w-[560px]">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-700">
                  <th className="py-3 pr-4 font-mono text-xs tracking-widest">DETECTOR</th>
                  <th className="py-3 pr-4 font-mono text-xs tracking-widest">SOURCE</th>
                  <th className="py-3 pr-4 font-mono text-xs tracking-widest w-1/4">AUC</th>
                  <th className="py-3 font-mono text-xs tracking-widest">ACCURACY</th>
                </tr>
              </thead>
              <tbody>
                {MODEL_RESULTS.map(m => (
                  <tr key={m.name} className="border-b border-slate-800 last:border-0">
                    <td className="py-4 pr-4 font-semibold text-white">{m.name}</td>
                    <td className="py-4 pr-4 text-slate-400">{m.source}</td>
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-cyan-400 w-10">{m.auc.toFixed(1)}</span>
                        <div className="h-1.5 flex-1 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-cyan-400" style={{ width: `${m.auc}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 font-mono font-bold text-white">{m.acc.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {[
              { title: 'Fake images (111)', d: APP_LABELS.fake, right: 'labelled FAKE', wrong: 'wrongly labelled REAL' },
              { title: 'Real images (110)', d: APP_LABELS.real, right: 'labelled REAL (never automatic)', wrong: 'wrongly labelled FAKE' },
            ].map(card => (
              <div key={card.title} className="glass rounded-2xl p-8 border border-slate-700/40">
                <h3 className="text-lg font-bold text-white mb-5">{card.title}</h3>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between"><dt className="text-slate-400">{card.right}</dt><dd className="font-mono font-bold text-emerald-400">{card.d.right}</dd></div>
                  <div className="flex justify-between"><dt className="text-slate-400">UNCERTAIN, sent to an expert</dt><dd className="font-mono font-bold text-amber-400">{card.d.unsure}</dd></div>
                  <div className="flex justify-between"><dt className="text-slate-400">{card.wrong}</dt><dd className="font-mono font-bold text-red-400">{card.d.wrong}</dd></div>
                </dl>
              </div>
            ))}
          </div>

          <div className="glass rounded-2xl p-8 border border-slate-700/40 mb-6 overflow-x-auto">
            <h3 className="text-xl font-bold text-white mb-1">How the AI label is decided</h3>
            <p className="text-slate-400 text-sm mb-4">
              FAKE when OpenFake (built for AI-generated images) scores 50% or more, or Xception (built for face
              swaps) scores 90% or more. Otherwise UNCERTAIN, and an expert decides. The other models are shown
              with their explanations but do not change the label.
            </p>
            <p className="text-slate-500 text-sm mb-4">
              Four more test sets of 100 fakes and 100 real photos each (fakes caught / real photos wrongly flagged):
            </p>
            <table className="w-full text-sm min-w-[560px]">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-700">
                  <th className="py-3 pr-4 font-mono text-xs tracking-widest">RULE</th>
                  <th className="py-3 pr-4 font-mono text-xs tracking-widest">AI IMAGES (OPENFAKE)</th>
                  <th className="py-3 pr-4 font-mono text-xs tracking-widest">AI IMAGES (DEEPFAKEFACE)</th>
                  <th className="py-3 pr-4 font-mono text-xs tracking-widest">FACE SWAPS (TUNING)</th>
                  <th className="py-3 font-mono text-xs tracking-widest">FACE SWAPS (HELD BACK)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-800">
                  <td className="py-3 pr-4 text-white font-semibold">OpenFake or Xception (used)</td>
                  <td className="py-3 pr-4 font-mono">100 / 2</td><td className="py-3 pr-4 font-mono">94 / 11</td>
                  <td className="py-3 pr-4 font-mono">27 / 8</td><td className="py-3 font-mono">25 / 5</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 text-slate-400">Average of all five</td>
                  <td className="py-3 pr-4 font-mono">87 / 5</td><td className="py-3 pr-4 font-mono">92 / 3</td>
                  <td className="py-3 pr-4 font-mono">13 / 13</td><td className="py-3 font-mono">19 / 7</td>
                </tr>
              </tbody>
            </table>
            <p className="text-slate-500 text-xs mt-4">
              The 90% Xception line was chosen after seeing these results, so the held-back face-swap set is the
              fair comparison. Face swaps remain the weakest area: most still go to an expert. These sets contain
              photos only; screenshots, memes and infographics were not tested.
            </p>
          </div>

          <div className="glass rounded-2xl p-8 border border-slate-700/40 text-sm text-slate-400 leading-relaxed space-y-3">
            <h3 className="text-xl font-bold text-white">What this means</h3>
            <p>
              The AI never labels a file REAL on its own: a low score only means the detectors found
              nothing, so the file goes to an expert. When it does say FAKE it is right
              {APP_LABELS.fake.right} times out of {APP_LABELS.fake.right + APP_LABELS.real.wrong}.
              Everything else goes to an expert as UNCERTAIN, and the final verdict always comes from a person.
            </p>
            <p>
              OpenFake is the strongest on fully AI-made pictures but almost never spots face swaps; Xception covers
              some of those. On the team's own 10 real photos, EfficientNet and AI-vs-Human scored 8 as fake.
            </p>
            <p>
              A file that carries an AI label in its metadata (C2PA or IPTC) is marked FAKE whatever the
              detectors say; 4 of the 111 fakes had one.
            </p>
          </div>
        </motion.div>


        {/* ── DEVELOPMENT PHASES ── */}
        <motion.div {...fadeUp(0.2)} className="mb-24">
          <div className="flex items-center gap-3 mb-10">
            <div className="h-px flex-1 bg-purple-500/30" />
            <span className="text-xs tracking-[0.3em] font-mono text-purple-400 uppercase">Development Phases</span>
            <div className="h-px flex-1 bg-purple-500/30" />
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
            <div className="h-px flex-1 bg-cyan-500/30" />
            <span className="text-xs tracking-[0.3em] font-mono text-cyan-400 uppercase">Why It Matters</span>
            <div className="h-px flex-1 bg-cyan-500/30" />
          </div>

          {/* Narrative */}
          <div className="glass rounded-2xl p-8 border border-slate-700/40">
            <h3 className="text-xl font-bold text-white mb-6">Why this matters</h3>
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
            <div className="h-px flex-1 bg-purple-500/30" />
            <span className="text-xs tracking-[0.3em] font-mono text-purple-400 uppercase">Research Foundation</span>
            <div className="h-px flex-1 bg-purple-500/30" />
          </div>

          <div
            className="glass rounded-3xl p-10 border border-purple-500/20 text-center relative overflow-hidden"
            style={{ boxShadow: '0 0 60px rgba(192,132,252,0.06)' }}
          >
            <div className="absolute inset-0 pointer-events-none" />
            <BookOpen className="w-10 h-10 text-purple-400 mx-auto mb-5 opacity-80" />
            <h3 className="text-2xl font-bold text-white mb-3">Foundational Research</h3>
            <p className="text-slate-400 max-w-lg mx-auto mb-8 text-sm leading-relaxed">
              Reality Check is grounded in peer-reviewed research across deep learning, media forensics,
              and explainable AI. Explore the full curated paper library.
            </p>
            <button
              onClick={() => navigate('/research-papers')}
              className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl font-semibold text-sm tracking-wider transition-all hover:brightness-110"
              style={{
                background: 'rgba(192,132,252,0.25)',
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