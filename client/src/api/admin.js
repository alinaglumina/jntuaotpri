import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios.js';
import { adminListQuery, adminPageQuery } from './queries.js';

const base = (r) => `/admin/${r}`;

export function useResourceList(resource, params) {
  return useQuery(adminListQuery(resource, params));
}

// Paginated variant — returns { items, total, page, limit }.
export function useResourcePage(resource, params) {
  return useQuery({ ...adminPageQuery(resource, params), placeholderData: (prev) => prev });
}

// If any field is a File, send multipart; otherwise JSON.
function toPayload(values) {
  const hasFile = Object.values(values).some((v) =>
    v instanceof File || (Array.isArray(v) && v.some((item) => item instanceof File))
  );
  if (!hasFile) return { data: values, headers: undefined };
  const fd = new FormData();
  for (const [k, v] of Object.entries(values)) {
    if (v == null || v === '') continue;
    if (Array.isArray(v)) {
      if (v.length === 0) continue;
      // Append each item under the same field name — multer/Express collects
      // repeated keys back into an array on req.body, whether the items are
      // Files (attachments/images) or plain strings (e.g. multiselect values).
      v.forEach((item) => fd.append(k, item instanceof File ? item : String(item)));
    } else {
      fd.append(k, v instanceof File ? v : String(v));
    }
  }
  return { data: fd, headers: { 'Content-Type': 'multipart/form-data' } };
}

export function useSaveResource(resource) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }) => {
      const { data, headers } = toPayload(values);
      return id ? api.put(`${base(resource)}/${id}`, data, { headers })
                : api.post(base(resource), data, { headers });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', resource] }),
  });
}

export function useDeleteResource(resource) {
  const qc = useQueryClient();
  return useMutation({
    // pass { id, hard: true } to permanently purge a soft-deleted row
    mutationFn: (arg) => {
      const { id, hard } = typeof arg === 'object' ? arg : { id: arg, hard: false };
      return api.delete(`${base(resource)}/${id}${hard ? '?hard=1' : ''}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', resource] }),
  });
}

export function useRestoreResource(resource) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.post(`${base(resource)}/${id}/restore`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', resource] }),
  });
}

export function useMyResources() {
  return useQuery({ queryKey: ['admin', '_resources'], queryFn: () => api.get('/admin/_resources') });
}
