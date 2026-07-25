import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { Setting } from '../models/Setting';
import { config } from '../config/env';
import { AppError } from '../middleware/errorHandler';
import {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshJWT,
  decodeRefreshJWT,
  storeRefreshTokenHash,
  isRefreshTokenValid,
  revokeRefreshToken,
  hashToken,
} from '../services/auth';
import { getGoogleAuthUrl, getGoogleTokens, getGoogleProfile, storeGoogleTokens } from '../services/google';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, displayName } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      throw new AppError('Email already registered', 400);
    }

    const hashedPassword = await hashPassword(password);
    const user = await User.create({
      email,
      password: hashedPassword,
      displayName,
      provider: 'local',
    });

    await Setting.create({ userId: user._id });

    const accessToken = generateAccessToken(user._id.toString(), user.role);
    const refreshToken = generateRefreshJWT(user._id.toString(), user.role);
    await storeRefreshTokenHash(user._id.toString(), refreshToken);

    res.status(201).json({
      success: true,
      data: {
        user: { id: user._id, email: user.email, displayName: user.displayName, role: user.role },
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, isActive: true });
    if (!user || !user.password) {
      throw new AppError('Invalid email or password', 401);
    }

    const valid = await comparePassword(password, user.password);
    if (!valid) {
      throw new AppError('Invalid email or password', 401);
    }

    const accessToken = generateAccessToken(user._id.toString(), user.role);
    const refreshToken = generateRefreshJWT(user._id.toString(), user.role);
    await storeRefreshTokenHash(user._id.toString(), refreshToken);

    res.json({
      success: true,
      data: {
        user: { id: user._id, email: user.email, displayName: user.displayName, avatar: user.avatar, role: user.role },
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const googleAuthRedirect = async (_req: Request, res: Response) => {
  const url = getGoogleAuthUrl();
  res.redirect(url);
};

export const googleAuthCallback = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code } = req.query;
    if (!code || typeof code !== 'string') {
      return res.redirect(`${config.corsOrigin}/login?error=google_auth_failed`);
    }

    const tokens = await getGoogleTokens(code);
    const profile = await getGoogleProfile(tokens.access_token!);

    let user = await User.findOne({ googleId: profile.id });
    if (!user) {
      user = await User.findOne({ email: profile.email });
      if (user) {
        user.googleId = profile.id;
        user.provider = 'google';
        await user.save();
      } else {
        user = await User.create({
          email: profile.email,
          displayName: profile.name || profile.email!.split('@')[0],
          avatar: profile.picture,
          provider: 'google',
          googleId: profile.id,
          emailVerified: true,
        });
        await Setting.create({ userId: user._id });
      }
    }

    await storeGoogleTokens(user._id.toString(), tokens.access_token!, tokens.refresh_token);

    const accessToken = generateAccessToken(user._id.toString(), user.role);
    const refreshToken = generateRefreshJWT(user._id.toString(), user.role);
    await storeRefreshTokenHash(user._id.toString(), refreshToken);

    res.redirect(
      `${config.corsOrigin}/login?token=${encodeURIComponent(accessToken)}&refresh=${encodeURIComponent(refreshToken)}`,
    );
  } catch (error) {
    res.redirect(`${config.corsOrigin}/login?error=google_auth_failed`);
  }
};

export const googleAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code } = req.body;
    const tokens = await getGoogleTokens(code);
    const profile = await getGoogleProfile(tokens.access_token!);

    let user = await User.findOne({ googleId: profile.id });
    if (!user) {
      user = await User.findOne({ email: profile.email });
      if (user) {
        user.googleId = profile.id;
        user.provider = 'google';
        await user.save();
      } else {
        user = await User.create({
          email: profile.email,
          displayName: profile.name || profile.email!.split('@')[0],
          avatar: profile.picture,
          provider: 'google',
          googleId: profile.id,
          emailVerified: true,
        });
        await Setting.create({ userId: user._id });
      }
    }

    await storeGoogleTokens(user._id.toString(), tokens.access_token!, tokens.refresh_token);

    const accessToken = generateAccessToken(user._id.toString(), user.role);
    const refreshToken = generateRefreshJWT(user._id.toString(), user.role);
    await storeRefreshTokenHash(user._id.toString(), refreshToken);

    res.json({
      success: true,
      data: {
        user: { id: user._id, email: user.email, displayName: user.displayName, avatar: user.avatar, role: user.role },
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken: token } = req.body;
    const payload = decodeRefreshJWT(token);
    if (!payload) {
      throw new AppError('Invalid or expired refresh token', 401);
    }

    const valid = await isRefreshTokenValid(payload.userId, token);
    if (!valid) {
      throw new AppError('Refresh token revoked', 401);
    }

    await revokeRefreshToken(payload.userId, token);

    const newAccessToken = generateAccessToken(payload.userId, payload.role);
    const newRefreshToken = generateRefreshJWT(payload.userId, payload.role);
    await storeRefreshTokenHash(payload.userId, newRefreshToken);

    res.json({
      success: true,
      data: { accessToken: newAccessToken, refreshToken: newRefreshToken },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken: token } = req.body;
    if (token) {
      const payload = decodeRefreshJWT(token);
      if (payload) {
        await revokeRefreshToken(payload.userId, token);
      }
    }
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      const resetToken = generateAccessToken(user._id.toString(), user.role);
      const hashed = hashToken(resetToken);
      user.refreshTokens.push({
        token: hashed,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        createdAt: new Date(),
      });
      await user.save();
    }
    res.json({ success: true, message: 'If the email exists, a reset link has been sent' });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, password } = req.body;
    const hashedPassword = await hashPassword(password);
    res.json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.userId).select('-password -refreshTokens -googleAccessToken -googleRefreshToken');
    if (!user) {
      throw new AppError('User not found', 404);
    }
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};
