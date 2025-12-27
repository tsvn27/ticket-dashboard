"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { StatCard } from "@/components/dashboard/stat-card"
import { WeeklyChart } from "@/components/dashboard/weekly-chart"
import { TopAttendants } from "@/components/dashboard/top-attendants"
import { RecentTickets } from "@/components/dashboard/recent-tickets"
import { Ticket, Clock, CheckCircle, Star, Zap } from "lucide-react"

interface Stats {
  totalTickets: number
  openTickets: number
  closedToday: number
  avgRating: string
  panelsCount: number
  sparklines: {
    total: number[]
    open: number[]
    closed: number[]
    rating: number[]
  }
}

const defaultSparklines = {
  total: [0, 0, 0, 0, 0, 0, 0],
  open: [0, 0, 0, 0, 0, 0, 0],
  closed: [0, 0, 0, 0, 0, 0, 0],
  rating: [0, 0, 0, 0, 0, 0, 0]
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalTickets: 0,
    openTickets: 0,
    closedToday: 0,
    avgRating: "0",
    panelsCount: 0,
    sparklines: defaultSparklines
  })

  const fetchStats = () => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setStats({
            totalTickets: data.totalTickets ?? 0,
            openTickets: data.openTickets ?? 0,
            closedToday: data.closedToday ?? 0,
            avgRating: data.avgRating ?? "0",
            panelsCount: data.panelsCount ?? 0,
            sparklines: data.sparklines ?? defaultSparklines
          })
        }
      })
      .catch(console.error)
  }

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="pl-72">
        <Header title="Dashboard" description="Bem-vindo de volta! Aqui está o resumo." />
        <main className="p-8">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
            <StatCard
              title="Total de Tickets"
              value={stats.totalTickets.toString()}
              icon={Ticket}
              sparkline={stats.sparklines.total}
              delay={1}
            />
            <StatCard
              title="Tickets Abertos"
              value={stats.openTickets.toString()}
              subtitle="Aguardando"
              icon={Clock}
              sparkline={stats.sparklines.open}
              delay={2}
            />
            <StatCard
              title="Fechados Hoje"
              value={stats.closedToday.toString()}
              icon={CheckCircle}
              sparkline={stats.sparklines.closed}
              delay={3}
            />
            <StatCard
              title="Painéis"
              value={stats.panelsCount.toString()}
              subtitle="Configurados"
              icon={Zap}
              delay={4}
            />
            <StatCard
              title="Avaliação"
              value={stats.avgRating}
              subtitle="de 5 estrelas"
              icon={Star}
              sparkline={stats.sparklines.rating}
              delay={5}
            />
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <WeeklyChart />
            </div>
            <TopAttendants />
          </div>

          <div className="mt-8">
            <RecentTickets />
          </div>
        </main>
      </div>
    </div>
  )
}
