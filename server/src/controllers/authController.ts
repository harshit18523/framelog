import type { Request, Response } from "express";
import jwt from "jsonwebtoken";

import User from "../models/userModel.js";
import asyncHandler from "../utils/asyncHandler.js";
import { generateTokenPair, verifyRefreshToken } from "../utils/jwt.js";
import logger from "../utils/logger.js";

const signup = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, username } = req.body;
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      error: "This email is already registered. Try signing in.",
    });
  }

  const newUser = new User({ email, password, username });
  await newUser.save();

  res.status(201).json({
    message: "User registered successfully",
  });
});

const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && await user.matchPassword(password)) {
    const { accessToken, refreshToken } = generateTokenPair({
      userId: user._id,
      email: user.email,
    });
    const updatedUser = await User.findByIdAndUpdate(user._id,
      { $set: { refreshToken } },
      { returnDocument: "after" }
    );
    logger.info("refresh token saved in db");

    res.status(200).cookie("accessToken", accessToken, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 6 * 60 * 60 * 1000,
    }).cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 6 * 24 * 60 * 60 * 1000,
    }).json({
      accessToken,
      refreshToken,
      email: user.email,
      userId: user._id,
    });
  } else {
    res.status(401).json({
      error: "Invalid credentials",
    });
  }
});

const logout = asyncHandler(async (req: Request, res: Response) => {
  res.status(200).clearCookie("accessToken", {
    httpOnly: true,
    sameSite: "lax"
  }).clearCookie("refreshToken", {
    httpOnly: true,
    sameSite: "lax",
  }).json({
    message: "User logged out successfully",
  });
});

const refreshAccessToken = asyncHandler(async (req: Request, res: Response) => {
  const incomingRefreshToken = req.cookies.refreshToken;
  const decodedToken = verifyRefreshToken(incomingRefreshToken) as jwt.JwtPayload;
  const user = await User.findById(decodedToken.userId);
  logger.info(user);
  if (!user || incomingRefreshToken !== user.refreshToken) {
    logger.error("invalid or used or expired refresh token");
    throw new Error("Invalid refresh token");
  }

  const { accessToken, refreshToken } = generateTokenPair({
    userId: user._id,
    email: user.email,
  });
  const updatedUser = await User.findByIdAndUpdate(user._id, { $set: { refreshToken } }, { returnDocument: "after" });

  logger.info("refresh token updated");

  res.status(200).cookie("accessToken", accessToken, {
    httpOnly: true,
    sameSite: "lax",
  }).cookie("refreshToken", refreshToken, {
    httpOnly: true,
    sameSite: "lax",
  }).json({
    message: "access token refreshed",
  });
});

export {
  signup,
  login,
  logout,
  refreshAccessToken
};
