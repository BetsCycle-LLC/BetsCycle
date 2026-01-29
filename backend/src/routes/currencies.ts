import { Router } from 'express';

import { listPublicCurrencies } from '../controllers/currenciesController';

export const currenciesRouter = Router();

currenciesRouter.get('/', listPublicCurrencies);

