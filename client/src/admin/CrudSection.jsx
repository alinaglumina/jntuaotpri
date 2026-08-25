import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { RESOURCES } from './resources.js';
import { useResourcePage, useSaveResource, useDeleteResource, useRestoreResource } from '../api/admin.js';
import { useDebounce } from '../hooks/useDebounce.js';
import { ErrorState, Table, Modal, ConfirmDialog, Button, SearchBar, Badge, SkeletonTable, Pagination, useToast } from '../components/ui/index.js';
import ResourceForm from './components/ResourceForm.jsx';

const PAGE_SIZE = 25;

// Generic admin panel: debounced search + server-side pagination + Trash toggle.
export default function CrudSection() {
  const { resource } = useParams();
  const def = RESOURCES[resource];
  const { user, isAdmin } = useAuth();
  const [searchParams] = useSearchParams();
  const directorateParam = searchParams.get('directorate');
  const editParam = searchParams.get('edit');
  const editKeyParam = searchParams.get('editKey');
  const headingParam = searchParams.get('heading');
  const isDirectorateScoped = !!def?.fields?.some((f) => f.name === 'directorateKey');
  const toast = useToast();
  const [view, setView] = useState('active');
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [q, setQ] = useState(editKeyParam || '');
  const [page, setPage] = useState(1);
  const debouncedQ = useDebounce(q, 350);   // query only after typing stops

  const trash = view === 'trash';
  const params = { page, limit: PAGE_SIZE, ...(debouncedQ ? { q: debouncedQ } : {}), ...(trash ? { deleted: 'only' } : {}), ...(isDirectorateScoped && isAdmin && directorateParam ? { directorate: directorateParam } : {}) };
  const { data, isLoading, isError, error, isPlaceholderData } = useResourcePage(resource, params);
  const save = useSaveResource(resource);
  const del = useDeleteResource(resource);
  const restore = useRestoreResource(resource);

  if (!def) return <div className="rounded-md border border-dashed border-line p-8 text-center text-muted">Unknown section.</div>;

  const rows = data?.items || [];
  const total = data?.total || 0;
  const reset = () => setPage(1);

  // Deep-link support: /admin/r/xyz?edit=<id> opens that record's edit modal directly.
  useEffect(() => {
    if (editParam && rows.length) {
      const match = rows.find((r) => r._id === editParam);
      if (match) setEditing(match);
    }
  }, [editParam, rows]);

  // Deep-link support: /admin/r/page-content?editKey=<key>&heading=<label>
  // Opens the existing record for that key, or pre-fills a new one if it doesn't exist yet.
  useEffect(() => {
    if (editKeyParam && !isLoading) {
      const match = rows.find((r) => r.key === editKeyParam);
      setEditing(match || { key: editKeyParam, heading: headingParam || '' });
    }
  }, [editKeyParam, headingParam, rows, isLoading]);

  const isNew = editing === 'new' || (editing && !editing._id);
  const onSave = async (values) => { try { await save.mutateAsync({ id: isNew ? null : editing._id, values }); setEditing(null); toast.success('Saved.'); } catch (e) { toast.error(e.message); } };
  const onDelete = async () => { try { await del.mutateAsync({ id: confirm.row._id, hard: confirm.hard }); setConfirm(null); toast.success(confirm.hard ? 'Permanently deleted.' : 'Moved to trash.'); } catch (e) { toast.error(e.message); } };
  const onRestore = async (row) => { try { await restore.mutateAsync(row._id); toast.success('Restored.'); } catch (e) { toast.error(e.message); } };

  const columns = def.columns.map((key) => ({ key }));
  const visibleFields = isDirectorateScoped && !isAdmin
    ? def.fields.filter((f) => f.name !== 'directorateKey')
    : def.fields;
  const newRecordDefaults = isDirectorateScoped && isAdmin && directorateParam
    ? { directorateKey: directorateParam }
    : null;
  const setSearch = (v) => { setQ(v); reset(); };
  const switchView = (v) => { setView(v); reset(); };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl"><i className={`fa-solid ${def.icon} mr-2 text-crimson`} />{def.label}{trash && <Badge tone="slate" className="ml-2 align-middle">Trash</Badge>}</h1>
          <p className="text-sm text-muted">{total} {trash ? 'deleted' : 'record'}{total === 1 ? '' : 's'}{isPlaceholderData ? ' · updating…' : ''}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex overflow-hidden rounded-md border border-line text-sm">
            <button onClick={() => switchView('active')} className={`px-3 py-1.5 font-semibold ${!trash ? 'bg-navy text-white' : 'bg-surface text-brand hover:bg-navy/5'}`}>Active</button>
            <button onClick={() => switchView('trash')} className={`px-3 py-1.5 font-semibold ${trash ? 'bg-navy text-white' : 'bg-surface text-brand hover:bg-navy/5'}`}><i className="fa-solid fa-trash-can mr-1" />Trash</button>
          </div>
          {def.searchable !== false && <SearchBar value={q} onChange={setSearch} className="w-44" />}
          {!trash && <Button icon="fa-plus" size="sm" onClick={() => setEditing('new')}>Add</Button>}
        </div>
      </div>

      {isLoading ? <SkeletonTable rows={8} cols={def.columns.length + 1} /> : isError ? <ErrorState error={error} /> : (
        <>
          <Table columns={columns} rows={rows}
            empty={trash ? 'Trash is empty.' : `No ${def.label.toLowerCase()} found.`}
            actions={(row) => (trash ? (
              <>
                <button className="mr-3 text-brand hover:text-crimson" onClick={() => onRestore(row)} aria-label="Restore" title="Restore"><i className={`fa-solid fa-rotate-left ${restore.isPending ? 'fa-spin' : ''}`} /></button>
                <button className="text-crimson hover:text-crimson-700" onClick={() => setConfirm({ row, hard: true })} aria-label="Delete permanently" title="Delete permanently"><i className="fa-solid fa-trash-can" /></button>
              </>
            ) : (
              <>
                <button className="mr-3 text-brand hover:text-crimson" onClick={() => setEditing(row)} aria-label="Edit"><i className="fa-solid fa-pen" /></button>
                <button className="text-crimson hover:text-crimson-700" onClick={() => setConfirm({ row, hard: false })} aria-label="Delete"><i className="fa-solid fa-trash" /></button>
              </>
            ))} />
          <Pagination page={page} total={total} pageSize={PAGE_SIZE} onPage={setPage} />
        </>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={isNew ? `Add ${def.label}` : `Edit ${def.label}`}>
        {editing && <ResourceForm fields={visibleFields} initial={editing === 'new' ? newRecordDefaults : editing} onSubmit={onSave} onCancel={() => setEditing(null)} busy={save.isPending} error={save.error} />}
      </Modal>
      <ConfirmDialog open={!!confirm} title={confirm?.hard ? 'Delete permanently?' : 'Move to trash?'}
        body={confirm?.hard ? 'This permanently removes the item and cannot be undone.' : 'The item will be moved to Trash. You can restore it later.'}
        confirmLabel={confirm?.hard ? 'Delete forever' : 'Move to trash'} onConfirm={onDelete} onCancel={() => setConfirm(null)} busy={del.isPending} />
    </div>
  );
}
