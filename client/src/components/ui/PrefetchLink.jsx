import { Link } from 'react-router-dom';
import { prefetchPath } from '../../lib/prefetch.js';

// A drop-in <Link> that warms the target route's data + chunk on hover/focus/
// touch, so the click feels instant. Falls back to plain navigation if anything
// fails. Works for both mouse and keyboard users (onFocus) and mobile (touch).
export default function PrefetchLink({ to, onMouseEnter, onFocus, onTouchStart, children, ...rest }) {
  const warm = () => { if (typeof to === 'string') prefetchPath(to); };
  return (
    <Link
      to={to}
      onMouseEnter={(e) => { warm(); onMouseEnter?.(e); }}
      onFocus={(e) => { warm(); onFocus?.(e); }}
      onTouchStart={(e) => { warm(); onTouchStart?.(e); }}
      {...rest}
    >
      {children}
    </Link>
  );
}
