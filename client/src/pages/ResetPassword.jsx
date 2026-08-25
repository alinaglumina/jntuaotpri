import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useResetPassword } from '../api/auth.js';
import { Card, Button, FormField, Input } from '../components/ui/index.js';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const navigate = useNavigate();
  const reset = useResetPassword();
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const mismatch = confirm && pw !== confirm;

  if (!token) return (
    <div className="grid min-h-screen place-items-center bg-canvas p-4">
      <Card className="max-w-md p-8 text-center"><p className="text-crimson">Missing or invalid reset link.</p>
        <Link to="/forgot-password" className="mt-3 inline-block text-sm font-semibold text-crimson">Request a new link</Link></Card>
    </div>
  );

  return (
    <div className="grid min-h-screen place-items-center bg-canvas p-4">
      <title>Reset Password — JNTUA</title>
      <Card className="w-full max-w-md p-8">
        <h1 className="font-display text-2xl text-navy">Set a new password</h1>
        {reset.isSuccess ? (
          <div className="mt-4">
            <p className="rounded-md bg-green-50 p-4 text-sm text-green-800">Password reset. You can now sign in.</p>
            <Button className="mt-4 w-full" onClick={() => navigate('/login')}>Go to sign in</Button>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <FormField label="New password" hint="At least 8 characters"><Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoFocus /></FormField>
            <FormField label="Confirm password" error={mismatch ? 'Passwords do not match' : undefined}><Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} /></FormField>
            {reset.isError && <p className="text-sm text-crimson">{reset.error.message}</p>}
            <Button className="w-full" loading={reset.isPending} disabled={pw.length < 8 || mismatch} onClick={() => reset.mutate({ token, newPassword: pw })}>Reset password</Button>
          </div>
        )}
      </Card>
    </div>
  );
}
