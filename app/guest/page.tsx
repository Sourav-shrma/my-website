"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Navigation } from "@/components/navigation"
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

export default function GuestChatPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hi there! Welcome to MindfulU! I'm here to support you on your mental wellness journey. This is a guest session, so your messages won't be saved - but you have full access to all features. How are you feeling today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [currentMood, setCurrentMood] = useState<string>("neutral")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  async function handleSend() {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      emotion: detectEmotion(input),
      timestamp: new Date(),
    }

    setCurrentMood(userMessage.emotion || "neutral")

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    setError("")

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage.content }),
      })

      if (!res.ok) {
        throw new Error("Failed to get response")
      }

      const { reply } = await res.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "",
        timestamp: new Date(),
        isTyping: true,
      }

      setMessages((prev) => [...prev, assistantMessage])

      await typeMessage(reply, (newContent) => {
        setMessages((prev) =>
          prev.map((msg) => (msg.id === assistantMessage.id ? { ...msg, content: newContent } : msg)),
        )
      })

      setMessages((prev) => prev.map((msg) => (msg.id === assistantMessage.id ? { ...msg, isTyping: false } : msg)))
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const themeConfig = emotionThemes[currentMood] || emotionThemes.neutral

  return (
    <div className={`min-h-screen bg-gradient-to-br ${themeConfig.bgGradient} transition-all duration-1000 ease-out`}>
      <Navigation />
      <div className="flex flex-col h-screen pt-16">
        <div className="border-b border-border/50 backdrop-blur-sm px-4 md:px-8 py-3">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <Button onClick={() => router.push("/")} variant="ghost" size="sm" className="gap-2">
              <ArrowLeft size={18} />
              Back to Home
            </Button>

            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="bg-sky-100 text-sky-700 border-sky-200">
                Guest Mode
              </Badge>
              <Link href="/guest/journal">
                <Button variant="ghost" size="sm">
                  Journal
                </Button>
              </Link>
              <Link href="/guest/analytics">
                <Button variant="ghost" size="sm">
                  Analytics
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="sm" className="gap-2 bg-gradient-to-r from-sky-500 to-blue-600">
                  <LogIn size={16} />
                  Sign Up Free
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-3xl mx-auto space-y-4">
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`flex gap-3 max-w-xs md:max-w-xl lg:max-w-2xl ${
                      message.role === "user" ? "flex-row-reverse" : ""
                    }`}
                  >
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        message.role === "user"
                          ? `bg-gradient-to-br ${themeConfig.borderColor} text-white`
                          : `bg-gradient-to-br from-blue-400 to-purple-400 text-white`
                      }`}
                    >
                      {message.role === "user" ? <User size={16} /> : <Sparkles size={16} />}
                    </div>
                    <div>
                      <Card
                        className={`${
                          message.role === "user"
                            ? `bg-white dark:bg-slate-800 ${themeConfig.borderColor} border-2`
                            : `bg-white/50 dark:bg-slate-800/50 backdrop-blur ${themeConfig.borderColor} border-2`
                        } rounded-2xl`}
                      >
                        <CardContent className="pt-4">
                          <p className="text-sm md:text-base leading-relaxed">
                            {message.content}
                            {message.isTyping && (
                              <span className="inline-block ml-1 w-2 h-4 bg-current rounded-full animate-pulse" />
                            )}
                          </p>
                        </CardContent>
                      </Card>
                      {message.emotion && message.role === "user" && (
                        <div className="mt-2">
                          <Badge variant="outline" className={emotionColors[message.emotion]}>
                            {message.emotion}
                          </Badge>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="border-t border-border/50 backdrop-blur-sm p-4 md:p-6">
          <div className="max-w-3xl mx-auto space-y-3">
            {currentMood !== "neutral" && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`text-center text-sm font-medium ${themeConfig.accentColor}`}
              >
                {themeConfig.description} • I'm here to support you
              </motion.div>
            )}

            {error && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                placeholder="Share how you're feeling..."
                className="resize-none min-h-12 rounded-xl border-2"
                disabled={isLoading}
              />
              <Button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                size="lg"
                className={`rounded-xl flex-shrink-0 ${themeConfig.accentColor.replace("text-", "bg-")} text-white hover:opacity-90 transition-all`}
              >
                {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
