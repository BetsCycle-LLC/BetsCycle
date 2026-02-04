import { Schema, model, type InferSchemaType } from 'mongoose';

const faucetClaimSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'Player', required: true, index: true },
    currencyId: { type: Schema.Types.ObjectId, ref: 'Currency' },
    lastClaimedAt: { type: Date, required: true, default: () => new Date() },
  },
  { timestamps: true }
);

faucetClaimSchema.index({ userId: 1 }, { unique: true });

export type FaucetClaimDocument = InferSchemaType<typeof faucetClaimSchema>;

export const FaucetClaim = model('FaucetClaim', faucetClaimSchema);


