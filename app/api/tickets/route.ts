import { NextResponse } from 'next/server';

const BOT_API_URL = process.env.BOT_API_URL || 'http://localhost:3001';
const API_SECRET = process.env.API_SECRET || '';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const limit = searchParams.get('limit') || '100';

    const response = await fetch(`${BOT_API_URL}/tickets?status=${status}&limit=${limit}`, {
      headers: { 'X-API-Secret': API_SECRET }
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Bot API error' }, { status: response.status });
    }

    const data = await response.json();
    const tickets = data.tickets || [];
    
    const total = tickets.length;
    const open = tickets.filter((t: any) => t.status === 'open').length;
    const closed = tickets.filter((t: any) => t.status === 'closed' || t.status === 'deleted').length;
    
    return NextResponse.json({ 
      tickets, 
      total, 
      open, 
      closed 
    });
  } catch (error) {
    console.error('[API] Tickets error:', error);
    return NextResponse.json({ error: 'Bot offline' }, { status: 503 });
  }
}
