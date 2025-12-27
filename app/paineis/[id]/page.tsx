"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Sidebar } from "@/components/dashboard/sidebar"
import { ArrowLeft, Settings, MessageSquare, Clock, Sliders, Bot, Grip, Pencil, Trash2, Plus, X, Save, Loader2, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import Link from "next/link"

type Tab = "geral" | "opcoes" | "mensagens" | "horario" | "preferencias" | "ia"

interface PanelOption {
  name: string
  description: string
  createdAt?: number
  updatedAt?: number
}

interface Panel {
  id: string
  name: string
  enabled: boolean
  mode: "channel" | "thread"
  options: PanelOption[]
  categoryId: string | null
  channelId: string | null
  roles: { staff: string | null; admin: string | null }
  schedule: {
    enabled: boolean
    open: string
    close: string
    closedDays?: number[]
    closedMessage?: string
  }
  messages: {
    title?: string
    description?: string
    panel?: { content?: string }
  }
  preferences: {
    transcripts?: boolean
    dmNotifications?: boolean
    rating?: boolean
    autoClose?: boolean
    ticketPanelStyle?: 'buttons' | 'select'
    staffPanelStyle?: 'buttons' | 'select'
    memberPanelStyle?: 'buttons' | 'select'
  }
  ai?: { enabled: boolean; useContext?: boolean; instructions?: string }
}

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "geral", label: "Geral", icon: <Settings className="h-4 w-4" /> },
  { id: "opcoes", label: "Opções", icon: <Grip className="h-4 w-4" /> },
  { id: "mensagens", label: "Mensagens", icon: <MessageSquare className="h-4 w-4" /> },
  { id: "horario", label: "Horário", icon: <Clock className="h-4 w-4" /> },
  { id: "preferencias", label: "Preferências", icon: <Sliders className="h-4 w-4" /> },
  { id: "ia", label: "IA", icon: <Bot className="h-4 w-4" /> },
]

