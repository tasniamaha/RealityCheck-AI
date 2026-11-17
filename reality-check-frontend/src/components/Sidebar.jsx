import { useLocation, useNavigate } from 'react-router-dom';
import Logo from './Logo';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const menuSections = [
  {
    label: 'Main',
    items: [
      { name: 'Home',      path: '/',               icon: '' },
      { name: 'Dashboard', path: '/user-dashboard',  icon: '' },
      { name: 'New Scan',  path: '/user-dashboard',  icon: '', badge: 'Live' },
    ],
  },
  {
    label: 'Explore',
    items: [
      { name: 'Demo',            path: '/demo',            icon: '', badge: 'Free' },
      { name: 'Methodology',     path: '/methodology',     icon: '' },
      { name: 'Research Papers', path: '/research-papers', icon: '' },
    ],
  },
  {
    label: 'Review',
    items: [
      { name: 'Expert Panel',  path: '/expert-dashboard', icon: '' },
      { name: 'Admin Control', path: '/admin-dashboard',  icon: '' },
    ],
  },
];

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const navigate  = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const handleNav = (path) => { navigate(path); onClose(); };

  const handleLogout = async () => {
    await logout();
    onClose();
    navigate('/');
  };

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : user?.username
      ? user.username.slice(0, 2).toUpperCase()
      : (user?.role ?? 'U').slice(0, 2).toUpperCase();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(236,235,241,0.6)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
              zIndex: 1100,
            }}
          />

          {/* Drawer */}
          <motion.aside
            key="sidebar"
            initial={{ x: -290 }}
            animate={{ x: 0 }}
            exit={{ x: -290 }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            style={{
              position: 'fixed',
              top: 0, left: 0,
              height: '100vh', width: '280px',
              background: 'rgba(255,255,255, 0.98)',
              borderRight: '1px solid rgba(122,42,184,0.18)',
              zIndex: 1200,
              display: 'flex', flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Top accent */}
            <div style={{ height: '2px', background: '#7A2AB8' }} />

            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '18px 20px 16px',
              borderBottom: '1px solid rgba(122,42,184,0.1)',
            }}>
              <Logo size={30} />

              <button
                onClick={onClose}
                aria-label="Close sidebar"
                style={{
                  width: '30px', height: '30px', borderRadius: '7px',
                  border: '1px solid rgba(23,19,31,0.15)',
                  background: 'rgba(23,19,31,0.05)',
                  color: '#777283', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '16px', lineHeight: 1, transition: 'all 0.15s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(122,42,184,0.4)';
                  e.currentTarget.style.color = '#7A2AB8';
                  e.currentTarget.style.background = 'rgba(122,42,184,0.08)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(23,19,31,0.15)';
                  e.currentTarget.style.color = '#777283';
                  e.currentTarget.style.background = 'rgba(23,19,31,0.05)';
                }}
              >×</button>
            </div>

            {/* Nav */}
            <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
              {menuSections.map(section => (
                <div key={section.label} style={{ marginBottom: '4px' }}>
                  <div style={{
                    fontSize: '9px', letterSpacing: '0.2em', color: '#E2E0E8',
                    textTransform: 'uppercase', padding: '10px 20px 4px', fontWeight: 600,
                  }}>
                    {section.label}
                  </div>

                  {section.items.map(item => {
                    const isActive = location.pathname === item.path;
                    return (
                      <button
                        key={item.name}
                        onClick={() => handleNav(item.path)}
                        style={{
                          width: '100%',
                          display: 'flex', alignItems: 'center', gap: '12px',
                          padding: '9px 20px',
                          background: isActive ? 'rgba(122,42,184,0.07)' : 'transparent',
                          border: 'none',
                          borderLeft: `2px solid ${isActive ? '#7A2AB8' : 'transparent'}`,
                          color: isActive ? '#17131F' : '#777283',
                          fontSize: '19px', fontWeight: isActive ? 700 : 500,
                          cursor: 'pointer', textAlign: 'left',
                          transition: 'all 0.15s', letterSpacing: '0.01em',
                        }}
                        onMouseEnter={e => {
                          if (!isActive) {
                            e.currentTarget.style.background = 'rgba(122,42,184,0.04)';
                            e.currentTarget.style.color = '#575262';
                            e.currentTarget.style.borderLeftColor = 'rgba(122,42,184,0.3)';
                          }
                        }}
                        onMouseLeave={e => {
                          if (!isActive) {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = '#777283';
                            e.currentTarget.style.borderLeftColor = 'transparent';
                          }
                        }}
                      >
                        <span style={{ fontSize: '15px', width: '20px', textAlign: 'center', flexShrink: 0 }}>
                          {item.icon}
                        </span>
                        <span style={{ flex: 1 }}>{item.name}</span>
                        {item.badge && (
                          <span style={{
                            fontSize: '9px', padding: '2px 7px', borderRadius: '10px',
                            background: item.badge === 'Free'
                              ? 'rgba(122,42,184,0.12)' : 'rgba(122,42,184,0.1)',
                            color: item.badge === 'Free' ? '#7A2AB8' : '#7A2AB8',
                            border: `1px solid ${item.badge === 'Free' ? 'rgba(122,42,184,0.25)' : 'rgba(122,42,184,0.2)'}`,
                            letterSpacing: '0.08em', fontWeight: 600,
                          }}>
                            {item.badge}
                          </span>
                        )}
                        {isActive && (
                          <span style={{ color: '#7A2AB8', fontSize: '12px', opacity: 0.6 }}>›</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </nav>

            <div style={{ height: '1px', background: 'rgba(122,42,184,0.08)', margin: '0 20px' }} />

            {/* User section */}
            <div style={{ padding: '14px 20px' }}>
              {user ? (
                <>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '10px 12px',
                    background: 'rgba(122,42,184,0.04)',
                    border: '1px solid rgba(122,42,184,0.1)',
                    borderRadius: '10px', marginBottom: '10px',
                  }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '8px',
                      background: 'rgba(122,42,184,0.3)',
                      border: '1px solid rgba(122,42,184,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '11px', fontWeight: 700, color: '#7A2AB8', flexShrink: 0,
                    }}>{initials}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#17131F', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {user.name ?? user.username ?? 'User'}
                      </div>
                      <div style={{ fontSize: '10px', color: '#CDCAD5', textTransform: 'capitalize', letterSpacing: '0.05em' }}>
                        {user.role ?? 'Member'}
                      </div>
                    </div>
                    <div style={{
                      width: '7px', height: '7px', borderRadius: '50%',
                      background: '#7A2AB8', boxShadow: '0 0 5px rgba(122,42,184,0.7)', flexShrink: 0,
                    }} />
                  </div>

                  <button
                    onClick={handleLogout}
                    style={{
                      width: '100%', padding: '8px',
                      border: '1px solid rgba(23,19,31,0.12)',
                      borderRadius: '8px', background: 'transparent',
                      color: '#CDCAD5', fontSize: '12px', cursor: 'pointer',
                      letterSpacing: '0.06em', textTransform: 'uppercase',
                      fontWeight: 500, transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = 'rgba(185,40,27,0.35)';
                      e.currentTarget.style.color = '#B9281B';
                      e.currentTarget.style.background = 'rgba(185,40,27,0.05)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'rgba(23,19,31,0.12)';
                      e.currentTarget.style.color = '#CDCAD5';
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >Sign Out</button>
                </>
              ) : (
                /* Not logged in — show login/demo buttons */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button
                    onClick={() => handleNav('/login')}
                    style={{
                      width: '100%', padding: '9px',
                      border: '1px solid rgba(122,42,184,0.3)',
                      borderRadius: '8px',
                      background: 'rgba(122,42,184,0.06)',
                      color: '#7A2AB8', fontSize: '12px', cursor: 'pointer',
                      letterSpacing: '0.06em', textTransform: 'uppercase',
                      fontWeight: 600, transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(122,42,184,0.12)';
                      e.currentTarget.style.borderColor = 'rgba(122,42,184,0.6)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'rgba(122,42,184,0.06)';
                      e.currentTarget.style.borderColor = 'rgba(122,42,184,0.3)';
                    }}
                  >Sign In</button>
                  <button
                    onClick={() => handleNav('/demo')}
                    style={{
                      width: '100%', padding: '9px',
                      border: '1px solid rgba(122,42,184,0.25)',
                      borderRadius: '8px', background: 'transparent',
                      color: '#575262', fontSize: '12px', cursor: 'pointer',
                      letterSpacing: '0.06em', textTransform: 'uppercase',
                      fontWeight: 500, transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = 'rgba(122,42,184,0.5)';
                      e.currentTarget.style.color = '#7A2AB8';
                      e.currentTarget.style.background = 'rgba(122,42,184,0.06)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'rgba(122,42,184,0.25)';
                      e.currentTarget.style.color = '#575262';
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >Try Demo — No Login</button>
                </div>
              )}
            </div>

            {/* Bottom accent */}
            <div style={{ height: '2px', background: '#7A2AB8' }} />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}