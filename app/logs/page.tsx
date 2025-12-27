"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface LogEntry {
  type: string
  ticketId: number
  channelId?: string
  userId: string
  staffId?: string
  timestamp: number | string
  details?: Record<string, any>
}

const typeLabels: Record<string, string> = {
  created: "Ticket Criado",
  assumed: "Ticket Assumido",
  closed: "Ticket Fechado",
  reopened: "Ticket Reaberto",
  transferred: "Ticket Transferido",
  deleted: "Ticket Deletado",
  rated: "Ticket Avaliado",
}

const typeColors: Record<string, string> = {
  created: "bg-foreground",
  assumed: "bg-muted-foreground",
  closed: "bg-muted-foreground/50",
  reopened: "bg-foreground",
  transferred: "bg-muted-foreground",
  deleted: "bg-muted-foreground/30",
  rated: "bg-foreground/70",
}

function formatTime(timestamp: number | string): string {
  const time = typeof timestamp === 'string' ? new Date(timestamp).getTime() : timestamp
  if (!time || isNaN(time)) return '-'
  
  const diff = Date.now() - time
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (days > 0) return `${days}d atrás`
  if (hours > 0) return `${hours}h atrás`
  if (minutes > 0) return `${minutes}min atrás`
  return "agora"
}

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    fetchLogs()
  }, [filter])

  const fetchLogs = async () => {
    try {
      const res = await fetch(`/api/logs?limit=100&type=${filter}`)
      const data = await res.json()
      setLogs(data.logs || [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const filters = ["all", "created", "assumed", "closed", "reopened", "transferred", "deleted"]

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="pl-64">
        <Header
          title="Logs"
          description="Histórico de ações"
          action={
            <div className="flex gap-1">
              {filters.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                    filter === f ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {f === "all" ? "Todos" : typeLabels[f]?.split(" ")[1] || f}
                </button>
              ))}
            </div>
          }
        />
        <main className="p-8">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Nenhum log encontrado</p>
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-card">
              <div className="divide-y divide-border">
                {logs.map((log, index) => (
                  <div key={index} className="flex items-start gap-4 p-5 hover:bg-secondary/30 transition-colors">
                    <div className={cn("mt-1 h-2.5 w-2.5 rounded-full shrink-0", typeColors[log.type] || "bg-muted-foreground")} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-medium text-foreground">{typeLabels[log.type] || log.type}</h4>
                        <span className="text-sm font-mono text-muted-foreground">#{log.ticketId}</span>
                      </div>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {log.staffId ? `Staff: ${log.staffId}` : `Usuário: ${log.userId}`}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{formatTime(log.timestamp)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
