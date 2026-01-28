import type { Request, Response } from 'express';

import { Player } from '../models/Player';

type AdminPlayerResponse = {
  id: string;
  username: string;
  email: string;
  status: string;
  avatar?: string;
  playerType: string;
  registrationDate: Date;
  personalInfo?: {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    country?: string;
    countryCode?: string;
  };
  verification: {
    emailVerified: boolean;
    phoneVerified: boolean;
  };
};

function sanitizePlayerForAdmin(player: {
  _id: { toString(): string };
  username: string;
  email: string;
  status: string;
  avatar?: string;
  playerType?: string;
  registrationDate?: Date;
  personalInfo?: {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    country?: string;
    countryCode?: string;
  };
  verification?: {
    emailVerified?: boolean;
    phoneVerified?: boolean;
  };
}): AdminPlayerResponse {
  return {
    id: player._id.toString(),
    username: player.username,
    email: player.email,
    status: player.status,
    avatar: player.avatar,
    playerType: player.playerType ?? 'normal',
    registrationDate: player.registrationDate ?? new Date(0),
    personalInfo: player.personalInfo,
    verification: {
      emailVerified: player.verification?.emailVerified ?? false,
      phoneVerified: player.verification?.phoneVerified ?? false,
    },
  };
}

export async function listPlayers(req: Request, res: Response) {
  const status = typeof req.query.status === 'string' ? req.query.status : undefined;

  const query: Record<string, string> = {};
  if (status) {
    query.status = status;
  }

  const players = await Player.find(query).sort({ createdAt: -1 });

  return res.json({
    players: players.map((player) => sanitizePlayerForAdmin(player)),
  });
}

export async function updatePlayer(req: Request, res: Response) {
  const playerId = req.params.playerId;

  if (!playerId) {
    return res.status(400).json({ message: 'Player id is required.' });
  }

  const { avatar, email, personalInfo } = req.body ?? {};

  const updates: Record<string, unknown> = {};

  if (email !== undefined) {
    updates.email = String(email).toLowerCase();
  }

  if (avatar !== undefined) {
    updates.avatar = avatar;
  }

  if (personalInfo) {
    updates.personalInfo = {
      firstName: personalInfo.firstName,
      lastName: personalInfo.lastName,
      phoneNumber: personalInfo.phoneNumber,
      country: personalInfo.country,
      countryCode: personalInfo.countryCode,
    };
  }

  const player = await Player.findByIdAndUpdate(playerId, updates, { new: true });

  if (!player) {
    return res.status(404).json({ message: 'Player not found' });
  }

  return res.json({ player: sanitizePlayerForAdmin(player) });
}

