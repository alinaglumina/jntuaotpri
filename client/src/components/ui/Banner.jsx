import { motion } from 'framer-motion';
// Page/section banner (navy gradient) with optional eyebrow + gold underline.
export default function Banner({ title, subtitle, eyebrow, align = 'left', children, className = '' }) {
  return (
    <section className={`relative overflow-hidden bg-navy text-white ${className}`}>
      <div className={`container py-10 ${align === 'center' ? 'text-center' : ''}`}>
        {eyebrow && <span className="mb-2 inline-block rounded-full border border-gold/40 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gold">{eyebrow}</span>}
        <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="font-display text-3xl font-bold text-white md:text-4xl">{title}</motion.h1>
        {subtitle && <p className="mt-1 max-w-2xl text-white/80">{subtitle}</p>}
        <div className={`mt-3 h-1 w-20 rounded bg-gold ${align === 'center' ? 'mx-auto' : ''}`} />
        {children}
      </div>
    </section>
  );
}
