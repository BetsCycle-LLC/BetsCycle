import type { Request, Response } from 'express';
import { LoyaltyTier } from '../models/LoyaltyTier';
import { getLoyaltyLevelByXP, getNextLoyaltyLevel, getLoyaltyProgress } from '../utils/loyalty';

/**
 * Get loyalty level by XP
 * GET /api/loyalty/level?xp=1000
 */
export async function getLoyaltyLevelHandler(req: Request, res: Response) {
  try {
    const xp = Number(req.query.xp);

    if (Number.isNaN(xp) || xp < 0) {
      return res.status(400).json({ message: 'Invalid XP value. Must be a positive number.' });
    }

    const level = await getLoyaltyLevelByXP(xp);

    if (!level) {
      return res.status(404).json({ message: 'No loyalty levels configured or XP too low.' });
    }

    return res.json({ level });
  } catch (error) {
    console.error('Error getting loyalty level:', error);
    return res.status(500).json({ message: 'Failed to get loyalty level.' });
  }
}

/**
 * Get next loyalty level
 * GET /api/loyalty/next-level?xp=1000
 */
export async function getNextLoyaltyLevelHandler(req: Request, res: Response) {
  try {
    const xp = Number(req.query.xp);

    if (Number.isNaN(xp) || xp < 0) {
      return res.status(400).json({ message: 'Invalid XP value. Must be a positive number.' });
    }

    const nextLevel = await getNextLoyaltyLevel(xp);

    if (!nextLevel) {
      return res.json({
        message: 'Maximum level reached!',
        nextLevel: null,
      });
    }

    return res.json({ nextLevel });
  } catch (error) {
    console.error('Error getting next loyalty level:', error);
    return res.status(500).json({ message: 'Failed to get next loyalty level.' });
  }
}

/**
 * Get loyalty progress information
 * GET /api/loyalty/progress?xp=1000
 */
export async function getLoyaltyProgressHandler(req: Request, res: Response) {
  try {
    const xp = Number(req.query.xp);

    if (Number.isNaN(xp) || xp < 0) {
      return res.status(400).json({ message: 'Invalid XP value. Must be a positive number.' });
    }

    const progress = await getLoyaltyProgress(xp);

    return res.json(progress);
  } catch (error) {
    console.error('Error getting loyalty progress:', error);
    return res.status(500).json({ message: 'Failed to get loyalty progress.' });
  }
}

/**
 * Get all loyalty tiers and levels
 * GET /api/loyalty/tiers
 */
export async function getLoyaltyTiersHandler(_req: Request, res: Response) {
  try {
    const tiers = await LoyaltyTier.find().sort({ order: 1 });

    return res.json({
      tiers: tiers.map((tier) => ({
        id: tier._id.toString(),
        tiersName: tier.tiersName,
        icon: tier.icon,
        order: tier.order,
        levels: tier.levels.map((level) => ({
          levelNumber: level.levelNumber,
          xp: level.xp,
          faucetInterval: level.faucetInterval ?? 0,
          faucetRewards: (level.faucetRewards ?? []).map((reward) => ({
            currencyId: reward.currencyId.toString(),
            amount: reward.amount,
          })),
          weeklyRakeback: level.weeklyRakeback,
          monthlyRakeback: level.monthlyRakeback,
          levelUpBonus: level.levelUpBonus.map((bonus) => ({
            currencyId: bonus.currencyId.toString(),
            amount: bonus.amount,
          })),
        })),
        createdAt: tier.createdAt,
        updatedAt: tier.updatedAt,
      })),
    });
  } catch (error) {
    console.error('Error getting loyalty tiers:', error);
    return res.status(500).json({ message: 'Failed to get loyalty tiers.' });
  }
}

