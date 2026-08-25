import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useUpdateProfile } from '../api/cms.js';
import { Card, Button, FormField, Input, Badge, useToast } from '../components/ui/index.js';

export default function Profile() {
  const { user } = useAuth();
  const toast = useToast();
  const update = useUpdateProfile();
  const [form, setForm] = useState({ fullName: '', email: '' });
  useEffect(() => { if (user) setForm({ fullName: user.full_name || '', email: user.email || '' }); }, [user]);

  const submit = async () => { try { await update.mutateAsync(form); toast.success('Profile updated.'); } catch (e) { toast.error(e.message); } };

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl"><i className="fa-solid fa-id-badge mr-2 text-crimson" /> My Profile</h1>
      <Card className="mt-6 p-6">
        <div className="mb-4 flex items-center gap-4">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-navy font-display text-2xl text-white">{(user?.username || '?')[0].toUpperCase()}</span>
          <div><p className="font-semibold text-navy">{user?.username}</p>
            <Badge tone={user?.role === 'admin' ? 'crimson' : 'navy'}>{user?.role}</Badge>
            {user?.directorate && <span className="ml-2 text-xs text-slate-500">{user.directorate}</span>}</div>
        </div>
        <div className="space-y-4">
          <FormField label="Full name"><Input value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} /></FormField>
          <FormField label="Email"><Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} /></FormField>
          <div className="flex items-center justify-between">
            <Button loading={update.isPending} onClick={submit}>Save changes</Button>
            <Link to="/admin/account/password" className="text-sm font-semibold text-crimson">Change password →</Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
