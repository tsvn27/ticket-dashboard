import { cookies } from 'next/headers';

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID!;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET!;
const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI || 'http://localhost:3000/api/auth/callback';

export const DISCORD_OAUTH_URL = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(DISCORD_REDIRECT_URI)}&response_type=code&scope=identify+guilds`;

export interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  global_name: string | null;
}

export interface Session {
  user: DiscordUser;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export async function exchangeCode(code: string): Promise<{ access_token: string; refresh_token: string; expires_in: number }> {
  const response = await fetch('https://discord.com/api/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: DISCORD_CLIENT_ID,
      client_secret: DISCORD_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code,
      redirect_uri: DISCORD_REDIRECT_URI,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to exchange code');
  }

  return response.json();
}

export async function getDiscordUser(accessToken: string): Promise<DiscordUser> {
  const response = await fetch('https://discord.com/api/users/@me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error('Failed to get user');
  }

  return response.json();
}

export async function refreshAccessToken(refreshToken: string): Promise<{ access_token: string; refresh_token: string; expires_in: number }> {
  const response = await fetch('https://discord.com/api/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: DISCORD_CLIENT_ID,
      client_secret: DISCORD_CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to refresh token');
  }

  return response.json();
}

export function encodeSession(session: Session): string {
  return Buffer.from(JSON.stringify(session)).toString('base64');
}

export function decodeSession(encoded: string): Session | null {
  try {
    return JSON.parse(Buffer.from(encoded, 'base64').toString());
  } catch {
    return null;
  }
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');
  if (!sessionCookie) return null;
  return decodeSession(sessionCookie.value);
}

export async function isAuthorized(session: Session | null): Promise<boolean> {
  if (!session) return false;
  
  const ownerId = process.env.DASHBOARD_OWNER_ID;
  if (ownerId && session.user.id === ownerId) return true;
  
  const botApiUrl = process.env.BOT_API_URL || 'http://localhost:3001';
  const apiSecret = process.env.API_SECRET || '';
  
  try {
    const response = await fetch(`${botApiUrl}/permissions/${session.user.id}`, {
      headers: { 'X-API-Secret': apiSecret }
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.isOwner || data.dashboard === true) return true;
    }
  } catch {}
  
  try {
    const fs = await import('fs');
    const path = await import('path');
    
    const configPath = path.join(process.cwd(), '..', 'config.json');
    const permissionsPath = path.join(process.cwd(), '..', 'data', 'permissions.json');
    
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      if (session.user.id === config.owner) return true;
    }
    
    if (fs.existsSync(permissionsPath)) {
      const permissions = JSON.parse(fs.readFileSync(permissionsPath, 'utf-8'));
      const userPerms = permissions[session.user.id];
      if (userPerms?.dashboard === true) return true;
    }
  } catch {}
  
  if (!ownerId) {
    return true;
  }
  
  return false;
}
