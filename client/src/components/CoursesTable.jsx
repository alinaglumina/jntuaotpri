import { useQuery } from '@tanstack/react-query';
import { coursesQuery } from '../api/queries.js';

// Renders the Courses Offered table: Course Name, Category, Intake,
// Duration, Eligibility, and download links for Regulations/Syllabus.
export default function CoursesTable() {
  const { data, isLoading } = useQuery(coursesQuery());
  const items = data?.items || [];

  if (isLoading) return <div className="skeleton h-40 w-full rounded-lg" />;
  if (items.length === 0) return <p className="rounded-md border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">No courses listed yet.</p>;

  return (
    <div className="overflow-x-auto rounded-lg border border-line shadow-card">
      <table className="w-full text-left text-sm">
        <thead className="bg-navy/5 text-navy">
          <tr>
            <th className="px-4 py-3">Course Name</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3">Intake</th>
            <th className="px-4 py-3">Duration</th>
            <th className="px-4 py-3">Eligibility</th>
            <th className="px-4 py-3 w-24 text-center">Regulations</th>
            <th className="px-4 py-3 w-24 text-center">Syllabus</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {items.map((c, i) => (
            <tr key={c._id} className={i % 2 === 0 ? 'bg-white' : 'bg-navy/[0.02]'}>
              <td className="px-4 py-3 font-medium text-slate-800">{c.name}</td>
              <td className="px-4 py-3 text-slate-700">{c.category || '—'}</td>
              <td className="px-4 py-3 text-slate-700">{c.intake || '—'}</td>
              <td className="px-4 py-3 text-slate-700">{c.duration || '—'}</td>
              <td className="px-4 py-3 text-slate-700">{c.eligibility || '—'}</td>
              <td className="px-4 py-3 text-center">
                {c.regulations ? (
                  <a href={c.regulations} target="_blank" rel="noopener noreferrer" aria-label={`Regulations for ${c.name}`}
                     className="inline-grid h-8 w-8 place-items-center rounded bg-crimson/10 text-crimson hover:bg-crimson hover:text-white">
                    <i className="fa-solid fa-file-pdf" aria-hidden="true" />
                  </a>
                ) : <span className="text-slate-300">—</span>}
              </td>
              <td className="px-4 py-3 text-center">
                {c.syllabus ? (
                  <a href={c.syllabus} target="_blank" rel="noopener noreferrer" aria-label={`Syllabus for ${c.name}`}
                     className="inline-grid h-8 w-8 place-items-center rounded bg-crimson/10 text-crimson hover:bg-crimson hover:text-white">
                    <i className="fa-solid fa-file-pdf" aria-hidden="true" />
                  </a>
                ) : <span className="text-slate-300">—</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
