import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { ApiError } from '../utils/ApiError';
import { User, IUserDocument } from '../models/User';
import asyncHandler from '../utils/asyncHandler';

// Extend Express Request interface to include authenticated user
export interface AuthRequest extends Request {
  user?: IUserDocument;
}

export const authenticate = asyncHandler(
  async (req: AuthRequest, _res: Response, next: NextFunction) => {
    let token: string | undefined;

    // 1. Check Authorization Bearer header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
    // 2. Check cookies fallback
    else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      throw new ApiError(401, 'Unauthorized: Access token is missing');
    }

    try {
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.id);

      if (!user) {
        throw new ApiError(401, 'Unauthorized: User no longer exists');
      }

      req.user = user;
      next();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        throw err;
      }
      throw new ApiError(401, 'Unauthorized: Invalid or expired access token');
    }
  }
);

export default authenticate;
