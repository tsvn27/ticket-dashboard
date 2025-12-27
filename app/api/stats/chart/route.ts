import { NextResponse } from 'next/server';

const BOT_API_URL = process.env.BOT_API_URL || 'http://localhost:3001';
const API_SECRET = process.env.API_SECRET || '';

const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export async function GET() {
  try {
    const ticketsResponse = await fetch(`${BOT_API_URL}/tickets?limit=500`, {
      headers: { 'X-API-Secret': API_SECRET }
    });

    if (!ticketsResponse.ok) {
      return NextResponse.json({ weekData: [], monthData: [] });
    }

    const { tickets } = await ticketsResponse.json();

    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const oneWeek = 7 * oneDay;

    const weekData = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = now - (i * oneDay);
      const dayEnd = dayStart + oneDay;
      const dayDate = new Date(dayStart);
      const dayName = dayNames[dayDate.getDay()];

      const abertos = tickets.filter((t: any) => {
        const created = new Date(t.createdAt).getTime();
        return created >= dayStart && created < dayEnd;
      }).length;

      const fechados = tickets.filter((t: any) => {
        if (!t.closedAt) return false;
        const closed = new Date(t.closedAt).getTime();
        return closed >= dayStart && closed < dayEnd;
      }).length;

      weekData.push({ name: dayName, abertos, fechados });
    }

    const monthData = [];
    for (let i = 3; i >= 0; i--) {
      const weekStart = now - ((i + 1) * oneWeek);
      const weekEnd = weekStart + oneWeek;

      const abertos = tickets.filter((t: any) => {
        const created = new Date(t.createdAt).getTime();
        return created >= weekStart && created < weekEnd;
      }).length;

      const fechados = tickets.filter((t: any) => {
        if (!t.closedAt) return false;
        const closed = new Date(t.closedAt).getTime();
        return closed >= weekStart && closed < weekEnd;
      }).length;

      monthData.push({ name: `Sem ${4 - i}`, abertos, fechados });
    }

    return NextResponse.json({ weekData, monthData });
  } catch (error) {
    console.error('[API] Chart error:', error);
    return NextResponse.json({ weekData: [], monthData: [] });
  }
}
