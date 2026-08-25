import { useSelector } from 'react-redux';
import { selectUser, selectAuthStatus } from '../store/authSlice.js';

export function useAuth() {
  const user = useSelector(selectUser);
  const status = useSelector(selectAuthStatus);
  return {
    user, status,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    isAdmin: user?.role === 'admin',
  };
}
