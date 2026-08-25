import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/index.js';

export default function Forbidden() {
  return (
    <div className="container grid min-h-[60vh] place-items-center text-center">
      <div>
        <p className="font-display text-7xl font-bold text-crimson">403</p>
        <h1 className="mt-2 text-2xl">Access denied</h1>
        <p className="mt-1 text-slate-600">You don’t have permission to view this page.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Button as={Link} to="/admin" icon="fa-gauge">Dashboard</Button>
          <Button as={Link} to="/" variant="ghost">Home</Button>
        </div>
      </div>
    </div>
  );
}
