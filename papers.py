"""
1. Removes every "MP4" from the texts on the site and in the README.
2. Replaces the research paper list with checked, relevant papers.
Safe to run twice. Run from the project folder:  python papers.py
"""
import glob
import os
import re
import sys

SRC = os.path.join('reality-check-frontend', 'src')
DOT = chr(0xB7)

# -- 1. MP4 --
pat = re.compile(r'(,\s*|\s*' + DOT + r'\s*)MP4\b')
for f in glob.glob(os.path.join(SRC, '**', '*.jsx'), recursive=True) + \
         glob.glob(os.path.join(SRC, '**', '*.js'), recursive=True) + ['README.md']:
    text = open(f, encoding='utf-8').read()
    new = pat.sub('', text)
    if new != text:
        open(f, 'w', encoding='utf-8').write(new)
        print('removed MP4 from', f)

# -- 2. Papers --
P = [
    ('FaceForensics++: Learning to Detect Manipulated Facial Images', 'R\\u00f6ssler et al.', '2019', 'ICCV 2019',
     ['Dataset', 'Face Swap', 'Benchmark'],
     'A large benchmark of manipulated face videos made with four methods. The Xception face-swap checkpoint used in Reality Check was trained on it.',
     'https://arxiv.org/abs/1901.08971'),
    ('Celeb-DF: A Large-scale Challenging Dataset for DeepFake Forensics', 'Li et al.', '2020', 'CVPR 2020',
     ['Dataset', 'Face Swap', 'Benchmark'],
     'High-quality celebrity face-swap videos that showed how much detectors trained on older datasets lose on better fakes.',
     'https://arxiv.org/abs/1909.12962'),
    ('The DeepFake Detection Challenge (DFDC) Dataset', 'Dolhansky et al.', '2020', 'arXiv 2020',
     ['Dataset', 'Competition', 'Benchmark'],
     'A large face-swap dataset with consenting actors, released for a public detection competition.',
     'https://arxiv.org/abs/2006.07397'),
    ('Robustness and Generalizability of Deepfake Detection: A Study with Diffusion Models', 'Song et al.', '2023', 'arXiv 2023',
     ['Dataset', 'Diffusion Models', 'Generalisation'],
     'Introduces the DeepFakeFace dataset (Stable Diffusion text-to-image, inpainting and InsightFace swaps). We used it to re-train our EfficientNet and to build our test set.',
     'https://arxiv.org/abs/2309.02218'),
    ('OpenFake: An Open Dataset and Platform Toward Real-World Deepfake Detection', 'Livernoche et al.', '2025', 'arXiv 2025',
     ['Dataset', 'Diffusion Models', 'Generalisation'],
     'About three million real images and nearly one million images from recent generators, with a SwinV2 detector trained on them. That detector is the OpenFake model in Reality Check.',
     'https://arxiv.org/abs/2509.09495'),
    ('CNN-generated images are surprisingly easy to spot... for now', 'Wang et al.', '2020', 'CVPR 2020',
     ['AI-generated Images', 'Generalisation'],
     'Shows that a classifier trained on one GAN can catch images from many others, with the right augmentation, and warns that this may not last.',
     'https://arxiv.org/abs/1912.11035'),
    ('Towards Universal Fake Image Detectors that Generalize Across Generative Models', 'Ojha et al.', '2023', 'CVPR 2023',
     ['AI-generated Images', 'Generalisation', 'Vision-Language'],
     'Finds that real-vs-fake classifiers fail on new kinds of generators, and that features from a large pretrained vision-language model generalise much better.',
     'https://arxiv.org/abs/2302.10174'),
    ('Detecting Deep-Fake Videos from Appearance and Behavior', 'Agarwal et al.', '2020', 'WIFS 2020',
     ['Face Swap', 'Video', 'Biometrics'],
     'Combines how a person looks with how they move their face and head to spot face-swap videos.',
     'https://arxiv.org/abs/2004.14491'),
    ('MesoNet: a Compact Facial Video Forgery Detection Network', 'Afchar et al.', '2018', 'WIFS 2018',
     ['Face Swap', 'Video', 'Lightweight'],
     'A small network that looks at mid-level image detail to detect Deepfake and Face2Face videos.',
     'https://arxiv.org/abs/1809.00888'),
    ('Deepfake detection by human crowds, machines, and machine-informed crowds', 'Groh et al.', '2022', 'PNAS 2022',
     ['Human-in-the-loop', 'Study'],
     'In studies with over 15,000 people, ordinary viewers were about as accurate as a leading detector but made different mistakes, which supports combining people and models.',
     'https://doi.org/10.1073/pnas.2110013119'),
    ('Deepfakes and Beyond: A Survey of Face Manipulation and Fake Detection', 'Tolosana et al.', '2020', 'Information Fusion',
     ['Survey', 'Face Swap'],
     'A survey of face manipulation types and the methods and datasets used to detect them.',
     'https://arxiv.org/abs/2001.00179'),
    ('Xception: Deep Learning with Depthwise Separable Convolutions', 'Chollet', '2017', 'CVPR 2017',
     ['Architecture', 'CNN'],
     'The network architecture behind our face-swap detector.',
     'https://arxiv.org/abs/1610.02357'),
    ('EfficientNet: Rethinking Model Scaling for Convolutional Neural Networks', 'Tan and Le', '2019', 'ICML 2019',
     ['Architecture', 'CNN'],
     'The architecture of our own detector, EfficientNet-B0, which we re-trained on DeepFakeFace.',
     'https://arxiv.org/abs/1905.11946'),
    ('Sigmoid Loss for Language Image Pre-Training (SigLIP)', 'Zhai et al.', '2023', 'ICCV 2023',
     ['Architecture', 'Vision-Language'],
     'The image-text model whose image encoder underlies two of our detectors: the SigLIP deepfake detector and AI-vs-Human.',
     'https://arxiv.org/abs/2303.15343'),
    ('Swin Transformer V2: Scaling Up Capacity and Resolution', 'Liu et al.', '2022', 'CVPR 2022',
     ['Architecture', 'Transformer'],
     'The vision transformer architecture of the OpenFake detector.',
     'https://arxiv.org/abs/2111.09883'),
    ('YuNet: A Tiny Millisecond-level Face Detector', 'Wu et al.', '2023', 'Machine Intelligence Research',
     ['Face Detection', 'Lightweight'],
     'The fast face detector we use to find and crop the face before the face-swap check.',
     'https://doi.org/10.1007/s11633-023-1423-y'),
    ('Grad-CAM: Visual Explanations from Deep Networks via Gradient-based Localization', 'Selvaraju et al.', '2017', 'ICCV 2017',
     ['Explainability', 'Heatmaps'],
     'Shows which image regions drove the decision of a network. We use it for the EfficientNet heatmaps.',
     'https://arxiv.org/abs/1610.02391'),
    ('Visualizing and Understanding Convolutional Networks', 'Zeiler and Fergus', '2014', 'ECCV 2014',
     ['Explainability', 'Heatmaps'],
     'Introduces occlusion sensitivity: hide one part of the image and see how the score changes. We use this for the Xception and OpenFake heatmaps.',
     'https://arxiv.org/abs/1311.2901'),
    ('On Calibration of Modern Neural Networks', 'Guo et al.', '2017', 'ICML 2017',
     ['Calibration', 'Reliability'],
     'Shows that network confidence scores are often overconfident and introduces temperature scaling, which we apply to the OpenFake scores.',
     'https://arxiv.org/abs/1706.04599'),
]


