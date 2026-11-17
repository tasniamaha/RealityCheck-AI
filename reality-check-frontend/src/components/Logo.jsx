import { Link } from 'react-router-dom';
import mark from '../assets/logo/logo-mark.png';

// The one logo. Every page uses this component, so the mark and wordmark
// never drift apart. size = height of the mark in px.
export default function Logo({ size = 34, to = '/', showName = true, className = '' }) {
  const body = (
    <span className={`inline-flex items-center ${className}`} style={{ gap: size * 0.28 }}>
      <img src={mark} alt="" width={size} height={size} style={{ width: size, height: size, display: 'block' }} />
      {showName && (
        <span
          style={{
            fontSize: size * 0.62, fontWeight: 800, fontStretch: '78%',
            letterSpacing: '-0.01em', lineHeight: 1, color: '#17131F', whiteSpace: 'nowrap',
          }}
        >
          Reality Check
        </span>
      )}
    </span>
  );
  if (!to) return body;
  return <Link to={to} aria-label="Reality Check home" style={{ textDecoration: 'none' }}>{body}</Link>;
}
