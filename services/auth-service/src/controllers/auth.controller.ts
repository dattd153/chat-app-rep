import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { kafkaProducer } from '../services/kafka-producer';
import { EventSubjects } from '@chat-app/events';
import { logger } from '@chat-app/logger';
import { successResponse, errorResponse } from '@chat-app/shared';

const JWT_SECRET = process.env.JWT_SECRET || 'access_secret';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'refresh_secret';
const ACCESS_EXPIRES = '15m'; // Default 15 mins for production
const REFRESH_EXPIRES = '7d';

const generateTokens = async (user: any) => {
  const accessToken = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: ACCESS_EXPIRES }
  );

  const refreshToken = jwt.sign(
    { userId: user.id },
    REFRESH_SECRET,
    { expiresIn: REFRESH_EXPIRES }
  );

  // Save refresh token to user (rotation support)
  user.refreshTokens.push(refreshToken);
  await user.save();

  return { accessToken, refreshToken };
};

export const register = async (req: Request, res: Response) => {
  const { email, password, name } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send(errorResponse('EMAIL_EXISTS', 'Email in use'));
    }

    const user = new User({ email, password, name });
    await user.save();

    const { accessToken, refreshToken } = await generateTokens(user);

    // Side-effect: emit event
    await kafkaProducer.emit('USER_CREATED', {
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    res.status(201).send(successResponse({
      userId: user.id,
      accessToken,
      refreshToken
    }));
  } catch (err) {
    logger.error('Registration failed', { error: err });
    res.status(500).send(errorResponse('INTERNAL_ERROR', 'Something went wrong'));
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).send(errorResponse('INVALID_CREDENTIALS', 'Email or password incorrect'));
    }

    const isMatch = await bcrypt.compare(password, user.password as string);
    if (!isMatch) {
      return res.status(401).send(errorResponse('INVALID_CREDENTIALS', 'Email or password incorrect'));
    }

    const { accessToken, refreshToken } = await generateTokens(user);

    res.send(successResponse({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      accessToken,
      refreshToken,
      expiresIn: 900 // 15 mins in seconds
    }));
  } catch (err) {
    logger.error('Login failed', { error: err });
    res.status(500).send(errorResponse('INTERNAL_ERROR', 'Something went wrong'));
  }
};

export const refresh = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).send(errorResponse('MISSING_TOKEN', 'Refresh token is required'));
  }

  try {
    const payload = jwt.verify(refreshToken, REFRESH_SECRET) as { userId: string };
    const user = await User.findById(payload.userId);

    if (!user || !user.refreshTokens.includes(refreshToken)) {
      return res.status(401).send(errorResponse('INVALID_REFRESH_TOKEN', 'Invalid or expired refresh token'));
    }

    // Refresh token rotation: remove old one, add new one
    user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken);
    const tokens = await generateTokens(user);

    res.send(successResponse(tokens));
  } catch (err) {
    return res.status(401).send(errorResponse('INVALID_REFRESH_TOKEN', 'Invalid refresh token'));
  }
};

export const logout = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  try {
    if (refreshToken) {
      const payload = jwt.verify(refreshToken, REFRESH_SECRET) as { userId: string };
      const user = await User.findById(payload.userId);
      if (user) {
        user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken);
        await user.save();
      }
    }
    res.send(successResponse({ message: 'Logged out successfully' }));
  } catch (err) {
    res.status(400).send(errorResponse('LOGOUT_FAILED', 'Could not logout'));
  }
};

export const logoutAll = async (req: Request, res: Response) => {
  // Assuming middleware adds user to req
  const userId = (req as any).user?.userId;
  if (!userId) return res.status(401).send(errorResponse('UNAUTHORIZED', 'Unauthorized'));

  try {
    const user = await User.findById(userId);
    if (user) {
      user.refreshTokens = [];
      await user.save();
    }
    res.send(successResponse({ message: 'All sessions revoked' }));
  } catch (err) {
    res.status(500).send(errorResponse('INTERNAL_ERROR', 'Failed to revoke sessions'));
  }
};

export const verifyToken = async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).send(successResponse({ valid: false }));
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
    res.send(successResponse({ userId: payload.userId, valid: true }));
  } catch (err) {
    res.status(401).send(successResponse({ valid: false }));
  }
};
