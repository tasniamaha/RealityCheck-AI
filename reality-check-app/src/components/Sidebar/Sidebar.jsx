import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const sidebarRef = useRef(null);
  const [clickCount, setClickCount] = useState(0);
  const clickTimerRef = useRef(null);

  useEffect(() => {
    console.log('Sidebar isOpen state changed:', isOpen);
  }, [isOpen]);

  console.log('Sidebar component rendered, isOpen:', isOpen);

  const menuItems = [
    { name: 'Home', path: '/', icon: '🏠' },
    { name: 'Dashboard', path: '/dashboard', icon: '📊' },
    { name: 'New Scan', path: '/scan', icon: '🔍' },
    { name: 'Results', path: '/results', icon: '📋' },
    { name: 'Expert', path: '/expert', icon: '👨‍⚖️' },
    { name: 'Flow', path: '/flow', icon: '🔄' },
    { name: 'Demo', path: '/demo', icon: '🎮' },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      console.log('Added click outside listener');
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      console.log('Removed click outside listener');
    };
  }, [isOpen, onClose]);

  const handleSidebarClick = () => {
    setClickCount(prev => prev + 1);

    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
    }

    clickTimerRef.current = setTimeout(() => {
      setClickCount(0);
    }, 300);

    if (clickCount === 1) {
      onClose();
      setClickCount(0);
    }
  };

  const handleItemClick = () => {
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="sidebar-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              console.log('Overlay clicked, closing sidebar');
              onClose();
            }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              zIndex: 999
            }}
          />

          <motion.aside
            ref={sidebarRef}
            className="sidebar"
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            onClick={handleSidebarClick}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              height: '100vh',
              width: '320px',
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRight: '1px solid rgba(255, 255, 255, 0.1)',
              zIndex: 1000,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '0 0 40px rgba(0, 0, 0, 0.2)'
            }}
          >
            <div className="sidebar-header">
              <div className="sidebar-brand">
                <div className="brand-icon">
                  <div className="icon-circle">
                    <span className="icon-text">RC</span>
                  </div>
                </div>
                <div className="brand-info">
                  <h2 className="brand-name">Reality Check</h2>
                  <p className="brand-status">Deepfake Detection System</p>
                </div>
              </div>

              <button
                className="sidebar-close"
                onClick={() => {
                  console.log('Close button clicked');
                  onClose();
                }}
                aria-label="Close sidebar"
              >
                <svg className="close-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <nav className="sidebar-nav">
              <div className="nav-section">
                <h3 className="nav-section-title">Navigation</h3>
                <ul className="nav-menu">
                  {menuItems.map((item) => (
                    <li key={item.name}>
                      <Link
                        to={item.path}
                        className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                        onClick={handleItemClick}
                      >
                        <span className="nav-icon">{item.icon}</span>
                        <span className="nav-text">{item.name}</span>
                        <span className="nav-indicator">
                          <svg className="indicator-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="9 18 15 12 9 6"></polyline>
                          </svg>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="user-section">
                <div className="user-profile">
                  <div className="profile-avatar">
                    <div className="avatar-circle">
                      <span className="avatar-text">AD</span>
                    </div>
                  </div>
                  <div className="profile-info">
                    <h4 className="profile-name">Admin User</h4>
                    <p className="profile-role">System Administrator</p>
                  </div>
                </div>

                <div className="user-status">
                  <div className="status-indicator online"></div>
                  <span className="status-text">Available</span>
                </div>
              </div>
            </nav>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default Sidebar;