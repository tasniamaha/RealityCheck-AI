export default function StatusBadge({ status }) {
  const colors = {
    'Pending': 'bg-yellow-500/20 text-yellow-400',
    'Approved': 'bg-emerald-500/20 text-emerald-400',
    'Rejected': 'bg-red-500/20 text-red-400',
    'Awaiting Expert Review': 'bg-amber-500/20 text-amber-400',
    'Verified': 'bg-cyan-500/20 text-cyan-400',
  };

  return (
    <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${colors[status] || 'bg-slate-500/20 text-slate-400'}`}>
      {status}
    </span>
  );
}