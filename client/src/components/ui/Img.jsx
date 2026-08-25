import { useState } from 'react';
// Optimized <img>: native lazy-loading, async decode, width/height or aspect
// ratio to prevent layout shift, and a graceful fallback on error.
export default function Img({ src, alt = '', ratio, className = '', imgClassName = '', ...rest }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const box = ratio ? { aspectRatio: ratio } : undefined;
  return (
    <span className={`relative block overflow-hidden bg-line/40 ${className}`} style={box}>
      {!loaded && !failed && <span className="skeleton absolute inset-0" aria-hidden="true" />}
      {failed ? (
        <span className="absolute inset-0 grid place-items-center text-muted"><i className="fa-regular fa-image text-2xl" aria-hidden="true" /></span>
      ) : (
        <img src={src} alt={alt} loading="lazy" decoding="async"
          onLoad={() => setLoaded(true)} onError={() => setFailed(true)}
          className={`h-full w-full object-cover transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'} ${imgClassName}`} {...rest} />
      )}
    </span>
  );
}
