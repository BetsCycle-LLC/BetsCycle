import type { Request, Response } from 'express';

import { Currency } from '../models/Currency';

type CurrencyResponse = {
  id: string;
  currencyCode: string;
  currencyName: string;
  currencyType: 'crypto' | 'fiat' | 'token';
  symbol: string;
  withdrawalFee: number;
  depositFee: number;
  minDeposit: number;
  maxWithdrawal: number;
  minWithdrawal: number;
  status: 'active' | 'inactive';
  lastUpdated: Date;
};

function sanitizeCurrency(currency: {
  _id: { toString(): string };
  currencyCode: string;
  currencyName: string;
  currencyType: 'crypto' | 'fiat' | 'token';
  symbol: string;
  withdrawalFee: number;
  depositFee: number;
  minDeposit: number;
  maxWithdrawal: number;
  minWithdrawal: number;
  status: 'active' | 'inactive';
  lastUpdated: Date;
}): CurrencyResponse {
  return {
    id: currency._id.toString(),
    currencyCode: currency.currencyCode,
    currencyName: currency.currencyName,
    currencyType: currency.currencyType,
    symbol: currency.symbol,
    withdrawalFee: currency.withdrawalFee,
    depositFee: currency.depositFee,
    minDeposit: currency.minDeposit,
    maxWithdrawal: currency.maxWithdrawal,
    minWithdrawal: currency.minWithdrawal,
    status: currency.status,
    lastUpdated: currency.lastUpdated,
  };
}

const allowedTypes = new Set(['crypto', 'fiat', 'token']);
const allowedStatuses = new Set(['active', 'inactive']);

function parseNumber(value: unknown, field: string) {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    throw new Error(`${field} must be a number.`);
  }
  return parsed;
}

export async function listCurrencies(_req: Request, res: Response) {
  const currencies = await Currency.find().sort({ lastUpdated: -1 });

  return res.json({
    currencies: currencies.map((currency) => sanitizeCurrency(currency)),
  });
}

export async function createCurrency(req: Request, res: Response) {
  try {
    const {
      currencyCode,
      currencyName,
      currencyType,
      symbol,
      withdrawalFee = 0,
      depositFee = 0,
      minDeposit = 0,
      maxWithdrawal = 0,
      minWithdrawal = 0,
      status = 'active',
    } = req.body ?? {};

    if (!currencyCode || !currencyName || !currencyType || !symbol) {
      return res.status(400).json({ message: 'Missing required currency fields.' });
    }

    if (!allowedTypes.has(currencyType)) {
      return res.status(400).json({ message: 'Invalid currency type.' });
    }

    if (!allowedStatuses.has(status)) {
      return res.status(400).json({ message: 'Invalid currency status.' });
    }

    const currency = await Currency.create({
      currencyCode: String(currencyCode).toUpperCase(),
      currencyName: String(currencyName),
      currencyType,
      symbol: String(symbol),
      withdrawalFee: parseNumber(withdrawalFee, 'withdrawalFee'),
      depositFee: parseNumber(depositFee, 'depositFee'),
      minDeposit: parseNumber(minDeposit, 'minDeposit'),
      maxWithdrawal: parseNumber(maxWithdrawal, 'maxWithdrawal'),
      minWithdrawal: parseNumber(minWithdrawal, 'minWithdrawal'),
      status,
      lastUpdated: new Date(),
    });

    return res.status(201).json({ currency: sanitizeCurrency(currency) });
  } catch (error) {
    if (error instanceof Error && error.message.includes('E11000')) {
      return res.status(409).json({ message: 'Currency code already exists.' });
    }
    if (error instanceof Error) {
      return res.status(400).json({ message: error.message });
    }
    return res.status(400).json({ message: 'Unable to create currency.' });
  }
}

export async function updateCurrency(req: Request, res: Response) {
  const currencyId = req.params.currencyId;

  if (!currencyId) {
    return res.status(400).json({ message: 'Currency id is required.' });
  }

  try {
    const updates: Record<string, unknown> = {};
    const {
      currencyCode,
      currencyName,
      currencyType,
      symbol,
      withdrawalFee,
      depositFee,
      minDeposit,
      maxWithdrawal,
      minWithdrawal,
      status,
    } = req.body ?? {};

    if (currencyCode !== undefined) {
      updates.currencyCode = String(currencyCode).toUpperCase();
    }
    if (currencyName !== undefined) {
      updates.currencyName = String(currencyName);
    }
    if (currencyType !== undefined) {
      if (!allowedTypes.has(currencyType)) {
        return res.status(400).json({ message: 'Invalid currency type.' });
      }
      updates.currencyType = currencyType;
    }
    if (symbol !== undefined) {
      updates.symbol = String(symbol);
    }
    if (withdrawalFee !== undefined) {
      updates.withdrawalFee = parseNumber(withdrawalFee, 'withdrawalFee');
    }
    if (depositFee !== undefined) {
      updates.depositFee = parseNumber(depositFee, 'depositFee');
    }
    if (minDeposit !== undefined) {
      updates.minDeposit = parseNumber(minDeposit, 'minDeposit');
    }
    if (maxWithdrawal !== undefined) {
      updates.maxWithdrawal = parseNumber(maxWithdrawal, 'maxWithdrawal');
    }
    if (minWithdrawal !== undefined) {
      updates.minWithdrawal = parseNumber(minWithdrawal, 'minWithdrawal');
    }
    if (status !== undefined) {
      if (!allowedStatuses.has(status)) {
        return res.status(400).json({ message: 'Invalid currency status.' });
      }
      updates.status = status;
    }

    updates.lastUpdated = new Date();

    const currency = await Currency.findByIdAndUpdate(currencyId, updates, { new: true });

    if (!currency) {
      return res.status(404).json({ message: 'Currency not found.' });
    }

    return res.json({ currency: sanitizeCurrency(currency) });
  } catch (error) {
    if (error instanceof Error && error.message.includes('E11000')) {
      return res.status(409).json({ message: 'Currency code already exists.' });
    }
    if (error instanceof Error) {
      return res.status(400).json({ message: error.message });
    }
    return res.status(400).json({ message: 'Unable to update currency.' });
  }
}

export async function deleteCurrency(req: Request, res: Response) {
  const currencyId = req.params.currencyId;

  if (!currencyId) {
    return res.status(400).json({ message: 'Currency id is required.' });
  }

  const currency = await Currency.findByIdAndDelete(currencyId);

  if (!currency) {
    return res.status(404).json({ message: 'Currency not found.' });
  }

  return res.json({ success: true });
}

