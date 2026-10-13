import { Router } from "express";

import verifyJwt from "../middlewares/authMiddleware.js";
import { createReview, getMovieReviews } from "../controllers/reviewController.js";

const router = Router();

router.post("/", verifyJwt, createReview);
router.get('/movie/:tmdbId', getMovieReviews); // Public: anyone can read reviews

export default router;