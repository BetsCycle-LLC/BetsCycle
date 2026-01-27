import { Router } from 'express';

import { listPlayers } from '../controllers/adminPlayersController';
import { requireAuth } from '../middleware/auth';

export const adminPlayersRouter = Router();

adminPlayersRouter.get('/', requireAuth, listPlayers);

