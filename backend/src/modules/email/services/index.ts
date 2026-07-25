import { GmailAccount } from '../../../models/GmailAccount';
import { EmailConnectionStatus, EmailProfile, EmailTestResult } from '../types';
import * as gmailOauth from '../providers/gmail/oauth';
import * as gmailImap from '../providers/gmail/imap';

export async function getConnectionStatus(userId: string): Promise<EmailConnectionStatus> {
  const account = await GmailAccount.findOne({ userId: userId as any });

  if (!account) {
    return { connected: false, provider: '', status: 'disconnected' };
  }

  if (account.expiresAt <= new Date()) {
    try {
      await gmailOauth.refreshAccessToken(userId);
      account.status = 'connected';
    } catch {
      account.status = 'expired';
    }
    await account.save();
  }

  return {
    connected: account.connected && account.status === 'connected',
    provider: account.provider,
    email: account.gmailEmail,
    status: account.status,
    connectedAt: account.connectedAt?.toISOString(),
    lastConnected: account.lastConnected?.toISOString(),
    lastSync: account.lastSync?.toISOString(),
  };
}

export async function getProfile(userId: string): Promise<EmailProfile> {
  const account = await GmailAccount.findOne({ userId: userId as any });
  if (!account) {
    throw new Error('Gmail account not connected');
  }
  return {
    email: account.gmailEmail,
    provider: account.provider,
  };
}

export async function testEmailConnection(userId: string): Promise<EmailTestResult> {
  const account = await GmailAccount.findOne({ userId: userId as any });
  if (!account) {
    return { success: false, message: 'No Gmail account connected' };
  }

  try {
    const latencyMs = await gmailImap.testConnection(userId, account.gmailEmail);
    return {
      success: true,
      message: 'IMAP connection successful',
      latencyMs,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `IMAP connection failed: ${err.message}`,
    };
  }
}
