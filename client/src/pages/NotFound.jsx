import { Link } from 'react-router-dom';
export default function NotFound() {
  return (
    <div className="container grid min-h-[60vh] place-items-center text-center">
      <div>
        <p className="font-display text-6xl font-bold text-navy">404</p>
        <p className="mt-2 text-slate-600">That page doesn’t exist.</p>
        <Link to="/" className="btn-primary mt-6">Go home</Link>
      </div>
    </div>
  );
}
