import { useForm } from 'react-hook-form';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useLogin } from '../api/auth.js';

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const login = useLogin();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/admin';

  const onSubmit = async (values) => {
    try {
      await login.mutateAsync(values);
      navigate(from, { replace: true });
    } catch { /* error surfaced below */ }
  };

  return (
    <>
      <title>Admin Login — JNTUA</title>
      <div className="container grid min-h-[70vh] place-items-center py-12">
        <div className="card w-full max-w-md p-8">
          <h1 className="text-2xl">Admin &amp; Directorate Login</h1>
          <p className="mt-1 text-sm text-slate-500">Sign in to manage portal content.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
            <div>
              <label className="mb-1 block text-sm font-semibold" htmlFor="username">Username or email</label>
              <input id="username" className="field" autoComplete="username"
                {...register('username', { required: 'Username is required' })} />
              {errors.username && <p className="mt-1 text-xs text-crimson">{errors.username.message}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold" htmlFor="password">Password</label>
              <input id="password" type="password" className="field" autoComplete="current-password"
                {...register('password', { required: 'Password is required' })} />
              {errors.password && <p className="mt-1 text-xs text-crimson">{errors.password.message}</p>}
            </div>

            {login.isError && (
              <div className="rounded-md bg-crimson/10 px-3 py-2 text-sm text-crimson-700">{login.error.message}</div>
            )}

            <button type="submit" className="btn-primary w-full" disabled={login.isPending}>
              {login.isPending ? 'Signing in…' : 'Sign in'}
            </button>
            <div className="mt-4 text-center"><a href="/forgot-password" className="text-sm text-slate-500 hover:text-crimson">Forgot password?</a></div>
      </form>

          <Link to="/" className="mt-4 inline-block text-sm">← Back to site</Link>
        </div>
      </div>
    </>
  );
}
