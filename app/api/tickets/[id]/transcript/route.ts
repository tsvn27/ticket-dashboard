import { NextResponse } from 'next/server';

const BOT_API_URL = process.env.BOT_API_URL || 'http://localhost:3001';
const API_SECRET = process.env.API_SECRET || '';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const response = await fetch(`${BOT_API_URL}/tickets/${id}/transcript`, {
      headers: { 'X-API-Secret': API_SECRET }
    });

    if (!response.ok) {
      return NextResponse.json({ 
        messages: [], 
        error: 'Transcript não encontrado' 
      }, { status: response.status });
    }

    return NextResponse.json(await response.json());
  } catch (error) {
    console.error('[API] Transcript error:', error);
    return NextResponse.json({ 
      messages: [], 
      error: 'Bot offline' 
    }, { status: 503 });
  }
}
