"use client"

import { useState, useEffect, useRef } from "react"
import { X, Download, Loader2, MessageSquare, User, Bot, Paperclip, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  author: {
    id: string
    username: string
    displayName?: string
    avatar?: string
    bot?: boolean
  }
  content: string
  timestamp: string
  attachments?: {
    name: string
    url: string
    contentType?: string
  }[]
  embeds?: {
    title?: string
    description?: string
    color?: number
  }[]
}

interface TranscriptModalProps {
  ticketId: number
  channelId: string
  isOpen: boolean
  onClose: () => void
}

export function TranscriptModal({ ticketId, channelId, isOpen, onClose }: TranscriptModalProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && channelId) {
      fetchTranscript()
    }
  }, [isOpen, channelId])

  const fetchTranscript = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/tickets/${channelId}/transcript`)
      const data = await res.json()
      
      if (data.error) {
        setError(data.error)
        setMessages([])
      } else {
        setMessages(data.messages || [])
      }
    } catch (err) {
      setError("Erro ao carregar transcript")
      setMessages([])
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const downloadTranscript = () => {
    const content = messages.map(msg => {
      const time = formatTime(msg.timestamp)
      const author = msg.author.displayName || msg.author.username
      let text = `[${time}] ${author}: ${msg.content}`
      
      if (msg.attachments?.length) {
        text += `\n  Anexos: ${msg.attachments.map(a => a.name).join(', ')}`
      }
      
      return text
    }).join('\n\n')

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ticket-${ticketId}-transcript.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-3xl max-h-[85vh] mx-4 bg-card border border-border rounded-xl shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-secondary">
              <MessageSquare className="h-5 w-5 text-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Transcript do Ticket #{ticketId}
              </h2>
              <p className="text-sm text-muted-foreground">
                {messages.length} mensagens
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <Button variant="outline" size="sm" onClick={downloadTranscript}>
                <Download className="h-4 w-4 mr-2" />
                Baixar
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">{error}</p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                O transcript pode não estar disponível para este ticket
              </p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">Nenhuma mensagem encontrada</p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div 
                key={msg.id || index}
                className={cn(
                  "flex gap-3 p-3 rounded-lg transition-colors hover:bg-secondary/30",
                  msg.author.bot && "bg-secondary/20"
                )}
              >
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {msg.author.avatar ? (
                    <img 
                      src={msg.author.avatar} 
                      alt={msg.author.username}
                      className="h-10 w-10 rounded-full"
                    />
                  ) : (
                    <div className={cn(
                      "h-10 w-10 rounded-full flex items-center justify-center",
                      msg.author.bot ? "bg-primary" : "bg-secondary"
                    )}>
                      {msg.author.bot ? (
                        <Bot className="h-5 w-5 text-primary-foreground" />
                      ) : (
                        <User className="h-5 w-5 text-foreground" />
                      )}
                    </div>
                  )}
                </div>

                {/* Message Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className={cn(
                      "font-semibold text-sm",
                      msg.author.bot ? "text-primary" : "text-foreground"
                    )}>
                      {msg.author.displayName || msg.author.username}
                    </span>
                    {msg.author.bot && (
                      <span className="text-[10px] font-medium uppercase px-1.5 py-0.5 rounded bg-primary text-primary-foreground">
                        BOT
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                  
                  {/* Text Content */}
                  {msg.content && (
                    <p className="text-sm text-foreground/90 mt-1 whitespace-pre-wrap break-words">
                      {msg.content}
                    </p>
                  )}

                  {/* Embeds */}
                  {msg.embeds?.map((embed, i) => (
                    <div 
                      key={i}
                      className="mt-2 p-3 rounded-lg border-l-4 bg-secondary/50"
                      style={{ borderColor: embed.color ? `#${embed.color.toString(16).padStart(6, '0')}` : 'var(--border)' }}
                    >
                      {embed.title && (
                        <p className="font-semibold text-sm text-foreground">{embed.title}</p>
                      )}
                      {embed.description && (
                        <p className="text-sm text-muted-foreground mt-1">{embed.description}</p>
                      )}
                    </div>
                  ))}

                  {/* Attachments */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {msg.attachments.map((att, i) => (
                        <a
                          key={i}
                          href={att.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors text-sm"
                        >
                          {att.contentType?.startsWith('image/') ? (
                            <ImageIcon className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Paperclip className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="text-foreground truncate max-w-[200px]">
                            {att.name}
                          </span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  )
}
