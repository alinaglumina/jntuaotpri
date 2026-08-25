import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/index.js';

export default function ServerError({ status = 500, message }) {
  return (
    <div className="container grid min-h-[60vh] place-items-center text-center">
      <div>
        <p className="font-display text-7xl font-bold text-navy">{status}</p>
        <h1 className="mt-2 text-2xl">Something went wrong</h1>
        <p className="mt-1 max-w-md text-slate-600">{message || 'An unexpected error occurred while loading this page. Please try again.'}</p>
        <div className="mt-6 flex justify-center gap-3">
          <Button onClick={() => window.location.reload()} icon="fa-rotate-right">Reload</Button>
          <Button as={Link} to="/" variant="ghost">Home</Button>
        </div>
      </div>
    </div>
  );
}
