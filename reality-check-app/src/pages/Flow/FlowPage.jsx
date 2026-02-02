import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Card from '../../components/common/Card.jsx'
import './Flow.css'

const FlowPage = () => {
  const navigate = useNavigate()

  const flowSteps = [
    {
      id: 'landing',
      icon: '🏠',
      title: 'Landing Page',
      color: '#06b6d4'
    },
    {
      id: 'upload',
      icon: '📤',
      title: 'Upload Media',
      color: '#8b5cf6'
    },
    {
      id: 'processing',
      icon: '⚙️',
      title: 'AI Processing',
      color: '#a855f7'
    },
    {
      id: 'detection',
      icon: '📊',
      title: 'Detection Score',
      color: '#10b981'
    },
    {
      id: 'expert',
      icon: '👥',
      title: 'Expert Review',
      color: '#f59e0b'
    },
    {
      id: 'dataset',
      icon: '💾',
      title: 'Learning Dataset',
      color: '#06b6d4'
    }
  ]

  const detectionMethods = [
    {
      title: 'Facial Landmark Analysis',
      description: 'Examines consistency in facial features, eye blinking patterns, and micro-expressions.',
      icon: '👁️',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      title: 'Temporal Coherence',
      description: 'Checks for smooth, natural movements and consistent timing in video frames.',
      icon: '⏱️',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    {
      title: 'Lighting & Shadow Analysis',
      description: 'Verifies consistency in lighting direction, intensity, and shadow behavior.',
      icon: '💡',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    },
    {
      title: 'Digital Fingerprinting',
      description: 'Analyzes compression artifacts, noise patterns, and editing signatures.',
      icon: '🔍',
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  }

  return (
    <div className="flow-page-modern">
      {/* Animated Background */}
      <div className="flow-bg">
        <div className="flow-bg-orb flow-orb-1"></div>
        <div className="flow-bg-orb flow-orb-2"></div>
        <div className="flow-bg-orb flow-orb-3"></div>
        <div className="flow-bg-grid"></div>
      </div>

      <div className="flow-container-modern">
        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flow-hero"
        >
          <h1 className="flow-main-title">Detection Flow</h1>
          <p className="flow-subtitle">
            Follow the complete journey from upload to verified results
          </p>
        </motion.div>

        {/* Streamlined Flow Visualization */}
        <section className="flow-visualization-section">
          <div className="flow-steps-horizontal">
            {flowSteps.map((step, index) => (
              <div key={step.id} className="flow-item-wrapper">
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    delay: index * 0.15,
                    type: "spring",
                    stiffness: 150,
                    damping: 15
                  }}
                  className="flow-node-compact"
                  whileHover={{ scale: 1.1, y: -5 }}
                >
                  <motion.div
                    className="flow-circle-compact"
                    style={{
                      background: step.color,
                      boxShadow: `0 8px 25px ${step.color}60`
                    }}
                    animate={{
                      boxShadow: [
                        `0 8px 20px ${step.color}40`,
                        `0 8px 30px ${step.color}70`,
                        `0 8px 20px ${step.color}40`
                      ]
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      delay: index * 0.2
                    }}
                  >
                    <span className="flow-icon-compact">{step.icon}</span>

                    {/* Ripple Animation */}
                    <motion.div
                      className="flow-ripple"
                      style={{ borderColor: step.color }}
                      animate={{
                        scale: [1, 1.8, 1.8],
                        opacity: [0.6, 0.3, 0]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: index * 0.3
                      }}
                    />
                    <motion.div
                      className="flow-ripple"
                      style={{ borderColor: step.color }}
                      animate={{
                        scale: [1, 1.8, 1.8],
                        opacity: [0.6, 0.3, 0]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: index * 0.3 + 0.6
                      }}
                    />
                  </motion.div>
                  <h3 className="flow-title-compact">{step.title}</h3>
                </motion.div>

                {/* Line Connector with Moving Dot */}
                {index < flowSteps.length - 1 && (
                  <motion.div
                    className="flow-arrow-wrapper"
                    initial={{ opacity: 0, scaleX: 0 }}
                    whileInView={{ opacity: 1, scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{
                      delay: index * 0.15 + 0.2,
                      duration: 0.5
                    }}
                  >
                    <svg className="flow-arrow-svg" viewBox="0 0 100 3" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id={`grad-${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor={step.color} />
                          <stop offset="100%" stopColor={flowSteps[index + 1].color} />
                        </linearGradient>
                      </defs>
                      <motion.line
                        x1="0"
                        y1="1.5"
                        x2="100"
                        y2="1.5"
                        stroke={`url(#grad-${index})`}
                        strokeWidth="3"
                        strokeLinecap="round"
                        initial={{ pathLength: 0, opacity: 0 }}
                        whileInView={{ pathLength: 1, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{
                          delay: index * 0.15 + 0.3,
                          duration: 0.6,
                          ease: "easeInOut"
                        }}
                      />
                    </svg>

                    {/* Moving Dot */}
                    <motion.div
                      className="flow-dot"
                      style={{ background: step.color }}
                      animate={{
                        left: ['0%', '100%'],
                        opacity: [0, 1, 1, 0]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: index * 0.3,
                        ease: "linear"
                      }}
                    />
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Detection Methods */}
        <section className="methods-section-modern">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="section-title-modern"
          >
            🎯 Detection Methods
          </motion.h2>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="methods-grid-compact"
          >
            {detectionMethods.map((method, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="method-card-compact"
                whileHover={{
                  scale: 1.03,
                  y: -5,
                  transition: { duration: 0.2 }
                }}
              >
                <div
                  className="method-icon-box"
                  style={{ background: method.gradient }}
                >
                  <span className="method-icon-small">{method.icon}</span>
                </div>
                <div className="method-content">
                  <h3>{method.title}</h3>
                  <p>{method.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Stats Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="stats-section-modern"
        >
          <div className="stats-grid-compact">
            {[
              { value: '98.7%', label: 'Accuracy', icon: '🎯' },
              { value: '2.3s', label: 'Avg. Time', icon: '⚡' },
              { value: '50K+', label: 'Analyzed', icon: '📊' },
              { value: '99.9%', label: 'Satisfaction', icon: '⭐' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="stat-card-compact"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                whileHover={{ scale: 1.05, y: -3 }}
              >
                <div className="stat-icon-small">{stat.icon}</div>
                <div className="stat-value-small">{stat.value}</div>
                <div className="stat-label-small">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Disclaimer */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="disclaimer-section-compact"
        >
          <div className="disclaimer-card-compact">
            <div className="disclaimer-icon-small">⚠️</div>
            <div className="disclaimer-text">
              <h3>Important Disclaimer</h3>
              <p>This is a demonstration application. No real AI analysis is performed. All results are randomly generated for educational purposes only.</p>
            </div>
          </div>
        </motion.section>

        {/* CTA Section */}
        <motion.section
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="cta-section-compact"
        >
          <div className="cta-card-compact">
            <h2>Ready to Try?</h2>
            <p>Experience the deepfake detection process firsthand</p>
            <div className="cta-buttons-compact">
              <motion.button
                onClick={() => navigate('/scan')}
                className="cta-btn cta-btn-primary"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <span>🔍</span>
                <span>Start Scan</span>
              </motion.button>
              <motion.button
                onClick={() => navigate('/demo')}
                className="cta-btn cta-btn-outline"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <span>🎮</span>
                <span>Try Demo</span>
              </motion.button>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  )
}

export default FlowPage