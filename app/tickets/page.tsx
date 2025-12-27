"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { TranscriptModal } from "@/components/dashboard/transcript-modal"
import { cn } from "@/lib/utils"
import { Loader2, MessageSquare, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Ticket {
  channelId: string
  id: number
  ticketId?: number
  userId: string
  panelId: string
  optionIndex: number
  optionName: string
  panelName: string
  mode: string
  createdAt: number | string
  lastActivity: number | string
  status: string
  priority: string
  claimedBy: string | null
  addedUsers: string[]
}

const priorityColors: Record<string, string> = {
  high: "text-foreground font-semibold",
  medium: "text-muted-foreground",
  low: "text-muted-foreground/60",
  urgent: "text-foreground font-bold",
}

const priorityLabels: Record<string, string> = {
  high: "Alta",
  medium: "Média",
  low: "Baixa",
  urgent: "Urgente",
}

type FilterType = "all" | "open" | "closed"

function formatTime(timestamp: number | string): string {
  const time = typeof timestamp === 'string' ? new Date(timestamp).getTime() : timestamp
  if (!time || isNaN(time)) return '-'
  
  const diff = Date.now() - time
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (days > 0) return `${days}d`
  if (hours > 0) return `${hours}h`
  if (minutes > 0) return `${minutes}min`
  return 'agora'
}

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterType>("all")
  const [counts, setCounts] = useState({ total: 0, open: 0, closed: 0 })
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)

  useEffect(() => {
    fetchTickets()
  }, [])

  const fetchTickets = async () => {
    try {
      const res = await fetch("/api/tickets")
      const data = await res.json()
      const tickets = (data.tickets || []).map((t: any) => ({
        ...t,
        id: t.ticketId || t.id
      }))
      setTickets(tickets)
      setCounts({ 
        total: data.total ?? 0, 
        open: data.opened ?? data.open ?? 0, 
        closed: data.closed ?? 0 
      })
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const filteredTickets = tickets.filter((ticket) => {
    if (filter === "all") return true
    if (filter === "open") return ticket.status === "open"
    if (filter === "closed") return ticket.status === "closed" || ticket.status === "deleted"
    return true
  })

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="pl-64">
        <Header
          title="Tickets"
          description="Gerenciar todos os tickets"
          action={
            <div className="flex gap-2">
              {([
                { key: "all", label: "Todos", count: counts.total },
                { key: "open", label: "Abertos", count: counts.open },
                { key: "closed", label: "Fechados", count: counts.closed },
              ] as const).map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    filter === f.key ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {f.label} ({f.count})
                </button>
              ))}
            </div>
          }
        />
        <main className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Nenhum ticket encontrado</p>
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-secondary/30">
                      <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Ticket
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Usuário
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Categoria
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Prioridade
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Atendente
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Status
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Tempo
                      </th>
                      <th className="px-5 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredTickets.map((ticket) => (
                      <tr key={ticket.channelId} className="hover:bg-secondary/30 transition-colors">
                        <td className="px-5 py-4">
                          <span className="text-sm font-mono font-medium text-foreground">#{ticket.id}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm font-medium text-foreground font-mono">{ticket.userId}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm text-muted-foreground">{ticket.optionName || ticket.panelName}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={cn("text-sm", priorityColors[ticket.priority] || "text-muted-foreground")}>
                            {priorityLabels[ticket.priority] || ticket.priority}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm text-muted-foreground">
                            {ticket.claimedBy || "-"}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
                              ticket.status === "open"
                                ? "bg-foreground text-background"
                                : "bg-secondary text-muted-foreground",
                            )}
                          >
                            <span
                              className={cn(
                                "h-1.5 w-1.5 rounded-full",
                                ticket.status === "open" ? "bg-background" : "bg-muted-foreground",
                              )}
                            />
                            {ticket.status === "open" ? "Aberto" : "Fechado"}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm text-muted-foreground">{formatTime(ticket.createdAt)}</span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedTicket(ticket)}
                            className="gap-1.5"
                          >
                            <MessageSquare className="h-4 w-4" />
                            Transcript
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Transcript Modal */}
      <TranscriptModal
        ticketId={selectedTicket?.id || 0}
        channelId={selectedTicket?.channelId || ''}
        isOpen={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
      />
    </div>
  )
}
