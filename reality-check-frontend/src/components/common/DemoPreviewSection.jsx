import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const STATS = [
  { value: '87%', label: 'Detection Accuracy' },
  { value: '2.3s',  label: 'Average Analysis Time' },
  { value: '89%', label: 'User Satisfaction' },
];

export default function DemoPreviewSection() {
  const navigate = useNavigate();

  return (
    <section style={{
      position: 'relative',
      padding: '100px 24px',
      background: 'rgba(2, 8, 23, 0.95)',
      overflow: 'hidden',
      textAlign: 'center',
    }}>

      {/* Floating tiny circles */}
      {[...Array(22)].map((_, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            borderRadius: '50%',
            width:  `${4 + (i % 5) * 3}px`,
            height: `${4 + (i % 5) * 3}px`,
            background: i % 3 === 0
              ? 'rgba(34,211,238,0.35)'
              : i % 3 === 1
                ? 'rgba(237, 235, 239, 0.3)'
                : 'rgba(228, 215, 215, 0.1)',
            left:  `${(i * 37 + 11) % 95}%`,
            top:   `${(i * 53 + 7)  % 90}%`,
            pointerEvents: 'none',
            filter: 'blur(0.5px)',
          }}
          animate={{
            y:       [0, -(18 + (i % 4) * 10), 0],
            x:       [0, (i % 2 === 0 ? 1 : -1) * (8 + (i % 3) * 6), 0],
            opacity: [0.3, 0.9, 0.3],
            scale:   [1, 1.3, 1],
          }}
          transition={{
            duration: 4 + (i % 5) * 1.2,
            repeat: Infinity,
            delay: (i * 0.4) % 3.5,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px', margin: '0 auto' }}>

       

        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{
            fontSize: 'clamp(2rem, 4vw, 3.2rem)',
            fontWeight: 800, color: '#f1f5f9',
            letterSpacing: '-0.02em', marginBottom: '16px',
            lineHeight: 1.15,
          }}
        >
          Interactive Detection Demo
        
        </motion.h2>
<br/>

      

        {/* Stat cards */}
        <div style={{
          display: 'flex', justifyContent: 'center',
          gap: '24px', flexWrap: 'wrap', marginBottom: '52px',
        }}>
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              style={{
                background: 'rgba(2, 11, 36, 0.8)',
                border: '1px solid rgba(227, 234, 235, 0.18)',
                borderRadius: '20px',
                padding: '28px 36px',
                minWidth: '160px',
                backdropFilter: 'blur(10px)',
              }}
            >
              <div style={{
                position: 'relative',
                width: '80px', height: '80px',
                margin: '0 auto 16px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <motion.div
                  style={{
                    position: 'absolute', inset: 0,
                    borderRadius: '50%',
                    border: '2px solid rgba(34,211,238,0.25)',
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                />
                <motion.div
                  style={{
                    position: 'absolute', inset: '8px',
                    borderRadius: '50%',
                    border: '1px solid rgba(234, 230, 239, 0.2)',
                  }}
                  animate={{ rotate: -360 }}
                  transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                />
                <span style={{
                  fontSize: '18px', fontWeight: 800,
                  fontFamily: 'monospace', color: '#22d3ee',
                  position: 'relative', zIndex: 1,
                }}>
                  {stat.value}
                </span>
              </div>
              <div style={{
                fontSize: '11px', color: '#475569',
                letterSpacing: '0.08em', textTransform: 'uppercase',
                fontFamily: 'monospace',
              }}>
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}
        >
       
         
        
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/methodology')}
            style={{
              padding: '14px 32px',
              background: 'transparent',
              border: '1px solid rgba(148,163,184,0.25)',
              borderRadius: '14px',
              color: '#94a3b8', fontSize: '14px',
              fontWeight: 600, cursor: 'pointer',
              letterSpacing: '0.04em',
            }}
          >
            View Technical Details
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}