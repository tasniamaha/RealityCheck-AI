import { generateScanId } from '../utils/ids.jsx'

const STORAGE_KEY = 'rc_scans_v1'
const MAX_SCANS = 20

const getStoredScans = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Error reading scans from localStorage:', error)
    return []
  }
}

const saveScans = (scans) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scans.slice(-MAX_SCANS)))
  } catch (error) {
    console.error('Error saving scans to localStorage:', error)
  }
}

export const addScan = (scan) => {
  const scans = getStoredScans()
  const newScan = {
    id: generateScanId(),
    ...scan,
    createdAt: new Date().toISOString()
  }
  scans.push(newScan)
  saveScans(scans)
  return newScan
}

export const getScanById = (id) => {
  const scans = getStoredScans()
  return scans.find(scan => scan.id === id) || null
}

export const getAllScans = () => {
  return getStoredScans().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

export const getStats = () => {
  const scans = getStoredScans()
  const total = scans.length
  const deepfake = scans.filter(s => s.label === 'Deepfake').length
  const real = scans.filter(s => s.label === 'Real').length
  const uncertain = scans.filter(s => s.label === 'Uncertain').length

  return {
    total,
    deepfake,
    real,
    uncertain,
    deepfakePercentage: total > 0 ? Math.round((deepfake / total) * 100) : 0,
    realPercentage: total > 0 ? Math.round((real / total) * 100) : 0
  }
}

export const clearAllScans = () => {
  localStorage.removeItem(STORAGE_KEY)
}

export const generateMockResult = (filename, type, previewUrl) => {
  const labels = ['Real', 'Deepfake', 'Uncertain']
  const weights = [0.4, 0.4, 0.2] // 40% Real, 40% Deepfake, 20% Uncertain
  const random = Math.random()
  let labelIndex = 0
  let cumulativeWeight = 0

  for (let i = 0; i < weights.length; i++) {
    cumulativeWeight += weights[i]
    if (random <= cumulativeWeight) {
      labelIndex = i
      break
    }
  }

  const label = labels[labelIndex]

  // Generate confidence based on label
  let confidence
  if (label === 'Real') {
    confidence = 80 + Math.random() * 20 // 80-100%
  } else if (label === 'Deepfake') {
    confidence = 75 + Math.random() * 25 // 75-100%
  } else {
    confidence = 30 + Math.random() * 40 // 30-70%
  }

  const signals = generateSignals(label)

  const explanations = {
    Real: 'Our analysis indicates this content appears to be authentic. The multimedia exhibits natural characteristics consistent with legitimate capture.',
    Deepfake: 'The analysis has detected multiple indicators consistent with synthetic manipulation. Exercise caution with this content.',
    Uncertain: 'Analysis results are inconclusive. We recommend additional verification through alternative methods or expert review.'
  }

  const models = [
    { name: 'Veritas v2.1', version: '2.1.3' },
    { name: 'AuthenticAI Pro', version: '1.8.2' },
    { name: 'DeepGuard ML', version: '3.0.1' },
    { name: 'RealityNet', version: '2.5.0' }
  ]
  const model = models[Math.floor(Math.random() * models.length)]

  return {
    id: generateScanId(),
    filename,
    type,
    label,
    confidence,
    explanation: explanations[label],
    signals,
    model,
    previewUrl,
    createdAt: new Date().toISOString()
  }
}

const generateSignals = (label) => {
  const commonSignals = [
    'Facial symmetry analysis',
    'Lighting consistency check',
    'Background noise pattern',
    'Temporal coherence'
  ]

  const realSignals = [
    'Natural eye blinking pattern detected',
    'Consistent skin texture variations',
    'Authentic shadow behavior',
    'Normal breathing movements observed',
    'Natural hair flow'
  ]

  const deepfakeSignals = [
    'Inconsistent pupil dilation detected',
    'Unnatural skin texture smoothing',
    'Background warping artifacts',
    'Facial landmark misalignment',
    'Temporal flickering in video frames'
  ]

  const uncertainSignals = [
    'Low resolution limits analysis',
    'Compression artifacts present',
    'Partial occlusion detected',
    'Insufficient facial data',
    'Mixed signal indicators'
  ]

  let signals = [...commonSignals]

  if (label === 'Real') {
    signals = signals.concat(realSignals.slice(0, 3))
  } else if (label === 'Deepfake') {
    signals = signals.concat(deepfakeSignals.slice(0, 3))
  } else {
    signals = signals.concat(uncertainSignals.slice(0, 3))
  }

  // Shuffle and return 4-6 signals
  return signals
    .sort(() => Math.random() - 0.5)
    .slice(0, 4 + Math.floor(Math.random() * 3))
}