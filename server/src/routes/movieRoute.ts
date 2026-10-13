import { Router } from "express";
import { getMovieDetails, getPopularMovies, searchMovies } from "../controllers/movieController.js";

const router = Router();

router.get("/popular", getPopularMovies);
router.get("/search", searchMovies);
router.get("/:id", getMovieDetails);

export default router;
