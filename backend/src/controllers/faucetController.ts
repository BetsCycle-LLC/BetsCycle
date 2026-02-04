import type { Request, Response } from 'express';

import { Currency } from '../models/Currency';
import { FaucetClaim } from '../models/FaucetClaim';
import { Player } from '../models/Player';
import { PlayerXP } from '../models/PlayerXP';
import { getLoyaltyLevelByXP } from '../utils/loyalty';

const MINUTE_MS = 60 * 1000;

function getIntervalMs(intervalMinutes: number) {
  return Math.max(0, intervalMinutes) * MINUTE_MS;
}

export async function getFaucetStatus(req: Request, res: Response) {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const player = await Player.findById(userId);
  if (!player) {
    return res.status(404).json({ message: 'Player not found.' });
  }

  let playerXP = await PlayerXP.findOne({ userId });
  if (!playerXP) {
    playerXP = await PlayerXP.create({ userId, xp: 0 });
  }

  const currentLevel = await getLoyaltyLevelByXP(playerXP.xp);
  if (!currentLevel) {
    return res.json({ level: null, faucets: [] });
  }

  const rewards = currentLevel.faucetRewards ?? [];
  const currencyIds = rewards.map((reward) => reward.currencyId);
  const currencies = await Currency.find({ _id: { $in: currencyIds } });
  const currencyMap = new Map(currencies.map((currency) => [currency._id.toString(), currency]));

  const intervalMs = getIntervalMs(currentLevel.faucetInterval ?? 0);
  const now = Date.now();
  const lastClaim = await FaucetClaim.findOne({ userId }).sort({ lastClaimedAt: -1 });
  const lastClaimedAt = lastClaim?.lastClaimedAt ?? null;
  const nextClaimAt = lastClaimedAt ? new Date(lastClaimedAt.getTime() + intervalMs) : null;
  const timeRemainingMs =
    intervalMs === 0 || !nextClaimAt ? 0 : Math.max(0, nextClaimAt.getTime() - now);
  const canClaim = intervalMs === 0 || !lastClaimedAt || timeRemainingMs === 0;

  const faucets = rewards.map((reward) => {
    const currency = currencyMap.get(reward.currencyId);

    return {
      currencyId: reward.currencyId,
      currencyCode: currency?.currencyCode ?? '',
      currencyName: currency?.currencyName ?? '',
      symbol: currency?.symbol ?? '',
      amount: reward.amount,
      intervalMinutes: currentLevel.faucetInterval ?? 0,
      lastClaimedAt,
      nextClaimAt,
      canClaim,
      timeRemainingMs,
    };
  });

  return res.json({
    level: {
      tiersName: currentLevel.tiersName,
      levelNumber: currentLevel.levelNumber,
      faucetInterval: currentLevel.faucetInterval ?? 0,
      icon: currentLevel.icon ?? '',
    },
    faucets,
  });
}

export async function claimFaucet(req: Request, res: Response) {
  const userId = req.user?.id;
  const { currencyId } = req.body ?? {};

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (!currencyId || typeof currencyId !== 'string') {
    return res.status(400).json({ message: 'Currency id is required.' });
  }

  const player = await Player.findById(userId);
  if (!player) {
    return res.status(404).json({ message: 'Player not found.' });
  }

  let playerXP = await PlayerXP.findOne({ userId });
  if (!playerXP) {
    playerXP = await PlayerXP.create({ userId, xp: 0 });
  }

  const currentLevel = await getLoyaltyLevelByXP(playerXP.xp);
  if (!currentLevel) {
    return res.status(400).json({ message: 'No loyalty level found.' });
  }

  const reward = currentLevel.faucetRewards.find((item) => item.currencyId === currencyId);
  if (!reward) {
    return res.status(400).json({ message: 'Faucet reward not configured for this currency.' });
  }

  if (reward.amount <= 0) {
    return res.status(400).json({ message: 'Faucet reward amount is not available.' });
  }

  const intervalMs = getIntervalMs(currentLevel.faucetInterval ?? 0);
  const now = new Date();

  const claim = await FaucetClaim.findOne({ userId }).sort({ lastClaimedAt: -1 });
  if (claim && intervalMs > 0) {
    const nextClaimAt = new Date(claim.lastClaimedAt.getTime() + intervalMs);
    if (nextClaimAt.getTime() > now.getTime()) {
      return res.status(400).json({
        message: 'Faucet not ready yet.',
        nextClaimAt,
        timeRemainingMs: nextClaimAt.getTime() - now.getTime(),
      });
    }
  }

  if (claim) {
    claim.lastClaimedAt = now;
    claim.currencyId = currencyId;
    await claim.save();
  } else {
    await FaucetClaim.create({ userId, currencyId, lastClaimedAt: now });
  }

  const currency = await Currency.findById(currencyId);

  return res.json({
    claimed: {
      currencyId,
      currencyCode: currency?.currencyCode ?? '',
      currencyName: currency?.currencyName ?? '',
      symbol: currency?.symbol ?? '',
      amount: reward.amount,
    },
    intervalMinutes: currentLevel.faucetInterval ?? 0,
    nextClaimAt: intervalMs > 0 ? new Date(now.getTime() + intervalMs) : null,
  });
}


