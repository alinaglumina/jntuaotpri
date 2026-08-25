import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { useSessionBootstrap } from './api/auth.js';
import { setGuest } from './store/authSlice.js';
import { router } from './routes/index.jsx';

export default function App() {
  const dispatch = useDispatch();
  useSessionBootstrap();   // restore session on load (guards wait for this)
  useEffect(() => {
    const onExpired = () => dispatch(setGuest());   // refresh failed → force re-login
    window.addEventListener('auth:expired', onExpired);
    return () => window.removeEventListener('auth:expired', onExpired);
  }, [dispatch]);
  return <RouterProvider router={router} />;
}
