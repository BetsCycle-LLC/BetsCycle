import { Router } from 'express';

import { login, me, register, verifyEmail } from '../controllers/authController';
import { requireAuth } from '../middleware/auth';

export const authRouter = Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/verify-email', verifyEmail);
authRouter.get('/me', requireAuth, me);

