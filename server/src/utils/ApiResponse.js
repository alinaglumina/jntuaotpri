// Preserves the EXACT envelope the legacy PHP APIs returned, so the React
// data layer stays unchanged: { success, data, error }.
export function ok(res, data = null, status = 200) {
  return res.status(status).json({ success: true, data, error: null });
}
export function fail(res, error = 'Request failed', status = 400, data = null) {
  return res.status(status).json({ success: false, data, error });
}
