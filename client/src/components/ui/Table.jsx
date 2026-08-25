import { memo } from 'react';
// Generic table. columns: [{ key, label?, render?(row), className? }].
// Falls back to smart formatting for dates/booleans if no render given.
function auto(row, col) {
  const v = row[col.key];
  if (v == null || v === '') return '—';
  if (Array.isArray(v)) return v.length ? v.join(', ') : '—';
  if (typeof v === 'boolean') return v ? 'Yes' : 'No';
  if (/date|createdAt|updatedAt|uploadedAt/i.test(col.key)) { const d = new Date(v); if (!isNaN(d)) return d.toLocaleDateString('en-IN'); }
  const s = String(v); return s.length > 70 ? s.slice(0, 70) + '…' : s;
}
function TableBase({ columns, rows, actions, empty = 'No records.' }) {
  if (!rows?.length) return <div className="rounded-md border border-dashed border-line p-8 text-center text-sm text-muted">{empty}</div>;
  return (
    <div className="overflow-x-auto rounded-lg bg-surface shadow-card">
      <table className="w-full text-left text-sm">
        <thead className="bg-navy/5 text-navy">
          <tr>
            {columns.map((c) => <th key={c.key} className={`px-4 py-3 font-semibold capitalize ${c.className || ''}`}>{c.label || c.key.replace(/([A-Z])/g, ' $1')}</th>)}
            {actions && <th className="px-4 py-3 text-right">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((row) => (
            <tr key={row._id || row.id} className="hover:bg-navy/5">
              {columns.map((c) => <td key={c.key} className={`px-4 py-3 ${c.className || ''}`}>{c.render ? c.render(row) : auto(row, c)}</td>)}
              {actions && <td className="px-4 py-3 text-right">{actions(row)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default memo(TableBase);
