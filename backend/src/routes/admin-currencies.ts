import { Router } from 'express';

import {
  listCurrencies,
  createCurrency,
  updateCurrency,
  deleteCurrency,
} from '../controllers/adminCurrenciesController';
import { requireAuth } from '../middleware/auth';

export const adminCurrenciesRouter = Router();

adminCurrenciesRouter.get('/', requireAuth, listCurrencies);
adminCurrenciesRouter.post('/', requireAuth, createCurrency);
adminCurrenciesRouter.put('/:currencyId', requireAuth, updateCurrency);
adminCurrenciesRouter.delete('/:currencyId', requireAuth, deleteCurrency);

