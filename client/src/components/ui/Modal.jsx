import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Accessible base modal: backdrop click + Esc to close, scroll-locked.
const SIZES = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
export default function Modal({ open, onClose, title, size = 'md', footer, children }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [open, onClose]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/40 p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.96, y: 8 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, opacity: 0 }}
            className={`my-8 w-full ${SIZES[size]} rounded-lg bg-surface shadow-lift`}>
            {title && (
              <div className="flex items-center justify-between border-b border-line px-6 py-4">
                <h2 className="font-display text-xl text-navy">{title}</h2>
                <button onClick={onClose} aria-label="Close" className="text-slate-400 hover:text-crimson"><i className="fa-solid fa-xmark" /></button>
              </div>
            )}
            <div className="px-6 py-5">{children}</div>
            {footer && <div className="flex justify-end gap-2 border-t border-line px-6 py-3">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
