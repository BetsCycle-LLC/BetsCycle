import type { Request, Response } from 'express';

import { LoyaltyTier } from '../models/LoyaltyTier';
import { Currency } from '../models/Currency';

type LevelUpBonus = {
  currencyId: string;
  amount: number;
};

type TierLevel = {
  levelNumber: number;
  xp: number;
  faucetInterval: number;
  weeklyRakeback: number;
  monthlyRakeback: number;
  levelUpBonus: LevelUpBonus[];
};

type TierResponse = {
  id: string;
  tiersName: string;
  icon: string;
  order: number;
  levels: TierLevel[];
  createdAt: Date;
  updatedAt: Date;
};

function sanitizeTier(tier: {
  _id: { toString(): string };
  tiersName: string;
  icon: string;
  order: number;
  levels: Array<{
    levelNumber: number;
    xp: number;
    weeklyRakeback: number;
    monthlyRakeback: number;
    levelUpBonus: Array<{
      currencyId: { toString(): string };
      amount: number;
    }>;
  }>;
  createdAt: Date;
  updatedAt: Date;
}): TierResponse {
  return {
    id: tier._id.toString(),
    tiersName: tier.tiersName,
    icon: tier.icon,
    order: tier.order,
    levels: tier.levels.map((level) => ({
      levelNumber: level.levelNumber,
      xp: level.xp,
      faucetInterval: level.faucetInterval ?? 0,
      weeklyRakeback: level.weeklyRakeback,
      monthlyRakeback: level.monthlyRakeback,
      levelUpBonus: level.levelUpBonus.map((bonus) => ({
        currencyId: bonus.currencyId.toString(),
        amount: bonus.amount,
      })),
    })),
    createdAt: tier.createdAt,
    updatedAt: tier.updatedAt,
  };
}

function parseNumber(value: unknown, field: string) {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    throw new Error(`${field} must be a number.`);
  }
  return parsed;
}

export async function listLoyaltyTiers(_req: Request, res: Response) {
  const tiers = await LoyaltyTier.find().sort({ order: 1 });

  return res.json({
    tiers: tiers.map((tier) => sanitizeTier(tier)),
  });
}

export async function createLoyaltyTier(req: Request, res: Response) {
  try {
    const {
      tiersName,
      order = 0,
      levels: levelsStr,
      iconPath,
    } = req.body ?? {};

    if (!tiersName) {
      return res.status(400).json({ message: 'Tier name is required.' });
    }

    // Handle icon from file upload or path
    let icon = iconPath || '';
    if (req.file) {
      // Store relative path from uploads folder
      icon = `/uploads/loyalty-icons/${req.file.filename}`;
    }

    // Parse levels from JSON string
    let levels: TierLevel[] = [];
    if (levelsStr) {
      try {
        levels = JSON.parse(levelsStr);
      } catch {
        return res.status(400).json({ message: 'Invalid levels format.' });
      }
    }

    if (levels.length === 0) {
      return res.status(400).json({ message: 'At least one level is required.' });
    }

    // Validate currencies exist in all levels
    const allCurrencyIds = new Set<string>();
    levels.forEach((level) => {
      level.levelUpBonus.forEach((bonus) => {
        allCurrencyIds.add(bonus.currencyId);
      });
    });

    if (allCurrencyIds.size > 0) {
      const currencies = await Currency.find({ _id: { $in: Array.from(allCurrencyIds) } });
      if (currencies.length !== allCurrencyIds.size) {
        return res.status(400).json({ message: 'One or more currencies not found.' });
      }
    }

    const tier = await LoyaltyTier.create({
      tiersName: String(tiersName).trim(),
      icon,
      order: parseNumber(order, 'order'),
      levels: levels.map((level) => ({
        levelNumber: parseNumber(level.levelNumber, 'level number'),
        xp: parseNumber(level.xp, 'XP'),
        faucetInterval: parseNumber(level.faucetInterval ?? 0, 'faucet interval'),
        weeklyRakeback: parseNumber(level.weeklyRakeback, 'weeklyRakeback'),
        monthlyRakeback: parseNumber(level.monthlyRakeback, 'monthlyRakeback'),
        levelUpBonus: level.levelUpBonus.map((bonus) => ({
          currencyId: bonus.currencyId,
          amount: parseNumber(bonus.amount, 'bonus amount'),
        })),
      })),
    });

    return res.status(201).json({ tier: sanitizeTier(tier) });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ message: error.message });
    }
    return res.status(400).json({ message: 'Unable to create tier.' });
  }
}

export async function updateLoyaltyTier(req: Request, res: Response) {
  const tierId = req.params.tierId;

  if (!tierId) {
    return res.status(400).json({ message: 'Tier id is required.' });
  }

  try {
    const updates: Record<string, unknown> = {};
    const {
      tiersName,
      order,
      levels: levelsStr,
      iconPath,
    } = req.body ?? {};

    if (tiersName !== undefined) {
      updates.tiersName = String(tiersName).trim();
    }

    if (order !== undefined) {
      updates.order = parseNumber(order, 'order');
    }

    // Handle icon update
    if (req.file) {
      updates.icon = `/uploads/loyalty-icons/${req.file.filename}`;
    } else if (iconPath !== undefined) {
      updates.icon = iconPath;
    }

    // Handle levels update
    if (levelsStr !== undefined) {
      let levels: TierLevel[] = [];
      try {
        levels = JSON.parse(levelsStr);
      } catch {
        return res.status(400).json({ message: 'Invalid levels format.' });
      }

      if (levels.length === 0) {
        return res.status(400).json({ message: 'At least one level is required.' });
      }

      // Validate currencies exist in all levels
      const allCurrencyIds = new Set<string>();
      levels.forEach((level) => {
        level.levelUpBonus.forEach((bonus) => {
          allCurrencyIds.add(bonus.currencyId);
        });
      });

      if (allCurrencyIds.size > 0) {
        const currencies = await Currency.find({ _id: { $in: Array.from(allCurrencyIds) } });
        if (currencies.length !== allCurrencyIds.size) {
          return res.status(400).json({ message: 'One or more currencies not found.' });
        }
      }

      updates.levels = levels.map((level) => ({
        levelNumber: parseNumber(level.levelNumber, 'level number'),
        xp: parseNumber(level.xp, 'XP'),
        faucetInterval: parseNumber(level.faucetInterval ?? 0, 'faucet interval'),
        weeklyRakeback: parseNumber(level.weeklyRakeback, 'weeklyRakeback'),
        monthlyRakeback: parseNumber(level.monthlyRakeback, 'monthlyRakeback'),
        levelUpBonus: level.levelUpBonus.map((bonus) => ({
          currencyId: bonus.currencyId,
          amount: parseNumber(bonus.amount, 'bonus amount'),
        })),
      }));
    }

    const tier = await LoyaltyTier.findByIdAndUpdate(tierId, updates, { new: true });

    if (!tier) {
      return res.status(404).json({ message: 'Tier not found.' });
    }

    return res.json({ tier: sanitizeTier(tier) });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ message: error.message });
    }
    return res.status(400).json({ message: 'Unable to update tier.' });
  }
}

export async function deleteLoyaltyTier(req: Request, res: Response) {
  const tierId = req.params.tierId;

  if (!tierId) {
    return res.status(400).json({ message: 'Tier id is required.' });
  }

  const tier = await LoyaltyTier.findByIdAndDelete(tierId);

  if (!tier) {
    return res.status(404).json({ message: 'Tier not found.' });
  }

  return res.json({ success: true });
}


