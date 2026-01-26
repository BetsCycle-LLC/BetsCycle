import type { Request, Response } from 'express';
import type { HydratedDocument } from 'mongoose';

import { Player, type PlayerDocument } from '../models/Player';
import { signToken } from '../utils/jwt';
import { comparePassword, hashPassword } from '../utils/password';

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
  });

  const token = signToken(player._id.toString());

  return res.status(201).json({ token, player: sanitizePlayer(player) });
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

