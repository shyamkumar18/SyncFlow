import mongoose from 'mongoose';
import { config } from './env';
import { seedDefaultCategories } from './seeds';

export async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(config.mongodbUri);
    console.log('MongoDB connected');
    await seedDefaultCategories();
  } catch (error: any) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB runtime error:', err.message);
  });
}
