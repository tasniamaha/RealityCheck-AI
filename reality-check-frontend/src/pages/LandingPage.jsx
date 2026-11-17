import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

import frameA from '../assets/Include_image.jpg';
import frameB from '../assets/include_2.jpg';
import frameC from '../assets/hero_3.png';
import frameD from '../assets/hero4.jpg';

const FRAMES = [
  { src: frameA, no: '21' },
  { src: frameB, no: '22' },
  { src: frameC, no: '23', marked: true },
  { src: frameD, no: '24' },
];

const STEPS = [
  { title: 'You upload a file', text: 'A photo or a short video. JPG, PNG, MP4 or MOV.' },
  { title: 'Three detectors score it', text: 'SigLIP, EfficientNet-B0 and AI-vs-Human each give a fake score from 0 to 100.' },
  { title: 'You see every score', text: 'Each one comes with a heatmap of the areas that moved it. Nothing is averaged away.' },
  { title: 'An expert decides', text: 'A person reviews the file and the scores. Their verdict is the final one.' },
];

const SAMPLE = [
  { name: 'SigLIP', score: 32.6 },
  { name: 'EfficientNet-B0', score: 61.0 },
  { name: 'AI-vs-Human', score: 97.2 },
];

const LIMITS = [
  { title: 'Detectors are often wrong.', text: 'On our own test images they disagree with each other regularly. That is why you see all three scores, not one confident answer.' },
  { title: 'A score is not proof.', text: 'A high fake score means the file looks like what a detector learned to flag. It can still be a real photo.' },
  { title: 'A missing AI label proves nothing.', text: 'Some generators write a label into the file. Screenshots and re-uploads remove it.' },
];

function Sprockets() {
  return (
    <div className="flex justify-between px-3" aria-hidden="true">
      {Array.from({ length: 26 }).map((_, i) => (
        <span key={i} className="block w-[9px] h-[6px] rounded-[1px] bg-lightbox/90" />
      ))}
    </div>
  );
}