export default function PanelEditPage() {
  const params = useParams()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>("geral")
  const [panel, setPanel] = useState<Panel | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingOption, setEditingOption] = useState<number | null>(null)
  const [newOption, setNewOption] = useState({ name: "", description: "" })
  const [showNewOption, setShowNewOption] = useState(false)

  useEffect(() => {
    fetchPanel()
    const interval = setInterval(fetchPanel, 10000)
    return () => clearInterval(interval)
  }, [params.id])

  const fetchPanel = async () => {
    try {
      const res = await fetch(`/api/panels/${params.id}`)
      if (!res.ok) throw new Error("Painel não encontrado")
      const data = await res.json()
      setPanel(data)
    } catch (error) {
      console.error(error)
      router.push("/paineis")
    } finally {
      setLoading(false)
    }
  }

  const savePanel = async () => {
    if (!panel) return
    setSaving(true)
    try {
      const res = await fetch(`/api/panels/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(panel),
      })
      if (!res.ok) throw new Error("Erro ao salvar")
    } catch (error) {
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  const deletePanel = async () => {
    if (!confirm("Tem certeza que deseja excluir este painel?")) return
    try {
      await fetch(`/api/panels/${params.id}`, { method: "DELETE" })
      router.push("/paineis")
    } catch (error) {
      console.error(error)
    }
  }

  const addOption = () => {
    if (!panel || !newOption.name) return
    setPanel({
      ...panel,
      options: [...panel.options, { ...newOption, createdAt: Date.now() }],
    })
    setNewOption({ name: "", description: "" })
    setShowNewOption(false)
  }

  const updateOption = (index: number, data: Partial<PanelOption>) => {
    if (!panel) return
    const options = [...panel.options]
    options[index] = { ...options[index], ...data, updatedAt: Date.now() }
    setPanel({ ...panel, options })
  }

  const deleteOption = (index: number) => {
    if (!panel) return
    setPanel({ ...panel, options: panel.options.filter((_, i) => i !== index) })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!panel) return null

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="pl-64">
        <div className="border-b border-border bg-card/50">
          <div className="flex items-center justify-between px-8 py-4">
            <div className="flex items-center gap-4">
              <Link href="/paineis">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-semibold">{panel.name}</h1>
                <p className="text-sm text-muted-foreground">Editar configurações do painel</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Ativo</span>
                <Switch
                  checked={panel.enabled}
                  onCheckedChange={(enabled) => setPanel({ ...panel, enabled })}
                />
              </div>
              <Button variant="destructive" size="sm" onClick={deletePanel}>
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button onClick={savePanel} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Salvar
              </Button>
              <Button 
                variant="outline" 
                onClick={() => alert('Para fazer deploy, use o comando /painel no Discord e selecione "Enviar Painel"')}
              >
                <Send className="h-4 w-4 mr-2" />
                Deploy
              </Button>
            </div>
          </div>
          <div className="flex gap-1 px-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                  activeTab === tab.id
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <main className="p-8">
          {activeTab === "geral" && (
            <div className="max-w-2xl space-y-6">
              <div className="space-y-2">
                <Label>Nome do Painel</Label>
                <Input
                  value={panel.name}
                  onChange={(e) => setPanel({ ...panel, name: e.target.value })}
                  placeholder="Ex: Suporte Geral"
                />
              </div>
              <div className="space-y-2">
                <Label>Modo</Label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setPanel({ ...panel, mode: "channel" })}
                    className={cn(
                      "flex-1 p-4 rounded-lg border transition-colors",
                      panel.mode === "channel"
                        ? "border-foreground bg-foreground/5"
                        : "border-border hover:border-muted-foreground"
                    )}
                  >
                    <p className="font-medium">Canal</p>
                    <p className="text-sm text-muted-foreground">Cada ticket cria um novo canal</p>
                  </button>
                  <button
                    onClick={() => setPanel({ ...panel, mode: "thread" })}
                    className={cn(
                      "flex-1 p-4 rounded-lg border transition-colors",
                      panel.mode === "thread"
                        ? "border-foreground bg-foreground/5"
                        : "border-border hover:border-muted-foreground"
                    )}
                  >
                    <p className="font-medium">Tópico</p>
                    <p className="text-sm text-muted-foreground">Cada ticket cria um tópico</p>
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>ID da Categoria</Label>
                <Input
                  value={panel.categoryId || ""}
                  onChange={(e) => setPanel({ ...panel, categoryId: e.target.value || null })}
                  placeholder="ID da categoria do Discord"
                />
              </div>
              <div className="space-y-2">
                <Label>ID do Canal</Label>
                <Input
                  value={panel.channelId || ""}
                  onChange={(e) => setPanel({ ...panel, channelId: e.target.value || null })}
                  placeholder="ID do canal onde o painel será enviado"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cargo Staff</Label>
                  <Input
                    value={panel.roles?.staff || ""}
                    onChange={(e) => setPanel({ ...panel, roles: { ...panel.roles, staff: e.target.value || null } })}
                    placeholder="ID do cargo"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cargo Admin</Label>
                  <Input
                    value={panel.roles?.admin || ""}
                    onChange={(e) => setPanel({ ...panel, roles: { ...panel.roles, admin: e.target.value || null } })}
                    placeholder="ID do cargo"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "opcoes" && (
            <div className="max-w-2xl space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{panel.options.length}/25 opções</p>
                <Button
                  size="sm"
                  onClick={() => setShowNewOption(true)}
                  disabled={panel.options.length >= 25}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
              </div>
              {showNewOption && (
                <div className="p-4 rounded-lg border border-border bg-card space-y-3">
                  <Input
                    value={newOption.name}
                    onChange={(e) => setNewOption({ ...newOption, name: e.target.value })}
                    placeholder="Nome da opção"
                  />
                  <Textarea
                    value={newOption.description}
                    onChange={(e) => setNewOption({ ...newOption, description: e.target.value })}
                    placeholder="Descrição"
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={addOption}>Adicionar</Button>
                    <Button size="sm" variant="ghost" onClick={() => setShowNewOption(false)}>Cancelar</Button>
                  </div>
                </div>
              )}
              {panel.options.map((option, index) => (
                <div key={index} className="p-4 rounded-lg border border-border bg-card">
                  {editingOption === index ? (
                    <div className="space-y-3">
                      <Input
                        value={option.name}
                        onChange={(e) => updateOption(index, { name: e.target.value })}
                      />
                      <Textarea
                        value={option.description}
                        onChange={(e) => updateOption(index, { description: e.target.value })}
                        rows={2}
                      />
                      <Button size="sm" onClick={() => setEditingOption(null)}>Concluir</Button>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{option.name}</p>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" onClick={() => setEditingOption(index)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => deleteOption(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === "mensagens" && (
            <div className="max-w-2xl space-y-6">
              <div className="space-y-2">
                <Label>Título do Painel</Label>
                <Input
                  value={panel.messages?.title || ""}
                  onChange={(e) => setPanel({ ...panel, messages: { ...panel.messages, title: e.target.value } })}
                  placeholder="Título exibido no embed"
                />
              </div>
              <div className="space-y-2">
                <Label>Descrição do Painel</Label>
                <Textarea
                  value={panel.messages?.description || ""}
                  onChange={(e) => setPanel({ ...panel, messages: { ...panel.messages, description: e.target.value } })}
                  placeholder="Descrição exibida no embed"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Conteúdo da Mensagem</Label>
                <Textarea
                  value={panel.messages?.panel?.content || ""}
                  onChange={(e) => setPanel({ ...panel, messages: { ...panel.messages, panel: { ...panel.messages?.panel, content: e.target.value } } })}
                  placeholder="Conteúdo acima do embed (suporta markdown)"
                  rows={4}
                />
              </div>
            </div>
          )}

          {activeTab === "horario" && (
            <div className="max-w-2xl space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div>
                  <p className="font-medium">Horário de Atendimento</p>
                  <p className="text-sm text-muted-foreground">Limitar abertura de tickets por horário</p>
                </div>
                <Switch
                  checked={panel.schedule?.enabled || false}
                  onCheckedChange={(enabled) => setPanel({ ...panel, schedule: { ...panel.schedule, enabled } })}
                />
              </div>
              {panel.schedule?.enabled && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Abertura</Label>
                    <Input
                      type="time"
                      value={panel.schedule?.open || "09:00"}
                      onChange={(e) => setPanel({ ...panel, schedule: { ...panel.schedule, open: e.target.value } })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Fechamento</Label>
                    <Input
                      type="time"
                      value={panel.schedule?.close || "18:00"}
                      onChange={(e) => setPanel({ ...panel, schedule: { ...panel.schedule, close: e.target.value } })}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "preferencias" && (
            <div className="max-w-2xl space-y-6">
              {/* Funcionalidades */}
              <div className="rounded-lg border border-border bg-card">
                <div className="border-b border-border p-5">
                  <h3 className="font-medium text-foreground">Funcionalidades</h3>
                  <p className="text-sm text-muted-foreground">Ativar ou desativar recursos do painel</p>
                </div>
                <div className="divide-y divide-border">
                  <div className="flex items-center justify-between p-5">
                    <div>
                      <p className="text-sm font-medium text-foreground">Transcripts</p>
                      <p className="text-sm text-muted-foreground">Salvar histórico de mensagens ao fechar ticket</p>
                    </div>
                    <Switch
                      checked={panel.preferences?.transcripts !== false}
                      onCheckedChange={(transcripts) => setPanel({ ...panel, preferences: { ...panel.preferences, transcripts } })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-5">
                    <div>
                      <p className="text-sm font-medium text-foreground">DM Notificações</p>
                      <p className="text-sm text-muted-foreground">Enviar notificações por mensagem direta</p>
                    </div>
                    <Switch
                      checked={panel.preferences?.dmNotifications !== false}
                      onCheckedChange={(dmNotifications) => setPanel({ ...panel, preferences: { ...panel.preferences, dmNotifications } })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-5">
                    <div>
                      <p className="text-sm font-medium text-foreground">Avaliação</p>
                      <p className="text-sm text-muted-foreground">Solicitar avaliação ao fechar ticket</p>
                    </div>
                    <Switch
                      checked={panel.preferences?.rating !== false}
                      onCheckedChange={(rating) => setPanel({ ...panel, preferences: { ...panel.preferences, rating } })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-5">
                    <div>
                      <p className="text-sm font-medium text-foreground">Auto-Close</p>
                      <p className="text-sm text-muted-foreground">Fechar tickets inativos automaticamente</p>
                    </div>
                    <Switch
                      checked={panel.preferences?.autoClose || false}
                      onCheckedChange={(autoClose) => setPanel({ ...panel, preferences: { ...panel.preferences, autoClose } })}
                    />
                  </div>
                </div>
              </div>

              {/* Estilos de Exibição */}
              <div className="rounded-lg border border-border bg-card">
                <div className="border-b border-border p-5">
                  <h3 className="font-medium text-foreground">Estilos de Exibição</h3>
                  <p className="text-sm text-muted-foreground">Configurar aparência dos painéis</p>
                </div>
                <div className="divide-y divide-border">
                  <div className="flex items-center justify-between p-5">
                    <div>
                      <p className="text-sm font-medium text-foreground">Painel de Tickets</p>
                      <p className="text-sm text-muted-foreground">Estilo do painel principal</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPanel({ ...panel, preferences: { ...panel.preferences, ticketPanelStyle: 'buttons' } })}
                        className={cn(
                          "px-3 py-1.5 text-sm rounded-md border transition-colors",
                          (panel.preferences?.ticketPanelStyle || 'buttons') === 'buttons'
                            ? "bg-foreground text-background border-foreground"
                            : "border-border hover:border-muted-foreground"
                        )}
                      >
                        Botões
                      </button>
                      <button
                        onClick={() => setPanel({ ...panel, preferences: { ...panel.preferences, ticketPanelStyle: 'select' } })}
                        className={cn(
                          "px-3 py-1.5 text-sm rounded-md border transition-colors",
                          panel.preferences?.ticketPanelStyle === 'select'
                            ? "bg-foreground text-background border-foreground"
                            : "border-border hover:border-muted-foreground"
                        )}
                      >
                        Select
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-5">
                    <div>
                      <p className="text-sm font-medium text-foreground">Painel Atendente</p>
                      <p className="text-sm text-muted-foreground">Estilo do painel para staff</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPanel({ ...panel, preferences: { ...panel.preferences, staffPanelStyle: 'buttons' } })}
                        className={cn(
                          "px-3 py-1.5 text-sm rounded-md border transition-colors",
                          panel.preferences?.staffPanelStyle === 'buttons'
                            ? "bg-foreground text-background border-foreground"
                            : "border-border hover:border-muted-foreground"
                        )}
                      >
                        Botões
                      </button>
                      <button
                        onClick={() => setPanel({ ...panel, preferences: { ...panel.preferences, staffPanelStyle: 'select' } })}
                        className={cn(
                          "px-3 py-1.5 text-sm rounded-md border transition-colors",
                          (panel.preferences?.staffPanelStyle || 'select') === 'select'
                            ? "bg-foreground text-background border-foreground"
                            : "border-border hover:border-muted-foreground"
                        )}
                      >
                        Select
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-5">
                    <div>
                      <p className="text-sm font-medium text-foreground">Painel Membro</p>
                      <p className="text-sm text-muted-foreground">Estilo do painel para usuário</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPanel({ ...panel, preferences: { ...panel.preferences, memberPanelStyle: 'buttons' } })}
                        className={cn(
                          "px-3 py-1.5 text-sm rounded-md border transition-colors",
                          panel.preferences?.memberPanelStyle === 'buttons'
                            ? "bg-foreground text-background border-foreground"
                            : "border-border hover:border-muted-foreground"
                        )}
                      >
                        Botões
                      </button>
                      <button
                        onClick={() => setPanel({ ...panel, preferences: { ...panel.preferences, memberPanelStyle: 'select' } })}
                        className={cn(
                          "px-3 py-1.5 text-sm rounded-md border transition-colors",
                          (panel.preferences?.memberPanelStyle || 'select') === 'select'
                            ? "bg-foreground text-background border-foreground"
                            : "border-border hover:border-muted-foreground"
                        )}
                      >
                        Select
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "ia" && (
            <div className="max-w-2xl space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div>
                  <p className="font-medium">Assistente IA</p>
                  <p className="text-sm text-muted-foreground">Usar IA para auxiliar nos tickets</p>
                </div>
                <Switch
                  checked={panel.ai?.enabled || false}
                  onCheckedChange={(enabled) => setPanel({ ...panel, ai: { ...panel.ai, enabled } })}
                />
              </div>
              {panel.ai?.enabled && (
                <div className="space-y-2">
                  <Label>Instruções da IA</Label>
                  <Textarea
                    value={panel.ai?.instructions || ""}
                    onChange={(e) => setPanel({ ...panel, ai: { ...panel.ai, instructions: e.target.value } })}
                    placeholder="Instruções personalizadas para a IA..."
                    rows={5}
                  />
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
