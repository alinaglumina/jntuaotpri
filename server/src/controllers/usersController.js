import asyncHandler from '../utils/asyncHandler.js';
import { ok } from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import { User } from '../models/index.js';

export const listUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort('username').lean();
  return ok(res, { items: users.map(({ passwordHash, ...u }) => u), total: users.length });
});

export const createUser = asyncHandler(async (req, res) => {
  const { username, password, fullName, email, role, directorate } = req.body;
  if (!username || !password) throw ApiError.badRequest('Username and password are required');
  if (await User.findOne({ username: username.toLowerCase() })) throw ApiError.badRequest('Username already exists');
  const user = await User.create({
    username: username.toLowerCase(), email, fullName,
    role: role === 'admin' ? 'admin' : 'director', directorate: directorate || '',
    passwordHash: await User.hashPassword(password),
  });
  return ok(res, user.toSafeJSON(), 201);
});

export const updateUser = asyncHandler(async (req, res) => {
  const patch = { ...req.body };
  if (patch.password) { patch.passwordHash = await User.hashPassword(patch.password); delete patch.password; }
  delete patch.username;
  const user = await User.findByIdAndUpdate(req.params.id, patch, { new: true });
  if (!user) throw ApiError.notFound();
  return ok(res, user.toSafeJSON());
});

export const deleteUser = asyncHandler(async (req, res) => {
  if (String(req.user._id) === req.params.id) throw ApiError.badRequest('You cannot delete your own account');
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw ApiError.notFound();
  return ok(res, { id: req.params.id, deleted: true });
});
