import type { Request, Response } from 'express';
import type { HydratedDocument } from 'mongoose';
import crypto from 'crypto';

import { Player, type PlayerDocument } from '../models/Player';
import { signToken } from '../utils/jwt';
import { comparePassword, hashPassword } from '../utils/password';
import { sendVerificationEmail } from '../utils/email';

function sanitizePlayer(player: HydratedDocument<PlayerDocument> | null) {
  if (!player) {
    return null;
  }

  return {
    id: player._id.toString(),
    username: player.username,
    email: player.email,
    registrationDate: player.registrationDate,
    status: player.status,
    personalInfo: player.personalInfo,
    avatar: player.avatar,
    verification: {
      emailVerified: player.verification?.emailVerified ?? false,
      phoneVerified: player.verification?.phoneVerified ?? false,
    },
    playerType: player.playerType,
    preferences: player.preferences,
  };
}

export async function register(req: Request, res: Response) {
  const { username, email, password, personalInfo, avatar, playerType, preferences } = req.body ?? {};

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Username, email, and password are required.' });
  }

  const existing = await Player.findOne({
    $or: [{ email: String(email).toLowerCase() }, { username }],
  });

  if (existing) {
    return res.status(409).json({ message: 'Username or email already exists.' });
  }

  const passwordHash = await hashPassword(String(password));

  const emailVerificationCode = crypto.randomInt(100000, 1000000).toString();
  const emailVerificationExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

  const player = await Player.create({
    username,
    email,
    passwordHash,
    registrationDate: new Date(),
    status: 'active',
    personalInfo,
    avatar,
    playerType,
    preferences,
    verification: {
      emailVerified: false,
      emailVerificationCode,
      emailVerificationExpiresAt,
    },
  });

  try {
    await sendVerificationEmail(player.email, emailVerificationCode);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('SendGrid failed. Verification code:', emailVerificationCode);
  }

  return res.status(201).json({ player: sanitizePlayer(player) });
}

export async function login(req: Request, res: Response) {
  const { email, username, password } = req.body ?? {};

  if ((!email && !username) || !password) {
    return res.status(400).json({ message: 'Email or username and password are required.' });
  }

  const query: Array<Record<string, string>> = [];
  if (email) {
    query.push({ email: String(email).toLowerCase() });
  }
  if (username) {
    query.push({ username: String(username) });
  }

  const player = await Player.findOne({ $or: query });

  if (!player) {
    return res.status(401).json({ message: 'Invalid credentials.' });
  }

  if (!player.verification?.emailVerified) {
    return res.status(403).json({ message: 'Email not verified.' });
  }

  const isMatch = await comparePassword(String(password), player.passwordHash);

  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid credentials.' });
  }

  const token = signToken(player._id.toString());

  return res.json({ token, player: sanitizePlayer(player) });
}

export async function me(req: Request, res: Response) {
  const playerId = req.user?.id;

  if (!playerId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const player = await Player.findById(playerId);

  if (!player) {
    return res.status(404).json({ message: 'Player not found' });
  }

  return res.json({ player: sanitizePlayer(player) });
}

export async function verifyEmail(req: Request, res: Response) {
  const { email, code } = req.body ?? {};

  if (!email || !code) {
    return res.status(400).json({ message: 'Email and verification code are required.' });
  }

  const player = await Player.findOne({ email: String(email).toLowerCase() });

  if (!player) {
    return res.status(404).json({ message: 'Account not found.' });
  }

  const verification = player.verification;

  if (!verification?.emailVerificationCode || !verification.emailVerificationExpiresAt) {
    return res.status(400).json({ message: 'Verification code is not available.' });
  }

  if (verification.emailVerificationExpiresAt.getTime() < Date.now()) {
    return res.status(400).json({ message: 'Verification code expired.' });
  }

  if (verification.emailVerificationCode !== String(code)) {
    return res.status(400).json({ message: 'Invalid verification code.' });
  }

  player.verification = {
    ...(player.verification ?? {}),
    emailVerified: true,
    emailVerificationCode: undefined,
    emailVerificationExpiresAt: undefined,
  };

  await player.save();

  return res.json({ player: sanitizePlayer(player) });
}

export async function updateProfile(req: Request, res: Response) {
  const playerId = req.user?.id;

  if (!playerId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { avatar, personalInfo } = req.body ?? {};

  const updates: Record<string, unknown> = {};

  if (avatar !== undefined) {
    updates.avatar = avatar;
  }

  if (personalInfo) {
    updates.personalInfo = {
      firstName: personalInfo.firstName,
      lastName: personalInfo.lastName,
      dateOfBirth: personalInfo.dateOfBirth ? new Date(personalInfo.dateOfBirth) : undefined,
      phoneNumber: personalInfo.phoneNumber,
      country: personalInfo.country,
    };
  }

  const player = await Player.findByIdAndUpdate(playerId, updates, { new: true });

  if (!player) {
    return res.status(404).json({ message: 'Player not found' });
  }

  return res.json({ player: sanitizePlayer(player) });
}

