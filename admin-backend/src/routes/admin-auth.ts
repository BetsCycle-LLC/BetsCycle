import { Router } from 'express';

import { loginAdmin, meAdmin } from '../controllers/adminAuthController';
import { requireAuth } from '../middleware/auth';

export const adminAuthRouter = Router();

adminAuthRouter.post('/login', loginAdmin);
adminAuthRouter.get('/me', requireAuth, meAdmin);

