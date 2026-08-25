import { useState } from 'react';
import { useInbox, useUpdateMessage, useDeleteMessage } from '../api/cms.js';
import { Loading, ErrorState, Card, Badge, Button, Modal, ConfirmDialog, useToast } from '../components/ui/index.js';

// Reusable inbox for Contact Messages and Enquiries. kind = 'contact-messages' | 'enquiries'.
export default function MessagesInbox({ kind, title, statuses }) {
  const toast = useToast();
  const [status, setStatus] = useState('');
  const [open, setOpen] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const { data, isLoading, isError, error } = useInbox(kind, status ? { status } : undefined);
  const update = useUpdateMessage(kind);
  const del = useDeleteMessage(kind);

  if (isLoading) return <Loading />;
  if (isError) return <ErrorState error={error} />;
  const items = data?.items || [];

  const open2 = async (m) => { setOpen(m); if (m.status === 'new') { try { await update.mutateAsync({ id: m._id, status: statuses[1] }); } catch {} } };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div><h1 className="text-2xl"><i className="fa-solid fa-inbox mr-2 text-crimson" /> {title}</h1>
          <p className="text-sm text-slate-500">{data?.total || 0} total{data?.unread ? ` · ${data.unread} new` : ''}</p></div>
        <div className="flex gap-1">
          {['', ...statuses].map((s) => (
            <button key={s} onClick={() => setStatus(s)} className={`rounded-full px-3 py-1 text-xs font-semibold ${status === s ? 'bg-navy text-white' : 'bg-slate-100 text-navy hover:bg-slate-200'}`}>{s || 'All'}</button>
          ))}
        </div>
      </div>

      {items.length === 0 ? <p className="rounded-md border border-dashed border-slate-300 p-10 text-center text-slate-500">No messages.</p> : (
        <div className="space-y-3">
          {items.map((m) => (
            <Card key={m._id} hoverable className="flex items-start justify-between gap-4 p-4">
              <button className="flex-1 text-left" onClick={() => open2(m)}>
                <div className="flex items-center gap-2">
                  {m.status === 'new' && <span className="h-2 w-2 rounded-full bg-crimson" />}
                  <span className="font-semibold text-navy">{m.name}</span>
                  <span className="text-xs text-slate-400">{m.email}</span>
                  {m.type && <Badge tone="slate">{m.type}</Badge>}
                </div>
                <p className="mt-1 line-clamp-1 text-sm text-slate-600">{m.subject || m.programme || m.message}</p>
                <p className="text-xs text-slate-400">{new Date(m.createdAt).toLocaleString('en-IN')}</p>
              </button>
              <div className="flex shrink-0 items-center gap-2">
                <Badge tone={m.status === 'new' ? 'crimson' : m.status === 'resolved' || m.status === 'archived' ? 'green' : 'navy'}>{m.status}</Badge>
                <button className="text-slate-400 hover:text-crimson" onClick={() => setConfirm(m)}><i className="fa-solid fa-trash" /></button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={!!open} onClose={() => setOpen(null)} title={open?.subject || `Message from ${open?.name}`}
        footer={<div className="flex gap-2">{statuses.map((s) => <Button key={s} size="sm" variant={open?.status === s ? 'primary' : 'ghost'} onClick={() => update.mutate({ id: open._id, status: s })}>{s}</Button>)}</div>}>
        {open && (
          <div className="space-y-2 text-sm">
            <p><strong>{open.name}</strong> · <a href={`mailto:${open.email}`} className="text-crimson">{open.email}</a>{open.phone && ` · ${open.phone}`}</p>
            {open.type && <p className="text-slate-500">Type: {open.type}{open.programme && ` · ${open.programme}`}</p>}
            <p className="whitespace-pre-wrap rounded bg-slate-50 p-3 text-slate-700">{open.message}</p>
            <p className="text-xs text-slate-400">{new Date(open.createdAt).toLocaleString('en-IN')}</p>
          </div>
        )}
      </Modal>
      <ConfirmDialog open={!!confirm} title="Delete this message?" onConfirm={async () => { try { await del.mutateAsync(confirm._id); setConfirm(null); toast.success('Deleted.'); } catch (e) { toast.error(e.message); } }} onCancel={() => setConfirm(null)} busy={del.isPending} />
    </div>
  );
}
