import { Schema, model, type InferSchemaType } from 'mongoose';

const playerXPSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'Player',
      required: true,
      unique: true,
      index: true,
    },
    xp: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
playerXPSchema.index({ xp: -1 }); // For leaderboard queries

export type PlayerXPDocument = InferSchemaType<typeof playerXPSchema>;

export const PlayerXP = model('PlayerXP', playerXPSchema);

