import 'dotenv/config';
import app from './src/app.js';
import { config } from './src/config/env.js';
import { connectDB } from './src/config/database.js';

async function start() {
  await connectDB();
  app.listen(config.port, () => {
    console.log(`$yncFlow API running on port ${config.port}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
