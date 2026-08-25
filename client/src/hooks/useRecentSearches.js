import { useState, useCallback } from 'react';
const KEY = 'jntua-recent-searches';
const MAX = 6;
function read() { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; } }

// Persists the user's recent search terms locally (most-recent first, de-duped).
export function useRecentSearches() {
  const [recent, setRecent] = useState(read);
  const add = useCallback((term) => {
    const t = (term || '').trim(); if (t.length < 2) return;
    setRecent((prev) => {
      const next = [t, ...prev.filter((x) => x.toLowerCase() !== t.toLowerCase())].slice(0, MAX);
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);
  const clear = useCallback(() => { try { localStorage.removeItem(KEY); } catch {} setRecent([]); }, []);
  return { recent, add, clear };
}
