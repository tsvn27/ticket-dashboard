import { NextResponse } from 'next/server';

const BOT_API_URL = process.env.BOT_API_URL || 'http://localhost:3001';
const API_SECRET = process.env.API_SECRET || '';
const GUILD_ID = process.env.GUILD_ID || '';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { channelId } = body;

    if (!channelId) {
      return NextResponse.json({ error: 'channelId é obrigatório' }, { status: 400 });
    }

    const response = await fetch(`${BOT_API_URL}/deploy/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Secret': API_SECRET
      },
      body: JSON.stringify({ guildId: GUILD_ID, channelId })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return NextResponse.json({ 
        success: false, 
        error: error.error || 'Falha ao fazer deploy' 
      }, { status: response.status });
    }

    const result = await response.json();
    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      channelId: result.channelId
    });
  } catch (error) {
    console.error('[API] Deploy error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Bot offline' 
    }, { status: 503 });
  }
}
