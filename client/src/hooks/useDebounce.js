import { useState, useEffect } from 'react';
// Returns a debounced copy of `value` that only updates after `delay` ms of quiet.
// Use for search inputs so we query after typing stops, not on every keystroke.
export function useDebounce(value, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}
