"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Loader2, Check } from "lucide-react"

interface Settings {
  dmNotifications: boolean
  ratingSystem: boolean
  transcripts: boolean
  autoClose: boolean
  inactivityTime: number
  maxTicketsPerUser: number
  logsChannelId: string | null
  staffRoleId: string | null
  adminRoleId: string | null
}

const defaultSettings: Settings = {
  dmNotifications: true,
  ratingSystem: true,
  transcripts: true,
  autoClose: false,
  inactivityTime: 24,
  maxTicketsPerUser: 2,
  logsChannelId: null,
  staffRoleId: null,
  adminRoleId: null,
}

export default function ConfiguracoesPage() {
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings")
      const data = await res.json()
      setSettings({ ...defaultSettings, ...data })
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    setSaving(true)
    setSaved(false)
    try {
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (error) {
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="pl-64">
        <Header title="Configurações" description="Configurações gerais do bot" />
        <main className="p-8 max-w-3xl">
          {/* Notificações */}
          <div className="rounded-lg border border-border bg-card">
            <div className="border-b border-border p-5">
              <h3 className="font-medium text-foreground">Notificações</h3>
              <p className="text-sm text-muted-foreground">Configurar notificações do sistema</p>
            </div>
            <div className="divide-y divide-border">
              <div className="flex items-center justify-between p-5">
                <div>
                  <p className="text-sm font-medium text-foreground">Notificações por DM</p>
                  <p className="text-sm text-muted-foreground">Enviar notificações via mensagem direta</p>
                </div>
                <Switch
                  checked={settings.dmNotifications}
                  onCheckedChange={(dmNotifications) => setSettings({ ...settings, dmNotifications })}
                />
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="mt-6 rounded-lg border border-border bg-card">
            <div className="border-b border-border p-5">
              <h3 className="font-medium text-foreground">Funcionalidades</h3>
              <p className="text-sm text-muted-foreground">Ativar ou desativar recursos</p>
            </div>
            <div className="divide-y divide-border">
              <div className="flex items-center justify-between p-5">
                <div>
                  <p className="text-sm font-medium text-foreground">Sistema de Avaliação</p>
                  <p className="text-sm text-muted-foreground">Solicitar avaliação ao fechar tickets</p>
                </div>
                <Switch
                  checked={settings.ratingSystem}
                  onCheckedChange={(ratingSystem) => setSettings({ ...settings, ratingSystem })}
                />
              </div>
              <div className="flex items-center justify-between p-5">
                <div>
                  <p className="text-sm font-medium text-foreground">Transcripts</p>
                  <p className="text-sm text-muted-foreground">Salvar histórico dos tickets</p>
                </div>
                <Switch
                  checked={settings.transcripts}
                  onCheckedChange={(transcripts) => setSettings({ ...settings, transcripts })}
                />
              </div>
            </div>
          </div>

          {/* Auto Close */}
          <div className="mt-6 rounded-lg border border-border bg-card">
            <div className="border-b border-border p-5">
              <h3 className="font-medium text-foreground">Fechamento Automático</h3>
              <p className="text-sm text-muted-foreground">Fechar tickets inativos automaticamente</p>
            </div>
            <div className="divide-y divide-border">
              <div className="flex items-center justify-between p-5">
                <div>
                  <p className="text-sm font-medium text-foreground">Ativar fechamento automático</p>
                  <p className="text-sm text-muted-foreground">Fechar tickets sem atividade</p>
                </div>
                <Switch
                  checked={settings.autoClose}
                  onCheckedChange={(autoClose) => setSettings({ ...settings, autoClose })}
                />
              </div>
              {settings.autoClose && (
                <div className="flex items-center justify-between p-5">
                  <div>
                    <p className="text-sm font-medium text-foreground">Tempo de inatividade</p>
                    <p className="text-sm text-muted-foreground">Horas sem mensagens para fechar</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={settings.inactivityTime}
                      onChange={(e) => setSettings({ ...settings, inactivityTime: parseInt(e.target.value) || 24 })}
                      className="w-20 text-center"
                    />
                    <span className="text-sm text-muted-foreground">horas</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Limites */}
          <div className="mt-6 rounded-lg border border-border bg-card">
            <div className="border-b border-border p-5">
              <h3 className="font-medium text-foreground">Limites</h3>
              <p className="text-sm text-muted-foreground">Configurar limites do sistema</p>
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Tickets por usuário</p>
                  <p className="text-sm text-muted-foreground">Máximo de tickets abertos por usuário</p>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={settings.maxTicketsPerUser}
                    onChange={(e) => setSettings({ ...settings, maxTicketsPerUser: parseInt(e.target.value) || 2 })}
                    className="w-20 text-center"
                  />
                  <span className="text-sm text-muted-foreground">tickets</span>
                </div>
              </div>
            </div>
          </div>

          {/* IDs do Discord */}
          <div className="mt-6 rounded-lg border border-border bg-card">
            <div className="border-b border-border p-5">
              <h3 className="font-medium text-foreground">IDs do Discord</h3>
              <p className="text-sm text-muted-foreground">Configurar canais e cargos padrão</p>
            </div>
            <div className="divide-y divide-border">
              <div className="flex items-center justify-between p-5">
                <div>
                  <p className="text-sm font-medium text-foreground">Canal de Logs</p>
                  <p className="text-sm text-muted-foreground">ID do canal para enviar logs</p>
                </div>
                <Input
                  value={settings.logsChannelId || ""}
                  onChange={(e) => setSettings({ ...settings, logsChannelId: e.target.value || null })}
                  placeholder="ID do canal"
                  className="w-48"
                />
              </div>
              <div className="flex items-center justify-between p-5">
                <div>
                  <p className="text-sm font-medium text-foreground">Cargo Staff</p>
                  <p className="text-sm text-muted-foreground">ID do cargo de atendentes</p>
                </div>
                <Input
                  value={settings.staffRoleId || ""}
                  onChange={(e) => setSettings({ ...settings, staffRoleId: e.target.value || null })}
                  placeholder="ID do cargo"
                  className="w-48"
                />
              </div>
              <div className="flex items-center justify-between p-5">
                <div>
                  <p className="text-sm font-medium text-foreground">Cargo Admin</p>
                  <p className="text-sm text-muted-foreground">ID do cargo de administradores</p>
                </div>
                <Input
                  value={settings.adminRoleId || ""}
                  onChange={(e) => setSettings({ ...settings, adminRoleId: e.target.value || null })}
                  placeholder="ID do cargo"
                  className="w-48"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" onClick={fetchSettings}>Cancelar</Button>
            <Button onClick={saveSettings} disabled={saving} className="min-w-[100px]">
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : saved ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Salvo
                </>
              ) : (
                "Salvar"
              )}
            </Button>
          </div>
        </main>
      </div>
    </div>
  )
}
