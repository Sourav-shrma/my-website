"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { MessageSquare, Plus, Trash2, Clock, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { format, isToday, isYesterday, isThisWeek } from "date-fns"

interface ChatSession {
  id: string
  title: string
  created_at: string
  updated_at: string
}

interface ChatSidebarProps {
  currentSessionId?: string
  onNewChat: () => void
  onSelectSession: (sessionId: string) => void
  isGuest?: boolean
}

export function ChatSidebar({ currentSessionId, onNewChat, onSelectSession, isGuest = false }: ChatSidebarProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [loading, setLoading] = useState(true)
  const [collapsed, setCollapsed] = useState(false)
  const supabase = createBrowserClient()

  useEffect(() => {
    if (!isGuest) {
      loadSessions()
    } else {
      setLoading(false)
    }
  }, [isGuest])

  async function loadSessions() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data, error } = await supabase
        .from("chat_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })

      if (error) throw error
      setSessions(data || [])
    } catch (error) {
      console.error("Error loading sessions:", error)
    } finally {
      setLoading(false)
    }
  }

  async function deleteSession(sessionId: string, e: React.MouseEvent) {
    e.stopPropagation()
    try {
      const { error } = await supabase.from("chat_sessions").delete().eq("id", sessionId)
      if (error) throw error
      setSessions((prev) => prev.filter((s) => s.id !== sessionId))
      if (currentSessionId === sessionId) onNewChat()
    } catch (error) {
      console.error("Error deleting session:", error)
    }
  }

  function formatSessionDate(dateStr: string) {
    const date = new Date(dateStr)
    if (isToday(date)) return "Today"
    if (isYesterday(date)) return "Yesterday"
    if (isThisWeek(date)) return format(date, "EEEE")
    return format(date, "MMM d")
  }

  function groupSessionsByDate(sessions: ChatSession[]) {
    const groups: { [key: string]: ChatSession[] } = {}
    sessions.forEach((session) => {
      const key = formatSessionDate(session.updated_at)
      if (!groups[key]) groups[key] = []
      groups[key].push(session)
    })
    return groups
  }

  const groupedSessions = groupSessionsByDate(sessions)

  if (isGuest) {
    return (
      <div className={cn(
        "h-full border-r border-border/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm transition-all duration-300",
        collapsed ? "w-16" : "w-72",
      )}>
        <div className="p-4 border-b border-border/50 flex items-center justify-between">
          {!collapsed && <h2 className="font-semibold text-sm">Chat History</h2>}
          <Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </Button>
        </div>
        <div className="p-4">
          {!collapsed && (
            <div className="text-center text-sm text-muted-foreground">
              <p className="mb-4">Sign in to save your chat history</p>
              <Button asChild size="sm" className="w-full bg-gradient-to-r from-indigo-500 to-purple-600">
                <a href="/auth/login">Sign In</a>
              </Button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={cn(
      "h-full border-r border-border/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm transition-all duration-300 flex flex-col",
      collapsed ? "w-16" : "w-72",
    )}>
      <div className="p-4 border-b border-border/50 flex items-center justify-between">
        {!collapsed && <h2 className="font-semibold text-sm">Chat History</h2>}
        <Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </Button>
      </div>

      <div className="p-2">
        <Button
          onClick={onNewChat}
          className={cn(
            "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700",
            collapsed ? "w-full p-2" : "w-full",
          )}
          size={collapsed ? "icon" : "default"}
        >
          <Plus size={18} />
          {!collapsed && <span className="ml-2">New Chat</span>}
        </Button>
      </div>

  <ScrollArea className="flex-1 px-2">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : sessions.length === 0 ? (
          !collapsed && (
            <div className="text-center py-8 text-sm text-muted-foreground">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No conversations yet</p>
              <p className="text-xs mt-1">Start chatting to create one</p>
            </div>
          )
        ) : (
          Object.entries(groupedSessions).map(([date, dateSessions]) => (
            <div key={date} className="mb-4">
              {!collapsed && (
                <div className="flex items-center gap-2 px-2 py-1 text-xs text-muted-foreground">
                  <Clock size={12} />
                  {date}
                </div>
              )}
              <div className="space-y-1">
                {dateSessions.map((session) => (
                  <div
                    key={session.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => onSelectSession(session.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onSelectSession(session.id);
                      }
                    }}
                    className={cn(
                      "w-full text-left rounded-lg p-2 transition-colors group cursor-pointer",
                      currentSessionId === session.id
                        ? "bg-indigo-100 dark:bg-indigo-900/30"
                        : "hover:bg-slate-100 dark:hover:bg-slate-800/50",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <MessageSquare size={16} className="flex-shrink-0 text-muted-foreground" />
                      {!collapsed && (
                        <>
                          <span className="text-sm truncate flex-1">{session.title}</span>
                          {/* Fixed: Replaced Button with accessible div */}
                          <div
                            role="button"
                            tabIndex={0}
                            onClick={(e) => deleteSession(session.id, e)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                e.stopPropagation();
                                deleteSession(session.id, e as any);
                              }
                            }}
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded hover:bg-red-100 dark:hover:bg-red-900/20 cursor-pointer"
                            aria-label="Delete session"
                          >
                            <Trash2 size={14} className="text-muted-foreground hover:text-destructive" />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </ScrollArea>
    </div>
  )
}