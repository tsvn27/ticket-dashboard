import { NextResponse } from 'next/server';

const BOT_API_URL = process.env.BOT_API_URL || 'http://localhost:3001';
const API_SECRET = process.env.API_SECRET || '';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const response = await fetch(`${BOT_API_URL}/panels/${id}`, {
      headers: { 'X-API-Secret': API_SECRET }
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Painel não encontrado' }, { status: response.status });
    }

    return NextResponse.json(await response.json());
  } catch (error) {
    return NextResponse.json({ error: 'Bot offline' }, { status: 503 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const response = await fetch(`${BOT_API_URL}/panels/${id}`, {
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

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const response = await fetch(`${BOT_API_URL}/panels/${id}`, {
      method: 'DELETE',
      headers: { 'X-API-Secret': API_SECRET }
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Bot API error' }, { status: response.status });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Bot offline' }, { status: 503 });
  }
}
