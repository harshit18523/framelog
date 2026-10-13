import axios from "axios";
import dotenv from "dotenv"
dotenv.config();

const tmdb = axios.create({
  baseURL: process.env.TMDB_bASE_URL || "https://api.themoviedb.org/3",
  // params: {
  //   api_key: process.env.TMDB_API_KEY,
  // },
  headers: {
    Authorization: `Bearer ${process.env.TMDB_READ_ACCESS_TOKEN}`,
    "Content-Type": "application/json",
  },
});

export default tmdb;
