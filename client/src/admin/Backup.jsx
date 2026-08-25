import { useBackupInfo } from '../api/cms.js';
import { Loading, ErrorState, Card, Button, Table } from '../components/ui/index.js';

export default function Backup() {
  const { data, isLoading, isError, error } = useBackupInfo();
  const download = () => { window.location.href = '/api/admin/backup/download'; };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl"><i className="fa-solid fa-database mr-2 text-crimson" /> Backup Management</h1>
      <Card className="mt-6 p-6">
        <p className="text-sm text-slate-600">Download a full JSON snapshot of all content collections (excludes user credentials and audit logs). Store it somewhere safe or use it to restore.</p>
        {isLoading ? <Loading /> : isError ? <ErrorState error={error} /> : (
          <>
            <p className="mt-4 text-sm"><strong>{data?.total ?? 0}</strong> documents across <strong>{Object.keys(data?.collections || {}).length}</strong> collections.</p>
            <Button className="mt-4" icon="fa-download" onClick={download}>Download backup (.json)</Button>
            <details className="mt-6"><summary className="cursor-pointer text-sm font-semibold text-navy">Per-collection counts</summary>
              <div className="mt-3">
                <Table columns={[{ key: 'name', label: 'Collection' }, { key: 'count' }]}
                  rows={Object.entries(data?.collections || {}).map(([name, count]) => ({ _id: name, name, count }))} empty="—" />
              </div>
            </details>
          </>
        )}
      </Card>
    </div>
  );
}
