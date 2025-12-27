"use client"

import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"
import { TrendingUp, TrendingDown } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: LucideIcon
  trend?: {
    value: string
    positive: boolean
  }
  sparkline?: number[]
  className?: string
  delay?: number
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  sparkline,
  className,
  delay = 0,
}: StatCardProps) {
  const renderSparkline = () => {
    if (!sparkline || sparkline.length === 0) return null
    
    const allZero = sparkline.every(v => v === 0)
    const data = allZero ? sparkline.map(() => 1) : sparkline

    const max = Math.max(...data)
    const min = Math.min(...data)
    const range = max - min || 1
    const width = 80
    const height = 32
    const padding = 2

    const points = data
      .map((val, i) => {
        const x = padding + (i / (data.length - 1)) * (width - padding * 2)
        const y = allZero 
          ? height / 2 
          : height - padding - ((val - min) / range) * (height - padding * 2)
        return `${x},${y}`
      })
      .join(" ")

    return (
      <svg width={width} height={height} className="overflow-visible">
        <defs>
          <linearGradient id={`gradient-${delay}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="white" stopOpacity={allZero ? 0.1 : 0.3} />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polyline
          fill="none"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
          className={allZero ? "opacity-30" : "opacity-60"}
        />
        {!allZero && (
          <polygon
            fill={`url(#gradient-${delay})`}
            points={`${padding},${height - padding} ${points} ${width - padding},${height - padding}`}
            className="opacity-40"
          />
        )}
      </svg>
    )
  }

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:border-foreground/20 hover:bg-card/80",
        "animate-fade-in opacity-0",
        className,
      )}
      style={{ animationDelay: `${delay * 0.05}s` }}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-3xl font-bold text-foreground tracking-tight animate-count-up">{value}</p>
            {trend && (
              <span
                className={cn(
                  "flex items-center gap-0.5 text-xs font-medium rounded-full px-1.5 py-0.5",
                  trend.positive ? "text-foreground bg-foreground/10" : "text-muted-foreground bg-muted",
                )}
              >
                {trend.positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {trend.value}
              </span>
            )}
          </div>
          {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
        </div>

        <div className="flex flex-col items-end gap-2">
          {Icon && (
            <div className="rounded-lg bg-foreground/5 p-2.5 ring-1 ring-foreground/10 group-hover:bg-foreground/10 transition-colors">
              <Icon className="h-4 w-4 text-foreground/70" />
            </div>
          )}
          {sparkline && <div className="mt-1">{renderSparkline()}</div>}
        </div>
      </div>
    </div>
  )
}
