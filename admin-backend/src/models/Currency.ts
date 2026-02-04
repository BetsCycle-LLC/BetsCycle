import { Schema, model, type InferSchemaType } from 'mongoose';

const currencySchema = new Schema(
  {
    currencyCode: { type: String, required: true, unique: true, uppercase: true, trim: true },
    currencyName: { type: String, required: true, trim: true },
    currencyType: { type: String, required: true, enum: ['crypto', 'fiat', 'token'] },
    symbol: { type: String, required: true },
    withdrawalFee: { type: Number, default: 0 },
    depositFee: { type: Number, default: 0 },
    minDeposit: { type: Number, default: 0 },
    maxWithdrawal: { type: Number, default: 0 },
    minWithdrawal: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    lastUpdated: { type: Date, default: () => new Date() },
  },
  { timestamps: true },
);

export type CurrencyDocument = InferSchemaType<typeof currencySchema>;

export const Currency = model('Currency', currencySchema);

