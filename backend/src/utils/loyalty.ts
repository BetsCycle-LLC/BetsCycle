import { LoyaltyTier } from '../models/LoyaltyTier';

export type LoyaltyLevelInfo = {
  tiersName: string;
  icon: string;
  order: number;
  levelNumber: number;
  xp: number;
  faucetInterval: number;
  weeklyRakeback: number;
  monthlyRakeback: number;
  levelUpBonus: Array<{
    currencyId: string;
    amount: number;
  }>;
} | null;

/**
 * Get the loyalty tier and level information based on the provided XP
 * @param xp - The experience points to check
 * @returns The tier and level information, or null if no matching level found
 */
export async function getLoyaltyLevelByXP(xp: number): Promise<LoyaltyLevelInfo> {
  // Fetch all tiers sorted by order (ascending)
  const tiers = await LoyaltyTier.find().sort({ order: 1 });

  if (tiers.length === 0) {
    return null;
  }

  let currentLevel: LoyaltyLevelInfo = null;

  // Iterate through tiers to find the appropriate level
  for (const tier of tiers) {
    // Sort levels by XP (ascending)
    const sortedLevels = [...tier.levels].sort((a, b) => a.xp - b.xp);

    // Find the highest level where required XP <= provided XP
    for (const level of sortedLevels) {
      if (xp >= level.xp) {
        currentLevel = {
          tiersName: tier.tiersName,
          icon: tier.icon,
          order: tier.order,
          levelNumber: level.levelNumber,
          xp: level.xp,
        faucetInterval: level.faucetInterval ?? 0,
          weeklyRakeback: level.weeklyRakeback,
          monthlyRakeback: level.monthlyRakeback,
          levelUpBonus: level.levelUpBonus.map((bonus) => ({
            currencyId: bonus.currencyId.toString(),
            amount: bonus.amount,
          })),
        };
      } else {
        // Since levels are sorted, we can break early
        break;
      }
    }

    // If we found a level in this tier, continue to check higher tiers
    // The player might qualify for a higher tier
  }

  return currentLevel;
}

/**
 * Get the next loyalty level information based on current XP
 * @param currentXP - The current experience points
 * @returns The next level information, or null if already at max level
 */
export async function getNextLoyaltyLevel(
  currentXP: number
): Promise<LoyaltyLevelInfo> {
  const tiers = await LoyaltyTier.find().sort({ order: 1 });

  if (tiers.length === 0) {
    return null;
  }

  let nextLevel: LoyaltyLevelInfo = null;
  let minXPDifference = Infinity;

  // Find the next level with XP > currentXP
  for (const tier of tiers) {
    const sortedLevels = [...tier.levels].sort((a, b) => a.xp - b.xp);

    for (const level of sortedLevels) {
      if (level.xp > currentXP) {
        const xpDifference = level.xp - currentXP;
        if (xpDifference < minXPDifference) {
          minXPDifference = xpDifference;
          nextLevel = {
            tiersName: tier.tiersName,
            icon: tier.icon,
            order: tier.order,
            levelNumber: level.levelNumber,
            xp: level.xp,
          faucetInterval: level.faucetInterval ?? 0,
            weeklyRakeback: level.weeklyRakeback,
            monthlyRakeback: level.monthlyRakeback,
            levelUpBonus: level.levelUpBonus.map((bonus) => ({
              currencyId: bonus.currencyId.toString(),
              amount: bonus.amount,
            })),
          };
        }
      }
    }
  }

  return nextLevel;
}

/**
 * Get XP progress information
 * @param currentXP - The current experience points
 * @returns Progress information including current level, next level, and progress percentage
 */
export async function getLoyaltyProgress(currentXP: number): Promise<{
  currentLevel: LoyaltyLevelInfo;
  nextLevel: LoyaltyLevelInfo;
  progressPercentage: number;
  xpToNextLevel: number;
}> {
  const currentLevel = await getLoyaltyLevelByXP(currentXP);
  const nextLevel = await getNextLoyaltyLevel(currentXP);

  let progressPercentage = 0;
  let xpToNextLevel = 0;

  if (currentLevel && nextLevel) {
    const currentLevelXP = currentLevel.xp;
    const nextLevelXP = nextLevel.xp;
    const xpRange = nextLevelXP - currentLevelXP;
    const currentProgress = currentXP - currentLevelXP;
    progressPercentage = (currentProgress / xpRange) * 100;
    xpToNextLevel = nextLevelXP - currentXP;
  } else if (!nextLevel) {
    // Max level reached
    progressPercentage = 100;
    xpToNextLevel = 0;
  }

  return {
    currentLevel,
    nextLevel,
    progressPercentage: Math.min(100, Math.max(0, progressPercentage)),
    xpToNextLevel: Math.max(0, xpToNextLevel),
  };
}

