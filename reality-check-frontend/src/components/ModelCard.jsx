export default function ModelCard({ result }) {
  const color = result.status === 'Real' ? 'emerald' : result.status === 'Fake' ? 'red' : 'yellow';
  
  return (
    <div className="glass rounded-2xl p-6 neon-border">
      <p className="text-cyan-400 font-mono text-xs mb-2">{result.model}</p>
      <p className={`text-4xl font-bold text-${color}-400`}>{result.status}</p>
      <p className="text-5xl font-mono mt-4">{result.confidence}<span className="text-xl">%</span></p>
    </div>
  );
}