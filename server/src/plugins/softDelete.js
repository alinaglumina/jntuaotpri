// Reusable soft-delete plugin. Adds `isDeleted` + `deletedAt`, auto-excludes
// deleted docs from queries (unless `.setOptions({ withDeleted: true })`), and
// provides softDelete()/restore() instance methods + a `deleted()` static.
export function softDeletePlugin(schema) {
  schema.add({
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
  });

  // Exclude soft-deleted documents from reads by default.
  const guard = function () {
    if (!this.getOptions?.().withDeleted) this.where({ isDeleted: { $ne: true } });
  };
  ['find', 'findOne', 'findOneAndUpdate', 'countDocuments', 'updateMany', 'updateOne'].forEach((op) =>
    schema.pre(op, guard)
  );

  schema.methods.softDelete = function () {
    this.isDeleted = true; this.deletedAt = new Date(); return this.save();
  };
  schema.methods.restore = function () {
    this.isDeleted = false; this.deletedAt = null; return this.save();
  };
  // Query helpers.
  schema.statics.withDeleted = function (filter = {}) { return this.find(filter).setOptions({ withDeleted: true }); };
  schema.statics.onlyDeleted = function (filter = {}) { return this.find({ ...filter, isDeleted: true }).setOptions({ withDeleted: true }); };
}

// Models that must NOT be soft-deletable (append-only or infra).
export const SOFT_DELETE_EXCLUDE = new Set(['AuditLog', 'SiteSetting']);
