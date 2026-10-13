import type { Request, Response } from "express";

import tmdb from "../utils/tmdb.js";
import asyncHandler from "../utils/asyncHandler.js";

const getPopularMovies = asyncHandler(async (req: Request, res: Response) => {
  const response = await tmdb.get("/movie/popular");
  res.json(response.data.results);
});

const searchMovies = asyncHandler(async (req: Request, res: Response) => {
  const { query } = req.query;
  if (!query) {
    return res.status(400).json({
      message: "Search query is required",
    });
  }
  const response = await tmdb.get("/search/movie", {
    params: {
      query,
    },
  });
  res.json(response.data.results);
});

const getMovieDetails = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const response = await tmdb.get(`/movie/${id}`, {
    params: {
      append_to_response: "credits",
    },
  });
  res.json(response.data);
});

export {
  getPopularMovies,
  searchMovies,
  getMovieDetails
};
