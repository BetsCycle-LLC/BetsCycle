import mongoose from 'mongoose';

export async function connectToDatabase(uri: string) {
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  // eslint-disable-next-line no-console
  console.log('Connected to MongoDB');
}

