"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/dashboard/stat-card"
import { Users, UserCheck, Ticket, Star, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Attendant {
  odiscordId: string
  name: string
  odiscordTag: string
  avatar: string
  status: string
  role: string
  ticketsClosed: number
  ticketsOpen: number
  totalTickets: number
}

const statusColors: Record<string, string> = {
  online: "bg-green-500",
  idle: "bg-yellow-500",
  dnd: "bg-red-500",
  offline: "bg-gray-500",
}

export default function AtendentesPage() {
  const [attendants, setAttendants] = useState<Attendant[]>([])
  const [loading, setLoading] = useState(true)
  const [lastSync, setLastSync] = useState<number | null>(null)

  useEffect(() => {
    fetchAttendants()
    const interval = setInterval(fetchAttendants, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchAttendants = async () => {
    try {
      const res = await fetch("/api/attendants")
      const data = await res.json()
      setAttendants(Array.isArray(data.attendants) ? data.attendants : [])
      setLastSync(data.lastSync)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const totalTickets = Array.isArray(attendants) ? attendants.reduce((acc, a) => acc + (a.ticketsClosed || 0) + (a.ticketsOpen || 0), 0) : 0
  const onlineCount = Array.isArray(attendants) ? attendants.filter(a => a.status === 'online' || a.status === 'idle' || a.status === 'dnd').length : 0
  const totalClosed = Array.isArray(attendants) ? attendants.reduce((acc, a) => acc + (a.ticketsClosed || 0), 0) : 0

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="pl-64">
        <Header
          title="Atendentes"
          description={lastSync ? `Atualizado ${new Date(lastSync).toLocaleTimeString('pt-BR')}` : "Equipe de suporte"}
        />
        <main className="p-8">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4 mb-6">
            <StatCard title="Total" value={attendants.length} icon={Users} />
            <StatCard title="Online" value={onlineCount} icon={UserCheck} />
            <StatCard title="Com Tickets" value={attendants.filter(a => (a.ticketsOpen || 0) > 0).length} icon={Ticket} />
            <StatCard title="Tickets Fechados" value={totalClosed} icon={Star} />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : attendants.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Nenhum atendente encontrado</p>
              <p className="text-sm text-muted-foreground mt-2">Configure o cargo de staff no bot com /painel</p>
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-secondary/30">
                      <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Atendente
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Status
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Abertos
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Fechados
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {attendants.map((attendant) => (
                      <tr key={attendant.odiscordId} className="hover:bg-secondary/30 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <img 
                                src={attendant.avatar} 
                                alt={attendant.name}
                                className="h-9 w-9 rounded-full bg-secondary"
                              />
                              <span className={cn(
                                "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card",
                                statusColors[attendant.status] || statusColors.offline
                              )} />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">{attendant.name}</p>
                              <p className="text-xs text-muted-foreground">{attendant.odiscordTag}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={cn(
                            "text-sm capitalize",
                            attendant.status === 'online' ? 'text-green-500' :
                            attendant.status === 'idle' ? 'text-yellow-500' :
                            attendant.status === 'dnd' ? 'text-red-500' : 'text-muted-foreground'
                          )}>
                            {attendant.status === 'dnd' ? 'Não perturbe' : attendant.status}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm text-foreground">{attendant.ticketsOpen}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm text-foreground">{attendant.ticketsClosed}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm font-medium text-foreground">{attendant.totalTickets}</span>
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
    </div>
  )
}
