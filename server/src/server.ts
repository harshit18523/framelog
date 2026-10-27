import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Robust dotenv configuration: load server/.env and root .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import http from 'http';
import { createApp } from './app.js';
import { connectDB, disconnectDB } from './config/db.js';
import { initSocketServer } from './socket/index.js';

const PORT = process.env.PORT || 5000;
const app = createApp();
const httpServer = http.createServer(app);

// Initialize Socket.IO with the HTTP server
initSocketServer(httpServer);

const startServer = async () => {
  // Connect to MongoDB
  await connectDB();

  const server = httpServer.listen(PORT, () => {
    console.log(`🎬 FrameLog Server running on http://localhost:${PORT}`);
    console.log(`⚡ Socket.IO initialized on ws://localhost:${PORT}`);
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
