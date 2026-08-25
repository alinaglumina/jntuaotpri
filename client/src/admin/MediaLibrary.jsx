import { useState, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios.js';
import { Loading, ErrorState, EmptyState, Modal, Button, Badge, ConfirmDialog, FilePreview, fileIcon, Select, useToast } from '../components/ui/index.js';
import { useAuth } from '../hooks/useAuth.js';

const TYPES = [['', 'All'], ['image', 'Images'], ['pdf', 'PDF'], ['word', 'Word'], ['excel', 'Excel'], ['powerpoint', 'PPT'], ['video', 'Video'], ['archive', 'ZIP'], ['other', 'Other']];
const fmtSize = (b) => (b > 1e6 ? `${(b / 1e6).toFixed(1)} MB` : b > 1e3 ? `${(b / 1e3).toFixed(0)} KB` : `${b} B`);

export default function MediaLibrary() {
  const qc = useQueryClient();
  const toast = useToast();
  const { isAdmin } = useAuth();
  const [folder, setFolder] = useState('root');
  const [type, setType] = useState('');
  const [preview, setPreview] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [drag, setDrag] = useState(false);
  const [progress, setProgress] = useState(null);      // 0..100 while uploading
  const [report, setReport] = useState(false);
  const [moveTo, setMoveTo] = useState(null);
  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const replaceRef = useRef(null);
  const [replacing, setReplacing] = useState(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['media', folder, type], queryFn: () => api.get('/admin/media', { params: { folder, ...(type ? { type } : {}) } }),
  });
  const invalidate = () => qc.invalidateQueries({ queryKey: ['media'] });
  const clearSel = () => setSelected(new Set());

  // Upload with progress (one file at a time, sequential, live % bar).
  const uploadFiles = useCallback(async (files) => {
    for (const file of files) {
      const fd = new FormData(); fd.append('file', file); fd.append('folder', folder);
      try {
        await api.post('/admin/media', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (e) => setProgress(Math.round((e.loaded / (e.total || 1)) * 100)),
        });
      } catch (err) { toast.error(`${file.name}: ${err.message}`); }
    }
    setProgress(null); invalidate(); toast.success(`Uploaded ${files.length} file${files.length === 1 ? '' : 's'}.`);
  }, [folder]);

  const replace = useMutation({
    mutationFn: ({ id, file }) => { const fd = new FormData(); fd.append('file', file); return api.put(`/admin/media/${id}/replace`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }); },
    onSuccess: () => { invalidate(); toast.success('File replaced.'); }, onError: (e) => toast.error(e.message),
  });
  const del = useMutation({ mutationFn: (id) => api.delete(`/admin/media/${id}`), onSuccess: () => { invalidate(); toast.success('Deleted.'); } });
  const bulkDelete = useMutation({ mutationFn: (ids) => api.post('/admin/media/bulk-delete', { ids }), onSuccess: (r) => { invalidate(); clearSel(); toast.success(`Deleted ${r.deleted} files.`); } });
  const bulkMove = useMutation({ mutationFn: ({ ids, folder }) => api.post('/admin/media/bulk-move', { ids, folder }), onSuccess: (r) => { invalidate(); clearSel(); setMoveTo(null); toast.success(`Moved ${r.moved} files.`); } });
  const createFolder = useMutation({
    mutationFn: (name) => api.post('/admin/media/folders', { name, parent: folder }),
    onSuccess: () => { invalidate(); setNewFolderOpen(false); setNewFolderName(''); toast.success('Folder created.'); },
    onError: (e) => toast.error(e.message),
  });

  const toggle = (id) => setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const doReplace = (f) => { setReplacing(f); replaceRef.current?.click(); };
  const onReplaceFile = (e) => { const file = e.target.files?.[0]; if (file && replacing) replace.mutate({ id: replacing._id, file }); e.target.value = ''; setReplacing(null); };
  const download = (f) => { window.location.href = `/api/media/${f._id}/download`; };
  const fullUrl = (f) => `${window.location.origin}${f.url}`;
  const copyUrl = async (f) => {
    try {
      await navigator.clipboard.writeText(fullUrl(f));
      toast.success('URL copied to clipboard.');
    } catch {
      toast.error('Could not copy URL.');
    }
  };

  const onDrop = (e) => { e.preventDefault(); setDrag(false); const files = [...(e.dataTransfer.files || [])]; if (files.length) uploadFiles(files); };
  const files = data?.files || [];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl"><i className="fa-solid fa-photo-film mr-2 text-crimson" /> Media Library</h1>
        <div className="flex gap-2">
          {isAdmin && <Button variant="ghost" size="sm" icon="fa-folder-plus" onClick={() => setNewFolderOpen(true)}>New folder</Button>}
          <Button variant="ghost" size="sm" icon="fa-chart-simple" onClick={() => setReport(true)}>Download report</Button>
          <label className="btn-primary cursor-pointer text-sm">
            <i className="fa-solid fa-upload" /> Upload
            <input type="file" multiple className="hidden" onChange={(e) => e.target.files?.length && uploadFiles([...e.target.files])} />
          </label>
        </div>
      </div>

      {/* Drag-and-drop zone with live progress */}
      <div onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={onDrop}
        className={`mb-4 rounded-lg border-2 border-dashed p-6 text-center text-sm transition ${drag ? 'border-crimson bg-crimson/5' : 'border-line'}`}>
        {progress != null ? (
          <div>
            <p className="mb-2 text-muted">Uploading… {progress}%</p>
            <div className="mx-auto h-2 max-w-md overflow-hidden rounded-full bg-line"><div className="h-full bg-navy transition-all" style={{ width: `${progress}%` }} /></div>
          </div>
        ) : <p className="text-muted"><i className="fa-solid fa-cloud-arrow-up mr-2 text-navy" />Drag &amp; drop files here, or use Upload. Multiple files supported.</p>}
      </div>

      <div className="mb-4 flex flex-wrap gap-1">
        {TYPES.map(([k, label]) => <button key={k} onClick={() => setType(k)} className={`rounded-full px-3 py-1 text-xs font-semibold ${type === k ? 'bg-navy text-white' : 'bg-surface text-brand hover:bg-navy/5 border border-line'}`}>{label}</button>)}
      </div>

      {/* Bulk toolbar */}
      {selected.size > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-md bg-navy/5 px-4 py-2 text-sm">
          <span className="font-semibold text-navy">{selected.size} selected</span>
          {isAdmin && <Button size="sm" variant="ghost" icon="fa-folder" onClick={() => setMoveTo('root')}>Move</Button>}
          {isAdmin && <Button size="sm" variant="danger" icon="fa-trash" loading={bulkDelete.isPending} onClick={() => bulkDelete.mutate([...selected])}>Delete</Button>}
          <button className="text-muted hover:text-crimson" onClick={clearSel}>Clear</button>
        </div>
      )}

      {isLoading ? <Loading /> : isError ? <ErrorState error={error} /> : (
        <>
          {data.folders?.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {folder !== 'root' && <button onClick={() => setFolder('root')} className="rounded-md border border-line bg-surface px-3 py-2 text-sm text-brand hover:bg-navy/5"><i className="fa-solid fa-arrow-left mr-1" /> Root</button>}
              {data.folders.map((f) => <button key={f._id} onClick={() => setFolder(f._id)} className="rounded-md border border-line bg-surface px-3 py-2 text-sm text-brand hover:bg-navy/5"><i className="fa-solid fa-folder mr-1 text-gold" /> {f.name}</button>)}
            </div>
          )}
          {files.length === 0 ? <EmptyState label="No files here." icon="fa-folder-open" /> : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10">
              {files.map((f) => (
                <div key={f._id} className={`card relative overflow-hidden ${selected.has(f._id) ? 'ring-2 ring-crimson' : ''}`}>
                  <input type="checkbox" checked={selected.has(f._id)} onChange={() => toggle(f._id)} className="absolute left-2 top-2 z-10 h-4 w-4 rounded border-slate-300 text-navy" aria-label="Select file" />
                  <button className="block w-full" onClick={() => setPreview(f)} aria-label={`Preview ${f.originalName}`}>
                    {f.fileType === 'image' ? <img src={f.url} alt={f.originalName} className="h-28 w-full object-cover" loading="lazy" /> : <div className="grid h-28 place-items-center bg-navy/5 text-3xl"><i className={`fa-solid ${fileIcon(f.fileType)}`} /></div>}
                  </button>
                  <div className="p-2">
                    <p className="truncate text-xs font-medium text-content" title={f.originalName}>{f.originalName}</p>
                    <p className="text-[11px] text-muted">{fmtSize(f.size)} · <i className="fa-solid fa-download" /> {f.downloadCount || 0}</p>
                    <div className="mt-1.5 flex items-center justify-between text-xs">
                      <button onClick={() => setPreview(f)} className="text-brand hover:text-crimson" title="Preview"><i className="fa-solid fa-eye" /></button>
                      <button onClick={() => download(f)} className="text-brand hover:text-crimson" title="Download"><i className="fa-solid fa-download" /></button>
                      {isAdmin && <button onClick={() => doReplace(f)} className="text-brand hover:text-crimson" title="Replace"><i className="fa-solid fa-arrows-rotate" /></button>}
                      <button onClick={() => copyUrl(f)} className="text-brand hover:text-crimson" title="Copy URL"><i className="fa-solid fa-link" /></button>
                      {isAdmin && <button onClick={() => setConfirm(f)} className="text-muted hover:text-crimson" title="Delete"><i className="fa-solid fa-trash" /></button>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <input ref={replaceRef} type="file" className="hidden" onChange={onReplaceFile} />

      <Modal open={!!preview} onClose={() => setPreview(null)} size="xl" title={preview?.originalName}
        footer={<><span className="mr-auto text-xs text-muted">{preview && `${fmtSize(preview.size)} · ${preview.downloadCount || 0} downloads`}</span>
          <Button size="sm" variant="ghost" icon="fa-link" onClick={() => copyUrl(preview)}>Copy URL</Button>
          {isAdmin && <Button size="sm" variant="ghost" onClick={() => doReplace(preview)}>Replace</Button>}
          <Button size="sm" icon="fa-download" onClick={() => download(preview)}>Download</Button></>}>
        {preview && <FilePreview url={preview.url} type={preview.fileType} name={preview.originalName} height={520} />}
      </Modal>

      {/* Move-to-folder picker */}
      <Modal open={moveTo != null} onClose={() => setMoveTo(null)} title={`Move ${selected.size} file(s)`}
        footer={<><Button size="sm" variant="ghost" onClick={() => setMoveTo(null)}>Cancel</Button>
          <Button size="sm" loading={bulkMove.isPending} onClick={() => bulkMove.mutate({ ids: [...selected], folder: moveTo })}>Move here</Button></>}>
        <Select value={moveTo || 'root'} onChange={(e) => setMoveTo(e.target.value)} placeholder="Root"
          options={[{ value: 'root', label: 'Root' }, ...(data?.folders || []).map((f) => ({ value: f._id, label: f.name }))]} />
      </Modal>

      <Modal open={newFolderOpen} onClose={() => setNewFolderOpen(false)} title="New Folder"
        footer={<><Button size="sm" variant="ghost" onClick={() => setNewFolderOpen(false)}>Cancel</Button>
          <Button size="sm" loading={createFolder.isPending} disabled={!newFolderName.trim()} onClick={() => createFolder.mutate(newFolderName.trim())}>Create</Button></>}>
        <input
          type="text" value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)}
          placeholder="Folder name" autoFocus
          onKeyDown={(e) => { if (e.key === 'Enter' && newFolderName.trim()) createFolder.mutate(newFolderName.trim()); }}
          className="w-full rounded-md border border-line px-3 py-2 text-sm"
        />
      </Modal>

      <ReportModal open={report} onClose={() => setReport(false)} fmtSize={fmtSize} />
      <ConfirmDialog open={!!confirm} title={`Delete “${confirm?.originalName}”?`} body="This removes the file from storage permanently."
        onConfirm={() => { del.mutate(confirm._id); setConfirm(null); }} onCancel={() => setConfirm(null)} busy={del.isPending} />
    </div>
  );
}

function ReportModal({ open, onClose, fmtSize }) {
  const { data, isLoading } = useQuery({ queryKey: ['media-report'], queryFn: () => api.get('/admin/media/report'), enabled: open });
  return (
    <Modal open={open} onClose={onClose} size="lg" title="Download Report">
      {isLoading ? <Loading /> : (
        <div>
          <div className="mb-4 flex gap-6">
            <div><p className="text-2xl font-bold text-navy">{data?.totalDownloads ?? 0}</p><p className="text-xs text-muted">Total downloads</p></div>
            <div><p className="text-2xl font-bold text-navy">{data?.totalFiles ?? 0}</p><p className="text-xs text-muted">Files</p></div>
          </div>
          {(data?.top || []).length === 0 ? <p className="text-sm text-muted">No downloads recorded yet.</p> : (
            <table className="w-full text-left text-sm">
              <thead className="text-muted"><tr><th className="py-1">File</th><th>Type</th><th className="text-right">Downloads</th></tr></thead>
              <tbody className="divide-y divide-line">
                {data.top.map((f) => (
                  <tr key={f._id}><td className="py-2"><i className={`fa-solid ${fileIcon(f.fileType)} mr-2`} />{f.originalName}</td>
                    <td><Badge tone="slate">{f.fileType}</Badge></td>
                    <td className="text-right font-semibold text-navy">{f.downloadCount}</td></tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </Modal>
  );
}
