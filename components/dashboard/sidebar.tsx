"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Ticket, LayoutGrid, Users, FileText, Settings, ChevronRight, LogOut } from "lucide-react"
import { useRealtime } from "@/hooks/use-realtime"

const menuItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Tickets", href: "/tickets", icon: Ticket },
  { name: "Painéis", href: "/paineis", icon: LayoutGrid },
  { name: "Atendentes", href: "/atendentes", icon: Users },
]

const systemItems = [
  { name: "Logs", href: "/logs", icon: FileText },
  { name: "Configurações", href: "/configuracoes", icon: Settings },
]

interface User {
  id: string
  username: string
  globalName: string | null
  avatar: string | null
}

export function Sidebar() {
  const pathname = usePathname()
  const { connected } = useRealtime()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => setUser(data.user))
      .catch(() => {})
  }, [])

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    window.location.href = "/login"
  }

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-sidebar-border bg-sidebar">
      <div className="flex h-full flex-col">
        <div className="flex h-20 items-center gap-4 border-b border-sidebar-border px-6">
          <div className="relative">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-foreground text-background font-bold text-base">
              TB
            </div>
            <div className={cn(
              "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-sidebar",
              connected ? "bg-foreground" : "bg-muted-foreground"
            )} />
          </div>
          <div>
            <h1 className="text-base font-semibold text-foreground tracking-tight">Ticket Bot</h1>
            <p className="text-xs text-muted-foreground">Painel de Controle</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6">
          <p className="px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70 mb-3">
            Menu Principal
          </p>
          <div className="space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
                  )}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-r-full bg-foreground" />
                  )}
                  <item.icon
                    className={cn("h-[18px] w-[18px] transition-transform duration-200", isActive && "scale-110")}
                  />
                  <span className="flex-1">{item.name}</span>
                  {isActive && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                </Link>
              )
            })}
          </div>

          <div className="my-6 h-px bg-sidebar-border" />

          <p className="px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70 mb-3">
            Sistema
          </p>
          <div className="space-y-1">
            {systemItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
                  )}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-r-full bg-foreground" />
                  )}
                  <item.icon
                    className={cn("h-[18px] w-[18px] transition-transform duration-200", isActive && "scale-110")}
                  />
                  <span className="flex-1">{item.name}</span>
                  {isActive && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                </Link>
              )
            })}
          </div>
        </nav>

        <div className="border-t border-sidebar-border p-4">
          {user ? (
            <div className="flex items-center gap-3 rounded-lg bg-secondary/50 px-4 py-3">
              {user.avatar ? (
                <img src={user.avatar} alt="" className="h-8 w-8 rounded-full" />
              ) : (
                <div className="h-8 w-8 rounded-full bg-foreground/20 flex items-center justify-center text-xs font-medium">
                  {user.username.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <span className="text-xs font-medium text-foreground block truncate">
                  {user.globalName || user.username}
                </span>
                <p className="text-[10px] text-muted-foreground">Conectado</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded hover:bg-secondary transition-colors"
                title="Sair"
              >
                <LogOut className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-lg bg-secondary/50 px-4 py-3">
              <div className="relative flex h-2.5 w-2.5">
                <span className={cn(
                  "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                  connected ? "bg-foreground" : "bg-muted-foreground"
                )} />
                <span className={cn(
                  "relative inline-flex rounded-full h-2.5 w-2.5",
                  connected ? "bg-foreground" : "bg-muted-foreground"
                )} />
              </div>
              <div className="flex-1">
                <span className="text-xs font-medium text-foreground">
                  {connected ? "Sistema Online" : "Conectando..."}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
