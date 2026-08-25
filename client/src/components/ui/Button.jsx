// Reusable button. Variants map to the JNTUA palette; supports icons + loading.
const VARIANTS = {
  primary: 'bg-navy text-white hover:bg-crimson',
  crimson: 'bg-crimson text-white hover:bg-crimson-700',
  ghost:   'border border-navy/20 text-navy hover:bg-navy hover:text-white',
  outline: 'border border-slate-300 text-slate-700 hover:border-navy hover:text-navy',
  subtle:  'bg-navy/5 text-navy hover:bg-navy/10',
  danger:  'bg-crimson text-white hover:bg-crimson-700',
  link:    'text-navy hover:text-crimson underline-offset-2 hover:underline px-0',
};
const SIZES = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-6 py-3 text-base' };

export default function Button({
  as: Tag = 'button', variant = 'primary', size = 'md', icon, iconRight,
  loading = false, disabled, className = '', children, ...rest
}) {
  return (
    <Tag
      className={`inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      disabled={disabled || loading} {...rest}
    >
      {loading ? <i className="fa-solid fa-spinner fa-spin" aria-hidden="true" />
        : icon ? <i className={`fa-solid ${icon}`} aria-hidden="true" /> : null}
      {children}
      {iconRight && !loading && <i className={`fa-solid ${iconRight}`} aria-hidden="true" />}
    </Tag>
  );
}
