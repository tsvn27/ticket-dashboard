import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ 
    message: 'Use WebSocket connection instead',
    wsUrl: `${process.env.BOT_API_URL?.replace('http', 'ws')}/ws`
  });
}
