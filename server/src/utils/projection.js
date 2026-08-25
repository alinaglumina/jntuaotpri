// Builds a Mongoose projection that returns ONLY the fields a list view needs,
// shrinking payloads (list endpoints don't need full HTML bodies, etc.).
export function listProjection(fields = []) {
  if (!fields.length) return null;
  const proj = { _id: 1, createdAt: 1, updatedAt: 1, isDeleted: 1 };
  for (const f of fields) proj[f] = 1;
  return proj;
}
