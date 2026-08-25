import { useLoginHistory, useRevokeSession, useRevokeOtherSessions } from '../api/auth.js';
import { Loading, ErrorState, Card, Table, Badge, Button, useToast } from '../components/ui/index.js';

export default function LoginHistory() {
  const toast = useToast();
  const { data, isLoading, isError, error } = useLoginHistory();
  const revoke = useRevokeSession();
  const revokeOthers = useRevokeOtherSessions();
  if (isLoading) return <Loading />;
  if (isError) return <ErrorState error={error} />;

  const sessions = data?.activeSessions || [];
  const others = sessions.filter((s) => !s.current).length;

  const doRevoke = async (id) => { try { await revoke.mutateAsync(id); toast.success('Session revoked.'); } catch (e) { toast.error(e.message); } };
  const doRevokeOthers = async () => { try { const r = await revokeOthers.mutateAsync(); toast.success(`Signed out ${r.revoked} other session${r.revoked === 1 ? '' : 's'}.`); } catch (e) { toast.error(e.message); } };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl"><i className="fa-solid fa-clock-rotate-left mr-2 text-crimson" /> Login History</h1>
        {others > 0 && <Button variant="ghost" size="sm" icon="fa-right-from-bracket" loading={revokeOthers.isPending} onClick={doRevokeOthers}>Sign out {others} other session{others === 1 ? '' : 's'}</Button>}
      </div>

      <h2 className="mt-6 text-lg">Active sessions</h2>
      <Card className="mt-2 p-2">
        <Table columns={[
          { key: 'device', label: 'Session', render: (r) => (
            <span>{r.current && <Badge tone="green" className="mr-2">this device</Badge>}<span className="text-xs text-slate-500">{r.userAgent || 'Unknown device'}</span></span>
          ) },
          { key: 'ip', label: 'IP' },
          { key: 'since', render: (r) => new Date(r.since).toLocaleString('en-IN') },
          { key: 'expiresAt', label: 'Expires', render: (r) => new Date(r.expiresAt).toLocaleDateString('en-IN') },
        ]}
          rows={sessions.map((s) => ({ ...s, _id: s.id }))}
          empty="No active sessions."
          actions={(r) => r.current
            ? <span className="text-xs text-slate-400">current</span>
            : <button className="text-crimson hover:text-crimson-700" title="Revoke" onClick={() => doRevoke(r.id)}><i className={`fa-solid fa-ban ${revoke.isPending ? 'fa-spin' : ''}`} /></button>} />
      </Card>

      <h2 className="mt-8 text-lg">Recent sign-ins</h2>
      <Card className="mt-2 p-2">
        <Table columns={[
          { key: 'success', label: 'Result', render: (r) => <Badge tone={r.success ? 'green' : 'crimson'}>{r.success ? 'success' : 'failed'}</Badge> },
          { key: 'ip', label: 'IP' },
          { key: 'userAgent', label: 'Device', render: (r) => <span className="text-xs text-slate-500">{r.userAgent || '—'}</span> },
          { key: 'reason', render: (r) => r.reason || '—' },
          { key: 'at', label: 'When', render: (r) => new Date(r.at).toLocaleString('en-IN') },
        ]} rows={(data?.history || []).map((h) => ({ ...h, _id: h._id }))} empty="No sign-in history." />
      </Card>
    </div>
  );
}
