import { DollarSign, BarChart2, Globe, TrendingUp } from 'lucide-react';

// ─── PAPER ENTRIES ────────────────────────────────────────────────────────────
export const papers = [
  {
    id: 1,
    title: 'FaceForensics++: Learning to Detect Manipulated Facial Images',
    authors: 'R\u00f6ssler et al.',
    year: '2019',
    venue: 'ICCV 2019',
    tags: ['Dataset', 'Face Swap', 'Benchmark'],
    abstract:
      'A large benchmark of manipulated face videos made with four methods. The Xception face-swap checkpoint used in Reality Check was trained on it.',
    url: 'https://arxiv.org/abs/1901.08971',
    color: 'cyan',
  },
  {
    id: 2,
    title: 'Celeb-DF: A Large-scale Challenging Dataset for DeepFake Forensics',
    authors: 'Li et al.',
    year: '2020',
    venue: 'CVPR 2020',
    tags: ['Dataset', 'Face Swap', 'Benchmark'],
    abstract:
      'High-quality celebrity face-swap videos that showed how much detectors trained on older datasets lose on better fakes.',
    url: 'https://arxiv.org/abs/1909.12962',
    color: 'purple',
  },
  {
    id: 3,
    title: 'The DeepFake Detection Challenge (DFDC) Dataset',
    authors: 'Dolhansky et al.',
    year: '2020',
    venue: 'arXiv 2020',
    tags: ['Dataset', 'Competition', 'Benchmark'],
    abstract:
      'A large face-swap dataset with consenting actors, released for a public detection competition.',
    url: 'https://arxiv.org/abs/2006.07397',
    color: 'cyan',
  },
  {
    id: 4,
    title: 'Robustness and Generalizability of Deepfake Detection: A Study with Diffusion Models',
    authors: 'Song et al.',
    year: '2023',
    venue: 'arXiv 2023',
    tags: ['Dataset', 'Diffusion Models', 'Generalisation'],
    abstract:
      'Introduces the DeepFakeFace dataset (Stable Diffusion text-to-image, inpainting and InsightFace swaps). We used it to re-train our EfficientNet and to build our test set.',
    url: 'https://arxiv.org/abs/2309.02218',
    color: 'purple',
  },
  {
    id: 5,
    title: 'OpenFake: An Open Dataset and Platform Toward Real-World Deepfake Detection',
    authors: 'Livernoche et al.',
    year: '2025',
    venue: 'arXiv 2025',
    tags: ['Dataset', 'Diffusion Models', 'Generalisation'],
    abstract:
      'About three million real images and nearly one million images from recent generators, with a SwinV2 detector trained on them. That detector is the OpenFake model in Reality Check.',
    url: 'https://arxiv.org/abs/2509.09495',
    color: 'cyan',
  },
  {
    id: 6,
    title: 'CNN-generated images are surprisingly easy to spot... for now',
    authors: 'Wang et al.',
    year: '2020',
    venue: 'CVPR 2020',
    tags: ['AI-generated Images', 'Generalisation'],
    abstract:
      'Shows that a classifier trained on one GAN can catch images from many others, with the right augmentation, and warns that this may not last.',
    url: 'https://arxiv.org/abs/1912.11035',
    color: 'purple',
  },
  {
    id: 7,
    title: 'Towards Universal Fake Image Detectors that Generalize Across Generative Models',
    authors: 'Ojha et al.',
    year: '2023',
    venue: 'CVPR 2023',
    tags: ['AI-generated Images', 'Generalisation', 'Vision-Language'],
    abstract:
      'Finds that real-vs-fake classifiers fail on new kinds of generators, and that features from a large pretrained vision-language model generalise much better.',
    url: 'https://arxiv.org/abs/2302.10174',
    color: 'cyan',
  },
  {
    id: 8,
    title: 'Detecting Deep-Fake Videos from Appearance and Behavior',
    authors: 'Agarwal et al.',
    year: '2020',
    venue: 'WIFS 2020',
    tags: ['Face Swap', 'Video', 'Biometrics'],
    abstract:
      'Combines how a person looks with how they move their face and head to spot face-swap videos.',
    url: 'https://arxiv.org/abs/2004.14491',
    color: 'purple',
  },
  {
    id: 9,
    title: 'MesoNet: a Compact Facial Video Forgery Detection Network',
    authors: 'Afchar et al.',
    year: '2018',
    venue: 'WIFS 2018',
    tags: ['Face Swap', 'Video', 'Lightweight'],
    abstract:
      'A small network that looks at mid-level image detail to detect Deepfake and Face2Face videos.',
    url: 'https://arxiv.org/abs/1809.00888',
    color: 'cyan',
  },
  {
    id: 10,
    title: 'Deepfake detection by human crowds, machines, and machine-informed crowds',
    authors: 'Groh et al.',
    year: '2022',
    venue: 'PNAS 2022',
    tags: ['Human-in-the-loop', 'Study'],
    abstract:
      'In studies with over 15,000 people, ordinary viewers were about as accurate as a leading detector but made different mistakes, which supports combining people and models.',
    url: 'https://doi.org/10.1073/pnas.2110013119',
    color: 'purple',
  },
  {
    id: 11,
    title: 'Deepfakes and Beyond: A Survey of Face Manipulation and Fake Detection',
    authors: 'Tolosana et al.',
    year: '2020',
    venue: 'Information Fusion',
    tags: ['Survey', 'Face Swap'],
    abstract:
      'A survey of face manipulation types and the methods and datasets used to detect them.',
    url: 'https://arxiv.org/abs/2001.00179',
    color: 'cyan',
  },
  {
    id: 12,
    title: 'Xception: Deep Learning with Depthwise Separable Convolutions',
    authors: 'Chollet',
    year: '2017',
    venue: 'CVPR 2017',
    tags: ['Architecture', 'CNN'],
    abstract:
      'The network architecture behind our face-swap detector.',
    url: 'https://arxiv.org/abs/1610.02357',
    color: 'purple',
  },
  {
    id: 13,
    title: 'EfficientNet: Rethinking Model Scaling for Convolutional Neural Networks',
    authors: 'Tan and Le',
    year: '2019',
    venue: 'ICML 2019',
    tags: ['Architecture', 'CNN'],
    abstract:
      'The architecture of our own detector, EfficientNet-B0, which we re-trained on DeepFakeFace.',
    url: 'https://arxiv.org/abs/1905.11946',
    color: 'cyan',
  },
  {
    id: 14,
    title: 'Sigmoid Loss for Language Image Pre-Training (SigLIP)',
    authors: 'Zhai et al.',
    year: '2023',
    venue: 'ICCV 2023',
    tags: ['Architecture', 'Vision-Language'],
    abstract:
      'The image-text model whose image encoder underlies two of our detectors: the SigLIP deepfake detector and AI-vs-Human.',
    url: 'https://arxiv.org/abs/2303.15343',
    color: 'purple',
  },
  {
    id: 15,
    title: 'Swin Transformer V2: Scaling Up Capacity and Resolution',
    authors: 'Liu et al.',
    year: '2022',
    venue: 'CVPR 2022',
    tags: ['Architecture', 'Transformer'],
    abstract:
      'The vision transformer architecture of the OpenFake detector.',
    url: 'https://arxiv.org/abs/2111.09883',
    color: 'cyan',
  },
  {
    id: 16,
    title: 'YuNet: A Tiny Millisecond-level Face Detector',
    authors: 'Wu et al.',
    year: '2023',
    venue: 'Machine Intelligence Research',
    tags: ['Face Detection', 'Lightweight'],
    abstract:
      'The fast face detector we use to find and crop the face before the face-swap check.',
    url: 'https://doi.org/10.1007/s11633-023-1423-y',
    color: 'purple',
  },
  {
    id: 17,
    title: 'Grad-CAM: Visual Explanations from Deep Networks via Gradient-based Localization',
    authors: 'Selvaraju et al.',
    year: '2017',
    venue: 'ICCV 2017',
    tags: ['Explainability', 'Heatmaps'],
    abstract:
      'Shows which image regions drove the decision of a network. We use it for the EfficientNet heatmaps.',
    url: 'https://arxiv.org/abs/1610.02391',
    color: 'cyan',
  },
  {
    id: 18,
    title: 'Visualizing and Understanding Convolutional Networks',
    authors: 'Zeiler and Fergus',
    year: '2014',
    venue: 'ECCV 2014',
    tags: ['Explainability', 'Heatmaps'],
    abstract:
      'Introduces occlusion sensitivity: hide one part of the image and see how the score changes. We use this for the Xception and OpenFake heatmaps.',
    url: 'https://arxiv.org/abs/1311.2901',
    color: 'purple',
  },
  {
    id: 19,
    title: 'On Calibration of Modern Neural Networks',
    authors: 'Guo et al.',
    year: '2017',
    venue: 'ICML 2017',
    tags: ['Calibration', 'Reliability'],
    abstract:
      'Shows that network confidence scores are often overconfident and introduces temperature scaling, which we apply to the OpenFake scores.',
    url: 'https://arxiv.org/abs/1706.04599',
    color: 'cyan',
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
  { id: '01', label: 'Upload',        sub: 'JPG · PNG · MOV',          color: '#22d3ee' },
  { id: '02', label: 'Preprocess',    sub: 'Frame extraction · Normalise',    color: '#818cf8' },
  { id: '03', label: 'AI Analysis',   sub: 'SigLIP · Xception · EfficientNet-B0 · AI-vs-Human · OpenFake', color: '#22d3ee' },
  { id: '04', label: 'Ensemble',      sub: 'OpenFake + Xception signals', color: '#818cf8' },
  { id: '05', label: 'Score',         sub: 'REAL · FAKE · UNCERTAIN',         color: '#22d3ee' },
  { id: '06', label: 'Expert Verdict',sub: 'Unsure cases and complaints',        color: '#c084fc' },
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
    body: 'A labelled test set of 221 images: 200 held-out images from the DeepFakeFace dataset (real photos, text-to-image, inpainting and face swaps) and 21 images collected by the team.',
  },
  {
    num: '04',
    title: 'Deep Learning Development',
    body: 'Five detectors are used: SigLIP, Xception (face swaps), AI-vs-Human, OpenFake (recent AI generators) and our EfficientNet-B0, re-trained on about 3,000 DeepFakeFace images that are not in the test set. Each gives a fake score from 0 to 100.',
  },
  {
    num: '05',
    title: 'Explainability & Ethics',
    body: 'Confidence visualisation, model cards, bias disclosure, and clear UNCERTAIN verdict class to avoid false certainty.',
  },
  {
    num: '06',
    title: 'Testing, Deployment & Future Work',
    body: 'Every detector is scored on the test set with python manage.py evaluate, and the results are shown on this page, including where the models fail. Next: multimodal detection and robustness to adversarial attacks.',
  },
];

// ─── ECONOMIC STATS ───────────────────────────────────────────────────────────
// Note: icon components are imported here so the data file stays self-contained.
export const economicStats = [
  { icon: DollarSign, value: '$78B',   label: 'Estimated global cost of deepfake fraud by 2027',        color: 'text-cyan-400'   },
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
    body: 'News organisations, courts, and social platforms face regulatory and reputational risk from unverified content. Reality Check keeps an audit trail of every scan, model score and expert decision.',
  },
  {
    color: 'text-cyan-400',
    heading: 'Market Opportunity',
    body: "Reality Check's human-in-the-loop design suits newsrooms, fact-checkers and forensic teams who need a person to sign off on every verdict.",
  },
];