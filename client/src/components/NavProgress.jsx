import { useNavigation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

// A thin progress bar at the top of the viewport while the router is loading
// (i.e. while a route loader runs). Makes loader-driven navigation feel instant.
export default function NavProgress() {
  const navigation = useNavigation();
  const active = navigation.state !== 'idle';
  return (
    <AnimatePresence>
      {active && (
        <motion.div className="fixed inset-x-0 top-0 z-[80] h-1 origin-left bg-gradient-to-r from-crimson to-gold"
          initial={{ scaleX: 0, opacity: 1 }} animate={{ scaleX: 0.9 }} exit={{ scaleX: 1, opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }} />
      )}
    </AnimatePresence>
  );
}
