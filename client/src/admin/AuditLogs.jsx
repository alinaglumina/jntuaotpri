import { useState } from 'react';
import { useLogs } from '../api/cms.js';
import { Loading, ErrorState, Table, Badge, Select, FormField } from '../components/ui/index.js';

const ACTIONS = ['create', 'update', 'delete', 'login', 'logout'];
const TONE = { create: 'green', update: 'navy', delete: 'crimson', login: 'gold', logout: 'slate' };

export default function AuditLogs() {
  const [filters, setFilters] = useState({});
  const { data = [], isLoading, isError, error } = useLogs(filters);

  return (
    <div>
      <h1 className="text-2xl"><i className="fa-solid fa-clipboard-list mr-2 text-crimson" /> Audit Logs</h1>
      <div className="mt-4 grid max-w-md gap-3 sm:grid-cols-2">
        <FormField label="Action"><Select value={filters.action || ''} options={ACTIONS} onChange={(e) => setFilters((f) => ({ ...f, action: e.target.value || undefined }))} /></FormField>
        <FormField label="Actor"><input className="field" placeholder="username" value={filters.actor || ''} onChange={(e) => setFilters((f) => ({ ...f, actor: e.target.value || undefined }))} /></FormField>
      </div>
      <div className="mt-6">
        {isLoading ? <Loading /> : isError ? <ErrorState error={error} /> : (
          <Table
            columns={[
              { key: 'action', render: (r) => <Badge tone={TONE[r.action] || 'slate'}>{r.action}</Badge> },
              { key: 'resource' }, { key: 'actor' },
              { key: 'path', className: 'text-xs text-slate-500' },
              { key: 'status' },
              { key: 'at', label: 'When', render: (r) => new Date(r.at).toLocaleString('en-IN') },
            ]}
            rows={data} empty="No log entries." />
        )}
      </div>
    </div>
  );
}
