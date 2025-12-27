import { NextResponse } from 'next/server';

const BOT_API_URL = process.env.BOT_API_URL || 'http://localhost:3001';
const API_SECRET = process.env.API_SECRET || '';

export async function GET() {
  try {
    const response = await fetch(`${BOT_API_URL}/settings`, {
      headers: { 'X-API-Secret': API_SECRET }
    });

    if (!response.ok) {
      return NextResponse.json({
        dmNotifications: true,
        ratingSystem: true,
        transcripts: true,
        autoClose: false,
        inactivityTime: 24,
        maxTicketsPerUser: 2
      });
    }

    return NextResponse.json(await response.json());
  } catch (error) {
    return NextResponse.json({ error: 'Bot offline' }, { status: 503 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const response = await fetch(`${BOT_API_URL}/settings`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'X-API-Secret': API_SECRET 
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Bot API error' }, { status: response.status });
    }

    return NextResponse.json(await response.json());
  } catch (error) {
    return NextResponse.json({ error: 'Bot offline' }, { status: 503 });
  }
}
