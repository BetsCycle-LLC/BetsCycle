import type { Request, Response } from 'express';
import { PlayerXP } from '../models/PlayerXP';
import { Player } from '../models/Player';
import { getLoyaltyProgress } from '../utils/loyalty';

/**
 * Get player's XP and loyalty level
 * GET /api/player/xp/:userId
 */
export async function getPlayerXP(req: Request, res: Response) {
  try {
    const { userId } = req.params;

    // Check if player exists
    const player = await Player.findById(userId);
    if (!player) {
      return res.status(404).json({ message: 'Player not found.' });
    }

    // Get or create player XP record
    let playerXP = await PlayerXP.findOne({ userId });
    if (!playerXP) {
      playerXP = await PlayerXP.create({ userId, xp: 0 });
    }

    // Get loyalty progress
    const loyaltyInfo = await getLoyaltyProgress(playerXP.xp);

    return res.json({
      userId: playerXP.userId,
      xp: playerXP.xp,
      loyalty: loyaltyInfo,
    });
  } catch (error) {
    console.error('Error getting player XP:', error);
    return res.status(500).json({ message: 'Failed to get player XP.' });
  }
}

/**
 * Add XP to a player
 * POST /api/player/xp/:userId/add
 * Body: { amount: number }
 */
export async function addPlayerXP(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const { amount } = req.body;

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount. Must be a positive number.' });
    }

    // Check if player exists
    const player = await Player.findById(userId);
    if (!player) {
      return res.status(404).json({ message: 'Player not found.' });
    }

    // Get or create player XP record
    let playerXP = await PlayerXP.findOne({ userId });
    if (!playerXP) {
      playerXP = await PlayerXP.create({ userId, xp: 0 });
    }

    const oldXP = playerXP.xp;
    const oldLevel = await getLoyaltyProgress(oldXP);

    // Add XP
    playerXP.xp += amount;
    await playerXP.save();

    const newLevel = await getLoyaltyProgress(playerXP.xp);

    // Check if player leveled up
    const leveledUp =
      oldLevel.currentLevel &&
      newLevel.currentLevel &&
      (oldLevel.currentLevel.order !== newLevel.currentLevel.order ||
        oldLevel.currentLevel.levelNumber !== newLevel.currentLevel.levelNumber);

    return res.json({
      userId: playerXP.userId,
      xp: playerXP.xp,
      xpAdded: amount,
      oldXP,
      leveledUp,
      loyalty: newLevel,
    });
  } catch (error) {
    console.error('Error adding player XP:', error);
    return res.status(500).json({ message: 'Failed to add player XP.' });
  }
}

/**
 * Set player's XP (admin only)
 * PUT /api/player/xp/:userId
 * Body: { xp: number }
 */
export async function setPlayerXP(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const { xp } = req.body;

    if (xp === undefined || typeof xp !== 'number' || xp < 0) {
      return res.status(400).json({ message: 'Invalid XP value. Must be a non-negative number.' });
    }

    // Check if player exists
    const player = await Player.findById(userId);
    if (!player) {
      return res.status(404).json({ message: 'Player not found.' });
    }

    // Update or create player XP record
    let playerXP = await PlayerXP.findOne({ userId });
    if (!playerXP) {
      playerXP = await PlayerXP.create({ userId, xp });
    } else {
      playerXP.xp = xp;
      await playerXP.save();
    }

    // Get loyalty progress
    const loyaltyInfo = await getLoyaltyProgress(playerXP.xp);

    return res.json({
      userId: playerXP.userId,
      xp: playerXP.xp,
      loyalty: loyaltyInfo,
    });
  } catch (error) {
    console.error('Error setting player XP:', error);
    return res.status(500).json({ message: 'Failed to set player XP.' });
  }
}

/**
 * Get XP leaderboard
 * GET /api/player/xp/leaderboard?limit=10&skip=0
 */
export async function getXPLeaderboard(req: Request, res: Response) {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);
    const skip = parseInt(req.query.skip as string) || 0;

    const leaderboard = await PlayerXP.find()
      .sort({ xp: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'email username'); // Adjust fields based on your Player model

    const total = await PlayerXP.countDocuments();

    // Add loyalty info for each player
    const leaderboardWithLoyalty = await Promise.all(
      leaderboard.map(async (entry) => {
        const loyalty = await getLoyaltyProgress(entry.xp);
        return {
          userId: entry.userId,
          xp: entry.xp,
          currentLevel: loyalty.currentLevel,
        };
      })
    );

    return res.json({
      leaderboard: leaderboardWithLoyalty,
      total,
      limit,
      skip,
    });
  } catch (error) {
    console.error('Error getting XP leaderboard:', error);
    return res.status(500).json({ message: 'Failed to get XP leaderboard.' });
  }
}

/**
 * Reset all player XP (admin only - dangerous)
 * DELETE /api/admin/player-xp/reset
 */
export async function resetAllPlayerXP(req: Request, res: Response) {
  try {
    const result = await PlayerXP.updateMany({}, { xp: 0 });

    return res.json({
      message: 'All player XP has been reset.',
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error('Error resetting player XP:', error);
    return res.status(500).json({ message: 'Failed to reset player XP.' });
  }
}