def js(s):
    return "'" + s.replace("'", "\\'") + "'"


entries = []
for i, (title, authors, year, venue, tags, abstract, url) in enumerate(P, 1):
    entries.append(
        "  {\n"
        f"    id: {i},\n"
        f"    title: {js(title)},\n"
        f"    authors: '{authors}',\n"
        f"    year: '{year}',\n"
        f"    venue: {js(venue)},\n"
        f"    tags: [{', '.join(js(t) for t in tags)}],\n"
        "    abstract:\n"
        f"      '{abstract}',\n"
        f"    url: '{url}',\n"
        f"    color: '{'cyan' if i % 2 else 'purple'}',\n"
        "  },")
block = "export const papers = [\n" + "\n".join(entries) + "\n];"

data = os.path.join(SRC, 'data', 'researchPapersData.js')
text = open(data, encoding='utf-8').read()
s = text.find('export const papers = [')
e = text.find('\n];', s)
if s < 0 or e < 0:
    sys.exit(f'{data}: paper list not found. Paste this message to Claude.')
text = text[:s] + block + text[e + 3:]
text = text.replace("sub: 'Weighted by measured accuracy'", "sub: 'OpenFake + Xception signals'")
open(data, 'w', encoding='utf-8').write(text)
print(f'{data}: {len(P)} papers written')
