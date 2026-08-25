import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import api from '../lib/axios.js';
import { setUser, clearUser, setGuest } from '../store/authSlice.js';

// Restores the session on app load and keeps redux in sync (v5-safe).
export function useSessionBootstrap() {
  const dispatch = useDispatch();
  const query = useQuery({
    queryKey: ['session'],
    queryFn: () => api.get('/auth/me'),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
  useEffect(() => {
    if (query.isSuccess) dispatch(setUser(query.data));
    else if (query.isError) dispatch(setGuest());
  }, [query.isSuccess, query.isError, query.data, dispatch]);
  return query;
}

export function useLogin() {
  const dispatch = useDispatch();
  return useMutation({
    mutationFn: (creds) => api.post('/auth/login', creds),
    onSuccess: (u) => dispatch(setUser(u)),
  });
}

export function useLogout() {
  const dispatch = useDispatch();
  return useMutation({
    mutationFn: () => api.post('/auth/logout'),
    onSuccess: () => dispatch(clearUser()),
  });
}

export function useForgotPassword() {
  return useMutation({ mutationFn: (id) => api.post('/auth/forgot-password', { username: id }) });
}
export function useResetPassword() {
  return useMutation({ mutationFn: ({ token, newPassword }) => api.post('/auth/reset-password', { token, newPassword }) });
}
export function useLoginHistory() {
  return useQuery({ queryKey: ['login-history'], queryFn: () => api.get('/auth/login-history') });
}

export function useRevokeSession() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id) => api.delete(`/auth/sessions/${id}`), onSuccess: () => qc.invalidateQueries({ queryKey: ['login-history'] }) });
}
export function useRevokeOtherSessions() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: () => api.post('/auth/sessions/revoke-others'), onSuccess: () => qc.invalidateQueries({ queryKey: ['login-history'] }) });
}
