import type { Response } from "express";

import type { AuthRequest } from "../middlewares/authMiddleware.js";
import Review from "../models/reviewModel.js";
import asyncHandler from "../utils/asyncHandler.js";

const createReview = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { tmdbId, movieTitle, posterPath, rating, text, watchedOn, isLiked } = req.body;
  const existingReview = await Review.findOne({ user: req.user?.userId, tmdbId });
  if (existingReview) {
    res.status(400).json({ message: "You have already reviewed this movie. Update your existing review instead." });
    return;
  }
  const review = new Review({
    user: req.user?.userId,
    tmdbId,
    movieTitle,
    posterPath,
    rating,
    text,
    watchedOn: watchedOn || Date.now(),
    isLiked
  });
  await review.save();

  res.status(201).json(review);
});

const getMovieReviews = asyncHandler(async (req: AuthRequest, res: Response) => {
  // Populate pulls in the username from the User model so we can display the author
  const reviews = await Review.find({ tmdbId: req.params.tmdbId as string })
    .populate('user', 'username')
    .sort({ createdAt: -1 });
  
  res.json(reviews);
});

export {
  createReview,
  getMovieReviews
};
