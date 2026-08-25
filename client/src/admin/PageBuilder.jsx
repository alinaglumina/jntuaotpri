import { useState, useMemo } from 'react';
import { useResourceList, useSaveResource, useDeleteResource } from '../api/admin.js';
import { Loading, ErrorState, Card, Button, Modal, ConfirmDialog, FormField, Input, Select, RichTextEditor, Badge, useToast } from '../components/ui/index.js';

// Block-based page builder over the content-blocks collection. Groups blocks by
// `page`, lets you add/edit/reorder/delete. Each block is a keyed content unit.
const TYPES = ['html', 'text', 'json', 'list', 'image'];

export default function PageBuilder() {
  const toast = useToast();
  const { data: blocks = [], isLoading, isError, error } = useResourceList('content-blocks');
  const save = useSaveResource('content-blocks');
  const del = useDeleteResource('content-blocks');
  const [edit, setEdit] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const byPage = useMemo(() => {
    const g = {};
    [...blocks].sort((a, b) => (a.order || 0) - (b.order || 0)).forEach((b) => { (g[b.page || 'ungrouped'] ||= []).push(b); });
    return g;
  }, [blocks]);

  if (isLoading) return <Loading />;
  if (isError) return <ErrorState error={error} />;

  const move = async (block, dir) => {
    try { await save.mutateAsync({ id: block._id, values: { order: (block.order || 0) + dir } }); }
    catch (e) { toast.error(e.message); }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div><h1 className="text-2xl"><i className="fa-solid fa-cubes mr-2 text-crimson" /> Page Builder</h1>
          <p className="text-sm text-slate-500">{blocks.length} content blocks across {Object.keys(byPage).length} pages</p></div>
        <Button icon="fa-plus" size="sm" onClick={() => setEdit('new')}>Add block</Button>
      </div>

      {Object.keys(byPage).length === 0 ? <p className="rounded-md border border-dashed border-slate-300 p-10 text-center text-slate-500">No blocks yet. Add one to start building a page.</p> : (
        <div className="space-y-6">
          {Object.entries(byPage).map(([page, list]) => (
            <Card key={page} className="p-5">
              <h2 className="mb-3 font-display text-lg text-navy"><i className="fa-solid fa-file-lines mr-2 text-slate-400" />{page}</h2>
              <div className="space-y-2">
                {list.map((b, i) => (
                  <div key={b._id} className="flex items-center justify-between rounded-md border border-slate-100 bg-slate-50 px-4 py-2">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col">
                        <button disabled={i === 0} className="text-xs text-slate-400 hover:text-navy disabled:opacity-30" onClick={() => move(b, -1)}><i className="fa-solid fa-chevron-up" /></button>
                        <button disabled={i === list.length - 1} className="text-xs text-slate-400 hover:text-navy disabled:opacity-30" onClick={() => move(b, 1)}><i className="fa-solid fa-chevron-down" /></button>
                      </div>
                      <div><span className="font-medium text-navy">{b.title || b.key}</span> <Badge tone="slate">{b.type}</Badge>
                        <p className="text-xs text-slate-400">{b.key}</p></div>
                    </div>
                    <div className="flex gap-3">
                      <button className="text-navy hover:text-crimson" onClick={() => setEdit(b)}><i className="fa-solid fa-pen" /></button>
                      <button className="text-crimson" onClick={() => setConfirm(b)}><i className="fa-solid fa-trash" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      {edit && <BlockModal block={edit === 'new' ? null : edit} onClose={() => setEdit(null)} busy={save.isPending}
        onSave={async (v) => { try { await save.mutateAsync({ id: edit === 'new' ? null : edit._id, values: v }); setEdit(null); toast.success('Block saved.'); } catch (e) { toast.error(e.message); } }} />}
      <ConfirmDialog open={!!confirm} title="Delete this block?" onConfirm={async () => { try { await del.mutateAsync(confirm._id); setConfirm(null); toast.success('Deleted.'); } catch (e) { toast.error(e.message); } }} onCancel={() => setConfirm(null)} busy={del.isPending} />
    </div>
  );
}

function BlockModal({ block, onClose, onSave, busy }) {
  const [f, setF] = useState({ key: block?.key || '', page: block?.page || '', title: block?.title || '', type: block?.type || 'html', body: block?.body || '', order: block?.order || 0 });
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));
  return (
    <Modal open onClose={onClose} size="lg" title={block ? `Edit block` : 'New block'}
      footer={<><Button variant="ghost" size="sm" onClick={onClose} disabled={busy}>Cancel</Button><Button size="sm" loading={busy} onClick={() => onSave(f)}>Save</Button></>}>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Key" required><Input value={f.key} onChange={(e) => set('key', e.target.value)} placeholder="home.hero" /></FormField>
        <FormField label="Page / section"><Input value={f.page} onChange={(e) => set('page', e.target.value)} placeholder="home" /></FormField>
        <FormField label="Title"><Input value={f.title} onChange={(e) => set('title', e.target.value)} /></FormField>
        <FormField label="Type"><Select value={f.type} options={TYPES} onChange={(e) => set('type', e.target.value)} /></FormField>
      </div>
      <div className="mt-4"><FormField label="Content">
        {f.type === 'html' ? <RichTextEditor value={f.body} onChange={(v) => set('body', v)} /> : <textarea className="field font-mono text-xs" rows={5} value={f.body} onChange={(e) => set('body', e.target.value)} />}
      </FormField></div>
    </Modal>
  );
}
