import { useCallback, useEffect, useState } from 'react';

// Admin view of "learning from expert reviews": progress toward the thresholds,
// the reasons experts have given, and what the last training run changed.

function Bar({ value, max }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="h-[6px] bg-slate-800 mt-2" aria-hidden="true">
      <div className={`h-full ${pct >= 100 ? 'bg-emerald-500' : 'bg-cyan-400'}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function Counts({ title, c }) {
  if (!c) return null;
  return (
    <div>
      <p className="text-sm font-semibold text-slate-400">{title}</p>
      <p className="mt-1 text-sm">
        Fakes: {c.fake_ok} caught, {c.fake_unc} uncertain, <span className="text-red-400 font-semibold">{c.fake_wrong} missed</span>
      </p>
      <p className="text-sm">
        Reals: {c.real_ok} passed, {c.real_unc} uncertain, <span className="text-red-400 font-semibold">{c.real_wrong} wrongly flagged</span>
      </p>
    </div>
  );
}

export default function LearningPanel() {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/learning/', { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Could not load (${res.status})`);
      setStatus(data.status || {});
      setError('');
    } catch (e) {
      setError(e.message);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (status?.state !== 'running') return undefined;
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, [status?.state, load]);

  const trainNow = async () => {
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/admin/learning/', { method: 'POST', credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not start training');
      setStatus({ ...(data.status || {}), state: data.started ? 'running' : data.status?.state });
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const p = status?.progress;
  const t = p?.thresholds || { fake_same_reason: 50, real: 50 };
  const largest = p?.largest_reason?.count || 0;
  const last = status?.last_run;

  return (
    <section className="mb-16 glass rounded-3xl border border-cyan-400/20 p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-[44rem]">
          <h2 className="text-4xl">Learning from expert reviews</h2>
          <p className="mt-3 text-slate-400">
            When experts have marked {t.fake_same_reason} files fake for the same reason, and {t.real} files real,
            the system trains an extra detector on those files. It is switched on only if it improves results
            on the labelled test set.
          </p>
        </div>
        <button onClick={trainNow} disabled={busy || !p?.ready || status?.state === 'running'} className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-black rounded-2xl font-semibold transition disabled:opacity-50">
          {status?.state === 'running' ? 'Training...' : 'Train now'}
        </button>
      </div>

      {error && <p className="mt-4 text-red-400 text-sm">{error}</p>}

      {p && (
        <div className="mt-8 grid md:grid-cols-2 gap-8">
          <div>
            <p className="font-semibold">Fake reviews with the same reason</p>
            <p className="text-sm text-slate-400">
              Largest group: {largest} of {t.fake_same_reason}
              {p.largest_reason ? ` ("${p.largest_reason.examples[0]}")` : ''}
            </p>
            <Bar value={largest} max={t.fake_same_reason} />
          </div>
          <div>
            <p className="font-semibold">Real reviews</p>
            <p className="text-sm text-slate-400">{p.reviews.real} of {t.real}</p>
            <Bar value={p.reviews.real} max={t.real} />
          </div>
        </div>
      )}

      {p?.reasons?.length > 0 && (
        <div className="mt-8">
          <p className="font-semibold">Reasons experts have given</p>
          <table className="mt-3 w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 border-b border-slate-700">
                <th className="py-2 pr-4 font-semibold">Files</th>
                <th className="py-2 pr-4 font-semibold">Key words</th>
                <th className="py-2 font-semibold">Written as</th>
              </tr>
            </thead>
            <tbody>
              {p.reasons.map(r => (
                <tr key={r.label} className="border-b border-slate-700 align-top">
                  <td className="py-2 pr-4 font-mono font-bold">{r.count}</td>
                  <td className="py-2 pr-4">{r.label}</td>
                  <td className="py-2 text-slate-400">{r.examples.map(e => `"${e}"`).join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {status?.message && (
        <div className={`mt-8 p-4 border band ${status.state === 'live' ? 'band-real' : status.state === 'rejected' ? 'band-unsure' : ''} border-slate-700 bg-slate-900/50 rounded-2xl`}>
          <p className="font-semibold">{status.message}</p>
          {status.error && <p className="text-red-400 text-sm mt-1">{status.error}</p>}
        </div>
      )}
      {status?.state === 'failed' && !status.message && (
        <p className="mt-6 text-red-400 text-sm">The last training run failed: {status.error}</p>
      )}

      {last && (
        <div className="mt-6 grid md:grid-cols-3 gap-6">
          <Counts title={`Test set before (${last.test_images} files)`} c={last.before} />
          <Counts title="Test set with the new learning" c={last.after} />
          <div>
            <p className="text-sm font-semibold text-slate-400">Last run</p>
            <p className="mt-1 text-sm">{last.finished_at}, trained on {last.trained_on} reviewed files</p>
            <p className="text-sm">New detector alone: AUC {last.expert_detector_auc}</p>
            <p className="text-sm">Reasons learned: {(last.reasons || []).join('; ')}</p>
          </div>
        </div>
      )}
    </section>
  );
}
