import { Router } from "express";
import { addToWatchlist, getUserWatchlist } from "../controllers/watchlistController.js";
import verifyJwt from "../middlewares/authMiddleware.js";

const router = Router();
router.route('/')
  .post(verifyJwt, addToWatchlist)
  .get(verifyJwt, getUserWatchlist);

export default router;
