import asyncHandler from '../utils/asyncHandler.js';
import { ok } from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import { Role } from '../models/index.js';
import { PERMISSIONS } from '../config/permissions.js';

export const listPermissions = asyncHandler(async (req, res) => ok(res, { permissions: PERMISSIONS }));

export const listRoles = asyncHandler(async (req, res) => {
  const roles = await Role.find().sort('name').lean();
  return ok(res, { items: roles, total: roles.length });
});

export const createRole = asyncHandler(async (req, res) => {
  const { name, label, permissions } = req.body;
  if (!name) throw ApiError.badRequest('Role name is required');
  if (await Role.findOne({ name: name.toLowerCase() })) throw ApiError.badRequest('Role already exists');
  const role = await Role.create({ name: name.toLowerCase(), label, permissions: dedupe(permissions) });
  return ok(res, role, 201);
});

export const updateRole = asyncHandler(async (req, res) => {
  const role = await Role.findById(req.params.id);
  if (!role) throw ApiError.notFound();
  if (role.isSystem && req.body.name && req.body.name !== role.name) throw ApiError.badRequest('Cannot rename a system role');
  if (req.body.label != null) role.label = req.body.label;
  if (req.body.permissions) role.permissions = dedupe(req.body.permissions);
  await role.save();
  return ok(res, role);
});

export const deleteRole = asyncHandler(async (req, res) => {
  const role = await Role.findById(req.params.id);
  if (!role) throw ApiError.notFound();
  if (role.isSystem) throw ApiError.badRequest('System roles cannot be deleted');
  await role.deleteOne();
  return ok(res, { id: req.params.id, deleted: true });
});

const dedupe = (arr) => [...new Set((arr || []).filter((p) => PERMISSIONS.includes(p) || p === '*'))];
