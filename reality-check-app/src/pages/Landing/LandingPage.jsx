import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../../components/common/Button';
import AnimatedCard from '../../components/common/AnimatedCard';
import PageTransition from '../../components/Layout/PageTransition';
import './Landing.css';

const LandingPage = () => {
  const [scanCount, setScanCount] = useState(0);
  const [deepfakeCount, setDeepfakeCount] = useState(0);
  const [authenticCount, setAuthenticCount] = useState(0);
  const [uncertainCount, setUncertainCount] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setScanCount(14827), 300),
      setTimeout(() => setDeepfakeCount(8921), 600),
      setTimeout(() => setAuthenticCount(4893), 900),
      setTimeout(() => setUncertainCount(1013), 1200)
    ];

    return () => timers.forEach(timer => clearTimeout(timer));
  }, []);

  const features = [
    {
      icon: '⚛️',
      title: 'Visual Physics Analysis',
      description: 'AI detects inconsistencies in lighting, shadows, and reflection patterns with 99.2% accuracy',
      color: 'purple'
    },
    {
      icon: '😊',
      title: 'Facial Expression AI',
      description: 'Advanced neural networks analyze micro-expressions and natural movement patterns',
      color: 'emerald'
    },
    {
      icon: '👄',
      title: 'Audio-Lip Synchronization',
      description: 'Precise temporal analysis ensures speech matches lip movements accurately',
      color: 'navy'
    },
    {
      icon: '🧠',
      title: 'Continuous Learning',
      description: 'Self-improving AI model that learns from every verification',
      color: 'purple'
    }
  ];

  const stats = [
    { label: 'Total Scans', value: scanCount, color: 'purple' },
    { label: 'Deepfakes Detected', value: deepfakeCount, color: 'emerald' },
    { label: 'Authentic Media', value: authenticCount, color: 'navy' },
    { label: 'Uncertain Cases', value: uncertainCount, color: 'purple' }
  ];

  return (
    <PageTransition>
      <div className="landing-page">
        {/* Dynamic Animated Background */}
        <div className="landing-bg">
          <div className="landing-bg-orb landing-orb-1"></div>
          <div className="landing-bg-orb landing-orb-2"></div>
          <div className="landing-bg-orb landing-orb-3"></div>
          <div className="landing-bg-orb landing-orb-4"></div>
          <div className="landing-bg-grid"></div>
          <div className="landing-bg-particles">
            <div className="particle"></div>
            <div className="particle"></div>
            <div className="particle"></div>
            <div className="particle"></div>
            <div className="particle"></div>
            <div className="particle"></div>
            <div className="particle"></div>
            <div className="particle"></div>
            <div className="particle"></div>
            <div className="particle"></div>
          </div>
        </div>

        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="hero-badge"
            >
              <span className="badge-icon">🛡️</span>
              <span>Advanced AI Detection</span>
            </motion.div>

            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="hero-title"
            >
              Reality Check
            </motion.h1>

            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="hero-subheading"
            >
              AI-Powered Deepfake Detection
            </motion.h2>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="hero-subtitle"
            >
              Analyze visual physics, facial expressions, shadow patterns, and audio-lip synchronization to uncover synthetic media with unprecedented accuracy
            </motion.p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="hero-actions"
            >
              <Link to="/scan">
                <Button variant="primary" size="large" className="hero-cta-button">
                  Start Verification Now
                </Button>
              </Link>

              <Link to="/demo">
                <Button variant="outline" size="large" className="hero-demo-button">
                  Interactive Demo
                </Button>
              </Link>
            </motion.div>


          </div>
        </section>

        {/* Features Section */}
        <section className="features-section">
          <div className="section-header">
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="section-title"
            >
              Advanced Detection Technology
            </motion.h2>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="section-description"
            >
              A multi-layered, scientific approach combining AI precision with human expertise
            </motion.p>
          </div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="feature-card"
              >
                <div className="feature-header">
                  <div className="feature-icon-wrapper">
                    <span className="feature-icon">{feature.icon}</span>
                  </div>
                  <h3>{feature.title}</h3>
                </div>
                <p>{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Demo Preview Section */}
        <section className="demo-preview-section">
          <div className="demo-container">
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="demo-title"
            >
              Interactive Detection Demo
            </motion.h2>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="demo-description"
            >
              Experience our AI in action with live detection demonstrations
            </motion.p>

            <div className="demo-stats">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="demo-stat-card"
              >
                <div className="demo-stat-circle">
                  <div className="demo-stat-value">98.7%</div>
                </div>
                <div className="demo-stat-label">Detection Accuracy</div>
              </motion.div>

              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="demo-stat-card"
              >
                <div className="demo-stat-circle">
                  <div className="demo-stat-value">2.3s</div>
                </div>
                <div className="demo-stat-label">Average Analysis Time</div>
              </motion.div>

              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="demo-stat-card"
              >
                <div className="demo-stat-circle">
                  <div className="demo-stat-value">99.9%</div>
                </div>
                <div className="demo-stat-label">User Satisfaction</div>
              </motion.div>
            </div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="demo-actions"
            >
              <Link to="/demo">
                <Button variant="secondary" size="large">
                  Launch Interactive Demo
                </Button>
              </Link>
              <Link to="/how-it-works">
                <Button variant="outline" size="large">
                  View Technical Details
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <div className="cta-content">
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="cta-title"
            >
              Ready to Verify Reality?
            </motion.h2>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="cta-description"
            >
              Join thousands of organizations and individuals protecting themselves from synthetic media. Or become an expert and help verify content worldwide.
            </motion.p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="cta-buttons"
            >
              <Link to="/signup">
                <Button variant="primary" size="large">
                  Create Free Account
                </Button>
              </Link>

              <Link to="/expert-apply">
                <Button variant="outline" size="large">
                  Apply as Expert
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Live Stats Bar */}
        <motion.div
          className="live-stats-bar"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="stats-scroll">
            <div className="stats-item">
              <span className="stat-pulse"></span>
              <span>Live: 247 scans in progress</span>
            </div>
            <div className="stats-item">
              <span className="stat-pulse"></span>
              <span>Active Experts: 52 online</span>
            </div>
            <div className="stats-item">
              <span className="stat-pulse"></span>
              <span>Uptime: 99.99% this month</span>
            </div>
            <div className="stats-item">
              <span className="stat-pulse"></span>
              <span>New Detection: Audio watermarking</span>
            </div>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default LandingPage;