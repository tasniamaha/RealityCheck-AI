import { motion } from 'framer-motion';

const STATS = [
  { pulse: true,  text: 'Live: 24/7 scans in progress' },
  { pulse: true,  text: 'Active Experts: 3 online' },
  { pulse: false, text: 'Models: SigLIP · Xception · EfficientNet' },
  { pulse: true,  text: 'Accuracy: 87% across all media types' },
];

const ITEMS = [...STATS, ...STATS];

export default function LiveStatsBar() {
  return (
    <div style={{
      width: '100%',
      background: 'rgba(2, 8, 23, 0.82)',
      borderTop: '1px solid rgba(34,211,238,0.15)',
      borderBottom: '1px solid rgba(34,211,238,0.15)',
      overflow: 'hidden',
      padding: '8px 0',
    }}>
      <motion.div
        style={{ display: 'flex', alignItems: 'center', width: 'max-content' }}
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
      >
        {ITEMS.map((item, i) => (
          <span
            key={i}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '14px',
fontWeight: 700,
color: '#e2e8f0',
letterSpacing: '0.08em',
marginRight: '70px',
padding: '0 10px',
            }}
          >
            {item.pulse && (
              <span style={{
                display: 'inline-block',
                width: '5px', height: '5px',
                borderRadius: '50%',
                background: '#22d3ee',
                boxShadow: '0 0 5px rgba(34,211,238,0.8)',
                animation: 'lsbPulse 2s infinite',
                flexShrink: 0,
              }} />
            )}
            {item.text}
          </span>
        ))}
      </motion.div>

      <style>{`
        @keyframes lsbPulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.25; }
        }
      `}</style>
    </div>
  );
}