import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios.js';

// ── Dashboard ──
export const useDashboard = () => useQuery({ queryKey: ['dashboard'], queryFn: () => api.get('/admin/dashboard') });

// ── Roles & Permissions ──
export const usePermissions = () => useQuery({ queryKey: ['permissions'], queryFn: () => api.get('/admin/permissions').then((d) => d.permissions) });
export const useRoles = () => useQuery({ queryKey: ['roles'], queryFn: () => api.get('/admin/roles').then((d) => d.items ?? []) });
export function useSaveRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }) => (id ? api.put(`/admin/roles/${id}`, values) : api.post('/admin/roles', values)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['roles'] }),
  });
}
export function useDeleteRole() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id) => api.delete(`/admin/roles/${id}`), onSuccess: () => qc.invalidateQueries({ queryKey: ['roles'] }) });
}

// ── Settings ──
export const useSettingsMap = () => useQuery({ queryKey: ['settings'], queryFn: () => api.get('/settings') });
export function useSaveSettings() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (map) => api.put('/settings', map), onSuccess: () => qc.invalidateQueries({ queryKey: ['settings'] }) });
}

// ── Audit logs ──
export const useLogs = (params) => useQuery({ queryKey: ['logs', params], queryFn: () => api.get('/admin/logs', { params }).then((d) => d.items ?? []) });

// ── Messages (contact | enquiries) ──
export const useInbox = (kind, params) => useQuery({ queryKey: ['inbox', kind, params], queryFn: () => api.get(`/admin/${kind}`, { params }) });
export function useUpdateMessage(kind) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, status }) => api.patch(`/admin/${kind}/${id}`, { status }), onSuccess: () => qc.invalidateQueries({ queryKey: ['inbox', kind] }) });
}
export function useDeleteMessage(kind) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id) => api.delete(`/admin/${kind}/${id}`), onSuccess: () => qc.invalidateQueries({ queryKey: ['inbox', kind] }) });
}

// ── Backup ──
export const useBackupInfo = () => useQuery({ queryKey: ['backup-info'], queryFn: () => api.get('/admin/backup/info') });

// ── Profile ──
export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (values) => api.put('/auth/profile', values), onSuccess: () => qc.invalidateQueries({ queryKey: ['session'] }) });
}
