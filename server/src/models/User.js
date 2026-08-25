import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username:      { type: String, required: true, unique: true, trim: true, lowercase: true },
  email:         { type: String, trim: true, lowercase: true, default: '' },
  passwordHash:  { type: String, required: true, select: false },
  fullName:      { type: String, default: '' },
  // 'admin' = super admin; 'director' = directorate manager
  role:          { type: String, enum: ['admin', 'director', 'examiner'], default: 'director', index: true },
  // directorate key this user manages, e.g. 'dap', 'otpri', 'iqac' (empty for super admin)
  directorate:   { type: String, default: '', index: true },
  isActive:      { type: Boolean, default: true },
  mustChangePwd: { type: Boolean, default: false },
  lastLogin:     { type: Date, default: null },
}, { timestamps: true });

userSchema.methods.verifyPassword = function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};
userSchema.statics.hashPassword = function (plain) {
  return bcrypt.hash(plain, 12);
};
userSchema.methods.toSafeJSON = function () {
  return {
    id: this._id, username: this.username, email: this.email,
    full_name: this.fullName, role: this.role, directorate: this.directorate,
    must_change_pwd: this.mustChangePwd,
  };
};
export default mongoose.model('User', userSchema);
