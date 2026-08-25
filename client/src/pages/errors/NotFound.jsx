import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/index.js';

export default function NotFound() {
  return (
    <div className="container grid min-h-[60vh] place-items-center text-center">
      <div>
        <p className="font-display text-7xl font-bold text-navy">404</p>
        <h1 className="mt-2 text-2xl">Page not found</h1>
        <p className="mt-1 text-slate-600">The page you’re looking for doesn’t exist or has moved.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Button as={Link} to="/" icon="fa-house">Go home</Button>
          <Button as={Link} to="/notifications" variant="ghost">Notifications</Button>
        </div>
      </div>
    </div>
  );
}
