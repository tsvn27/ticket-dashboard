"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowRight, Clock, CheckCircle2, AlertCircle } from "lucide-react"
import { TranscriptModal } from "./transcript-modal"

interface Ticket {
  channelId: string
  id: number
  ticketId?: number
  userId: string
  optionName: string
  panelName: string
  status: string
  priority: string
  createdAt: number | string
}

const priorityStyles: Record<string, string> = {
  high: "bg-foreground text-background",
  medium: "bg-secondary text-foreground",
  low: "bg-secondary/50 text-muted-foreground",
  urgent: "bg-foreground text-background",
}

const priorityLabels: Record<string, string> = {
  high: "Alta",
  medium: "Média",
  low: "Baixa",
  urgent: "Urgente",
}

function formatTime(timestamp: number | string): string {
  const time = typeof timestamp === 'string' ? new Date(timestamp).getTime() : timestamp
  if (!time || isNaN(time)) return '-'
  
  const diff = Date.now() - time
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (days > 0) return `${days}d`
  if (hours > 0) return `${hours}h`
  if (minutes > 0) return `${minutes} min`
  return 'agora'
}

export function RecentTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)

  useEffect(() => {
    fetch("/api/tickets?limit=5")
      .then(res => res.json())
      .then(data => {
        const tickets = (data.tickets || []).slice(0, 5).map((t: any) => ({
          ...t,
          id: t.ticketId || t.id
        }))
        setTickets(tickets)
      })
      .catch(() => {})
  }, [])

  return (
    <>
      <div className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h3 className="text-lg font-semibold text-foreground tracking-tight">Tickets Recentes</h3>
            <p className="text-sm text-muted-foreground mt-0.5">Últimas atividades do sistema</p>
          </div>
          <Link
            href="/tickets"
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
          >
            Ver todos
            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {tickets.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-muted-foreground">Nenhum ticket encontrado</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {tickets.map((ticket, index) => (
              <div
                key={ticket.channelId}
                onClick={() => setSelectedTicket(ticket)}
                className="group flex items-center gap-4 p-4 hover:bg-secondary/30 transition-all cursor-pointer"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${ticket.status === "open" ? "bg-foreground/10" : "bg-secondary"}`}
                >
                  {ticket.status === "open" ? (
                    <AlertCircle className="h-4 w-4 text-foreground" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-muted-foreground">#{ticket.id}</span>
                    <span
                      className={`text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded ${priorityStyles[ticket.priority] || priorityStyles.medium}`}
                    >
                      {priorityLabels[ticket.priority] || "Média"}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-foreground mt-0.5 truncate font-mono">{ticket.userId}</p>
                </div>

                <div className="hidden sm:block text-right">
                  <p className="text-xs text-muted-foreground">Categoria</p>
                  <p className="text-sm text-foreground">{ticket.optionName || ticket.panelName}</p>
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span className="text-sm">{formatTime(ticket.createdAt)}</span>
                </div>

                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Transcript Modal */}
      <TranscriptModal
        ticketId={selectedTicket?.id || 0}
        channelId={selectedTicket?.channelId || ''}
        isOpen={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
      />
    </>
  )
}
