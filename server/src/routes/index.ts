import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import authRoutes from './auth.routes';
import { ApiResponse } from '../utils/ApiResponse';

const router = Router();

// Health check endpoint
router.get('/health', (_req: Request, res: Response) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.status(200).json(
    new ApiResponse(
      {
        status: 'ok',
        uptime: process.uptime(),
        database: dbStatus,
        timestamp: new Date().toISOString(),
      },
      'FrameLog API is running'
    )
  );
});

// Auth endpoints
router.use('/auth', authRoutes);

export default router;
