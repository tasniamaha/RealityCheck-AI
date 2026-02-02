import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Button from '../../components/common/Button.jsx'
import ProgressBar from '../../components/common/ProgressBar.jsx'
import { getRandomMockScan } from '../../data/mockData.js'
import './Demo.css'

const DemoPage = () => {
  const navigate = useNavigate()
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('')
  const [demoType, setDemoType] = useState('random')

  const demoOptions = [
    {
      id: 'real',
      title: 'Real Content',
      description: 'Generate a mock result showing authentic content',
      icon: '✅',
      confidence: 90
    },
    {
      id: 'deepfake',
      title: 'Deepfake Detection',
      description: 'Generate a mock result showing manipulated content',
      icon: '🎭',
      confidence: 55
    },
    {
      id: 'uncertain',
      title: 'Uncertain Result',
      description: 'Generate a mock result with inconclusive analysis',
      icon: '❓',
      confidence: 70
    },
    {
      id: 'random',
      title: 'Random Result',
      description: 'Generate a random mock result (default)',
      icon: '🎲',
      confidence: null
    }
  ]

  const generateDemoResult = () => {
    setIsGenerating(true)
    setProgress(5)
    setStatus('Preparing demo...')

    // Simulate analysis progress
    const intervals = [
      { time: 500, progress: 20, message: 'Loading demo data...' },
      { time: 1500, progress: 45, message: 'Simulating analysis...' },
      { time: 2500, progress: 70, message: 'Generating mock signals...' },
      { time: 3500, progress: 90, message: 'Finalizing results...' }
    ]

    intervals.forEach(interval => {
      setTimeout(() => {
        setProgress(interval.progress)
        setStatus(interval.message)
      }, interval.time)
    })

    setTimeout(() => {
      setProgress(100)
      setStatus('Demo complete!')

      setTimeout(() => {
        // Generate mock result based on selected type
        const mockResult = getRandomMockScan()

        // Override confidence based on demo type
        if (demoType === 'real') {
          mockResult.confidence = 85 + Math.random() * 10
        } else if (demoType === 'deepfake') {
          mockResult.confidence = 50 + Math.random() * 15
        } else if (demoType === 'uncertain') {
          mockResult.confidence = 65 + Math.random() * 10
        }

        // Store in sessionStorage
        sessionStorage.setItem('currentScan', JSON.stringify(mockResult))
        sessionStorage.setItem('lastScanId', mockResult.id)

        setIsGenerating(false)
        // Navigate to results
        navigate(`/results/${mockResult.id}`)
      }, 500)
    }, 4000)
  }

  return (
    <div className="demo-page-modern">
      {/* Animated Background */}
      <div className="demo-bg">
        <div className="demo-bg-orb demo-orb-1"></div>
        <div className="demo-bg-orb demo-orb-2"></div>
        <div className="demo-bg-orb demo-orb-3"></div>
        <div className="demo-bg-grid"></div>
      </div>

      <div className="demo-container-modern">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="demo-hero"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="demo-hero-icon"
          >
            🚀
          </motion.div>
          <h1>Demo Mode</h1>
          <p>Experience the app instantly without uploading files. Perfect for testing and demonstration.</p>
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="demo-info-card-modern"
        >
          <h2>⚡ Instant Experience</h2>
          <p>Demo mode lets you experience the full analysis workflow instantly. No file upload required - we generate mock results based on your selection.</p>

          <div className="demo-features-grid">
            <div className="feature-tag">⚡ Instant results (4-5s)</div>
            <div className="feature-tag">🎯 Choose result type</div>
            <div className="feature-tag">📊 Realistic simulation</div>
            <div className="feature-tag">🔍 Full result details</div>
          </div>
        </motion.div>

        {/* Demo Options */}
        <section className="demo-options-section">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="section-title-demo"
          >
            Select Demo Type
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="demo-options-grid"
          >
            {demoOptions.map((option, index) => (
              <motion.div
                key={option.id}
                className={`demo-option-card-modern ${demoType === option.id ? 'selected' : ''}`}
                onClick={() => setDemoType(option.id)}
                whileHover={{ scale: 1.03, y: -5 }}
                whileTap={{ scale: 0.97 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <div className="option-icon-large">{option.icon}</div>
                <h3>{option.title}</h3>
                <p>{option.description}</p>
                {demoType === option.id && (
                  <motion.div
                    className="selected-indicator"
                    layoutId="selected"
                  />
                )}
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Run Demo Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="demo-run-section"
        >
          <div className="demo-run-card">
            <div className="run-header">
              <h2>Run Demo</h2>
              <div className="selected-badge">
                Selected: <strong>{demoOptions.find(o => o.id === demoType)?.title}</strong>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {isGenerating ? (
                <motion.div
                  key="generating"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="demo-progress-section"
                >
                  <ProgressBar
                    progress={progress}
                    label={status}
                    animated={true}
                    showPercentage
                  />
                  <p className="progress-hint">
                    ⏳ This simulates a real analysis workflow. In a real scenario, this would take 6-10 seconds.
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="ready"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="demo-action-section"
                >
                  <motion.button
                    className="btn-generate-demo"
                    onClick={generateDemoResult}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="btn-icon">🚀</span>
                    <span>Generate Demo Result</span>
                  </motion.button>
                  <p className="demo-hint">
                    Click to instantly generate a mock analysis result. No real AI processing occurs.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Disclaimer */}
            <div className="demo-disclaimer">
              <div className="disclaimer-icon">⚠️</div>
              <div className="disclaimer-text">
                <h3>Demo Mode Information</h3>
                <p>This is a demonstration feature. All results are randomly generated for demonstration purposes only. No actual AI analysis or deepfake detection is performed in demo mode.</p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Quick Links */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="demo-links-section"
        >
          <div className="demo-link-card">
            <h3>Want to try with real files?</h3>
            <p>Upload your own images or videos for a more realistic experience.</p>
            <motion.button
              className="link-btn link-btn-primary"
              onClick={() => navigate('/scan')}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Go to Real Scan
            </motion.button>
          </div>

          <div className="demo-link-card">
            <h3>Check your demo history</h3>
            <p>View all demo results in your dashboard alongside real scans.</p>
            <motion.button
              className="link-btn link-btn-outline"
              onClick={() => navigate('/dashboard')}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              View Dashboard
            </motion.button>
          </div>
        </motion.section>
      </div>
    </div>
  )
}

export default DemoPage