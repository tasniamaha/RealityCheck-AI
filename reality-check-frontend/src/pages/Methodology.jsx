import { motion } from 'framer-motion';
import { ExternalLink, BookOpen } from 'lucide-react';
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
// on 221 labelled images (110 real, 111 fake). Re-run both and update these numbers
// whenever a model or the test set changes.
const TEST_SET = {
  real: 110,
  fake: 111,
  parts: [
    '100 real photos and 100 fakes from the DeepFakeFace dataset, none of them used for training',
    'the fakes: 34 text-to-image (Stable Diffusion 1.5), 33 inpainting (part of a real face replaced), 33 face swaps (InsightFace)',
    '21 images collected by the team: 10 real photos and 11 AI-generated images',
  ],
};

const MODEL_RESULTS = [
  { name: 'SigLIP deepfake detector',  source: 'public checkpoint',                    auc: 55.3, acc: 52.0 },
  { name: 'EfficientNet-B0',           source: 'our model, re-trained on DeepFakeFace', auc: 62.6, acc: 60.2 },
  { name: 'AI-vs-Human SigLIP',        source: 'public checkpoint',                    auc: 65.7, acc: 64.3 },
  { name: 'Average of all three',      source: 'ensemble',                             auc: 68.9, acc: 66.5 },
];

// What the app labels on its own (calibrated ensemble, checked leave-one-out).
const APP_LABELS = {
  fake: { right: 23, unsure: 73, wrong: 15 },
  real: { right: 24, unsure: 76, wrong: 10 },
};

function SectionRule({ label }) {
  return (
    <div className="flex items-center gap-3 mb-10">
      <div className="h-px flex-1 bg-rule" />
      <span className="text-xs tracking-[0.3em] font-semibold text-brand-500 uppercase">{label}</span>
      <div className="h-px flex-1 bg-rule" />
    </div>
  );
}

function Bar({ value }) {
  return (
    <div className="h-2 w-full bg-lightbox rounded-full overflow-hidden" aria-hidden="true">
      <div className="h-full bg-ink" style={{ width: `${value}%` }} />
    </div>
  );
}

export default function Methodology() {
  const navigate = useNavigate();
  const fakeTotal = APP_LABELS.fake.right + APP_LABELS.fake.unsure + APP_LABELS.fake.wrong;
  const realTotal = APP_LABELS.real.right + APP_LABELS.real.unsure + APP_LABELS.real.wrong;
  const decided = APP_LABELS.fake.right + APP_LABELS.fake.wrong + APP_LABELS.real.right + APP_LABELS.real.wrong;
  const decidedRight = APP_LABELS.fake.right + APP_LABELS.real.right;

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      <div className="max-w-6xl mx-auto px-8 pt-32 pb-24 relative z-10">

        {/* -- PAGE TITLE -- */}
        <motion.div {...fadeUp(0)} className="text-center mb-20">
          <h1 className="text-6xl md:text-7xl font-black tracking-tighter leading-none mb-6">
            Project Methodology
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Three detectors score every upload, an AI label in the file overrides them, and a human
            expert gives the final verdict.
          </p>
          <p className="text-slate-500 text-sm max-w-2xl mx-auto leading-relaxed mt-4">
            When experts have marked at least 50 images fake for the same reason, the system trains an
            extra expert-trained detector from their reviews. It is switched on only if it improves the
            results on the labelled test set below.
          </p>
        </motion.div>

        {/* -- SYSTEM ARCHITECTURE -- */}
        <motion.div {...fadeUp(0.1)} className="mb-24">
          <SectionRule label="System Architecture" />
          <div className="bg-print rounded-3xl border border-rule p-10">
            <div className="relative flex flex-col md:flex-row items-stretch md:items-start justify-between gap-6 md:gap-2">
              {architectureSteps.map((step, i) => (
                <div key={step.id} className="flex items-start flex-1">
                  <div className="flex flex-col items-center text-center flex-1">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 border border-brand-500 text-brand-500">
                      <span className="text-lg font-black">{step.id}</span>
                    </div>
                    <p className="text-sm font-bold text-white mb-1">{step.label}</p>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{step.sub}</p>
                  </div>
                  {i < architectureSteps.length - 1 && (
                    <div className="hidden md:block mt-8 w-4 h-px bg-rule shrink-0" aria-hidden="true" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* -- MEASURED ACCURACY -- */}
        <motion.div {...fadeUp(0.15)} className="mb-24">
          <SectionRule label="Measured Accuracy" />

          <div className="bg-print rounded-3xl border border-rule p-8 md:p-10 mb-6">
            <h3 className="text-xl font-bold text-white mb-3">The test set</h3>
            <p className="text-slate-400 text-sm mb-4">
              {TEST_SET.real + TEST_SET.fake} labelled images: {TEST_SET.real} real and {TEST_SET.fake} fake.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400 text-sm">
              {TEST_SET.parts.map(p => <li key={p}>{p}</li>)}
            </ul>
          </div>

          <div className="bg-print rounded-3xl border border-rule p-8 md:p-10 mb-6 overflow-x-auto">
            <h3 className="text-xl font-bold text-white mb-1">Each detector on its own</h3>
            <p className="text-slate-500 text-sm mb-6">
              AUC: 50 means guessing, 100 means it always ranks a fake above a real image.
              Accuracy uses one cut-off at 50.
            </p>
            <table className="w-full text-sm min-w-[560px]">
              <thead>
                <tr className="text-left text-slate-500 border-b border-rule">
                  <th className="py-3 pr-4 font-semibold">Detector</th>
                  <th className="py-3 pr-4 font-semibold">Source</th>
                  <th className="py-3 pr-4 font-semibold w-1/4">AUC</th>
                  <th className="py-3 font-semibold">Accuracy</th>
                </tr>
              </thead>
              <tbody>
                {MODEL_RESULTS.map(m => (
                  <tr key={m.name} className="border-b border-rule last:border-0">
                    <td className="py-4 pr-4 font-semibold text-white">{m.name}</td>
                    <td className="py-4 pr-4 text-slate-400">{m.source}</td>
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-3">
                        <span className="font-bold w-10">{m.auc.toFixed(1)}</span>
                        <Bar value={m.auc} />
                      </div>
                    </td>
                    <td className="py-4 font-bold">{m.acc.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {[
              { title: `Fake images (${fakeTotal})`, d: APP_LABELS.fake, rightLabel: 'labelled FAKE', wrongLabel: 'wrongly labelled REAL' },
              { title: `Real images (${realTotal})`, d: APP_LABELS.real, rightLabel: 'labelled REAL', wrongLabel: 'wrongly labelled FAKE' },
            ].map(card => (
              <div key={card.title} className="bg-print rounded-3xl border border-rule p-8">
                <h3 className="text-lg font-bold text-white mb-5">{card.title}</h3>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between"><dt className="text-slate-400">{card.rightLabel}</dt><dd className="font-bold text-emerald-400">{card.d.right}</dd></div>
                  <div className="flex justify-between"><dt className="text-slate-400">UNCERTAIN, sent to an expert</dt><dd className="font-bold text-amber-400">{card.d.unsure}</dd></div>
                  <div className="flex justify-between"><dt className="text-slate-400">{card.wrongLabel}</dt><dd className="font-bold text-red-400">{card.d.wrong}</dd></div>
                </dl>
              </div>
            ))}
          </div>

          <div className="bg-print rounded-3xl border border-rule p-8 md:p-10 text-sm text-slate-400 leading-relaxed space-y-3">
            <h3 className="text-xl font-bold text-white">What this means</h3>
            <p>
              When the app gives a label on its own it is right {decidedRight} times out of {decided}.
              It sends the other {fakeTotal + realTotal - decided} images to an expert as UNCERTAIN.
              The detectors are not reliable enough to decide alone, which is why the final verdict
              always comes from a person.
            </p>
            <p>
              The detectors do best on fully generated images and worst on face swaps. On the team's
              own 10 real photos, two of the three detectors scored 8 as fake.
            </p>
            <p>
              The EfficientNet-B0 was re-trained on about 3,000 DeepFakeFace images, so its results on
              the DeepFakeFace part of the test set are likely better than it will do on new kinds of fakes.
              A file that carries an AI label in its metadata (C2PA or IPTC) is marked FAKE
              whatever the detectors say; 4 of the 111 fakes had one.
            </p>
          </div>
        </motion.div>

        {/* -- DEVELOPMENT PHASES -- */}
        <motion.div {...fadeUp(0.2)} className="mb-24">
          <SectionRule label="Development Phases" />
          <div className="grid md:grid-cols-2 gap-5">
            {methodologyPhases.map(item => (
              <div key={item.num} className="bg-print rounded-2xl p-7 border border-rule">
                <div className="flex items-start gap-4">
                  <span className="text-3xl font-black text-slate-700 leading-none shrink-0">{item.num}</span>
                  <div>
                    <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{item.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* -- WHY IT MATTERS -- */}
        <motion.div {...fadeUp(0.3)} className="mb-24">
          <SectionRule label="Why It Matters" />
          <div className="bg-print rounded-2xl p-8 border border-rule">
            <div className="grid md:grid-cols-3 gap-6 text-sm text-slate-400 leading-relaxed">
              {economicNarrative.map(item => (
                <div key={item.heading}>
                  <p className="text-brand-500 font-semibold mb-2 text-xs tracking-widest uppercase">{item.heading}</p>
                  {item.body}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* -- RESEARCH PAPERS -- */}
        <motion.div {...fadeUp(0.4)}>
          <SectionRule label="Research Foundation" />
          <div className="bg-print rounded-3xl p-10 border border-rule text-center">
            <BookOpen className="w-10 h-10 text-brand-500 mx-auto mb-5" />
            <h3 className="text-2xl font-bold text-white mb-3">Foundational Research</h3>
            <p className="text-slate-400 max-w-lg mx-auto mb-8 text-sm leading-relaxed">
              The papers behind the detectors, the datasets and the explanation methods.
            </p>
            <button onClick={() => navigate('/research-papers')} className="btn-ink inline-flex items-center gap-3">
              View Research Papers
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>

      <footer className="border-t border-rule py-10 relative z-10">
        <div className="max-w-6xl mx-auto px-8 text-center">
          <p className="text-slate-400 text-sm mb-2">
            Created by <span className="text-brand-500">Noshin Syara</span>,{' '}
            <span className="text-brand-500">Tasnia Rahman Maha</span> and{' '}
            <span className="text-brand-500">Maliha Mehnaj</span>
          </p>
          <p className="text-xs text-slate-600">&copy; 2026 Reality Check &middot; Innovation World Cup 2026</p>
        </div>
      </footer>
    </div>
  );
}
