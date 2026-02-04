import { Router } from 'express';

import { claimFaucet, getFaucetStatus } from '../controllers/faucetController';
import { requireAuth } from '../middleware/auth';

export const faucetRouter = Router();

faucetRouter.get('/status', requireAuth, getFaucetStatus);
faucetRouter.post('/claim', requireAuth, claimFaucet);


