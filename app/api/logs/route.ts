import { NextResponse } from 'next/server';

const BOT_API_URL = process.env.BOT_API_URL || 'http://localhost:3001';
const API_SECRET = process.env.API_SECRET || '';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '50';
    const type = searchParams.get('type') || '';

    const response = await fetch(`${BOT_API_URL}/logs?limit=${limit}&type=${type}`, {
      headers: { 'X-API-Secret': API_SECRET }
    });

    if (!response.ok) {
      return NextResponse.json({ logs: [] });
    }

    return NextResponse.json(await response.json());
  } catch (error) {
    return NextResponse.json({ logs: [] });
  }
}
