import mongoose from 'mongoose';
import { config } from './env';
import { seedDefaultCategories } from './seeds';

export async function connectDB(): Promise<void> {
  const options: mongoose.ConnectOptions = {
    maxPoolSize: config.isProduction ? 10 : 5,
    minPoolSize: config.isProduction ? 2 : 0,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    ...(config.isProduction && {
      retryWrites: true,
      w: 'majority',
    }),
  };

  try {
    await mongoose.connect(config.mongodbUri, options);
    console.log('MongoDB connected');

    if (config.isProduction) {
      mongoose.connection.on('error', (err) => {
        console.error('MongoDB runtime error:', err.message);
      });

      mongoose.connection.on('disconnected', () => {
        console.warn('MongoDB disconnected');
      });
    }

    await seedDefaultCategories();
  } catch (error: any) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
}
