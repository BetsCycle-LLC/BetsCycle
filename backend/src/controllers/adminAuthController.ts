import type { Request, Response } from 'express';
import type { HydratedDocument } from 'mongoose';

import { Admin, type AdminDocument } from '../models/Admin';
import { comparePassword } from '../utils/password';
import { signToken } from '../utils/jwt';

function sanitizeAdmin(admin: HydratedDocument<AdminDocument> | null) {
  if (!admin) {
    return null;
  }

  return {
    id: admin._id.toString(),
    username: admin.username,
    email: admin.email,
    status: admin.status,
  };
}

export async function loginAdmin(req: Request, res: Response) {
  const { email, username, password } = req.body ?? {};

  if ((!email && !username) || !password) {
    return res.status(400).json({ message: 'Email or username and password are required.' });
  }

  const query: Array<Record<string, string>> = [];
  if (email) {
    query.push({ email: String(email).toLowerCase() });
  }
  if (username) {
    query.push({ username: String(username) });
  }

  const admin = await Admin.findOne({ $or: query });

  if (!admin) {
    return res.status(401).json({ message: 'Invalid credentials.' });
  }

  const isMatch = await comparePassword(String(password), admin.passwordHash);

  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid credentials.' });
  }

  const token = signToken(admin._id.toString());

  return res.json({ token, admin: sanitizeAdmin(admin) });
}

export async function meAdmin(req: Request, res: Response) {
  const adminId = req.user?.id;

  if (!adminId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const admin = await Admin.findById(adminId);

  if (!admin) {
    return res.status(404).json({ message: 'Admin not found' });
  }

  return res.json({ admin: sanitizeAdmin(admin) });
}

