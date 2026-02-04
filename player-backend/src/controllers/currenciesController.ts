import type { Request, Response } from 'express';

import { Currency } from '../models/Currency';

type CurrencyResponse = {
  id: string;
  currencyCode: string;
  currencyName: string;
  currencyType: 'crypto' | 'fiat' | 'token';
  symbol: string;
  status: 'active' | 'inactive';
};

function sanitizeCurrency(currency: {
  _id: { toString(): string };
  currencyCode: string;
  currencyName: string;
  currencyType: 'crypto' | 'fiat' | 'token';
  symbol: string;
  status: 'active' | 'inactive';
}): CurrencyResponse {
  return {
    id: currency._id.toString(),
    currencyCode: currency.currencyCode,
    currencyName: currency.currencyName,
    currencyType: currency.currencyType,
    symbol: currency.symbol,
    status: currency.status,
  };
}

export async function listPublicCurrencies(_req: Request, res: Response) {
  // Only return active currencies for public view
  const currencies = await Currency.find({ status: 'active' }).sort({ currencyCode: 1 });

  return res.json({
    currencies: currencies.map((currency) => sanitizeCurrency(currency)),
  });
}

