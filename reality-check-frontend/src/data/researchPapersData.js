import { DollarSign, BarChart2, Globe, TrendingUp } from 'lucide-react';

// ─── PAPER ENTRIES ────────────────────────────────────────────────────────────
export const papers = [
  {
    id: 1,
    title: 'FaceForensics++: Learning to Detect Manipulated Facial Images',
    authors: 'Rössler et al.',
    year: '2019',
    venue: 'ICCV 2019',
    tags: ['Dataset', 'Face Manipulation', 'Benchmark'],
    abstract:
      'Introduces a large-scale dataset of forged face videos using four manipulation methods, enabling systematic benchmarking of detection models.',
    url: 'https://arxiv.org/abs/1901.08971',
    color: 'cyan',
  },
  {
    id: 2,
    title: 'Detecting Deep-Fake Videos from Appearance and Behavior',
    authors: 'Agarwal et al.',
    year: '2020',
    venue: 'CVPR Workshops',
    tags: ['Behavioral Biometrics', 'Video Detection'],
    abstract:
      'Proposes behavioural biometric signatures — blink patterns, head movements — as robust indicators of video authenticity.',
    url: 'https://arxiv.org/abs/2004.10448',
    color: 'purple',
  },
  {
    id: 3,
    title: 'Xception: Deep Learning with Depthwise Separable Convolutions',
    authors: 'Chollet, F.',
    year: '2017',
    venue: 'CVPR 2017',
    tags: ['Architecture', 'CNN', 'Transfer Learning'],
    abstract:
      "Introduces Xception, used as a backbone in Reality Check's deepfake classification pipeline, outperforming Inception V3 on large image datasets.",
    url: 'https://arxiv.org/abs/1610.02357',
    color: 'cyan',
  },
  {
    id: 4,
    title: 'EfficientNet: Rethinking Model Scaling for Convolutional Neural Networks',
    authors: 'Tan & Le',
    year: '2019',
    venue: 'ICML 2019',
    tags: ['Architecture', 'Efficiency', 'Scaling'],
    abstract:
      "Presents a compound scaling method that uniformly scales width, depth, and resolution, forming one of Reality Check's ensemble detection models.",
    url: 'https://arxiv.org/abs/1905.11946',
    color: 'purple',
  },
  {
    id: 5,
    title: 'Scaling Language-Image Pre-Training via Masking (SigLIP)',
    authors: 'Zhai et al. (Google)',
    year: '2023',
    venue: 'ICCV 2023',
    tags: ['Vision-Language', 'Foundation Model'],
    abstract:
      'SigLIP replaces softmax with sigmoid loss for image-text pre-training, enabling superior zero-shot classification — adapted in Reality Check for semantic forgery cues.',
    url: 'https://arxiv.org/abs/2303.15343',
    color: 'cyan',
  },
  {
    id: 6,
    title: 'MesoNet: a Compact Facial Video Forgery Detection Network',
    authors: 'Afchar et al.',
    year: '2018',
    venue: 'WIFS 2018',
    tags: ['Lightweight', 'Face Forgery', 'Video'],
    abstract:
      "A compact mesoscopic analysis network designed specifically for face forgery detection in video — an architectural inspiration for Reality Check's lightweight inference pipeline.",
    url: 'https://arxiv.org/abs/1809.00888',
    color: 'purple',
  },
  {
    id: 7,
    title: '"Deepfakes" and Beyond: A Survey of Face Manipulation and Fake Detection',
    authors: 'Tolosana et al.',
    year: '2020',
    venue: 'Information Fusion',
    tags: ['Survey', 'Face Swap', 'GAN'],
    abstract:
      'Comprehensive survey covering GAN-based face manipulation techniques and detection methods — used as the primary literature review foundation for Reality Check.',
    url: 'https://arxiv.org/abs/2001.00179',
    color: 'cyan',
  },
  {
    id: 8,
    title: 'Multi-Task Learning as Multi-Objective Optimization',
    authors: 'Sener & Koltun',
    year: '2018',
    venue: 'NeurIPS 2018',
    tags: ['Multi-Task', 'Optimisation', 'Ensemble'],
    abstract:
      "Frames multi-task learning as multi-objective optimisation — theoretical basis for Reality Check's ensemble cross-validation and signal weighting strategy.",
    url: 'https://arxiv.org/abs/1810.04650',
    color: 'purple',
  },
  {
    id: 9,
    title: 'Grad-CAM: Visual Explanations from Deep Networks via Gradient-based Localization',
    authors: 'Selvaraju et al.',
    year: '2017',
    venue: 'ICCV 2017',
    tags: ['Explainability', 'XAI', 'Visualisation'],
    abstract:
      "Grad-CAM produces class activation maps highlighting the image regions responsible for a model's prediction — directly informing Reality Check's explainability layer.",
    url: 'https://arxiv.org/abs/1610.02391',
    color: 'cyan',
  },
  {
    id: 10,
    title: 'The Deepfake Detection Challenge (DFDC) Dataset',
    authors: 'Dolhansky et al. (Facebook AI)',
    year: '2020',
    venue: 'arXiv 2020',
    tags: ['Dataset', 'Competition', 'Benchmark'],
    abstract:
      'Large-scale DFDC dataset released by Facebook AI for robust benchmarking across diverse actors, lighting conditions, and manipulation methods.',
    url: 'https://arxiv.org/abs/2006.07397',
    color: 'purple',
  },
];

