"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Settings, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface Panel {
  id: string
  name: string
  enabled: boolean
  mode: "channel" | "thread"
  optionsCount: number
  total: number
  open: number
}

export default function PaineisPage() {
  const [panels, setPanels] = useState<Panel[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newPanelName, setNewPanelName] = useState("")
  const [showCreate, setShowCreate] = useState(false)

  useEffect(() => {
    fetchPanels()
  }, [])

  const fetchPanels = async () => {
    try {
      const res = await fetch("/api/panels")
      const data = await res.json()
      setPanels(data.panels || [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const createPanel = async () => {
    if (!newPanelName.trim()) return
    setCreating(true)
    try {
      const res = await fetch("/api/panels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newPanelName }),
      })
      if (res.ok) {
        setNewPanelName("")
        setShowCreate(false)
        fetchPanels()
      }
    } catch (error) {
      console.error(error)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="pl-64">
        <Header
          title="Painéis"
          description="Gerenciar painéis de tickets"
          action={
            <Button className="gap-2" onClick={() => setShowCreate(true)}>
              <Plus className="h-4 w-4" />
              Criar Painel
            </Button>
          }
        />
        <main className="p-8">
          {showCreate && (
            <div className="mb-6 p-4 rounded-lg border border-border bg-card max-w-md">
              <p className="font-medium mb-3">Novo Painel</p>
              <div className="flex gap-2">
                <Input
                  value={newPanelName}
                  onChange={(e) => setNewPanelName(e.target.value)}
                  placeholder="Nome do painel"
                  onKeyDown={(e) => e.key === "Enter" && createPanel()}
                />
                <Button onClick={createPanel} disabled={creating}>
                  {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Criar"}
                </Button>
                <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancelar</Button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : panels.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">Nenhum painel criado ainda</p>
              <Button onClick={() => setShowCreate(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar primeiro painel
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {panels.map((panel) => (
                <div
                  key={panel.id}
                  className="group relative rounded-lg border border-border bg-card p-5 transition-colors hover:border-muted-foreground/50"
                >
                  <div className="absolute right-4 top-4">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                        panel.enabled ? "bg-foreground text-background" : "bg-secondary text-muted-foreground",
                      )}
                    >
                      {panel.enabled ? "Ativo" : "Desligado"}
                    </span>
                  </div>

                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-foreground">{panel.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {panel.mode === "channel" ? "Canal" : "Tópico"} · {panel.optionsCount} {panel.optionsCount === 1 ? "opção" : "opções"}
                    </p>
                  </div>

                  <div className="flex gap-6">
                    <div>
                      <p className="text-3xl font-bold text-foreground">{panel.total}</p>
                      <p className="text-xs text-muted-foreground">Total</p>
                    </div>
                    <div>
                      <p className={cn("text-3xl font-bold", panel.open > 0 ? "text-foreground" : "text-muted-foreground")}>
                        {panel.open}
                      </p>
                      <p className="text-xs text-muted-foreground">Abertos</p>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <Link href={`/paineis/${panel.id}`}>
                      <Button variant="secondary" size="sm" className="gap-1.5">
                        <Settings className="h-3.5 w-3.5" />
                        Editar
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
