import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';

export interface TokenPayload {
  id: string;
  email: string;
  username: string;
}

export const generateAccessToken = (payload: TokenPayload): string => {
  const secret = process.env.JWT_ACCESS_SECRET || 'framelog_dev_access_secret_key';
  const expiresIn = (process.env.JWT_ACCESS_EXPIRES_IN || '15m') as SignOptions['expiresIn'];
  return jwt.sign(payload, secret, { expiresIn });
};

export const generateRefreshToken = (payload: { id: string }): string => {
  const secret = process.env.JWT_REFRESH_SECRET || 'framelog_dev_refresh_secret_key';
  const expiresIn = (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as SignOptions['expiresIn'];
  return jwt.sign(payload, secret, { expiresIn });
};

export const generateTokenPair = (payload: TokenPayload): { accessToken: string; refreshToken: string } => {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken({ id: payload.id });
  return { accessToken, refreshToken };
};

export const verifyAccessToken = (token: string): TokenPayload & JwtPayload => {
  const secret = process.env.JWT_ACCESS_SECRET || 'framelog_dev_access_secret_key';
  return jwt.verify(token, secret) as TokenPayload & JwtPayload;
};

export const verifyRefreshToken = (token: string): { id: string } & JwtPayload => {
  const secret = process.env.JWT_REFRESH_SECRET || 'framelog_dev_refresh_secret_key';
  return jwt.verify(token, secret) as { id: string } & JwtPayload;
};
