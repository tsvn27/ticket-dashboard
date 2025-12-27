import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { exchangeCode, getDiscordUser, encodeSession, isAuthorized } from '@/lib/auth';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error || !code) {
    return NextResponse.redirect(new URL('/login?error=access_denied', request.url));
  }

  try {
    const tokens = await exchangeCode(code);
    const user = await getDiscordUser(tokens.access_token);

    const session = {
      user,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: Date.now() + tokens.expires_in * 1000,
    };

    const authorized = await isAuthorized(session);
    if (!authorized) {
      return NextResponse.redirect(new URL('/login?error=unauthorized', request.url));
    }

    const cookieStore = await cookies();
    cookieStore.set('session', encodeSession(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 dias
      path: '/',
    });

    return NextResponse.redirect(new URL('/', request.url));
  } catch (err) {
    console.error('OAuth callback error:', err);
    return NextResponse.redirect(new URL('/login?error=auth_failed', request.url));
  }
}
