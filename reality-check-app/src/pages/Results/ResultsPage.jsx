import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Card from '../../components/common/Card.jsx'
import Button from '../../components/common/Button.jsx'
import Badge from '../../components/common/Badge.jsx'
import { getScanById } from '../../store/scanStore.jsx'
import { formatDate } from '../../utils/format.jsx'
import './Results.css'

const ResultsPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [scan, setScan] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // First try to get scan from sessionStorage
    const storedScan = sessionStorage.getItem('currentScan');

    if (storedScan) {
      try {
        const parsedScan = JSON.parse(storedScan);
        setScan(parsedScan);
        setLoading(false);
        return;
      } catch (error) {
        console.error('Error parsing stored scan:', error);
      }
    }

    // If not found, try to get from store
    const foundScan = getScanById(id);
    if (foundScan) {
      setScan(foundScan);
    }

    setLoading(false);
  }, [id]);

  // Mock data for demonstration
  const mockScan = {
    id: '12345',
    filename: 'sample_video.mp4',
    type: 'video',
    label: 'Suspicious',
    confidence: 62,
    createdAt: new Date().toISOString(),
    previewUrl: 'https://via.placeholder.com/800x450',
    model: { name: 'DeepGuard', version: '2.1' },
    explanation: 'The AI detected patterns that suggest possible manipulation, but confidence is below the threshold for automatic classification.',
    signals: [
      'Inconsistent lighting detected in frames 120-145',
      'Unusual shadow patterns around facial features',
      'Minor audio-lip synchronization anomalies',
      'Metadata timestamp irregularities'
    ],
    metrics: {
      lighting: 75,
      audioLipSync: 68,
      motionFlow: 82,
      facialExpression: 71,
      shadows: 65
    }
  }

  // Generate realistic mock data based on scan
  const generateMockData = (scanData) => {
    const isDeepfake = scanData.confidence < 70;
    const isSuspicious = scanData.confidence >= 60 && scanData.confidence < 80;

    return {
      ...scanData,
      explanation: isDeepfake
        ? 'Our AI has detected significant manipulation patterns in this media. Multiple detection algorithms flagged inconsistencies in visual physics, facial expressions, and audio synchronization.'
        : isSuspicious
        ? 'The AI detected patterns that suggest possible manipulation, but confidence is below the threshold for automatic classification. Human expert review is recommended.'
        : 'This media appears to be authentic based on our comprehensive AI analysis. All detection metrics show consistent patterns expected in genuine content.',
      signals: isDeepfake
        ? [
            'Significant lighting inconsistencies detected across frames',
            'Unnatural facial micro-expressions in key segments',
            'Audio-lip synchronization mismatches exceeding threshold',
            'Shadow patterns inconsistent with light sources',
            'Metadata anomalies suggesting post-processing'
          ]
        : isSuspicious
        ? [
            'Minor lighting variations in frames 120-145',
            'Subtle shadow pattern irregularities detected',
            'Slight audio-lip synchronization delays',
            'Metadata timestamp minor inconsistencies'
          ]
        : [
            'Consistent lighting throughout all frames',
            'Natural facial expressions and movements',
            'Perfect audio-lip synchronization',
            'Authentic metadata with no signs of tampering'
          ]
    };
  };

  const displayScan = scan ? generateMockData(scan) : generateMockData(mockScan);

  if (loading) {
    return (
      <div className="results-page-modern">
        <div className="results-bg">
          <div className="results-bg-orb results-orb-1"></div>
          <div className="results-bg-orb results-orb-2"></div>
          <div className="results-bg-orb results-orb-3"></div>
          <div className="results-bg-grid"></div>
        </div>
        <div className="loading-modern">
          <div className="loading-spinner-modern"></div>
          <p>Loading results...</p>
        </div>
      </div>
    )
  }

  if (!scan && id !== 'demo') {
    return (
      <div className="results-page-modern">
        <div className="results-bg">
          <div className="results-bg-orb results-orb-1"></div>
          <div className="results-bg-orb results-orb-2"></div>
          <div className="results-bg-orb results-orb-3"></div>
          <div className="results-bg-grid"></div>
        </div>
        <div className="not-found-modern">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="not-found-icon"
          >
            🔍
          </motion.div>
          <h2>Results Not Found</h2>
          <p>The scan results you're looking for could not be found.</p>
          <div className="not-found-actions">
            <Button variant="primary" onClick={() => navigate('/dashboard')}>
              View Dashboard
            </Button>
            <Button variant="outline" onClick={() => navigate('/scan')}>
              Start New Scan
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return 'real'
    if (confidence >= 60) return 'uncertain'
    return 'deepfake'
  }

  const getConfidenceLabel = (confidence) => {
    if (confidence >= 80) return 'REAL'
    if (confidence >= 60) return 'SUSPICIOUS'
    return 'DEEPFAKE'
  }

  const confidenceColor = getConfidenceColor(displayScan.confidence)
  const confidenceLabel = getConfidenceLabel(displayScan.confidence)

  return (
    <div className="results-page-modern">
      {/* Dynamic Background */}
      <div className="results-bg">
        <div className="results-bg-orb results-orb-1"></div>
        <div className="results-bg-orb results-orb-2"></div>
        <div className="results-bg-orb results-orb-3"></div>
        <div className="results-bg-grid"></div>
        <div className="results-bg-particles">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="particle"></div>
          ))}
        </div>
      </div>

      <div className="results-container-modern">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="results-header-modern"
        >
          <button className="back-button" onClick={() => navigate('/dashboard')}>
            ← Back to Dashboard
          </button>
          <div className="header-actions-modern">
            <button className="action-btn">
              <span>🔗</span>
              <span>Share Report</span>
            </button>
            <button className="action-btn primary">
              <span>⬇</span>
              <span>Download</span>
            </button>
          </div>
        </motion.div>

        {/* Main Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="results-title-section"
        >
          <h1 className="results-main-title">Analysis Complete</h1>
          <p className="results-subtitle">Detailed deepfake detection results for your media</p>
        </motion.div>

        <div className="results-grid-modern">
          {/* Left Column */}
          <div className="results-left-col">
            {/* Media Preview */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="media-card-modern"
            >
              <h2 className="card-title-modern">Analyzed Media</h2>
              <div className="media-preview-modern">
                <div className="media-overlay">
                  <div className="detection-badge">
                    <span className={`badge-${confidenceColor}`}>
                      {confidenceLabel} - {displayScan.confidence}%
                    </span>
                  </div>
                </div>
                {displayScan.previewUrl ? (
                  displayScan.type === 'image' ? (
                    <img src={displayScan.previewUrl} alt="Analyzed media" />
                  ) : (
                    <video src={displayScan.previewUrl} controls />
                  )
                ) : (
                  <div style={{
                    width: '100%',
                    height: '400px',
                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(16, 185, 129, 0.2))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '4rem'
                  }}>
                    {displayScan.type === 'image' ? '🖼️' : '🎬'}
                  </div>
                )}
              </div>
            </motion.div>

            {/* AI Assessment */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="assessment-card-modern"
            >
              <h2 className="card-title-modern">AI Preliminary Assessment</h2>

              <div className="assessment-grid">
                <div className="confidence-circle-modern">
                  <svg className="circle-progress" viewBox="0 0 200 200">
                    <circle className="circle-bg" cx="100" cy="100" r="85" />
                    <circle
                      className={`circle-fill circle-${confidenceColor}`}
                      cx="100"
                      cy="100"
                      r="85"
                      style={{
                        strokeDashoffset: `calc(534 - (534 * ${displayScan.confidence}) / 100)`
                      }}
                    />
                  </svg>
                  <div className="circle-content">
                    <div className="circle-value">{displayScan.confidence}%</div>
                    <div className="circle-label">{confidenceLabel}</div>
                  </div>
                </div>

                <div className="assessment-alerts">
                  <div className="alert-box warning">
                    <div className="alert-icon">⚠</div>
                    <div className="alert-content">
                      <h4>Low Confidence Detection</h4>
                      <p>The AI detected patterns that suggest possible manipulation, but confidence is below the threshold for automatic classification.</p>
                    </div>
                  </div>

                  <div className="alert-box info">
                    <div className="alert-icon">⏱</div>
                    <div className="alert-content">
                      <h4>Expert Review Required</h4>
                      <p>Cases with scores between 60-80% are automatically sent to human experts for verification.</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Detection Metrics */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="metrics-card-modern"
            >
              <h2 className="card-title-modern">Detection Metrics</h2>

              <div className="radar-chart">
                <svg viewBox="0 0 400 400" className="radar-svg">
                  {/* Grid circles */}
                  <circle cx="200" cy="200" r="150" fill="none" stroke="rgba(139, 92, 246, 0.1)" strokeWidth="1" />
                  <circle cx="200" cy="200" r="120" fill="none" stroke="rgba(139, 92, 246, 0.1)" strokeWidth="1" />
                  <circle cx="200" cy="200" r="90" fill="none" stroke="rgba(139, 92, 246, 0.1)" strokeWidth="1" />
                  <circle cx="200" cy="200" r="60" fill="none" stroke="rgba(139, 92, 246, 0.1)" strokeWidth="1" />
                  <circle cx="200" cy="200" r="30" fill="none" stroke="rgba(139, 92, 246, 0.1)" strokeWidth="1" />

                  {/* Axis lines */}
                  <line x1="200" y1="200" x2="200" y2="50" stroke="rgba(139, 92, 246, 0.2)" strokeWidth="1" />
                  <line x1="200" y1="200" x2="330" y2="135" stroke="rgba(139, 92, 246, 0.2)" strokeWidth="1" />
                  <line x1="200" y1="200" x2="330" y2="265" stroke="rgba(139, 92, 246, 0.2)" strokeWidth="1" />
                  <line x1="200" y1="200" x2="200" y2="350" stroke="rgba(139, 92, 246, 0.2)" strokeWidth="1" />
                  <line x1="200" y1="200" x2="70" y2="265" stroke="rgba(139, 92, 246, 0.2)" strokeWidth="1" />

                  {/* Data polygon */}
                  <polygon
                    points="200,95 283,155 283,245 200,305 117,245"
                    fill="rgba(16, 185, 129, 0.2)"
                    stroke="rgba(16, 185, 129, 0.8)"
                    strokeWidth="2"
                  />

                  {/* Data points */}
                  <circle cx="200" cy="95" r="4" fill="#10b981" />
                  <circle cx="283" cy="155" r="4" fill="#10b981" />
                  <circle cx="283" cy="245" r="4" fill="#10b981" />
                  <circle cx="200" cy="305" r="4" fill="#10b981" />
                  <circle cx="117" cy="245" r="4" fill="#10b981" />
                </svg>

                <div className="radar-labels">
                  <div className="radar-label" style={{top: '10%', left: '50%'}}>
                    <span>Lighting</span>
                    <span className="label-value">{displayScan.metrics.lighting}</span>
                  </div>
                  <div className="radar-label" style={{top: '25%', right: '5%'}}>
                    <span>Shadows</span>
                    <span className="label-value">{displayScan.metrics.shadows}</span>
                  </div>
                  <div className="radar-label" style={{bottom: '25%', right: '5%'}}>
                    <span>Facial Expression</span>
                    <span className="label-value">{displayScan.metrics.facialExpression}</span>
                  </div>
                  <div className="radar-label" style={{bottom: '10%', left: '50%'}}>
                    <span>Motion Flow</span>
                    <span className="label-value">{displayScan.metrics.motionFlow}</span>
                  </div>
                  <div className="radar-label" style={{bottom: '25%', left: '5%'}}>
                    <span>Audio-Lip Sync</span>
                    <span className="label-value">{displayScan.metrics.audioLipSync}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Key Indicators */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="indicators-card-modern"
            >
              <h2 className="card-title-modern">Key Analysis Points</h2>
              <div className="indicators-list">
                {displayScan.signals.map((signal, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="indicator-item"
                  >
                    <span className="indicator-icon">🔍</span>
                    <span className="indicator-text">{signal}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="results-right-col">
            {/* Scan Details */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 }}
              className="details-mini-card"
            >
              <h3>📊 Scan Details</h3>
              <div className="details-list">
                <div className="detail-row">
                  <span className="detail-label">File Name</span>
                  <span className="detail-value">{displayScan.filename}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Media Type</span>
                  <span className="detail-value">{displayScan.type.toUpperCase()}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Analysis Model</span>
                  <span className="detail-value">{displayScan.model.name} v{displayScan.model.version}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Scan Duration</span>
                  <span className="detail-value">{displayScan.scanDuration}s</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Frames Analyzed</span>
                  <span className="detail-value">{displayScan.framesAnalyzed}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Analysis Date</span>
                  <span className="detail-value">{displayScan.analysisDate}</span>
                </div>
              </div>
            </motion.div>

            {/* Why Expert Review */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="expert-info-card"
            >
              <div className="expert-header">
                <span className="expert-icon">👨‍⚖️</span>
                <h3>Why Expert Review?</h3>
              </div>
              <p className="expert-description">
                AI detection is highly accurate, but human experts provide essential verification for edge cases and continuously improve our models.
              </p>
              <div className="expert-benefits">
                <div className="benefit-item">
                  <span className="benefit-check">✓</span>
                  <span>Validates AI predictions</span>
                </div>
                <div className="benefit-item">
                  <span className="benefit-check">✓</span>
                  <span>Catches subtle manipulations</span>
                </div>
                <div className="benefit-item">
                  <span className="benefit-check">✓</span>
                  <span>Improves future detection</span>
                </div>
              </div>
              <button className="notification-btn">
                <span>📧</span>
                <span>Get Email Notification</span>
              </button>
            </motion.div>

            {/* Expert Comments */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="comments-card"
            >
              <div className="comments-header">
                <h3>Expert Comments</h3>
                <span className="comments-icon">💬</span>
              </div>

              <div className="comment-item">
                <div className="comment-avatar" style={{background: 'linear-gradient(135deg, #8b5cf6, #ec4899)'}}>
                  SC
                </div>
                <div className="comment-content">
                  <div className="comment-header-info">
                    <span className="comment-author">Dr. Sarah Chen</span>
                    <span className="comment-time">5 minutes ago</span>
                  </div>
                  <p className="comment-text">
                    {displayScan.confidence < 70
                      ? "I've reviewed the analysis and the manipulation patterns are quite clear. I'm flagging this for further investigation."
                      : displayScan.confidence >= 80
                      ? "Analysis looks solid. All metrics show consistent patterns. I'm marking this as verified authentic."
                      : "I'm examining the shadow patterns in detail. There are some interesting inconsistencies that warrant closer inspection."}
                  </p>
                </div>
              </div>

              <div className="comment-item">
                <div className="comment-avatar" style={{background: 'linear-gradient(135deg, #10b981, #06b6d4)'}}>
                  AI
                </div>
                <div className="comment-content">
                  <div className="comment-header-info">
                    <span className="comment-author">System</span>
                    <span className="comment-time">10 minutes ago</span>
                  </div>
                  <p className="comment-text">
                    {displayScan.confidence < 70
                      ? `High-confidence deepfake detection (${displayScan.confidence}%). Case flagged for priority expert review.`
                      : displayScan.confidence >= 80
                      ? `High-confidence authentic media (${displayScan.confidence}%). Case marked for routine verification.`
                      : `Case automatically escalated to expert review based on confidence score of ${displayScan.confidence}%.`}
                  </p>
                </div>
              </div>

              <div className="comments-footer">
                New comments will appear here as experts review your submission
              </div>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="actions-card-modern"
            >
              <h3>Quick Actions</h3>
              <div className="action-buttons">
                <button className="action-button">
                  <span className="action-icon">📄</span>
                  <div className="action-text">
                    <span className="action-title">Export Report</span>
                    <span className="action-desc">Download PDF</span>
                  </div>
                </button>
                <button className="action-button">
                  <span className="action-icon">🔗</span>
                  <div className="action-text">
                    <span className="action-title">Share Results</span>
                    <span className="action-desc">Generate link</span>
                  </div>
                </button>
                <button className="action-button" onClick={() => navigate('/scan')}>
                  <span className="action-icon">🔄</span>
                  <div className="action-text">
                    <span className="action-title">Scan Another</span>
                    <span className="action-desc">New analysis</span>
                  </div>
                </button>
              </div>
            </motion.div>

            {/* Disclaimer */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="disclaimer-card"
            >
              <div className="disclaimer-icon">⚠️</div>
              <p>
                <strong>Remember:</strong> This is a demonstration application.
                No real AI analysis is performed. All results are randomly generated for demonstration purposes.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResultsPage