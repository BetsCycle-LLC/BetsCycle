import { Router } from 'express';
import {
  getLoyaltyTiersHandler,
  getLoyaltyLevelHandler,
  getNextLoyaltyLevelHandler,
  getLoyaltyProgressHandler,
} from '../controllers/loyaltyController';

export const loyaltyRouter = Router();

// Public endpoints - no auth required for checking loyalty levels
loyaltyRouter.get('/tiers', getLoyaltyTiersHandler);
loyaltyRouter.get('/level', getLoyaltyLevelHandler);
loyaltyRouter.get('/next-level', getNextLoyaltyLevelHandler);
loyaltyRouter.get('/progress', getLoyaltyProgressHandler);

