import { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
// Popup/toast notifications. Wrap the app in <ToastProvider>, call useToast().
const ToastCtx = createContext(null);
const TONES = { success: ['fa-circle-check', 'border-green-500 text-green-700'], error: ['fa-circle-exclamation', 'border-crimson text-crimson-700'], info: ['fa-circle-info', 'border-navy text-navy'] };
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((message, tone = 'info', ms = 3500) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), ms);
  }, []);
  const api = { toast: push, success: (m) => push(m, 'success'), error: (m) => push(m, 'error'), info: (m) => push(m, 'info') };
  return (
    <ToastCtx.Provider value={api}>
      {children}
      <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map((t) => {
            const [icon, cls] = TONES[t.tone];
            return (
              <motion.div key={t.id} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }}
                className={`flex items-center gap-2 rounded-md border-l-4 bg-white px-4 py-3 text-sm shadow-lift ${cls}`}>
                <i className={`fa-solid ${icon}`} aria-hidden="true" /> {t.message}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}
export const useToast = () => useContext(ToastCtx) || { toast: () => {}, success: () => {}, error: () => {}, info: () => {} };
