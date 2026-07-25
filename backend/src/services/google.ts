import { google } from 'googleapis';
import { config } from '../config/env';
import { encrypt, decrypt } from './encryption';
import { User } from '../models/User';

const oauth2Client = new google.auth.OAuth2(
  config.googleClientId,
  config.googleClientSecret,
  config.googleRedirectUri,
);

export function getGoogleAuthUrl(): string {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ],
  });
}

export async function getGoogleTokens(code: string) {
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

export async function getGoogleProfile(accessToken: string) {
  oauth2Client.setCredentials({ access_token: accessToken });
  const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
  const { data } = await oauth2.userinfo.get();
  return data;
}

export async function getStoredAuth(userId: string) {
  const user = await User.findById(userId).select('googleAccessToken googleRefreshToken');
  if (!user?.googleAccessToken) return null;
  return {
    accessToken: decrypt(user.googleAccessToken),
    refreshToken: user.googleRefreshToken ? decrypt(user.googleRefreshToken) : null,
  };
}

export async function storeGoogleTokens(
  userId: string,
  accessToken: string,
  refreshToken?: string | null,
): Promise<void> {
  const update: Record<string, string> = {
    googleAccessToken: encrypt(accessToken),
  };
  if (refreshToken) {
    update.googleRefreshToken = encrypt(refreshToken);
  }
  await User.findByIdAndUpdate(userId, { $set: update });
}

export async function getGmailClient(userId: string) {
  const auth = await getStoredAuth(userId);
  if (!auth) throw new Error('Google auth not found');

  oauth2Client.setCredentials({
    access_token: auth.accessToken,
    refresh_token: auth.refreshToken,
  });

  return google.gmail({ version: 'v1', auth: oauth2Client });
}
