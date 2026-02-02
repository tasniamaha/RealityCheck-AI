import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import { motion } from 'framer-motion';
import './Expert.css';

const ExpertPage = () => {
  const [stats, setStats] = useState({
    experts: 0,
    accuracy: 0,
    turnaround: 0
  });

  useEffect(() => {
    // Animate stats counting up
    const timer = setTimeout(() => {
      setStats({
        experts: 52,
        accuracy: 98.7,
        turnaround: 24
      });
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const requirements = [
    {
      icon: '🎓',
      title: 'Minimum 3 years experience',
      description: 'In digital forensics or AI/ML fields',
      color: 'var(--accent-purple)'
    },
    {
      icon: '👁️',
      title: 'Computer Vision Background',
      description: 'Or multimedia analysis expertise',
      color: 'var(--accent-emerald)'
    },
    {
      icon: '🔍',
      title: 'Deepfake Detection Experience',
      description: 'Tools and techniques proficiency',
      color: 'var(--accent-navy)'
    },
    {
      icon: '⚡',
      title: 'Analytical Excellence',
      description: 'Complex case analysis with precision',
      color: 'var(--accent-purple)'
    },
    {
      icon: '⚖️',
      title: 'Ethical Integrity',
      description: 'Commitment to accuracy and standards',
      color: 'var(--accent-emerald)'
    }
  ];

  const benefits = [
    {
      icon: '🚀',
      title: 'Advanced Tools',
      description: 'Proprietary detection suite',
      gradient: 'purple-emerald'
    },
    {
      icon: '📚',
      title: 'Continuous Training',
      description: 'Latest techniques updates',
      gradient: 'emerald-navy'
    },
    {
      icon: '💰',
      title: 'Competitive Pay',
      description: 'Per-case with accuracy bonuses',
      gradient: 'navy-purple'
    },
    {
      icon: '🏠',
      title: 'Remote Flexibility',
      description: 'Work on your schedule',
      gradient: 'purple-emerald'
    },
    {
      icon: '🌐',
      title: 'Expert Network',
      description: 'Global professional community',
      gradient: 'emerald-navy'
    },
    {
      icon: '📈',
      title: 'Career Growth',
      description: 'Specialization opportunities',
      gradient: 'navy-purple'
    }
  ];

  const processSteps = [
    { number: '01', title: 'Case Assignment', description: 'Anonymized cases for human verification' },
    { number: '02', title: 'Detailed Analysis', description: 'Specialized tools and manual inspection' },
    { number: '03', title: 'Verification Report', description: 'Comprehensive findings with confidence scores' },
    { number: '04', title: 'Quality Review', description: 'Peer validation for accuracy standards' }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div
      className="expert-page"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Hero Section with Glassmorphism */}
      <motion.section
        className="expert-hero"
        variants={itemVariants}
      >
        <div className="hero-bg-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>

        <div className="hero-content">
          <div className="logo-badge">
            <span className="logo-icon">🛡️</span>
            <span className="logo-text">Reality Check</span>
          </div>

          <motion.h1
            className="hero-title"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <span className="title-line">Expert Verification</span>
            <span className="title-gradient">Portal</span>
          </motion.h1>

          <p className="hero-subtitle">
            Join our elite network of certified deepfake detection specialists
          </p>

          <motion.div
            className="hero-cta"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/expert-apply">
              <Button variant="gradient" size="large" className="cta-button">
                <span className="button-content">
                  <span className="button-text">Become an Expert</span>
                  <span className="button-arrow">→</span>
                </span>
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Stats Section with Circular Progress */}
      <motion.section
        className="stats-section"
        variants={itemVariants}
      >
        <div className="section-header">
          <h2 className="section-title">
            <span className="title-decorator"></span>
            Trusted by Industry Leaders
            <span className="title-decorator"></span>
          </h2>
          <p className="section-description">
            Where AI meets human expertise for unparalleled accuracy
          </p>
        </div>

        <div className="stats-cards">
          <div className="stat-card">
            <div className="stat-circle">
              <svg className="circular-chart" viewBox="0 0 36 36">
                <path
                  className="circle-bg"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="circle"
                  strokeDasharray={`${stats.experts}, 100`}
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="stat-value">{stats.experts}+</div>
            </div>
            <h3>Certified Experts</h3>
            <p>Global network of specialists</p>
          </div>

          <div className="stat-card">
            <div className="stat-circle">
              <svg className="circular-chart" viewBox="0 0 36 36">
                <path
                  className="circle-bg"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="circle"
                  strokeDasharray={`${stats.accuracy}, 100`}
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="stat-value">{stats.accuracy}%</div>
            </div>
            <h3>Accuracy Rate</h3>
            <p>Industry-leading precision</p>
          </div>

          <div className="stat-card">
            <div className="stat-circle">
              <svg className="circular-chart" viewBox="0 0 36 36">
                <path
                  className="circle-bg"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="circle"
                  strokeDasharray={`${stats.turnaround}, 100`}
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="stat-value">{stats.turnaround}h</div>
            </div>
            <h3>Turnaround</h3>
            <p>Average case completion</p>
          </div>
        </div>
      </motion.section>

      {/* Requirements Section */}
      <motion.section
        className="requirements-section"
        variants={itemVariants}
      >
        <div className="section-header">
          <h2 className="section-title">
            <span className="section-icon">🎯</span>
            Elite Requirements
            <span className="title-badge">High Standards</span>
          </h2>
          <p className="section-description">
            We accept only the most qualified professionals
          </p>
        </div>

        <div className="requirements-grid">
          {requirements.map((req, index) => (
            <motion.div
              key={index}
              className="requirement-card"
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div
                className="requirement-icon"
                style={{ background: req.color }}
              >
                {req.icon}
              </div>
              <h3>{req.title}</h3>
              <p>{req.description}</p>
              <div className="requirement-line" style={{ background: req.color }}></div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Benefits Section */}
      <motion.section
        className="benefits-section"
        variants={itemVariants}
      >
        <div className="section-header">
          <h2 className="section-title">
            <span className="section-icon">✨</span>
            Premium Benefits
            <span className="title-badge">Exclusive Perks</span>
          </h2>
          <p className="section-description">
            Join our network and unlock exceptional advantages
          </p>
        </div>

        <div className="benefits-grid">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              className={`benefit-card gradient-${benefit.gradient}`}
              whileHover={{
                scale: 1.05,
                rotateY: 10,
                transition: { duration: 0.3 }
              }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="benefit-icon">{benefit.icon}</div>
              <h3>{benefit.title}</h3>
              <p>{benefit.description}</p>
              <div className="benefit-hover"></div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Process Section */}
      <motion.section
        className="process-section"
        variants={itemVariants}
      >
        <div className="section-header">
          <h2 className="section-title">
            <span className="section-icon">🔄</span>
            Seamless Process
            <span className="title-badge">4 Steps</span>
          </h2>
          <p className="section-description">
            Our streamlined workflow ensures maximum efficiency
          </p>
        </div>

        <div className="process-timeline">
          {processSteps.map((step, index) => (
            <motion.div
              key={index}
              className="process-step"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
            >
              <div className="step-number">{step.number}</div>
              <div className="step-content">
                <div className="step-header">
                  <div className="step-dot"></div>
                  <div className="step-line"></div>
                </div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        className="cta-section"
        variants={itemVariants}
      >
        <div className="cta-container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Make an Impact?</h2>
            <p className="cta-description">
              Join the forefront of digital authenticity verification
            </p>

            <motion.div
              className="cta-buttons"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Link to="/expert-apply">
                <Button variant="gradient" size="large" className="apply-button">
                  <span className="button-text">Start Application</span>
                  <span className="button-icon">🚀</span>
                </Button>
              </Link>
              <Link to="/expert-dashboard">
                <Button variant="outline" size="large" className="demo-button">
                  <span className="button-text">View Dashboard</span>
                  <span className="button-icon">📊</span>
                </Button>
              </Link>
            </motion.div>
          </div>

          <div className="cta-note">
            <div className="note-icon">ℹ️</div>
            <p>
              <strong>Demonstration Only:</strong> This portal showcases our expert verification system.
              Actual expert services are implemented in production.
            </p>
          </div>
        </div>
      </motion.section>

      {/* Footer Quick Links */}
      <motion.footer
        className="expert-footer"
        variants={itemVariants}
      >
        <div className="footer-content">
          <div className="footer-brand">
            <h3>
              <span className="footer-logo">🛡️</span>
              Reality Check
            </h3>
            <p>Advanced AI-powered deepfake detection</p>
          </div>

          <div className="footer-links">
            <div className="link-group">
              <h4>Quick Access</h4>
              <Link to="/scan">New Analysis</Link>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/how-it-works">How It Works</Link>
              <Link to="/expert">Expert Portal</Link>
            </div>

            <div className="link-group">
              <h4>Resources</h4>
              <Link to="/documentation">Documentation</Link>
              <Link to="/research">Research</Link>
              <Link to="/blog">Blog</Link>
              <Link to="/support">Support</Link>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2024 Reality Check. Demonstration application. No real AI analysis performed.</p>
        </div>
      </motion.footer>
    </motion.div>
  );
};

export default ExpertPage;