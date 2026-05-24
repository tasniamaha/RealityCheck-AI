import { createContext, useContext, useState, useCallback } from 'react';

const AppContext = createContext();
export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [expertApplications, setExpertApplications] = useState([]);
  const [pendingCases,        setPendingCases]        = useState([]);
  const [reviewedCases,       setReviewedCases]       = useState([]);

  // ── Expert Application (public submit) ────────────────────────────────────
  const addApplication = async (formData) => {
    const res = await fetch('/api/admin/applications/', {
      method:      'POST',
      credentials: 'include',
      headers:     { 'Content-Type': 'application/json' },
      body:        JSON.stringify(formData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Submission failed');
    return data;
  };

  // ── Admin: load applications ──────────────────────────────────────────────
  const fetchApplications = useCallback(async () => {
    const res  = await fetch('/api/admin/applications/', { credentials: 'include' });
    const data = await res.json();
    if (res.ok) setExpertApplications(data.applications || []);
  }, []);

  // ── Admin: approve / reject ───────────────────────────────────────────────
  const updateApplication = async (id, action) => {
    const res = await fetch(`/api/admin/applications/${id}/action/`, {
      method:      'POST',
      credentials: 'include',
      headers:     { 'Content-Type': 'application/json' },
      body:        JSON.stringify({ action: action.toLowerCase() }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Action failed');
    // Refresh list
    setExpertApplications(prev =>
      prev.map(a => a.id === id ? { ...a, status: data.status } : a)
    );
    return data;
  };

  // ── User: upload + analyze ────────────────────────────────────────────────
  const addNewCase = async (file) => {
    const form = new FormData();
    form.append('file', file);

    const res  = await fetch('/detect/', {
      method:      'POST',
      credentials: 'include',
      body:        form,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Detection failed');
    return data;   // { scan_id, status, model_results, ensemble, ... }
  };

  // ── User: poll for final verdict ──────────────────────────────────────────
  const pollScanStatus = async (scanId) => {
    const res  = await fetch(`/scan/${scanId}/status/`, { credentials: 'include' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Poll failed');
    return data;   // { status, final_verdict, final_confidence }
  };

  // ── Expert: load queue ────────────────────────────────────────────────────
  const fetchExpertQueue = useCallback(async () => {
    const res  = await fetch('/api/expert/queue/', { credentials: 'include' });
    const data = await res.json();
    if (res.ok) {
      setPendingCases(data.pending   || []);
      setReviewedCases(data.reviewed || []);
    }
  }, []);

  // ── Expert: submit verdict ────────────────────────────────────────────────
  const submitVerdict = async (scanId, verdict, confidence, reasoning = '') => {
    const res = await fetch(`/api/expert/review/${scanId}/`, {
      method:      'POST',
      credentials: 'include',
      headers:     { 'Content-Type': 'application/json' },
      body:        JSON.stringify({ verdict, confidence, reasoning }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Review failed');
    // Move case from pending → reviewed in local state
    setPendingCases(prev => prev.filter(c => c.id !== scanId));
    return data;
  };

  return (
    <AppContext.Provider value={{
      expertApplications,
      pendingCases,
      reviewedCases,
      addApplication,
      fetchApplications,
      updateApplication,
      addNewCase,
      pollScanStatus,
      fetchExpertQueue,
      submitVerdict,
    }}>
      {children}
    </AppContext.Provider>
  );
};