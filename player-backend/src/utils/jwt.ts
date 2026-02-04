import jwt from 'jsonwebtoken';

import { env } from '../config/env';

export type JwtPayload = {
  sub: string;
};

export function signToken(playerId: string) {
  const payload: JwtPayload = { sub: playerId };
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}

export function verifyToken(token: string) {
  return jwt.verify(token, env.jwtSecret) as JwtPayload;
}

