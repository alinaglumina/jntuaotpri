import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForgotPassword } from '../api/auth.js';
import { Card, Button, FormField, Input } from '../components/ui/index.js';

export default function ForgotPassword() {
  const [id, setId] = useState('');
  const forgot = useForgotPassword();
  const done = forgot.isSuccess;

  return (
    <div className="grid min-h-screen place-items-center bg-canvas p-4">
      <title>Forgot Password — JNTUA</title>
      <Card className="w-full max-w-md p-8">
        <h1 className="font-display text-2xl text-navy">Forgot password</h1>
        {done ? (
          <div className="mt-4">
            <p className="rounded-md bg-green-50 p-4 text-sm text-green-800">If an account exists, a reset link has been sent to its email.</p>
            {forgot.data?.devResetUrl && (
              <p className="mt-3 break-all rounded bg-slate-50 p-3 text-xs text-slate-600">Dev link: <a className="text-crimson" href={forgot.data.devResetUrl}>{forgot.data.devResetUrl}</a></p>
            )}
            <Link to="/login" className="mt-4 inline-block text-sm font-semibold text-crimson">← Back to sign in</Link>
          </div>
        ) : (
          <>
            <p className="mt-1 text-sm text-slate-500">Enter your username or email and we’ll send a reset link.</p>
            <div className="mt-6 space-y-4">
              <FormField label="Username or email"><Input value={id} onChange={(e) => setId(e.target.value)} autoFocus /></FormField>
              {forgot.isError && <p className="text-sm text-crimson">{forgot.error.message}</p>}
              <Button className="w-full" loading={forgot.isPending} onClick={() => id && forgot.mutate(id)}>Send reset link</Button>
              <Link to="/login" className="block text-center text-sm text-slate-500 hover:text-crimson">Back to sign in</Link>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
