"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase/client"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Navigation } from "@/components/navigation"
import { ChatSidebar } from "@/components/chat-sidebar"
import { Send, User, Loader2, Sparkles, ArrowLeft, LogIn } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  emotion?: string
  timestamp: Date
  isTyping?: boolean
}

interface DbMessage {
  id: string
  role: "user" | "assistant"
  content: string
  emotion?: string
  created_at: string
}

const emotionThemes: Record<
  string,
  { bgGradient: string; accentColor: string; borderColor: string; description: string }
> = {
  happy: {
    bgGradient:
      "from-yellow-50 via-amber-50 to-orange-50 dark:from-yellow-950/20 dark:via-amber-950/20 dark:to-orange-950/20",
    accentColor: "text-amber-600 dark:text-amber-400",
    borderColor: "border-amber-200 dark:border-amber-800",
    description: "Warm and energetic",
  },
  sad: {
    bgGradient:
      "from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20",
    accentColor: "text-indigo-600 dark:text-indigo-400",
    borderColor: "border-indigo-200 dark:border-indigo-800",
    description: "Gentle and supportive",
  },
  anxious: {
    bgGradient: "from-teal-50 via-cyan-50 to-sky-50 dark:from-teal-950/20 dark:via-cyan-950/20 dark:to-sky-950/20",
    accentColor: "text-teal-600 dark:text-teal-400",
    borderColor: "border-teal-200 dark:border-teal-800",
    description: "Calm and grounding",
  },
  angry: {
    bgGradient: "from-rose-50 via-pink-50 to-red-50 dark:from-rose-950/20 dark:via-pink-950/20 dark:to-red-950/20",
    accentColor: "text-rose-600 dark:text-rose-400",
    borderColor: "border-rose-200 dark:border-rose-800",
    description: "Validating and understanding",
  },
  stressed: {
    bgGradient:
      "from-emerald-50 via-green-50 to-lime-50 dark:from-emerald-950/20 dark:via-green-950/20 dark:to-lime-950/20",
    accentColor: "text-emerald-600 dark:text-emerald-400",
    borderColor: "border-emerald-200 dark:border-emerald-800",
    description: "Peaceful and refreshing",
  },
  hopeful: {
    bgGradient: "from-lime-50 via-green-50 to-teal-50 dark:from-lime-950/20 dark:via-green-950/20 dark:to-teal-950/20",
    accentColor: "text-green-600 dark:text-green-400",
    borderColor: "border-green-200 dark:border-green-800",
    description: "Uplifting and forward-moving",
  },
  neutral: {
    bgGradient: "from-gray-50 via-slate-50 to-zinc-50 dark:from-gray-950/20 dark:via-slate-950/20 dark:to-zinc-950/20",
    accentColor: "text-slate-600 dark:text-slate-400",
    borderColor: "border-slate-200 dark:border-slate-800",
    description: "Balanced and grounded",
  },
}

const emotionColors: Record<string, string> = {
  happy: "bg-chart-3/20 text-chart-3 border-chart-3/30",
  sad: "bg-primary/20 text-primary border-primary/30",
  anxious: "bg-chart-4/20 text-chart-4 border-chart-4/30",
  angry: "bg-destructive/20 text-destructive border-destructive/30",
  neutral: "bg-secondary/20 text-secondary-foreground border-secondary/30",
  stressed: "bg-chart-5/20 text-chart-5 border-chart-5/30",
  hopeful: "bg-chart-2/20 text-chart-2 border-chart-2/30",
}

function detectEmotion(text: string): string {
  const lowerText = text.toLowerCase()
  if (/(happy|joy|excited|great|wonderful|amazing|good|fantastic|blessed)/i.test(lowerText)) return "happy"
  if (/(sad|depressed|down|unhappy|miserable|crying|tears|lonely)/i.test(lowerText)) return "sad"
  if (/(anxious|worried|nervous|scared|fear|panic|stress|overwhelmed)/i.test(lowerText)) return "anxious"
  if (/(angry|frustrated|annoyed|mad|furious|irritated)/i.test(lowerText)) return "angry"
  if (/(hope|hopeful|optimistic|looking forward|better|improve)/i.test(lowerText)) return "hopeful"
  if (/(stress|pressure|tension|burden|exhausted|tired)/i.test(lowerText)) return "stressed"
  return "neutral"
}

