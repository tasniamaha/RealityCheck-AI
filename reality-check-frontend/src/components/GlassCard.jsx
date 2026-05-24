export default function GlassCard({ children, className = "" }) {
  return (
    <div className={`glass rounded-3xl p-8 neon-border ${className}`}>
      {children}
    </div>
  );
}