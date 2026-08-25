import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useDashboard } from '../api/cms.js';
import { StatWidget, Card, Chart, ErrorState, Badge, Skeleton, SkeletonCard } from '../components/ui/index.js';

const ICONS = { notifications: 'fa-bell', news: 'fa-newspaper', circulars: 'fa-file-circle-exclamation', events: 'fa-calendar-day', faculty: 'fa-chalkboard-user', mous: 'fa-handshake', gallery: 'fa-images', downloads: 'fa-download', departments: 'fa-sitemap', students: 'fa-user-graduate', media: 'fa-photo-film', users: 'fa-users' };
const TONES = ['navy', 'crimson', 'gold', 'green'];

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const { data, isLoading, isError, error } = useDashboard();

  if (isLoading) return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{Array.from({length:4}).map((_,i)=><div key={i} className="skeleton h-24 rounded-lg" />)}</div>;
  if (isError) return <ErrorState error={error} />;

  const counts = data?.counts || {};
  const chartData = Object.entries(counts).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value }));

  return (
    <div>
      <h1 className="text-3xl">Welcome, {user?.full_name || user?.username}</h1>
      <p className="mt-1 text-slate-500">{isAdmin ? 'Full administrative overview.' : `Managing ${user?.directorate || 'your directorate'}.`}</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Object.entries(counts).slice(0, 8).map(([key, value], i) => (
          <StatWidget key={key} icon={ICONS[key] || 'fa-database'} label={key} value={value} tone={TONES[i % TONES.length]} />
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-4 text-xl">Content by type</h2>
          {chartData.length ? <Chart type="bar" data={chartData} series={[{ key: 'value' }]} height={260} /> : <p className="text-sm text-slate-400">No data yet.</p>}
        </Card>
        <Card className="p-5">
          <h2 className="mb-4 text-xl">Recent activity</h2>
          {data?.recent?.length ? (
            <ul className="divide-y divide-slate-100 text-sm">
              {data.recent.map((log) => (
                <li key={log._id} className="flex items-center justify-between py-2">
                  <span><Badge tone={log.action === 'delete' ? 'crimson' : log.action === 'create' ? 'green' : 'navy'}>{log.action}</Badge> <span className="ml-2 text-slate-600">{log.resource}</span></span>
                  <span className="text-xs text-slate-400">{log.actor} · {new Date(log.at).toLocaleString('en-IN')}</span>
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-slate-400">No recent activity.</p>}
          <Link to="/admin/logs" className="mt-3 inline-block text-sm font-semibold text-crimson">View all logs →</Link>
        </Card>
      </div>
    </div>
  );
}
