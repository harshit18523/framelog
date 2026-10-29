import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import {
  getFriendsFilmReviews,
  getAllFilmReviews,
  getReviewComments,
  addReviewComment,
  deleteReviewComment,
} from '../controllers/review.controller.js';

const router = Router();

// Require authentication for all review and comment endpoints
router.use(authenticate);

// Get friends' reviews for a film
router.get('/films/:filmId/friends', getFriendsFilmReviews);

// Get all reviews for a film
router.get('/films/:filmId/all', getAllFilmReviews);

// Get comments for a review
router.get('/:reviewId/comments', getReviewComments);

// Add a comment or reply to a review
router.post('/:reviewId/comments', addReviewComment);

// Delete a comment
router.delete('/comments/:commentId', deleteReviewComment);

export default router;
