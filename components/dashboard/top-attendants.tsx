"use client"

import { useState, useEffect } from "react"
import { Star, Trophy, Medal, Award } from "lucide-react"
import Link from "next/link"

interface Attendant {
  odiscordId: string
  name: string
  odiscordTag: string
  avatar: string
  ticketsClosed: number
  ticketsOpen: number
  totalTickets: number
}

const rankIcons: Record<number, typeof Trophy> = {
  1: Trophy,
  2: Medal,
  3: Award,
}

export function TopAttendants() {
  const [attendants, setAttendants] = useState<Attendant[]>([])

  useEffect(() => {
    fetch("/api/attendants")
      .then(res => res.json())
      .then(data => {
        const sorted = (data.attendants || [])
          .sort((a: Attendant, b: Attendant) => (b.ticketsClosed || 0) - (a.ticketsClosed || 0))
          .slice(0, 3)
        setAttendants(sorted)
      })
      .catch(() => {})
  }, [])

  const getInitials = (name: string) => {
    if (!name) return '??'
    return name.slice(0, 2).toUpperCase()
  }

  if (attendants.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-foreground tracking-tight">Top Atendentes</h3>
          <p className="text-sm text-muted-foreground mt-0.5">Ranking do mês</p>
        </div>
        <p className="text-sm text-muted-foreground text-center py-8">Nenhum atendente cadastrado</p>
        <Link href="/atendentes">
          <button className="w-full py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground border border-dashed border-border hover:border-foreground/20 rounded-lg transition-all">
            Adicionar atendentes
          </button>
        </Link>
      </div>
    )
  }

  const top1 = attendants[0]

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground tracking-tight">Top Atendentes</h3>
        <p className="text-sm text-muted-foreground mt-0.5">Ranking do mês</p>
      </div>

      {top1 && (
        <div className="relative mb-6 p-4 rounded-xl bg-gradient-to-br from-secondary via-secondary/80 to-secondary/50 border border-border">
          <div className="absolute top-3 right-3">
            <Trophy className="h-5 w-5 text-foreground/30" />
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              {top1.avatar ? (
                <img src={top1.avatar} alt={top1.name} className="h-14 w-14 rounded-full ring-4 ring-foreground/20" />
              ) : (
                <div className="h-14 w-14 rounded-full bg-foreground text-background flex items-center justify-center text-lg font-bold ring-4 ring-foreground/20">
                  {getInitials(top1.name)}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-background border-2 border-foreground flex items-center justify-center">
                <span className="text-[10px] font-bold text-foreground">1</span>
              </div>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground text-sm">{top1.name}</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-sm text-muted-foreground">{top1.ticketsClosed || 0} tickets</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {attendants.slice(1).map((attendant, index) => {
          const rank = index + 2
          const RankIcon = rankIcons[rank] || Award
          return (
            <div
              key={attendant.odiscordId}
              className="group flex items-center gap-4 p-3 rounded-lg hover:bg-secondary/50 transition-all cursor-pointer"
            >
              <div className="relative">
                {attendant.avatar ? (
                  <img src={attendant.avatar} alt={attendant.name} className="h-10 w-10 rounded-full" />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-secondary text-foreground flex items-center justify-center text-sm font-semibold group-hover:bg-secondary/80 transition-colors">
                    {getInitials(attendant.name)}
                  </div>
                )}
                <div className="absolute -bottom-0.5 -right-0.5 h-5 w-5 rounded-full bg-background border border-border flex items-center justify-center">
                  <span className="text-[9px] font-bold text-muted-foreground">{rank}</span>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{attendant.name}</p>
                <p className="text-xs text-muted-foreground">{attendant.ticketsClosed || 0} tickets</p>
              </div>

              <RankIcon className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          )
        })}
      </div>

      <Link href="/atendentes">
        <button className="w-full mt-4 py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground border border-dashed border-border hover:border-foreground/20 rounded-lg transition-all">
          Ver todos os atendentes
        </button>
      </Link>
    </div>
  )
}
