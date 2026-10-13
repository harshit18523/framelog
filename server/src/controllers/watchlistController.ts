import type { Response } from "express";

import type { AuthRequest } from "../middlewares/authMiddleware.js";
import Watchlist from "../models/watchlistModel.js";
import asyncHandler from "../utils/asyncHandler.js";

const addToWatchlist = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { tmdbId, movieTitle, posterPath } = req.body;
  const existingItem = await Watchlist.findOne({ user: req.user?.userId, tmdbId });
  if (existingItem) {
    res.status(400).json({ message: "Already in your watchlist." });
    return;
  }
  const item = new Watchlist({
    user: req.user?.userId,
    tmdbId,
    movieTitle,
    posterPath,
  });
  await item.save();

  res.status(201).json(item);
});

const getUserWatchlist = asyncHandler(async (req: AuthRequest, res: Response) => {
  const watchlist = await Watchlist.find({ user: req.user?.userId }).sort({ createdAt: -1 });
  res.json(watchlist);
});

export {
  addToWatchlist,
  getUserWatchlist
};