function ContactStrip() {
  return (
    <div className="relative" style={{ transform: 'rotate(-3deg)' }}>
      <div className="bg-ink py-2 shadow-[0_30px_40px_-28px_rgba(23,19,31,0.7)]">
        <Sprockets />
        <div className="flex justify-between px-4 pt-1 text-[10px] font-semibold text-lightbox/70" style={{ fontStretch: '80%' }} aria-hidden="true">
          <span>REALITY CHECK 400</span><span>SAFETY FILM</span><span>REALITY CHECK 400</span>
        </div>
        <div className="grid grid-cols-4 gap-[6px] px-[6px] py-1">
          {FRAMES.map(f => (
            <figure key={f.no} className="relative m-0">
              <img src={f.src} alt="" className="block w-full aspect-[3/2] object-cover" />
              {f.marked && (
                <svg viewBox="0 0 300 200" className="absolute -inset-[14%] w-[128%] h-[128%] overflow-visible" aria-hidden="true">
                  <path
                    className="marker-draw"
                    style={{ '--len': 900 }}
                    d="M150 14 C 232 6, 290 52, 284 104 C 278 162, 206 192, 138 188 C 66 184, 12 150, 18 96 C 24 44, 92 12, 176 22"
                    fill="none" stroke="#7A2AB8" strokeWidth="7" strokeLinecap="round"
                  />
                </svg>
              )}
            </figure>
          ))}
        </div>
        <div className="grid grid-cols-4 px-[6px] pb-1 text-[10px] font-semibold text-lightbox/70" style={{ fontStretch: '80%' }} aria-hidden="true">
          {FRAMES.map(f => <span key={f.no} className="pl-1">{f.no} &gt; {f.no}A</span>)}
        </div>
        <Sprockets />
      </div>
    </div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const start = () => navigate(user ? '/user-dashboard' : '/register');

  return (
    <div className="bg-lightbox text-ink overflow-x-hidden">

      {/* Hero */}
      <section className="max-w-[1320px] mx-auto px-5 sm:px-8 pt-14 sm:pt-20 pb-20 grid lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] gap-12 lg:gap-6 items-center">
        <div>
          <h1 className="display text-[clamp(4rem,11vw,10.5rem)] leading-[0.84] -ml-1">
            Is this<br />photo<br />real?
          </h1>
          <p className="mt-8 max-w-[34rem] text-lg sm:text-xl text-slate-300">
            Upload an image or video. Three detectors score it, you see every score
            with a heatmap, and a human expert makes the final call.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
            <button onClick={start} className="btn-ink !text-lg !px-7 !py-4">Check a file</button>
            <Link to="/demo" className="font-semibold underline decoration-2 underline-offset-4 decoration-brand-500 hover:text-brand-500">
              Watch a scripted demo
            </Link>
          </div>
        </div>
        <div className="lg:-mr-44 mt-4 lg:mt-0">
          <ContactStrip />
        </div>
      </section>

      {/* How a check works */}
      <section className="border-t border-ink">
        <div className="max-w-[1320px] mx-auto px-5 sm:px-8 py-16 sm:py-20">
          <h2 className="text-5xl sm:text-6xl">How a check works</h2>
          <ol className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10 list-none p-0">
            {STEPS.map((s, i) => (
              <li key={s.title} className="border-t-[3px] border-ink pt-4">
                <span className="display block text-6xl text-brand-500">{i + 1}</span>
                <h3 className="mt-3 text-2xl">{s.title}</h3>
                <p className="mt-2 text-slate-400">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* What a result looks like */}
      <section className="border-t border-ink bg-print">
        <div className="max-w-[1320px] mx-auto px-5 sm:px-8 py-16 sm:py-20 grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <h2 className="text-5xl sm:text-6xl">You get the scores, not just a stamp</h2>
            <p className="mt-6 max-w-[36rem] text-lg text-slate-400">
              Most checkers print one word. We show what each detector said, where it
              looked, and whether they agree. When they do not, the file is marked
              uncertain and waits for a person.
            </p>
            <Link to="/methodology" className="mt-6 inline-block font-semibold underline decoration-2 underline-offset-4 decoration-brand-500 hover:text-brand-500">
              Read how the scores are produced
            </Link>
          </div>

          <figure className="m-0">
            <div className="crop bg-lightbox border border-rule band band-unsure p-6 sm:p-8">
              <p className="text-sm font-semibold text-slate-400">AI label before expert review</p>
              <p className="display text-6xl text-amber-400 mt-1">Uncertain</p>
              <dl className="mt-7 space-y-5">
                {SAMPLE.map(m => (
                  <div key={m.name}>
                    <div className="flex items-baseline justify-between gap-4">
                      <dt className="font-semibold">{m.name}</dt>
                      <dd className="m-0 font-mono font-bold text-lg">{m.score.toFixed(1)}% fake</dd>
                    </div>
                    <div className="mt-2 h-[6px] bg-slate-800">
                      <div className="h-full bg-ink" style={{ width: `${m.score}%` }} />
                    </div>
                  </div>
                ))}
              </dl>
              <p className="mt-7 text-slate-300">
                The detectors disagree, so this file waits for an expert.
              </p>
            </div>
            <figcaption className="mt-4 text-sm text-slate-500">Sample result. The numbers are an illustration.</figcaption>
          </figure>
        </div>
      </section>

      {/* Limits */}
      <section className="border-t border-ink">
        <div className="max-w-[1320px] mx-auto px-5 sm:px-8 py-16 sm:py-20">
          <h2 className="text-5xl sm:text-6xl">What this cannot do</h2>
          <div className="mt-10 grid md:grid-cols-3 gap-x-10 gap-y-8">
            {LIMITS.map(l => (
              <div key={l.title}>
                <h3 className="text-2xl">{l.title}</h3>
                <p className="mt-2 text-slate-400">{l.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing */}
      <section className="bg-ink text-print">
        <div className="max-w-[1320px] mx-auto px-5 sm:px-8 py-16 flex flex-wrap items-center justify-between gap-8">
          <h2 className="text-5xl sm:text-7xl text-print">Got a photo you doubt?</h2>
          <button
            onClick={start}
            className="inline-flex items-center justify-center px-8 py-4 bg-print text-ink font-bold text-lg rounded hover:bg-brand-100 transition-colors"
            style={{ fontStretch: '88%' }}
          >
            Check a file
          </button>
        </div>
      </section>

      <footer className="border-t border-ink">
        <div className="max-w-[1320px] mx-auto px-5 sm:px-8 py-8 flex flex-wrap items-center justify-between gap-4">
          <Logo size={28} />
          <p className="text-sm text-slate-500">AI scores are estimates. A human expert gives the final verdict.</p>
        </div>
      </footer>
    </div>
  );
}
