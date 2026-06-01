import { useLocation, useNavigate } from 'react-router-dom';
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
              background: 'rgba(0,0,0,0.6)',
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
              background: 'rgba(2, 6, 23, 0.98)',
              borderRight: '1px solid rgba(34,211,238,0.18)',
              zIndex: 1200,
              display: 'flex', flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Top accent */}
            <div style={{ height: '2px', background: 'linear-gradient(90deg,#22d3ee,#a855f7 50%,transparent)' }} />

            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '18px 20px 16px',
              borderBottom: '1px solid rgba(34,211,238,0.1)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  background: 'linear-gradient(135deg,rgba(34,211,238,0.25),rgba(139,92,246,0.25))',
                  border: '1px solid rgba(34,211,238,0.35)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px', fontWeight: 800, color: '#22d3ee', letterSpacing: '0.05em',
                }}>RC</div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#f1f5f9', letterSpacing: '-0.01em' }}>
                    REALITY<span style={{ color: '#22d3ee' }}>CHECK</span>
                  </div>
                  
                </div>
              </div>

              <button
                onClick={onClose}
                aria-label="Close sidebar"
                style={{
                  width: '30px', height: '30px', borderRadius: '7px',
                  border: '1px solid rgba(148,163,184,0.15)',
                  background: 'rgba(148,163,184,0.05)',
                  color: '#64748b', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '16px', lineHeight: 1, transition: 'all 0.15s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(34,211,238,0.4)';
                  e.currentTarget.style.color = '#22d3ee';
                  e.currentTarget.style.background = 'rgba(34,211,238,0.08)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(148,163,184,0.15)';
                  e.currentTarget.style.color = '#64748b';
                  e.currentTarget.style.background = 'rgba(148,163,184,0.05)';
                }}
              >✕</button>
            </div>

            {/* Nav */}
            <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
              {menuSections.map(section => (
                <div key={section.label} style={{ marginBottom: '4px' }}>
                  <div style={{
                    fontSize: '9px', letterSpacing: '0.2em', color: '#1e293b',
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
                          background: isActive ? 'rgba(34,211,238,0.07)' : 'transparent',
                          border: 'none',
                          borderLeft: `2px solid ${isActive ? '#22d3ee' : 'transparent'}`,
                          color: isActive ? '#eaeaea' : '#475569',
                          fontSize: '19px', fontWeight: isActive ? 700 : 500,
                          cursor: 'pointer', textAlign: 'left',
                          transition: 'all 0.15s', letterSpacing: '0.01em',
                        }}
                        onMouseEnter={e => {
                          if (!isActive) {
                            e.currentTarget.style.background = 'rgba(34,211,238,0.04)';
                            e.currentTarget.style.color = '#94a3b8';
                            e.currentTarget.style.borderLeftColor = 'rgba(34,211,238,0.3)';
                          }
                        }}
                        onMouseLeave={e => {
                          if (!isActive) {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = '#475569';
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
                              ? 'rgba(168,85,247,0.12)' : 'rgba(34,211,238,0.1)',
                            color: item.badge === 'Free' ? '#c084fc' : '#22d3ee',
                            border: `1px solid ${item.badge === 'Free' ? 'rgba(168,85,247,0.25)' : 'rgba(34,211,238,0.2)'}`,
                            letterSpacing: '0.08em', fontWeight: 600,
                          }}>
                            {item.badge}
                          </span>
                        )}
                        {isActive && (
                          <span style={{ color: '#22d3ee', fontSize: '12px', opacity: 0.6 }}>›</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </nav>

            <div style={{ height: '1px', background: 'rgba(34,211,238,0.08)', margin: '0 20px' }} />

            {/* User section */}
            <div style={{ padding: '14px 20px' }}>
              {user ? (
                <>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '10px 12px',
                    background: 'rgba(34,211,238,0.04)',
                    border: '1px solid rgba(34,211,238,0.1)',
                    borderRadius: '10px', marginBottom: '10px',
                  }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '8px',
                      background: 'linear-gradient(135deg,rgba(34,211,238,0.3),rgba(139,92,246,0.3))',
                      border: '1px solid rgba(34,211,238,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '11px', fontWeight: 700, color: '#22d3ee', flexShrink: 0,
                    }}>{initials}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {user.name ?? user.username ?? 'User'}
                      </div>
                      <div style={{ fontSize: '10px', color: '#334155', textTransform: 'capitalize', letterSpacing: '0.05em' }}>
                        {user.role ?? 'Member'}
                      </div>
                    </div>
                    <div style={{
                      width: '7px', height: '7px', borderRadius: '50%',
                      background: '#22d3ee', boxShadow: '0 0 5px rgba(34,211,238,0.7)', flexShrink: 0,
                    }} />
                  </div>

                  <button
                    onClick={handleLogout}
                    style={{
                      width: '100%', padding: '8px',
                      border: '1px solid rgba(148,163,184,0.12)',
                      borderRadius: '8px', background: 'transparent',
                      color: '#334155', fontSize: '12px', cursor: 'pointer',
                      letterSpacing: '0.06em', textTransform: 'uppercase',
                      fontWeight: 500, transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = 'rgba(239,68,68,0.35)';
                      e.currentTarget.style.color = '#ef4444';
                      e.currentTarget.style.background = 'rgba(239,68,68,0.05)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'rgba(148,163,184,0.12)';
                      e.currentTarget.style.color = '#334155';
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
                      border: '1px solid rgba(34,211,238,0.3)',
                      borderRadius: '8px',
                      background: 'rgba(34,211,238,0.06)',
                      color: '#22d3ee', fontSize: '12px', cursor: 'pointer',
                      letterSpacing: '0.06em', textTransform: 'uppercase',
                      fontWeight: 600, transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(34,211,238,0.12)';
                      e.currentTarget.style.borderColor = 'rgba(34,211,238,0.6)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'rgba(34,211,238,0.06)';
                      e.currentTarget.style.borderColor = 'rgba(34,211,238,0.3)';
                    }}
                  >Sign In</button>
                  <button
                    onClick={() => handleNav('/demo')}
                    style={{
                      width: '100%', padding: '9px',
                      border: '1px solid rgba(168,85,247,0.25)',
                      borderRadius: '8px', background: 'transparent',
                      color: '#94a3b8', fontSize: '12px', cursor: 'pointer',
                      letterSpacing: '0.06em', textTransform: 'uppercase',
                      fontWeight: 500, transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = 'rgba(168,85,247,0.5)';
                      e.currentTarget.style.color = '#c084fc';
                      e.currentTarget.style.background = 'rgba(168,85,247,0.06)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'rgba(168,85,247,0.25)';
                      e.currentTarget.style.color = '#94a3b8';
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >Try Demo — No Login</button>
                </div>
              )}
            </div>

            {/* Bottom accent */}
            <div style={{ height: '2px', background: 'linear-gradient(90deg,transparent,#a855f7 50%,#22d3ee)' }} />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}