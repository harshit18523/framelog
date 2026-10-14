import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import authRoutes from './auth.routes';
import filmRoutes from './film.routes';
import diaryRoutes from './diary.routes';
import watchlistRoutes from './watchlist.routes';
import watchedRoutes from './watched.routes';
import likesRoutes from './likes.routes';
import userRoutes from './user.routes';
import chatRoutes from './chat.routes';
import feedRoutes from './feed.routes';
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

// Films & TMDB endpoints
router.use('/films', filmRoutes);

// User library endpoints (Diary, Watched, Watchlist, Likes)
router.use('/diary', diaryRoutes);
router.use('/watched', watchedRoutes);
router.use('/watchlist', watchlistRoutes);
router.use('/likes', likesRoutes);

// Social endpoints (Feed, Users, Follow, and Chats)
router.use('/feed', feedRoutes);
router.use('/users', userRoutes);
router.use('/chats', chatRoutes);

export default router;