async function typeMessage(fullText: string, onUpdate: (text: string) => void, minDelay = 30, maxDelay = 80) {
  let currentText = ""
  for (let i = 0; i < fullText.length; i++) {
    await new Promise((resolve) => {
      setTimeout(
        () => {
          currentText += fullText[i]
          onUpdate(currentText)
          resolve(null)
        },
        Math.random() * (maxDelay - minDelay) + minDelay,
      )
    })
  }
}

export default function ChatPage() {
  const router = useRouter()
  const supabase = createBrowserClient()
  const { user, loading: authLoading } = useAuth()

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hi there! I'm your mental health companion. I'm here to listen and support you. How are you feeling today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [currentMood, setCurrentMood] = useState<string>("neutral")
  const [currentSessionId, setCurrentSessionId] = useState<string | undefined>()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const mountedRef = useRef(true)
  const abortControllerRef = useRef<AbortController | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    mountedRef.current = true

    return () => {
      mountedRef.current = false
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  async function createSession(firstMessage: string) {
    if (!user) return null

    const title = firstMessage.slice(0, 50) + (firstMessage.length > 50 ? "..." : "")

    const { data, error } = await supabase
      .from("chat_sessions")
      .insert({
        user_id: user.id,
        title,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating session:", error)
      return null
    }

    return data.id
  }

  async function saveMessage(sessionId: string, role: "user" | "assistant", content: string, emotion?: string) {
    if (!user || !sessionId) return

    const { error } = await supabase.from("chat_messages").insert({
      session_id: sessionId,
      user_id: user.id,
      role,
      content,
      emotion,
    })
    if (error) {
      console.error("Error saving message:", error)
    }

    await supabase.from("chat_sessions").update({ updated_at: new Date().toISOString() }).eq("id", sessionId)
  }

  async function loadSession(sessionId: string) {
    if (!user) return

    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Error loading messages:", error)
      return
    }

    const loadedMessages: Message[] = (data as DbMessage[]).map((msg) => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      emotion: msg.emotion || undefined,
      timestamp: new Date(msg.created_at),
    }))

    if (loadedMessages.length === 0) {
      loadedMessages.push({
        id: "welcome",
        role: "assistant",
        content:
          "Hi there! I'm your mental health companion. I'm here to listen and support you. How are you feeling today?",
        timestamp: new Date(),
      })
    }

    setMessages(loadedMessages)
    setCurrentSessionId(sessionId)
  }

  function handleNewChat() {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content:
          "Hi there! I'm your mental health companion. I'm here to listen and support you. How are you feeling today?",
        timestamp: new Date(),
      },
    ])
    setCurrentSessionId(undefined)
    setCurrentMood("neutral")
  }

  async function handleSend() {
    if (!input.trim() || isLoading) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      emotion: detectEmotion(input),
      timestamp: new Date(),
    };

    setCurrentMood(userMessage.emotion || "neutral");
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError("");

    let sessionId = currentSessionId;
    if (user && !sessionId) {
      sessionId = await createSession(userMessage.content);
      if (sessionId) {
        setCurrentSessionId(sessionId);
      }
    }
    if (user && sessionId) {
      await saveMessage(sessionId, "user", userMessage.content, userMessage.emotion);
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage.content }),
        signal: abortControllerRef.current.signal,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to get response");
      }

      if (!mountedRef.current) return;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "",
        timestamp: new Date(),
        isTyping: true,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      await typeMessage(data.reply, (newContent) => {
        if (mountedRef.current) {
          setMessages((prev) =>
            prev.map((msg) => (msg.id === assistantMessage.id ? { ...msg, content: newContent } : msg)),
          );
        }
      });

      if (mountedRef.current) {
        setMessages((prev) => prev.map((msg) => (msg.id === assistantMessage.id ? { ...msg, isTyping: false } : msg)));
      }

      if (user && sessionId) {
        await saveMessage(sessionId, "assistant", data.reply);
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      if (mountedRef.current) {
        console.error("Chat error:", err);
        setError(err instanceof Error ? err.message : "Failed to connect to AI. Please try again.");
        
        // Optionally add a fallback message
        if (!messages.some(m => m.role === "assistant" && m.timestamp > new Date(Date.now() - 5000))) {
          const fallbackMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: "I'm having trouble connecting right now. Please try again in a moment. I'm here to listen when you're ready.",
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, fallbackMessage]);
        }
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  } // <-- This is the missing closing brace for handleSend

  // The rest of your component (JSX) would go here
  // Make sure you have the return statement with all your JSX
  
  return (
    <div>
      {/* Your JSX content here */}
    </div>
  )
} // <-- This closes the ChatPage component