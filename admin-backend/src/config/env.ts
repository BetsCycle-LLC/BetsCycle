import { config } from 'dotenv';

config();

function readEnv(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  port: Number(readEnv('PORT', '4001')),
  mongoUri: readEnv('MONGO_URI'),
  jwtSecret: readEnv('JWT_SECRET'),
  jwtExpiresIn: readEnv('JWT_EXPIRES_IN', '7d'),
  clientOrigin: readEnv('CLIENT_ORIGIN', 'http://localhost:5173'),
};

