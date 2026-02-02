import { Router } from 'express';
import {
  getPlayerXP,
  addPlayerXP,
  setPlayerXP,
  getXPLeaderboard,
  resetAllPlayerXP,
} from '../controllers/playerXPController';
import { requireAuth } from '../middleware/auth';

export const playerXPRouter = Router();

// Public endpoints
playerXPRouter.get('/leaderboard', getXPLeaderboard);

// Protected endpoints - require authentication
playerXPRouter.get('/:userId', requireAuth, getPlayerXP);
playerXPRouter.post('/:userId/add', requireAuth, addPlayerXP);

// Admin endpoints - require admin authentication
playerXPRouter.put('/:userId', requireAuth, setPlayerXP);
playerXPRouter.delete('/reset', requireAuth, resetAllPlayerXP);

