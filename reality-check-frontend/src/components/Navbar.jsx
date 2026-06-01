import { useNavigate, useLocation } from 'react-router-dom';

export default function Navbar({ onMenuClick }) {
  const navigate = useNavigate();
  const location = useLocation();

  const navLinks = [
    { label: 'Methodology', path: '/methodology' },
    { label: 'Research',    path: '/research-papers' },
    { label: 'Demo',        path: '/demo' },
  ];

  return (
    <nav style={{
      position: 'fixed',
      top: 0, left: 0, right: 0,
      height: '64px',
      background: 'rgba(2, 8, 23, 0.95)',
      borderBottom: '1px solid rgba(34,211,238,0.2)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      padding: '0 24px',
      gap: '16px',
    }}>

      <button
        onClick={onMenuClick}
        aria-label="Open navigation menu"
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: '5px',
          padding: '8px 10px',
          background: 'rgba(34,211,238,0.05)',
          border: '1px solid rgba(34,211,238,0.25)',
          borderRadius: '8px',
          cursor: 'pointer',
          flexShrink: 0,
          transition: 'border-color 0.2s, background 0.2s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = 'rgba(34,211,238,0.6)';
          e.currentTarget.style.background  = 'rgba(34,211,238,0.1)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'rgba(34,211,238,0.25)';
          e.currentTarget.style.background  = 'rgba(34,211,238,0.05)';
        }}
      >
        <span style={{ display: 'block', width: '18px', height: '1.5px', background: '#22d3ee', borderRadius: '2px' }} />
        <span style={{ display: 'block', width: '18px', height: '1.5px', background: '#22d3ee', borderRadius: '2px' }} />
        <span style={{ display: 'block', width: '12px', height: '1.5px', background: '#22d3ee', borderRadius: '2px' }} />
      </button>

      <button
        onClick={() => navigate('/')}
        style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          transition: 'opacity 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '0.75')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
      >
        <span style={{
          width: '36px', height: '36px', borderRadius: '8px',
          background: 'rgba(34,211,238,0.15)',
          border: '1px solid rgba(34,211,238,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '11px', fontWeight: 800, color: '#22d3ee', flexShrink: 0,
        }}>RC</span>
        <span style={{
          fontSize: '20px', fontWeight: 800,
          letterSpacing: '-0.02em', color: '#fff', lineHeight: 1,
        }}>
          REALITY<span style={{ color: '#22d3ee' }}>CHECK</span>
        </span>
      </button>

      <div style={{ flex: 1 }} />

      {navLinks.map(link => {
        const isActive = location.pathname === link.path;
        return (
          <button
            key={link.path}
            onClick={() => navigate(link.path)}
            style={{
              padding: '6px 16px',
              border: `1px solid ${isActive ? 'rgba(34,211,238,0.5)' : 'rgba(148,163,184,0.2)'}`,
              borderRadius: '20px',
              background: isActive ? 'rgba(34,211,238,0.08)' : 'transparent',
              color: isActive ? '#22d3ee' : '#94a3b8',
              fontSize: '13px',
              fontWeight: isActive ? 600 : 400,
              letterSpacing: '0.04em',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              if (!isActive) {
                e.currentTarget.style.borderColor = 'rgba(34,211,238,0.35)';
                e.currentTarget.style.color = '#e2e8f0';
              }
            }}
            onMouseLeave={e => {
              if (!isActive) {
                e.currentTarget.style.borderColor = 'rgba(148,163,184,0.2)';
                e.currentTarget.style.color = '#94a3b8';
              }
            }}
          >
            {link.label}
          </button>
        );
      })}

      <div style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        padding: '5px 12px',
        border: '1px solid rgba(34,211,238,0.15)',
        borderRadius: '20px',
        fontSize: '11px', color: '#475569', letterSpacing: '0.05em',
      }}>
        <span style={{
          width: '6px', height: '6px', borderRadius: '50%',
          background: '#22d3ee',
          boxShadow: '0 0 6px rgba(34,211,238,0.8)',
          animation: 'rcPulse 2s infinite',
        }} />
        LIVE
      </div>

      <style>{`@keyframes rcPulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
    </nav>
  );
}