import path from 'path';
import dotenv from 'dotenv';

// Robust dotenv configuration: load server/.env and root .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

import { createApp } from './app';
import { connectDB, disconnectDB } from './config/db';

const PORT = process.env.PORT || 5000;
const app = createApp();

const startServer = async () => {
  // Connect to MongoDB
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`🎬 FrameLog Server running on http://localhost:${PORT}`);
    console.log(`🔐 Auth endpoints available at http://localhost:${PORT}/api/auth`);
    console.log(`🩺 Health check available at http://localhost:${PORT}/api/health`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    console.log(`\n[Server] Received ${signal}. Shutting down gracefully...`);
    server.close(async () => {
      console.log('[Server] HTTP server closed.');
      await disconnectDB();
      process.exit(0);
    });

    // Force exit after 10s if hanging
    setTimeout(() => {
      console.error('[Server] Could not close connections in time, forcefully exiting.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

startServer().catch((err) => {
  console.error('[Server] Failed to start:', err);
  process.exit(1);
});
