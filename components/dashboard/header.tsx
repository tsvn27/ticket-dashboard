"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Bell, Search, Command, X, Ticket, FileText, Users, Settings } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface HeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
}

interface SearchResult {
  type: 'ticket' | 'panel' | 'attendant' | 'page'
  id: string
  title: string
  subtitle?: string
  href: string
}

const pages: SearchResult[] = [
  { type: 'page', id: 'dashboard', title: 'Dashboard', subtitle: 'Página inicial', href: '/' },
  { type: 'page', id: 'tickets', title: 'Tickets', subtitle: 'Gerenciar tickets', href: '/tickets' },
  { type: 'page', id: 'paineis', title: 'Painéis', subtitle: 'Gerenciar painéis', href: '/paineis' },
  { type: 'page', id: 'atendentes', title: 'Atendentes', subtitle: 'Equipe de suporte', href: '/atendentes' },
  { type: 'page', id: 'logs', title: 'Logs', subtitle: 'Histórico de ações', href: '/logs' },
  { type: 'page', id: 'configuracoes', title: 'Configurações', subtitle: 'Configurações gerais', href: '/configuracoes' },
]

export function Header({ title, description, action }: HeaderProps) {
  const router = useRouter()
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [notifOpen, setNotifOpen] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
      if (e.key === 'Escape') {
        setSearchOpen(false)
        setNotifOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    if (searchOpen && searchRef.current) {
      searchRef.current.focus()
    }
  }, [searchOpen])

  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults(pages)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = pages.filter(p => 
      p.title.toLowerCase().includes(query) || 
      p.subtitle?.toLowerCase().includes(query)
    )

    fetch(`/api/tickets?limit=50`)
      .then(res => res.json())
      .then(data => {
        const tickets = (data.tickets || [])
          .filter((t: any) => 
            t.ticketId?.toString().includes(query) ||
            t.userId?.includes(query) ||
            t.optionName?.toLowerCase().includes(query)
          )
          .slice(0, 5)
          .map((t: any) => ({
            type: 'ticket' as const,
            id: t.channelId,
            title: `Ticket #${t.ticketId || t.id}`,
            subtitle: t.optionName || t.panelName,
            href: '/tickets'
          }))
        
        setResults([...filtered, ...tickets])
      })
      .catch(() => setResults(filtered))
  }, [searchQuery])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (result: SearchResult) => {
    router.push(result.href)
    setSearchOpen(false)
    setSearchQuery("")
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'ticket': return <Ticket className="h-4 w-4" />
      case 'panel': return <FileText className="h-4 w-4" />
      case 'attendant': return <Users className="h-4 w-4" />
      default: return <Settings className="h-4 w-4" />
    }
  }

  return (
    <>
      <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-border bg-background/80 backdrop-blur-xl px-8">
        <div>
          <h1 className="text-xl font-semibold text-foreground tracking-tight">{title}</h1>
          {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
        </div>

        <div className="flex items-center gap-3">
          {/* Search Button */}
          <button
            onClick={() => setSearchOpen(true)}
            className="relative hidden lg:flex items-center h-10 w-64 rounded-lg border border-border bg-secondary/50 px-3 text-sm text-muted-foreground hover:border-muted-foreground/50 transition-colors"
          >
            <Search className="h-4 w-4 mr-2" />
            <span>Buscar...</span>
            <div className="absolute right-2 flex items-center gap-0.5 rounded border border-border bg-background px-1.5 py-0.5">
              <Command className="h-3 w-3" />
              <span className="text-[10px] font-medium">K</span>
            </div>
          </button>

          {action}

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative h-10 w-10 rounded-lg"
              onClick={() => setNotifOpen(!notifOpen)}
            >
              <Bell className="h-[18px] w-[18px]" />
              {notifications.length > 0 && (
                <span className="absolute right-2 top-2 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-foreground opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-foreground" />
                </span>
              )}
            </Button>

            {notifOpen && (
              <div className="absolute right-0 top-12 w-80 rounded-lg border border-border bg-card shadow-xl">
                <div className="p-4 border-b border-border">
                  <h3 className="font-semibold text-foreground">Notificações</h3>
                </div>
                <div className="p-4">
                  {notifications.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Nenhuma notificação
                    </p>
                  ) : (
                    notifications.map((n, i) => (
                      <div key={i} className="p-2 hover:bg-secondary/50 rounded-lg">
                        {n.message}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="h-8 w-px bg-border mx-1" />

          {/* User */}
          <div className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-secondary/50 transition-colors cursor-pointer">
            <Avatar className="h-9 w-9 border-2 border-secondary">
              <AvatarImage src="/admin-avatar.png" />
              <AvatarFallback className="bg-foreground text-background text-xs font-semibold">AD</AvatarFallback>
            </Avatar>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-foreground leading-none">Admin</p>
              <p className="text-xs text-muted-foreground mt-0.5">Servidor</p>
            </div>
          </div>
        </div>
      </header>

      {/* Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
          <div 
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setSearchOpen(false)}
          />
          <div className="relative w-full max-w-lg mx-4 bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
            {/* Search Input */}
            <div className="flex items-center gap-3 p-4 border-b border-border">
              <Search className="h-5 w-5 text-muted-foreground" />
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar tickets, painéis, páginas..."
                className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none"
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="p-1 rounded hover:bg-secondary"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            {/* Results */}
            <div className="max-h-80 overflow-y-auto p-2">
              {results.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Nenhum resultado encontrado
                </p>
              ) : (
                results.map((result) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleSelect(result)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors text-left"
                  >
                    <div className="p-2 rounded-lg bg-secondary">
                      {getIcon(result.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{result.title}</p>
                      {result.subtitle && (
                        <p className="text-xs text-muted-foreground truncate">{result.subtitle}</p>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground capitalize">{result.type}</span>
                  </button>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-3 border-t border-border text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-secondary">↵</kbd> selecionar
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-secondary">esc</kbd> fechar
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
