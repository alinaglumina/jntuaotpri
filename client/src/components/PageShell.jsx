import { motion } from 'framer-motion';
import Seo from './Seo.jsx';

export default function PageShell({ title, subtitle, description, children, sidebar }) {
  return (
    <>
      <Seo title={title} description={description || subtitle} auto />
      <div className="bg-navy text-white">
        <div className="container py-8">
          <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="font-display text-3xl font-bold text-white md:text-4xl">
            {title}
          </motion.h1>
          {subtitle && <p className="mt-1 text-white/80">{subtitle}</p>}
          <div className="mt-3 h-1 w-20 rounded bg-gold" />
        </div>
      </div>
      <div className="container py-10">
        {sidebar ? (
          <div className="grid gap-8 md:grid-cols-[280px_1fr] md:items-start">
            <aside>{sidebar}</aside>
            <div>{children}</div>
          </div>
        ) : children}
      </div>
    </>
  );
}
