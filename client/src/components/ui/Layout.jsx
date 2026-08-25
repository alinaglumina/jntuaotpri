// Reusable layout primitives for consistent spacing + rhythm.
export function Container({ as: Tag = 'div', size = 'default', className = '', children }) {
  const max = { narrow: 'max-w-3xl', default: '', wide: 'max-w-screen-xl' }[size] || '';
  return <Tag className={`container ${max} ${className}`}>{children}</Tag>;
}
export function Section({ as: Tag = 'section', className = '', children }) {
  return <Tag className={`py-10 md:py-14 ${className}`}>{children}</Tag>;
}
export function Stack({ gap = 4, className = '', children }) {
  return <div className={`flex flex-col gap-${gap} ${className}`}>{children}</div>;
}
export function Grid({ cols = 3, gap = 6, className = '', children }) {
  const c = { 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-2 lg:grid-cols-3', 4: 'sm:grid-cols-2 lg:grid-cols-4' }[cols] || '';
  return <div className={`grid gap-${gap} ${c} ${className}`}>{children}</div>;
}
