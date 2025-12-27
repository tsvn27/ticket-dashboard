import { NextResponse } from 'next/server';

let permissions: Record<string, any> = {};

export async function GET() {
  return NextResponse.json({ permissions });
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { userId, permissions: userPerms } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId é obrigatório' }, { status: 400 });
    }

    if (userPerms === null) {
      delete permissions[userId];
    } else {
      permissions[userId] = { ...permissions[userId], ...userPerms };
    }

    return NextResponse.json({ success: true, permissions });
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