// ─── ALL UNIQUE TAGS (derived) ────────────────────────────────────────────────
export const allTags = [...new Set(papers.flatMap(p => p.tags))];

// ─── TAG COLOUR MAP ───────────────────────────────────────────────────────────
export const tagColor = {
  cyan: {
    border: 'border-cyan-400/30',
    text: 'text-cyan-400',
    bg: 'bg-cyan-400/8',
    glow: '0 0 20px rgba(34,211,238,0.08)',
  },
  purple: {
    border: 'border-purple-400/30',
    text: 'text-purple-400',
    bg: 'bg-purple-400/8',
    glow: '0 0 20px rgba(192,132,252,0.08)',
  },
};

// ─── METHODOLOGY ARCHITECTURE STEPS ──────────────────────────────────────────
export const architectureSteps = [
  { id: '01', label: 'Upload',        sub: 'JPG · PNG · MP4 · MOV',          color: '#22d3ee' },
  { id: '02', label: 'Preprocess',    sub: 'Frame extraction · Normalise',    color: '#818cf8' },
  { id: '03', label: 'AI Analysis',   sub: 'SigLIP · Xception · EfficientNet', color: '#22d3ee' },
  { id: '04', label: 'Ensemble',      sub: 'Cross-validate · Weight signals', color: '#818cf8' },
  { id: '05', label: 'Score',         sub: 'REAL · FAKE · UNCERTAIN',         color: '#22d3ee' },
  { id: '06', label: 'Expert Verdict',sub: 'Human-certified decision',        color: '#c084fc' },
];

// ─── METHODOLOGY DEVELOPMENT PHASES ──────────────────────────────────────────
export const methodologyPhases = [
  {
    num: '01',
    title: 'Requirement Analysis',
    body: 'Identified limitations in existing black-box deepfake detectors. Defined goals: interpretable results, scalable architecture, and transparent uncertainty communication.',
  },
  {
    num: '02',
    title: 'System Architecture Design',
    body: 'Modular full-stack design: React frontend, Django backend, and an isolated AI detection layer communicating via REST API.',
  },
  {
    num: '03',
    title: 'Dataset & Preprocessing',
    body: 'Benchmark datasets augmented with frame extraction, colour normalisation, resolution standardisation, and duplicate hashing.',
  },
  {
    num: '04',
    title: 'Deep Learning Development',
    body: 'Transfer learning on SigLIP, Xception, and EfficientNet. Models detect facial blending artefacts, GAN fingerprints, and compression inconsistencies.',
  },
  {
    num: '05',
    title: 'Explainability & Ethics',
    body: 'Confidence visualisation, model cards, bias disclosure, and clear UNCERTAIN verdict class to avoid false certainty.',
  },
  {
    num: '06',
    title: 'Testing, Deployment & Future Work',
    body: 'Rigorous cross-validation. Recognised at Innovation World Cup 2026. Future roadmap: multimodal detection, robustness under adversarial attacks.',
  },
];

// ─── ECONOMIC STATS ───────────────────────────────────────────────────────────
// Note: icon components are imported here so the data file stays self-contained.
export const economicStats = [
  { icon: DollarSign, value: '$78B',   label: 'Estimated global cost of deepfake fraud by 2027',        color: 'text-cyan-400'   },
  { icon: BarChart2,  value: '900%',   label: 'Rise in deepfake incidents since 2019',                   color: 'text-purple-400' },
  { icon: Globe,      value: '38+',    label: 'Countries reporting AI-driven disinformation campaigns',  color: 'text-cyan-400'   },
  { icon: TrendingUp, value: '$14.4B', label: 'Projected market for deepfake detection tools by 2030',   color: 'text-purple-400' },
];

// ─── ECONOMIC NARRATIVE ───────────────────────────────────────────────────────
export const economicNarrative = [
  {
    color: 'text-cyan-400',
    heading: 'Financial Fraud Prevention',
    body: 'Synthetic media is increasingly weaponised for CEO impersonation, wire-transfer fraud, and identity theft. Verified detection directly reduces corporate exposure and insurance liability.',
  },
  {
    color: 'text-purple-400',
    heading: 'Media & Publishing',
    body: 'News organisations, courts, and social platforms face regulatory and reputational risk from unverified content. Reality Check provides an audit trail that satisfies emerging EU AI Act and UK Online Safety Act requirements.',
  },
  {
    color: 'text-cyan-400',
    heading: 'Market Opportunity',
    body: "With the deepfake detection market projected to reach $14.4B by 2030, Reality Check's human-in-the-loop differentiation positions it for enterprise SaaS, government contracts, and forensic licensing.",
  },
];