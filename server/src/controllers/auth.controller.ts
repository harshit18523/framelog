import { Request, Response } from 'express';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { generateTokenPair, verifyRefreshToken } from '../utils/jwt.js';
import { AuthRequest } from '../middleware/auth.middleware.js';

const isProduction = process.env.NODE_ENV === 'production';

const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax',
};

// 15 minutes in ms
const ACCESS_TOKEN_MAX_AGE = 15 * 60 * 1000;
// 7 days in ms
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, username, email, password } = req.body;

  // Validation
  if (!name || typeof name !== 'string' || !name.trim()) {
    throw new ApiError(400, 'Name is required');
  }

  if (!username || typeof username !== 'string' || username.trim().length < 3) {
    throw new ApiError(400, 'Username must be at least 3 characters');
  }

  const cleanUsername = username.trim().toLowerCase();
  if (!/^[a-z0-9_]+$/.test(cleanUsername)) {
    throw new ApiError(400, 'Username can only contain letters, numbers, and underscores');
  }

  if (!email || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email.trim())) {
    throw new ApiError(400, 'Please enter a valid email address');
  }

  if (!password || typeof password !== 'string' || password.length < 8) {
    throw new ApiError(400, 'Password must be at least 8 characters long');
  }

  const cleanEmail = email.trim().toLowerCase();

  // Check existing user
  const existingEmail = await User.findOne({ email: cleanEmail });
  if (existingEmail) {
    throw new ApiError(409, 'Email is already registered. Please sign in.');
  }

  const existingUsername = await User.findOne({ username: cleanUsername });
  if (existingUsername) {
    throw new ApiError(409, 'Username is already taken. Please choose another.');
  }

  // Create user
  const user = await User.create({
    name: name.trim(),
    username: cleanUsername,
    email: cleanEmail,
    password,
  });

  // Generate tokens
  const { accessToken, refreshToken } = generateTokenPair({
    id: user._id.toString(),
    email: user.email,
    username: user.username,
  });

  // Save refresh token on user document
  user.refreshToken = refreshToken;
  await user.save();

  // Set HTTP-only cookies
  res.cookie('accessToken', accessToken, {
    ...cookieOptions,
    maxAge: ACCESS_TOKEN_MAX_AGE,
  });

  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions,
    maxAge: REFRESH_TOKEN_MAX_AGE,
  });

  res.status(201).json(
    new ApiResponse(
      {
        user,
        accessToken,
      },
      'User registered successfully'
    )
  );
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required');
  }

  const cleanEmail = String(email).trim().toLowerCase();

  // Find user and explicitly select password & refreshToken
  const user = await User.findOne({ email: cleanEmail }).select('+password +refreshToken');
  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid email or password');
  }

  // Generate new token pair
  const { accessToken, refreshToken } = generateTokenPair({
    id: user._id.toString(),
    email: user.email,
    username: user.username,
  });

  // Update refresh token
  user.refreshToken = refreshToken;
  await user.save();

  // Set HTTP-only cookies
  res.cookie('accessToken', accessToken, {
    ...cookieOptions,
    maxAge: ACCESS_TOKEN_MAX_AGE,
  });

  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions,
    maxAge: REFRESH_TOKEN_MAX_AGE,
  });

  res.status(200).json(
    new ApiResponse(
      {
        user,
        accessToken,
      },
      'User logged in successfully'
    )
  );
});

export const logout = asyncHandler(async (req: AuthRequest, res: Response) => {
  // If user session is present, invalidate refreshToken in database
  if (req.user) {
    await User.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: 1 } });
  }

  // Clear cookies
  res.clearCookie('accessToken', cookieOptions);
  res.clearCookie('refreshToken', cookieOptions);

  res.status(200).json(new ApiResponse(null, 'User logged out successfully'));
});

export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, 'Unauthorized');
  }

  res.status(200).json(
    new ApiResponse(
      {
        user: req.user,
      },
      'Current user retrieved successfully'
    )
  );
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;

  if (!token) {
    throw new ApiError(401, 'Refresh token is required');
  }

  try {
    const decoded = verifyRefreshToken(token);
    const user = await User.findById(decoded.id).select('+refreshToken');

    if (!user || user.refreshToken !== token) {
      throw new ApiError(401, 'Invalid or expired refresh token');
    }

    // Generate new token pair
    const { accessToken, refreshToken: newRefreshToken } = generateTokenPair({
      id: user._id.toString(),
      email: user.email,
      username: user.username,
    });

    user.refreshToken = newRefreshToken;
    await user.save();

    res.cookie('accessToken', accessToken, {
      ...cookieOptions,
      maxAge: ACCESS_TOKEN_MAX_AGE,
    });

    res.cookie('refreshToken', newRefreshToken, {
      ...cookieOptions,
      maxAge: REFRESH_TOKEN_MAX_AGE,
    });

    res.status(200).json(
      new ApiResponse(
        {
          accessToken,
          refreshToken: newRefreshToken,
          user,
        },
        'Token refreshed successfully'
      )
    );
  } catch (err: any) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(401, 'Invalid or expired refresh token');
  }
});
