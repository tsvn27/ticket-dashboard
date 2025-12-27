"use client"

import { useState, useEffect } from 'react';

interface RealtimeData {
  stats: {
    totalTickets: number;
    openTickets: number;
    panelsCount: number;
  };
  recentLogs: any[];
  timestamp: number;
}

export function useRealtime() {
  const [data, setData] = useState<RealtimeData | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let eventSource: EventSource | null = null;

    const connect = () => {
      eventSource = new EventSource('/api/realtime');

      eventSource.onopen = () => {
        setConnected(true);
      };

      eventSource.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          setData(parsed);
        } catch (error) {
          console.error('Failed to parse SSE data:', error);
        }
      };

      eventSource.onerror = () => {
        setConnected(false);
        eventSource?.close();
        setTimeout(connect, 5000);
      };
    };

    connect();

    return () => {
      eventSource?.close();
    };
  }, []);

  return { data, connected };
}
