import mark from '../assets/logo/logo-mark.png';

// The one logo used everywhere: the mark plus the name.
export default function BrandLogo({ size = 32, text = true }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: Math.round(size / 3) }}>
      <img src={mark} alt="Reality Check" style={{ width: size, height: size, objectFit: 'contain' }} />
      {text && (
        <span style={{ fontSize: Math.round(size * 0.66), fontWeight: 700, letterSpacing: '0.01em', lineHeight: 1, whiteSpace: 'nowrap' }}>
          <span style={{ color: '#a855f7' }}>Reality</span>{' '}<span style={{ color: '#ffffff' }}>Check</span>
        </span>
      )}
    </span>
  );
}
