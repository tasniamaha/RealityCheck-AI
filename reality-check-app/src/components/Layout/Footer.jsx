import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <h3 className="footer-title">
            <span className="footer-logo-icon">🛡️</span>
            Reality Check
          </h3>
          <p className="footer-tagline">
            Advanced AI-powered deepfake detection platform
          </p>
        </div>

        <div className="footer-links">
          <div className="footer-section">
            <h4>Product</h4>
            <ul>
              <li><Link to="/features">Features</Link></li>
              <li><Link to="/pricing">Pricing</Link></li>
              <li><Link to="/demo">Demo</Link></li>
              <li><Link to="/api">API</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Resources</h4>
            <ul>
              <li><Link to="/documentation">Documentation</Link></li>
              <li><Link to="/blog">Blog</Link></li>
              <li><Link to="/research">Research</Link></li>
              <li><Link to="/support">Support</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Company</h4>
            <ul>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/careers">Careers</Link></li>
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/terms">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="copyright">
            © {new Date().getFullYear()} Reality Check. All rights reserved.
          </p>
          <div className="footer-social">
            <a href="#" className="social-link" aria-label="Twitter">
              𝕏
            </a>
            <a href="#" className="social-link" aria-label="GitHub">
              🐙
            </a>
            <a href="#" className="social-link" aria-label="LinkedIn">
              💼
            </a>
            <a href="#" className="social-link" aria-label="Discord">
              🎮
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;