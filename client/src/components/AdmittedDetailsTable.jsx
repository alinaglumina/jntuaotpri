import { useQuery } from '@tanstack/react-query';
import { admittedDetailsQuery } from '../api/queries.js';

// Renders the Admitted Details table: Course Name, Category, Academic Year,
// Year Established, Male, Female, Total. `admittedDetailsQuery` uses the
// `list()` helper, which resolves directly to a flat array (not {items}).
export default function AdmittedDetailsTable() {
  const { data, isLoading } = useQuery(admittedDetailsQuery());
  const items = data || [];

  if (isLoading) return <div className="skeleton h-40 w-full rounded-lg" />;
  if (items.length === 0) return <p className="rounded-md border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">No admitted details available yet.</p>;

  return (
    <div className="overflow-x-auto rounded-lg border border-line shadow-card">
      <table className="w-full text-left text-sm">
        <thead className="bg-navy/5 text-navy">
          <tr>
            <th className="px-4 py-3">Course Name</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3">Academic Year</th>
            <th className="px-4 py-3">Year Established</th>
            <th className="px-4 py-3 text-center">Male</th>
            <th className="px-4 py-3 text-center">Female</th>
            <th className="px-4 py-3 text-center">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {items.map((r, i) => (
            <tr key={r._id} className={i % 2 === 0 ? 'bg-white' : 'bg-navy/[0.02]'}>
              <td className="px-4 py-3 font-medium text-slate-800">{r.courseName}</td>
              <td className="px-4 py-3 text-slate-700">{r.category || '—'}</td>
              <td className="px-4 py-3 text-slate-700">{r.academicYear || '—'}</td>
              <td className="px-4 py-3 text-slate-700">{r.yearEstablished || '—'}</td>
              <td className="px-4 py-3 text-center text-slate-700">{r.male ?? 0}</td>
              <td className="px-4 py-3 text-center text-slate-700">{r.female ?? 0}</td>
              <td className="px-4 py-3 text-center font-semibold text-navy">{r.total ?? 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
