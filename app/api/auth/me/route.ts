import { NextResponse } from 'next/server';
import { getSession, isAuthorized } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  
  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const authorized = await isAuthorized(session);
  if (!authorized) {
    return NextResponse.json({ user: null, error: 'unauthorized' }, { status: 403 });
  }

  return NextResponse.json({
    user: {
      id: session.user.id,
      username: session.user.username,
      globalName: session.user.global_name,
      avatar: session.user.avatar
        ? `https://cdn.discordapp.com/avatars/${session.user.id}/${session.user.avatar}.png`
        : null,
    },
  });
}
