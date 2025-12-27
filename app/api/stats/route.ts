import { NextResponse } from 'next/server';

const BOT_API_URL = process.env.BOT_API_URL || 'http://localhost:3001';
const API_SECRET = process.env.API_SECRET || '';

export async function GET() {
  try {
    const ticketsResponse = await fetch(`${BOT_API_URL}/tickets`, {
      headers: { 'X-API-Secret': API_SECRET }
    });

    const panelsResponse = await fetch(`${BOT_API_URL}/panels`, {
      headers: { 'X-API-Secret': API_SECRET }
    });

    if (!ticketsResponse.ok) {
      return NextResponse.json({
        totalTickets: 0,
        openTickets: 0,
        closedToday: 0,
        avgRating: "0",
        panelsCount: 0,
        sparklines: {
          total: [0, 0, 0, 0, 0, 0, 0],
          open: [0, 0, 0, 0, 0, 0, 0],
          closed: [0, 0, 0, 0, 0, 0, 0],
          rating: [0, 0, 0, 0, 0, 0, 0]
        }
      });
    }

    const ticketsData = await ticketsResponse.json();
    const panelsData = panelsResponse.ok ? await panelsResponse.json() : { panels: [] };
    
    const tickets = ticketsData.tickets || [];
    
    const totalTickets = tickets.length;
    const openTickets = tickets.filter((t: any) => t.status === 'open').length;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const closedToday = tickets.filter((t: any) => {
      if (t.status !== 'closed' && t.status !== 'deleted') return false;
      if (!t.closedAt) return false;
      return new Date(t.closedAt) >= today;
    }).length;
    
    const withRating = tickets.filter((t: any) => t.rating);
    const avgRating = withRating.length > 0
      ? (withRating.reduce((a: number, t: any) => a + t.rating, 0) / withRating.length).toFixed(1)
      : '0';

    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    
    const sparklineTotal: number[] = [];
    const sparklineOpen: number[] = [];
    const sparklineClosed: number[] = [];
    
    for (let i = 6; i >= 0; i--) {
      const dayStart = now - (i * oneDay);
      const dayEnd = dayStart + oneDay;
      
      const totalUntilDay = tickets.filter((t: any) => {
        const created = new Date(t.createdAt).getTime();
        return created < dayEnd;
      }).length;
      
      const openOnDay = tickets.filter((t: any) => {
        const created = new Date(t.createdAt).getTime();
        return created >= dayStart && created < dayEnd;
      }).length;
      
      const closedOnDay = tickets.filter((t: any) => {
        if (!t.closedAt) return false;
        const closed = new Date(t.closedAt).getTime();
        return closed >= dayStart && closed < dayEnd;
      }).length;
      
      sparklineTotal.push(totalUntilDay);
      sparklineOpen.push(openOnDay);
      sparklineClosed.push(closedOnDay);
    }

    return NextResponse.json({
      totalTickets,
      openTickets,
      closedToday,
      avgRating,
      panelsCount: (panelsData.panels || []).length,
      sparklines: {
        total: sparklineTotal,
        open: sparklineOpen,
        closed: sparklineClosed,
        rating: [0, 0, 0, 0, 0, 0, parseFloat(avgRating) || 0]
      }
    });
  } catch (error) {
    return NextResponse.json({
      totalTickets: 0,
      openTickets: 0,
      closedToday: 0,
      avgRating: "0",
      panelsCount: 0,
      sparklines: {
        total: [0, 0, 0, 0, 0, 0, 0],
        open: [0, 0, 0, 0, 0, 0, 0],
        closed: [0, 0, 0, 0, 0, 0, 0],
        rating: [0, 0, 0, 0, 0, 0, 0]
      }
    });
  }
}
