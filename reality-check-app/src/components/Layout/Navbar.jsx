import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Navbar.css';

const Navbar = ({ onMenuClick }) => {
  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Left: Hamburger Menu */}
        <div className="navbar-left">
          <motion.button
            className="navbar-menu-btn"
            onClick={onMenuClick}
            aria-label="Toggle menu"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <span className="menu-icon">⋮</span>
          </motion.button>

          <div className="navbar-brand">
            <Link to="/" className="navbar-logo">
              <div className="logo-icon">
                <div className="logo-icon-circle">RC</div>
              </div>
              <span className="logo-text">Reality Check</span>
            </Link>
          </div>
        </div>

        {/* Right: Auth Buttons */}
        <div className="navbar-right">
          <div className="navbar-auth">
            {/* Login Button */}
            <motion.div
              className="auth-button-container"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link to="/login" className="auth-link">
                <button className="auth-button auth-button-login">
                  <span className="auth-button-content">
                    <span className="auth-button-text">Login</span>
                  </span>
                </button>
              </Link>
            </motion.div>

            {/* Sign Up Button */}
            <motion.div
              className="auth-button-container"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link to="/signup" className="auth-link">
                <button className="auth-button auth-button-signup">
                  <span className="auth-button-content">
                    <span className="auth-button-text">Sign Up</span>
                  </span>
                </button>
              </Link>
            </motion.div>

            {/* Expert Button */}
            <motion.div
              className="auth-button-container"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link to="/expert-apply" className="auth-link">
                <button className="auth-button auth-button-expert">
                  <span className="auth-button-content">
                    <span className="auth-button-text">Become Expert</span>
                  </span>
                </button>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;