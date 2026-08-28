import { useQuery } from '@tanstack/react-query';
import { facultyByDeptQuery } from '../api/queries.js';

// Renders a faculty listing table for one department (e.g. Pharmacy, Food
// Technology): Name, Designation, Qualification, Specialization, PCI
// Registration No., and a link to the faculty member's profile attachment.
export default function FacultyTable({ department }) {
  const { data = [], isLoading } = useQuery(facultyByDeptQuery(department));

  if (isLoading) return <div className="skeleton h-40 w-full rounded-lg" />;
  if (data.length === 0) return <p className="rounded-md border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">No faculty listed yet.</p>;

  return (
    <div className="overflow-x-auto rounded-lg border border-line shadow-card">
      <table className="w-full text-left text-sm">
        <thead className="bg-navy/5 text-navy">
          <tr>
            <th className="px-4 py-3">Name of the Faculty</th>
            <th className="px-4 py-3">Designation</th>
            <th className="px-4 py-3">Qualification</th>
            <th className="px-4 py-3">Specialization</th>
            <th className="px-4 py-3">PCI Registration No.</th>
            <th className="px-4 py-3 w-24 text-center">Profile</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {data.map((f, i) => (
            <tr key={f._id} className={i % 2 === 0 ? 'bg-white' : 'bg-navy/[0.02]'}>
              <td className="px-4 py-3 font-medium text-slate-800">{f.name}</td>
              <td className="px-4 py-3 text-slate-700">{f.designation || '—'}</td>
              <td className="px-4 py-3 text-slate-700">{f.qualification || '—'}</td>
              <td className="px-4 py-3 text-slate-700">{f.specialization || '—'}</td>
              <td className="px-4 py-3 text-slate-700">{f.pciRegistrationNo || '—'}</td>
              <td className="px-4 py-3 text-center">
                {f.profileAttachment ? (
                  <a href={f.profileAttachment} target="_blank" rel="noopener noreferrer" aria-label={`View profile of ${f.name}`}
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
