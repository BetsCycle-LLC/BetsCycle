import { Admin } from '../models/Admin';
import { hashPassword } from './password';

const DEFAULT_ADMIN_EMAIL = 'admin@betscycle.com';
const DEFAULT_ADMIN_PASSWORD = 'adminP@ssw0rd';
const DEFAULT_ADMIN_USERNAME = 'admin';

export async function ensureDefaultAdmin() {
  const existing = await Admin.findOne({
    $or: [{ email: DEFAULT_ADMIN_EMAIL.toLowerCase() }, { username: DEFAULT_ADMIN_USERNAME }],
  });
  if (existing) {
    return;
  }

  const passwordHash = await hashPassword(DEFAULT_ADMIN_PASSWORD);

  await Admin.create({
    username: DEFAULT_ADMIN_USERNAME,
    email: DEFAULT_ADMIN_EMAIL.toLowerCase(),
    passwordHash,
    status: 'active',
  });
}

