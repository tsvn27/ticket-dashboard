"use client"

import { useState, useEffect, useMemo } from "react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface ChartData {
  name: string
  abertos: number
  fechados: number
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-border bg-card p-3 shadow-xl">
        <p className="text-sm font-medium text-foreground mb-2">{label}</p>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-white" />
            <span className="text-xs text-muted-foreground">Abertos:</span>
            <span className="text-xs font-medium text-foreground">{payload[0]?.value}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-neutral-500" />
            <span className="text-xs text-muted-foreground">Fechados:</span>
            <span className="text-xs font-medium text-foreground">{payload[1]?.value}</span>
          </div>
        </div>
      </div>
    )
  }
  return null
}

const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

export function WeeklyChart() {
  const [view, setView] = useState<"week" | "month">("week")
  const [weekData, setWeekData] = useState<ChartData[]>([])
  const [monthData, setMonthData] = useState<ChartData[]>([])

  useEffect(() => {
    fetch("/api/stats/chart")
      .then(res => res.json())
      .then(data => {
        if (data.weekData) setWeekData(data.weekData)
        if (data.monthData) setMonthData(data.monthData)
      })
      .catch(() => {
        const emptyWeek = dayNames.slice(1).concat(dayNames[0]).map(name => ({ name, abertos: 0, fechados: 0 }))
        setWeekData(emptyWeek)
        setMonthData([
          { name: "Sem 1", abertos: 0, fechados: 0 },
          { name: "Sem 2", abertos: 0, fechados: 0 },
          { name: "Sem 3", abertos: 0, fechados: 0 },
          { name: "Sem 4", abertos: 0, fechados: 0 },
        ])
      })
  }, [])

  const data = view === "week" ? weekData : monthData

  const stats = useMemo(() => {
    if (data.length === 0) return { totalAbertos: 0, totalFechados: 0, taxaResolucao: 0 }
    const totalAbertos = data.reduce((acc, item) => acc + item.abertos, 0)
    const totalFechados = data.reduce((acc, item) => acc + item.fechados, 0)
    const taxaResolucao = totalAbertos > 0 ? Math.round((totalFechados / totalAbertos) * 100) : 0
    return { totalAbertos, totalFechados, taxaResolucao }
  }, [data])

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground tracking-tight">Tickets por Dia</h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            {view === "week" ? "Últimos 7 dias" : "Últimas 4 semanas"}
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-lg bg-secondary p-1">
          <button
            onClick={() => setView("week")}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
              view === "week"
                ? "bg-foreground text-background shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Semana
          </button>
          <button
            onClick={() => setView("month")}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
              view === "month"
                ? "bg-foreground text-background shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Mês
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex items-center gap-2 rounded-full bg-secondary/70 px-4 py-2">
          <div className="h-2 w-2 rounded-full bg-white" />
          <span className="text-sm font-semibold text-foreground">{stats.totalAbertos}</span>
          <span className="text-xs text-muted-foreground">abertos</span>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-secondary/70 px-4 py-2">
          <div className="h-2 w-2 rounded-full bg-neutral-500" />
          <span className="text-sm font-semibold text-foreground">{stats.totalFechados}</span>
          <span className="text-xs text-muted-foreground">fechados</span>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-secondary/70 px-4 py-2">
          <span className="text-sm font-semibold text-foreground">{stats.taxaResolucao}%</span>
          <span className="text-xs text-muted-foreground">resolvidos</span>
        </div>
      </div>

      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gradientAbertos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffffff" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradientFechados" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#737373" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#737373" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#737373", fontSize: 12 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "#737373", fontSize: 12 }} dx={-10} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="abertos"
              stroke="#ffffff"
              strokeWidth={2}
              fill="url(#gradientAbertos)"
              dot={false}
              activeDot={{ r: 4, fill: "#ffffff", stroke: "#000000", strokeWidth: 2 }}
            />
            <Area
              type="monotone"
              dataKey="fechados"
              stroke="#737373"
              strokeWidth={2}
              fill="url(#gradientFechados)"
              dot={false}
              activeDot={{ r: 4, fill: "#737373", stroke: "#000000", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-white" />
          <span className="text-xs text-muted-foreground">Abertos</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-neutral-500" />
          <span className="text-xs text-muted-foreground">Fechados</span>
        </div>
      </div>
    </div>
  )
}
