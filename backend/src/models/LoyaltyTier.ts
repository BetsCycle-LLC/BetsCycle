import { Schema, model, type InferSchemaType } from 'mongoose';

const loyaltyTierSchema = new Schema(
  {
    tiersName: { type: String, required: true, trim: true },
    icon: { type: String, default: '' },
    order: { type: Number, required: true, default: 0 },
    levels: [
      {
        levelNumber: { type: Number, required: true },
        xp: { type: Number, required: true, default: 0 },
        weeklyRakeback: { type: Number, required: true, default: 0 },
        monthlyRakeback: { type: Number, required: true, default: 0 },
        levelUpBonus: [
          {
            currencyId: { type: Schema.Types.ObjectId, ref: 'Currency', required: true },
            amount: { type: Number, required: true, default: 0 },
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

export type LoyaltyTierDocument = InferSchemaType<typeof loyaltyTierSchema>;

export const LoyaltyTier = model('LoyaltyTier', loyaltyTierSchema);

