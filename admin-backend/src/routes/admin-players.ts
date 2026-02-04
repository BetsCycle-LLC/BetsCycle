import { Router } from 'express';

import { listPlayers, updatePlayer } from '../controllers/adminPlayersController';
import { requireAuth } from '../middleware/auth';

export const adminPlayersRouter = Router();

adminPlayersRouter.get('/', requireAuth, listPlayers);
adminPlayersRouter.put('/:playerId', requireAuth, updatePlayer);

