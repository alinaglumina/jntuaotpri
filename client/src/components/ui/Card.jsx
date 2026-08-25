// Flexible surface. Composable sub-parts, or pass children directly.
export default function Card({ as: Tag = 'div', hoverable = false, className = '', children, ...rest }) {
  return (
    <Tag className={`rounded-lg bg-surface shadow-card ${hoverable ? 'transition-shadow hover:shadow-lift' : ''} ${className}`} {...rest}>
      {children}
    </Tag>
  );
}
export function CardHeader({ title, subtitle, icon, action }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
      <div className="flex items-center gap-3">
        {icon && <span className="grid h-9 w-9 place-items-center rounded-md bg-navy/5 text-navy"><i className={`fa-solid ${icon}`} aria-hidden="true" /></span>}
        <div><h3 className="font-display text-lg text-navy">{title}</h3>{subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}</div>
      </div>
      {action}
    </div>
  );
}
export function CardBody({ className = '', children }) { return <div className={`p-5 ${className}`}>{children}</div>; }
export function CardFooter({ className = '', children }) { return <div className={`border-t border-line px-5 py-3 ${className}`}>{children}</div>; }
