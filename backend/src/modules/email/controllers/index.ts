import { Request, Response, NextFunction } from 'express';
import { GmailAccount } from '../../../models/GmailAccount';
import { config } from '../../../config/env';
import * as emailService from '../services';
import * as gmailOauth from '../providers/gmail/oauth';

export async function status(_req: Request, res: Response, next: NextFunction) {
  try {
    const s = await emailService.getConnectionStatus((_req as any).userId);
    res.json({ success: true, data: s });
  } catch (error) {
    next(error);
  }
}

export async function connect(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).userId;
    const existing = await GmailAccount.findOne({ userId }).lean();
    if (existing) {
      await gmailOauth.revokeTokens(userId);
      await GmailAccount.findOneAndDelete({ userId }).lean();
    }
    const url = gmailOauth.generateAuthUrl(userId);
    res.json({ success: true, data: { url } });
  } catch (error) {
    next(error);
  }
}

export async function callback(req: Request, res: Response, _next: NextFunction) {
  const origin = config.corsOrigin;

  try {
    const { code, state, error: oauthError } = req.query;

    if (oauthError) {
      return res.redirect(`${origin}/email-connection?email_error=${oauthError}`);
    }

    if (!code || typeof code !== 'string') {
      return res.redirect(`${origin}/email-connection?email_error=missing_code`);
    }

    if (!state || typeof state !== 'string') {
      return res.redirect(`${origin}/email-connection?email_error=invalid_state`);
    }

    const userId = gmailOauth.verifyState(state);
    if (!userId) {
      return res.redirect(`${origin}/email-connection?email_error=state_mismatch`);
    }

    const profileData = await gmailOauth.handleCallback(code, userId);

    res.redirect(
      `${origin}/email-connection?email_connected=${encodeURIComponent(profileData.email)}`,
    );
  } catch (err: any) {
    const msg = err?.message || 'connection_failed';
    res.redirect(`${origin}/email-connection?email_error=${encodeURIComponent(msg)}`);
  }
}

export async function disconnect(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).userId;
    await gmailOauth.revokeTokens(userId);
    await GmailAccount.findOneAndDelete({ userId }).lean();
    res.json({ success: true, message: 'Gmail account disconnected' });
  } catch (error) {
    next(error);
  }
}

export async function profile(req: Request, res: Response, next: NextFunction) {
  try {
    const p = await emailService.getProfile((req as any).userId);
    res.json({ success: true, data: p });
  } catch (error) {
    next(error);
  }
}

export async function testConnection(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await emailService.testEmailConnection((req as any).userId);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}
