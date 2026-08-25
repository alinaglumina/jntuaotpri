import { useState } from 'react';
import { useResourceList, useSaveResource, useDeleteResource } from '../api/admin.js';
import { Loading, ErrorState, Card, Button, Modal, ConfirmDialog, FormField, Input, Select, useToast } from '../components/ui/index.js';

// Header / Footer / Quick-link menu manager over the menus collection.
const LOCATIONS = [['header', 'Header Menu'], ['footer', 'Footer Menu'], ['quick', 'Quick Links']];

export default function MenuManager() {
  const toast = useToast();
  const { data: menus = [], isLoading, isError, error } = useResourceList('menus');
  const save = useSaveResource('menus');
  const del = useDeleteResource('menus');
  const [edit, setEdit] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [loc, setLoc] = useState('header');

  if (isLoading) return <Loading />;
  if (isError) return <ErrorState error={error} />;
  const items = menus.filter((m) => (m.location || 'header') === loc).sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <div><h1 className="text-2xl"><i className="fa-solid fa-bars mr-2 text-crimson" /> Menu Management</h1>
          <p className="text-sm text-slate-500">Header, footer and quick-link navigation</p></div>
        <Button icon="fa-plus" size="sm" onClick={() => setEdit('new')}>Add link</Button>
      </div>
      <div className="mb-4 flex gap-1">
        {LOCATIONS.map(([k, label]) => (
          <button key={k} onClick={() => setLoc(k)} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${loc === k ? 'bg-navy text-white' : 'bg-slate-100 text-navy hover:bg-slate-200'}`}>{label}</button>
        ))}
      </div>
      <Card className="p-4">
        {items.length === 0 ? <p className="py-6 text-center text-sm text-slate-400">No links in this menu.</p> : (
          <div className="space-y-2">
            {items.map((m) => (
              <div key={m._id} className="flex items-center justify-between rounded border border-slate-100 bg-slate-50 px-4 py-2">
                <div><span className="font-medium text-navy">{m.label}</span> <span className="text-xs text-slate-400">{m.url}</span></div>
                <div className="flex gap-3"><button className="text-navy hover:text-crimson" onClick={() => setEdit(m)}><i className="fa-solid fa-pen" /></button>
                  <button className="text-crimson" onClick={() => setConfirm(m)}><i className="fa-solid fa-trash" /></button></div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {edit && <LinkModal item={edit === 'new' ? { location: loc } : edit} onClose={() => setEdit(null)} busy={save.isPending}
        onSave={async (v) => { try { await save.mutateAsync({ id: edit === 'new' ? null : edit._id, values: v }); setEdit(null); toast.success('Saved.'); } catch (e) { toast.error(e.message); } }} />}
      <ConfirmDialog open={!!confirm} title="Delete this link?" onConfirm={async () => { try { await del.mutateAsync(confirm._id); setConfirm(null); toast.success('Deleted.'); } catch (e) { toast.error(e.message); } }} onCancel={() => setConfirm(null)} busy={del.isPending} />
    </div>
  );
}

function LinkModal({ item, onClose, onSave, busy }) {
  const [f, setF] = useState({ label: item.label || '', url: item.url || '', location: item.location || 'header', target: item.target || '_self', order: item.order || 0 });
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));
  return (
    <Modal open onClose={onClose} title={item._id ? 'Edit link' : 'New link'}
      footer={<><Button variant="ghost" size="sm" onClick={onClose} disabled={busy}>Cancel</Button><Button size="sm" loading={busy} onClick={() => onSave(f)}>Save</Button></>}>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Label" required><Input value={f.label} onChange={(e) => set('label', e.target.value)} /></FormField>
        <FormField label="URL"><Input value={f.url} onChange={(e) => set('url', e.target.value)} placeholder="/about/genesis" /></FormField>
        <FormField label="Location"><Select value={f.location} options={['header', 'footer', 'quick']} onChange={(e) => set('location', e.target.value)} /></FormField>
        <FormField label="Target"><Select value={f.target} options={['_self', '_blank']} onChange={(e) => set('target', e.target.value)} /></FormField>
        <FormField label="Order"><Input type="number" value={f.order} onChange={(e) => set('order', +e.target.value)} /></FormField>
      </div>
    </Modal>
  );
}
