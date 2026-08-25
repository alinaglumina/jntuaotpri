import { motion, useReducedMotion } from 'framer-motion';
// Fade/slide-in wrapper that becomes a no-op when the user prefers reduced motion.
export function FadeIn({ delay = 0, y = 8, as = 'div', className = '', children }) {
  const reduce = useReducedMotion();
  const M = motion[as] || motion.div;
  return (
    <M className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, delay }}>
      {children}
    </M>
  );
}
// Staggered container for lists/grids.
export function Stagger({ className = '', children }) {
  const reduce = useReducedMotion();
  return (
    <motion.div className={className}
      initial="hidden" whileInView="show" viewport={{ once: true }}
      variants={{ show: { transition: { staggerChildren: reduce ? 0 : 0.06 } } }}>
      {children}
    </motion.div>
  );
}
export const staggerItem = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };
