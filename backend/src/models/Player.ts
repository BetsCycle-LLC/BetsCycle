import { Schema, model, type InferSchemaType } from 'mongoose';

const notificationSettingsSchema = new Schema(
  {
    emailNotifications: { type: Boolean, default: true },
    smsNotifications: { type: Boolean, default: false },
  },
  { _id: false },
);

const preferencesSchema = new Schema(
  {
    language: { type: String, default: 'en' },
    theme: { type: String, default: 'dark' },
    notificationSettings: { type: notificationSettingsSchema, default: () => ({}) },
  },
  { _id: false },
);

const personalInfoSchema = new Schema(
  {
    firstName: { type: String },
    lastName: { type: String },
    dateOfBirth: { type: Date },
    phoneNumber: { type: String },
    country: { type: String },
  },
  { _id: false },
);

const verificationSchema = new Schema(
  {
    emailVerified: { type: Boolean, default: false },
    phoneVerified: { type: Boolean, default: false },
    emailVerificationCode: { type: String },
    emailVerificationExpiresAt: { type: Date },
    phoneVerificationToken: { type: String },
  },
  { _id: false },
);

const playerSchema = new Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    registrationDate: { type: Date, default: () => new Date() },
    status: { type: String, default: 'active' },
    personalInfo: { type: personalInfoSchema, default: () => ({}) },
    avatar: { type: String },
    verification: { type: verificationSchema, default: () => ({}) },
    playerType: { type: String, enum: ['normal', 'staking'], default: 'normal' },
    preferences: { type: preferencesSchema, default: () => ({}) },
  },
  { timestamps: true },
);

export type PlayerDocument = InferSchemaType<typeof playerSchema>;

export const Player = model('Player', playerSchema);

