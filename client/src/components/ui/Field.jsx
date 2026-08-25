import { forwardRef } from 'react';
// Label + control + error wrapper used across all forms. Works with or without
// react-hook-form (spread register() onto Input/Select/Textarea).
export function FormField({ label, required, error, hint, children }) {
  return (
    <div>
      {label && <label className="mb-1 block text-sm font-semibold text-slate-700">{label}{required && <span className="text-crimson"> *</span>}</label>}
      {children}
      {hint && !error && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
      {error && <p className="mt-1 text-xs text-crimson">{error}</p>}
    </div>
  );
}
const base = 'w-full rounded-md border border-line px-3 py-2 text-sm focus:border-navy focus:outline-none focus:ring-2 focus:ring-crimson/30';
export const Input = forwardRef(function Input({ className = '', ...p }, ref) {
  return <input ref={ref} className={`${base} ${className}`} {...p} />;
});
export const Textarea = forwardRef(function Textarea({ className = '', rows = 3, ...p }, ref) {
  return <textarea ref={ref} rows={rows} className={`${base} ${className}`} {...p} />;
});
export const Select = forwardRef(function Select({ options = [], placeholder = '— select —', className = '', ...p }, ref) {
  return (
    <select ref={ref} className={`${base} ${className}`} {...p}>
      <option value="">{placeholder}</option>
      {options.map((o) => typeof o === 'string' ? <option key={o} value={o}>{o}</option> : <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
});
export const Checkbox = forwardRef(function Checkbox({ label, className = '', ...p }, ref) {
  return (
    <label className={`flex items-center gap-2 text-sm font-semibold text-slate-700 ${className}`}>
      <input ref={ref} type="checkbox" className="h-4 w-4 rounded border-line text-navy focus:ring-crimson/30" {...p} /> {label}
    </label>
  );
});
