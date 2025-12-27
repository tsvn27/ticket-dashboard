import { NextResponse } from 'next/server';

const BOT_API_URL = process.env.BOT_API_URL || 'http://localhost:3001';
const API_SECRET = process.env.API_SECRET || '';

export async function GET() {
  try {
    const response = await fetch(`${BOT_API_URL}/attendants`, {
      headers: { 'X-API-Secret': API_SECRET }
    });

    if (!response.ok) {
      return NextResponse.json({ attendants: [], lastSync: null });
    }

    return NextResponse.json(await response.json());
  } catch (error) {
    return NextResponse.json({ attendants: [], lastSync: null });
  }
}
