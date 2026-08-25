import { useState } from 'react';
import { useRoles, usePermissions, useSaveRole, useDeleteRole } from '../api/cms.js';
import { Loading, ErrorState, Card, Button, Modal, ConfirmDialog, Badge, FormField, Input, useToast } from '../components/ui/index.js';

export default function RolesPermissions() {
  const toast = useToast();
  const { data: roles = [], isLoading, isError, error } = useRoles();
  const { data: permissions = [] } = usePermissions();
  const save = useSaveRole();
  const del = useDeleteRole();
  const [edit, setEdit] = useState(null);   // role | 'new' | null
  const [confirm, setConfirm] = useState(null);

  if (isLoading) return <Loading />;
  if (isError) return <ErrorState error={error} />;

  const grouped = permissions.reduce((acc, p) => { const g = p.split(':')[0]; (acc[g] ||= []).push(p); return acc; }, {});

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div><h1 className="text-2xl"><i className="fa-solid fa-user-shield mr-2 text-crimson" /> Roles & Permissions</h1>
          <p className="text-sm text-slate-500">{roles.length} roles · {permissions.length} permissions</p></div>
        <Button icon="fa-plus" size="sm" onClick={() => setEdit('new')}>New role</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {roles.map((r) => (
          <Card key={r._id} className="p-5">
            <div className="flex items-start justify-between">
              <div><h3 className="font-display text-lg text-navy">{r.label || r.name}</h3>
                <p className="text-xs text-slate-500">{r.name}{r.isSystem && <Badge tone="gold" className="ml-2">system</Badge>}</p></div>
              <div className="flex gap-2">
                <button className="text-navy hover:text-crimson" onClick={() => setEdit(r)}><i className="fa-solid fa-pen" /></button>
                {!r.isSystem && <button className="text-crimson" onClick={() => setConfirm(r)}><i className="fa-solid fa-trash" /></button>}
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-500">{r.permissions?.includes('*') ? 'All permissions' : `${r.permissions?.length || 0} permissions`}</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {(r.permissions || []).slice(0, 6).map((p) => <Badge key={p} tone="slate">{p}</Badge>)}
              {r.permissions?.length > 6 && <Badge tone="slate">+{r.permissions.length - 6}</Badge>}
            </div>
          </Card>
        ))}
      </div>

      {edit && <RoleModal role={edit === 'new' ? null : edit} grouped={grouped} onClose={() => setEdit(null)}
        onSave={async (values) => { try { await save.mutateAsync({ id: edit === 'new' ? null : edit._id, values }); setEdit(null); toast.success('Role saved.'); } catch (e) { toast.error(e.message); } }} busy={save.isPending} />}
      <ConfirmDialog open={!!confirm} title={`Delete role “${confirm?.name}”?`} onConfirm={async () => { try { await del.mutateAsync(confirm._id); setConfirm(null); toast.success('Deleted.'); } catch (e) { toast.error(e.message); } }} onCancel={() => setConfirm(null)} busy={del.isPending} />
    </div>
  );
}

function RoleModal({ role, grouped, onClose, onSave, busy }) {
  const [name, setName] = useState(role?.name || '');
  const [label, setLabel] = useState(role?.label || '');
  const [perms, setPerms] = useState(new Set(role?.permissions || []));
  const toggle = (p) => setPerms((s) => { const n = new Set(s); n.has(p) ? n.delete(p) : n.add(p); return n; });
  const all = role?.permissions?.includes('*');

  return (
    <Modal open onClose={onClose} size="lg" title={role ? `Edit “${role.name}”` : 'New role'}
      footer={<><Button variant="ghost" size="sm" onClick={onClose} disabled={busy}>Cancel</Button>
               <Button size="sm" loading={busy} onClick={() => onSave({ name, label, permissions: [...perms] })}>Save role</Button></>}>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Name" required><Input value={name} disabled={role?.isSystem} onChange={(e) => setName(e.target.value)} placeholder="editor" /></FormField>
        <FormField label="Label"><Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Content Editor" /></FormField>
      </div>
      {all ? <p className="mt-4 rounded bg-gold/10 p-3 text-sm text-[#8a6d13]">This role has the wildcard <code>*</code> (all permissions).</p> : (
        <div className="mt-4 max-h-72 space-y-3 overflow-y-auto pr-2">
          {Object.entries(grouped).map(([group, list]) => (
            <div key={group}>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">{group}</p>
              <div className="flex flex-wrap gap-2">
                {list.map((p) => (
                  <label key={p} className={`cursor-pointer rounded-full border px-3 py-1 text-xs ${perms.has(p) ? 'border-navy bg-navy text-white' : 'border-slate-200 text-slate-600 hover:border-navy'}`}>
                    <input type="checkbox" className="hidden" checked={perms.has(p)} onChange={() => toggle(p)} />{p.split(':')[1]}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}
