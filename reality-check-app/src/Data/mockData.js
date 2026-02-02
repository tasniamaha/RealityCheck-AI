// Mock scan data for demonstration
export const mockScans = [
  {
    id: 'scan_001',
    filename: 'interview_footage.mp4',
    fileSize: 15728640, // 15 MB
    type: 'video',
    label: 'Real',
    confidence: 94,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    previewUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&h=450&fit=crop',
    model: { name: 'DeepGuard AI', version: '2.1.0' },
    explanation: 'This media appears to be authentic based on our comprehensive AI analysis. All detection metrics show consistent patterns expected in genuine, unmanipulated content. The lighting, facial movements, and audio synchronization all indicate natural, authentic media with no signs of manipulation.',
    signals: [
      'Consistent lighting patterns throughout all frames',
      'Natural facial expressions and micro-movements detected',
      'Perfect audio-lip synchronization maintained',
      'Authentic metadata with no signs of manipulation',
      'Shadow patterns align correctly with light sources'
    ],
    metrics: {
      lighting: 96,
      audioLipSync: 92,
      motionFlow: 95,
      facialExpression: 93,
      shadows: 94
    },
    scanDuration: '2.8',
    framesAnalyzed: 456,
    analysisDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toLocaleString()
  },
  {
    id: 'scan_002',
    filename: 'political_speech.mp4',
    fileSize: 28311552, // 27 MB
    type: 'video',
    label: 'Deepfake',
    confidence: 58,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    previewUrl: 'https://images.unsplash.com/photo-1560439514-4e9645039924?w=800&h=450&fit=crop',
    model: { name: 'DeepGuard AI', version: '2.1.0' },
    explanation: 'Our AI has detected significant manipulation patterns in this media. Multiple detection algorithms flagged inconsistencies in visual physics, facial expressions, and audio synchronization. This content has been marked as likely synthetic with high confidence.',
    signals: [
      'Critical lighting inconsistencies detected across multiple frames',
      'Unnatural facial micro-expressions during speech segments',
      'Significant audio-lip synchronization mismatches detected',
      'Shadow patterns inconsistent with environmental lighting',
      'Metadata shows signs of heavy post-processing'
    ],
    metrics: {
      lighting: 54,
      audioLipSync: 48,
      motionFlow: 62,
      facialExpression: 51,
      shadows: 56
    },
    scanDuration: '3.2',
    framesAnalyzed: 624,
    analysisDate: new Date(Date.now() - 5 * 60 * 60 * 1000).toLocaleString()
  },
  {
    id: 'scan_003',
    filename: 'social_media_post.jpg',
    fileSize: 2097152, // 2 MB
    type: 'image',
    label: 'Suspicious',
    confidence: 71,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
    previewUrl: 'https://images.unsplash.com/photo-1542909168-82c3e7fdca44?w=800&h=450&fit=crop',
    model: { name: 'DeepGuard AI', version: '2.1.0' },
    explanation: 'The AI detected patterns that suggest possible manipulation, but confidence is below the threshold for automatic classification. Human expert review has been automatically requested to verify these findings. Several minor anomalies were detected that warrant closer inspection.',
    signals: [
      'Minor lighting variations detected in key areas',
      'Subtle irregularities in shadow patterns',
      'Facial texture analysis shows borderline anomalies',
      'Metadata shows minor inconsistencies',
      'Edge detection reveals possible blending artifacts'
    ],
    metrics: {
      lighting: 68,
      audioLipSync: 75,
      motionFlow: 72,
      facialExpression: 69,
      shadows: 71
    },
    scanDuration: '1.9',
    framesAnalyzed: 1,
    analysisDate: new Date(Date.now() - 1 * 60 * 60 * 1000).toLocaleString()
  },
  {
    id: 'scan_004',
    filename: 'celebrity_announcement.mp4',
    fileSize: 45678901, // 43.5 MB
    type: 'video',
    label: 'Suspicious',
    confidence: 66,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    previewUrl: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&h=450&fit=crop',
    model: { name: 'DeepGuard AI', version: '2.1.0' },
    explanation: 'The AI detected patterns that suggest possible manipulation, but confidence is below the threshold for automatic classification. Human expert review has been automatically requested to verify these findings.',
    signals: [
      'Minor lighting variations in frames 180-220',
      'Subtle shadow pattern irregularities detected',
      'Slight audio-lip synchronization delays detected',
      'Metadata timestamp shows minor inconsistencies',
      'Facial boundary analysis shows soft edges'
    ],
    metrics: {
      lighting: 64,
      audioLipSync: 62,
      motionFlow: 70,
      facialExpression: 67,
      shadows: 68
    },
    scanDuration: '2.6',
    framesAnalyzed: 512,
    analysisDate: new Date(Date.now() - 30 * 60 * 1000).toLocaleString()
  },
  {
    id: 'scan_005',
    filename: 'news_footage.mp4',
    fileSize: 32505856, // 31 MB
    type: 'video',
    label: 'Real',
    confidence: 89,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    previewUrl: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=450&fit=crop',
    model: { name: 'DeepGuard AI', version: '2.1.0' },
    explanation: 'This media appears to be authentic based on our comprehensive AI analysis. All detection metrics show consistent patterns expected in genuine, unmanipulated content. No significant anomalies were detected.',
    signals: [
      'Consistent lighting patterns throughout all frames',
      'Natural facial expressions and micro-movements detected',
      'Perfect audio-lip synchronization maintained',
      'Authentic metadata with no signs of manipulation',
      'Shadow patterns align correctly with light sources'
    ],
    metrics: {
      lighting: 91,
      audioLipSync: 88,
      motionFlow: 90,
      facialExpression: 87,
      shadows: 89
    },
    scanDuration: '2.4',
    framesAnalyzed: 432,
    analysisDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toLocaleString()
  }
];

// Function to get a scan by ID
export const getMockScanById = (id) => {
  return mockScans.find(scan => scan.id === id);
};

// Function to get a random scan
export const getRandomMockScan = () => {
  return mockScans[Math.floor(Math.random() * mockScans.length)];
};

// Function to get all mock scans
export const getAllMockScans = () => {
  return mockScans;
};