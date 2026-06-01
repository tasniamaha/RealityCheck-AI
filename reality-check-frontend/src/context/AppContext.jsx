import { createContext, useContext, useState, useCallback } from 'react';

const AppContext = createContext();
export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [expertApplications, setExpertApplications] = useState([]);
  const [pendingCases,        setPendingCases]        = useState([]);
  const [reviewedCases,       setReviewedCases]       = useState([]);
  const [complaints,          setComplaints]          = useState([]);

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
    setExpertApplications(prev =>
      prev.map(a => a.id === id ? { ...a, status: data.status } : a)
    );
    return data;
  };

  // ── User: upload + analyze ────────────────────────────────────────────────
  const addNewCase = async (file) => {
    const form = new FormData();
    form.append('file', file);
    const res  = await fetch('/detect/', { method: 'POST', credentials: 'include', body: form });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Detection failed');
    return data;
  };

  // ── User: poll for final verdict ──────────────────────────────────────────
  const pollScanStatus = async (scanId) => {
    const res  = await fetch(`/scan/${scanId}/status/`, { credentials: 'include' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Poll failed');
    return data;
  };

  // ── User: file a complaint ────────────────────────────────────────────────
  const submitComplaint = async (scanId, reason, details) => {
    const res = await fetch('/api/complaints/', {
      method:      'POST',
      credentials: 'include',
      headers:     { 'Content-Type': 'application/json' },
      body:        JSON.stringify({ scan_id: scanId, reason, details }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Complaint submission failed');
    return data;
  };

  // ── Admin: load complaints ────────────────────────────────────────────────
  const fetchComplaints = useCallback(async () => {
    const res  = await fetch('/api/complaints/', { credentials: 'include' });
    const data = await res.json();
    if (res.ok) setComplaints(data.complaints || []);
  }, []);

  // ── Admin: resolve / dismiss complaint ───────────────────────────────────
  const updateComplaint = async (id, action) => {
    const res = await fetch(`/api/complaints/${id}/action/`, {
      method:      'POST',
      credentials: 'include',
      headers:     { 'Content-Type': 'application/json' },
      body:        JSON.stringify({ action }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Action failed');
    setComplaints(prev =>
      prev.map(c => c.id === id ? { ...c, status: data.status } : c)
    );
    return data;
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
    setPendingCases(prev => prev.filter(c => c.id !== scanId));
    return data;
  };

  return (
    <AppContext.Provider value={{
      expertApplications,
      pendingCases,
      reviewedCases,
      complaints,
      addApplication,
      fetchApplications,
      updateApplication,
      addNewCase,
      pollScanStatus,
      submitComplaint,
      fetchComplaints,
      updateComplaint,
      fetchExpertQueue,
      submitVerdict,
    }}>
      {children}
    </AppContext.Provider>
  );
};