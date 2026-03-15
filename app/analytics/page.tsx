"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/page-header"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line,
} from "recharts"
import { TrendingUp, Calendar, Heart, Activity, Loader2 } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"
import { useAuth } from "@/contexts/auth-context"

const EMOTION_COLORS: Record<string, string> = {
  happy:   "#f59e0b",
  calm:    "#6366f1",
  hopeful: "#22c55e",
  neutral: "#94a3b8",
  anxious: "#14b8a6",
  sad:     "#3b82f6",
  angry:   "#f43f5e",
  stressed:"#10b981",
}

const EMOTION_SCORE: Record<string, number> = {
  happy: 9, hopeful: 8, calm: 7, neutral: 5,
  anxious: 4, stressed: 3, sad: 3, angry: 2,
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

interface AnalyticsData {
  weeklyMood: { day: string; mood: number }[]
  emotionDist: { name: string; value: number; color: string }[]
  monthlyTrend: { week: string; average: number }[]
  mostFrequentMood: string
  mostFrequentPct: number
  weeklyAverage: number
  weeklyDiff: number
  streak: number
  trend: string
  insights: string[]
}
interface ChatMessage {
  emotion: string | null
  created_at: string
}
export default function AnalyticsPage() {
  const { user } = useAuth()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    fetchAnalytics()
  }, [user])

  async function fetchAnalytics() {
    const supabase = createBrowserClient()
    setLoading(true)

    // Fetch last 30 days of messages with emotions
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: messages } = await supabase
      .from("chat_messages")
      .select("emotion, created_at")
      .eq("role", "user")
      .gte("created_at", thirtyDaysAgo.toISOString())
      .order("created_at", { ascending: true })

    if (!messages || messages.length === 0) {
      setData(getEmptyState())
      setLoading(false)
      return
    }

    // --- Emotion Distribution ---
    const emotionCount: Record<string, number> = {}
    messages.forEach((m: ChatMessage)  => {
      const e = m.emotion || "neutral"
      emotionCount[e] = (emotionCount[e] || 0) + 1
    })
    const total = messages.length
    const emotionDist = Object.entries(emotionCount)
      .map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value: Math.round((value / total) * 100),
        color: EMOTION_COLORS[name] || "#94a3b8",
      }))
      .sort((a, b) => b.value - a.value)

    // --- Most Frequent Mood ---
    const topEmotion = Object.entries(emotionCount).sort((a, b) => b[1] - a[1])[0]
    const mostFrequentMood = topEmotion?.[0] || "neutral"
    const mostFrequentPct = Math.round(((topEmotion?.[1] || 0) / total) * 100)

    // --- Weekly Mood (last 7 days) ---
    const last7Days: Record<string, { total: number; count: number }> = {}
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      last7Days[d.toDateString()] = { total: 0, count: 0 }
    }
    messages
      .filter((m: ChatMessage) =>{
        const d = new Date(m.created_at)
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        return d >= sevenDaysAgo
      })
      .forEach((m: ChatMessage)=> {
        const key = new Date(m.created_at).toDateString()
        if (last7Days[key]) {
          last7Days[key].total += EMOTION_SCORE[m.emotion || "neutral"] || 5
          last7Days[key].count += 1
        }
      })

    const weeklyMood = Object.entries(last7Days).map(([dateStr, val]) => ({
      day: DAYS[new Date(dateStr).getDay()],
      mood: val.count > 0 ? Math.round((val.total / val.count) * 10) / 10 : 0,
    }))

    // --- Weekly Average ---
    const thisWeekMsgs = messages.filter((m: ChatMessage) => {
      const d = new Date(m.created_at)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      return d >= sevenDaysAgo
    })
    const lastWeekMsgs = messages.filter((m: ChatMessage) => {
      const d = new Date(m.created_at)
      const fourteenDaysAgo = new Date()
      const sevenDaysAgo = new Date()
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      return d >= fourteenDaysAgo && d < sevenDaysAgo
    })

    const avg = (msgs: typeof messages) =>
  msgs.length > 0
    ? Math.round((msgs.reduce((s: number, m: { emotion: string | null; created_at: string }) => 
        s + (EMOTION_SCORE[m.emotion || "neutral"] || 5), 0) / msgs.length) * 10) / 10
    : 0

    const weeklyAverage = avg(thisWeekMsgs)
    const lastWeekAverage = avg(lastWeekMsgs)
    const weeklyDiff = Math.round((weeklyAverage - lastWeekAverage) * 10) / 10

    // --- Monthly Trend (4 weeks) ---
    const monthlyTrend = [1, 2, 3, 4].map((week) => {
      const end = new Date()
      end.setDate(end.getDate() - (4 - week) * 7)
      const start = new Date(end)
      start.setDate(start.getDate() - 7)
      const weekMsgs = messages.filter((m: ChatMessage) => {
        const d = new Date(m.created_at)
        return d >= start && d < end
      })
      return {
        week: `Week ${week}`,
        average: avg(weekMsgs),
      }
    })

    // --- Streak (consecutive days with chat activity) ---
    const activeDays = new Set(messages.map((m: ChatMessage) => new Date(m.created_at).toDateString()))
    let streak = 0
    const today = new Date()
    for (let i = 0; i <= 60; i++) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      if (activeDays.has(d.toDateString())) streak++
      else if (i > 0) break
    }

    // --- Trend ---
    const recentAvg = avg(thisWeekMsgs)
    const trend = recentAvg >= 7 ? "Excellent" : recentAvg >= 6 ? "Improving" : recentAvg >= 4 ? "Stable" : "Needs Attention"

    // --- Insights ---
    const insights: string[] = []
    if (weeklyDiff > 0) insights.push(`Your mood improved by ${weeklyDiff} points compared to last week 🎉`)
    if (streak >= 3) insights.push(`You've maintained a ${streak}-day chat streak — great consistency!`)
    const weekendMsgs = messages.filter((m: ChatMessage) => [0, 6].includes(new Date(m.created_at).getDay()))
    if (weekendMsgs.length > 0 && avg(weekendMsgs) > weeklyAverage)
      insights.push("You tend to feel better on weekends")
    if (emotionCount["anxious"] > 0)
      insights.push("Consider journaling on anxious days to identify triggers")
    if (mostFrequentMood === "happy" || mostFrequentMood === "calm")
      insights.push(`${mostFrequentPct}% of your check-ins show positive emotions — keep it up!`)
    if (insights.length === 0)
      insights.push("Keep chatting daily to build up your analytics insights!")

    setData({
      weeklyMood, emotionDist, monthlyTrend,
      mostFrequentMood, mostFrequentPct,
      weeklyAverage, weeklyDiff, streak, trend, insights,
    })
    setLoading(false)
  }

  function getEmptyState(): AnalyticsData {
    return {
      weeklyMood: DAYS.map((day) => ({ day, mood: 0 })),
      emotionDist: [],
      monthlyTrend: [1,2,3,4].map((w) => ({ week: `Week ${w}`, average: 0 })),
      mostFrequentMood: "—",
      mostFrequentPct: 0,
      weeklyAverage: 0,
      weeklyDiff: 0,
      streak: 0,
      trend: "No data yet",
      insights: ["Start chatting to see your personalized analytics here!"],
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen">
        <PageHeader title="Analytics" />
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-xl font-semibold mb-2">Sign in to view your analytics</h2>
          <p className="text-muted-foreground">Your mood data is saved when you're logged in.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const d = data!
  const trendColor =
    d.trend === "Excellent" ? "text-green-500" :
    d.trend === "Improving" ? "text-yellow-500" :
    d.trend === "Stable" ? "text-blue-500" : "text-red-500"

  return (
    <div className="min-h-screen">
      <PageHeader title="Analytics" />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Mood Analytics</h1>
          <p className="mt-2 text-muted-foreground">Understand your emotional patterns and track your progress</p>
        </div>

        {/* Summary Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Most Frequent Mood</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-chart-1 capitalize">{d.mostFrequentMood}</div>
              <p className="text-xs text-muted-foreground">{d.mostFrequentPct}% of check-ins</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Weekly Average</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-chart-2">{d.weeklyAverage}/10</div>
              <p className="text-xs text-muted-foreground">
                {d.weeklyDiff >= 0 ? "+" : ""}{d.weeklyDiff} from last week
              </p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Chat Streak</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-chart-3">{d.streak} days</div>
              <p className="text-xs text-muted-foreground">{d.streak > 0 ? "Keep it going!" : "Start chatting!"}</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Emotional Trend</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${trendColor}`}>{d.trend}</div>
              <p className="text-xs text-muted-foreground">Based on this month</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Weekly Mood Tracker</CardTitle>
              <CardDescription>Your mood scores for the past 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={d.weeklyMood}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" domain={[0, 10]} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                  <Bar dataKey="mood" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle>Emotion Distribution</CardTitle>
              <CardDescription>Breakdown of your emotional states</CardDescription>
            </CardHeader>
            <CardContent>
              {d.emotionDist.length === 0 ? (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No emotion data yet — start chatting!
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={d.emotionDist}
                      cx="50%" cy="50%"
                      labelLine={false}
                    label={({ name, percent }) =>
  `${String(name)} ${(((percent as number) ?? 0) * 100).toFixed(0)}%`}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {d.emotionDist.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card className="border-border lg:col-span-2">
            <CardHeader>
              <CardTitle>Monthly Emotional Trend</CardTitle>
              <CardDescription>Average mood score per week over the past month</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={d.monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" domain={[0, 10]} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                  <Line type="monotone" dataKey="average" stroke="hsl(var(--chart-3))" strokeWidth={3} dot={{ fill: "hsl(var(--chart-3))", r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6 border-border bg-accent/20">
          <CardHeader>
            <CardTitle>Insights & Observations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 leading-relaxed">
            {d.insights.map((insight, i) => (
              <p key={i} className="text-sm text-muted-foreground">• {insight}</p>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}