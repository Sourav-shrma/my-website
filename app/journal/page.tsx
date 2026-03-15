"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { PageHeader } from "@/components/page-header"
import { Smile, Meh, Frown, Heart, ThumbsUp, Sparkles, Calendar, Trash2, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"

const moods = [
  { label: "Great", icon: Smile, color: "text-chart-4" },
  { label: "Good", icon: ThumbsUp, color: "text-chart-3" },
  { label: "Okay", icon: Meh, color: "text-chart-2" },
  { label: "Not Great", icon: Frown, color: "text-chart-1" },
  { label: "Struggling", icon: Heart, color: "text-destructive" },
]

interface JournalEntry {
  id: string
  date: string
  timestamp: number
  mood: string
  content: string
}

export default function JournalPage() {
  const [entry, setEntry] = useState("")
  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [viewMode, setViewMode] = useState<"write" | "history">("write")
  const [entries, setEntries] = useState<JournalEntry[]>([])

  useEffect(() => {
    const savedEntries = localStorage.getItem("journalEntries")
    if (savedEntries) {
      try {
        setEntries(JSON.parse(savedEntries))
      } catch (e) {
        console.error("Failed to load journal entries:", e)
      }
    }
  }, [])

  const handleSave = () => {
    if (!entry.trim() || !selectedMood) return

    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      timestamp: Date.now(),
      mood: selectedMood,
      content: entry.trim(),
    }

    const updatedEntries = [newEntry, ...entries]
    setEntries(updatedEntries)
    localStorage.setItem("journalEntries", JSON.stringify(updatedEntries))

    setSaved(true)
    setTimeout(() => {
      setSaved(false)
      setEntry("")
      setSelectedMood(null)
    }, 2000)
  }

  const handleDelete = (id: string) => {
    const updatedEntries = entries.filter((e) => e.id !== id)
    setEntries(updatedEntries)
    localStorage.setItem("journalEntries", JSON.stringify(updatedEntries))
  }

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const getMoodIcon = (moodLabel: string) => {
    const mood = moods.find((m) => m.label === moodLabel)
    if (!mood) return null
    const Icon = mood.icon
    return <Icon className={cn("h-5 w-5", mood.color)} />
  }

  return (
    <div className="min-h-screen">
      <PageHeader title="Journal" />

      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Daily Journal</h1>
            <p className="mt-2 text-muted-foreground">Reflect on your thoughts and feelings</p>
          </div>

          <div className="mb-6 flex gap-2">
            <Button
              variant={viewMode === "write" ? "default" : "outline"}
              onClick={() => setViewMode("write")}
              className="flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Write Entry
            </Button>
            <Button
              variant={viewMode === "history" ? "default" : "outline"}
              onClick={() => setViewMode("history")}
              className="flex items-center gap-2"
            >
              <BookOpen className="h-4 w-4" />
              Entry History
              {entries.length > 0 && (
                <span className="ml-1 rounded-full bg-primary-foreground px-2 py-0.5 text-xs text-primary">
                  {entries.length}
                </span>
              )}
            </Button>
          </div>

          {viewMode === "write" ? (
            <>
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    {currentDate}
                  </CardTitle>
                  <CardDescription>
                    Take a moment to write about your day, your feelings, or anything on your mind
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Mood Selector */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">How are you feeling today?</Label>
                    <div className="grid grid-cols-5 gap-2">
                      {moods.map((mood) => {
                        const Icon = mood.icon
                        return (
                          <button
                            key={mood.label}
                            onClick={() => setSelectedMood(mood.label)}
                            className={cn(
                              "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all hover:bg-accent",
                              selectedMood === mood.label ? "border-primary bg-primary/5" : "border-border",
                            )}
                          >
                            <Icon className={cn("h-8 w-8", mood.color)} />
                            <span className="text-xs font-medium">{mood.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Journal Entry */}
                  <div className="space-y-3">
                    <Label htmlFor="entry" className="text-base font-semibold">
                      What's on your mind?
                    </Label>
                    <Textarea
                      id="entry"
                      value={entry}
                      onChange={(e) => setEntry(e.target.value)}
                      placeholder="Start writing your thoughts... There are no rules here. Just let it flow."
                      className="min-h-[300px] resize-none text-base leading-relaxed"
                    />
                    <p className="text-sm text-muted-foreground">{entry.length} characters</p>
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEntry("")
                        setSelectedMood(null)
                      }}
                    >
                      Clear
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={!entry.trim() || !selectedMood || saved}
                      className="min-w-[120px]"
                    >
                      {saved ? "Saved!" : "Save Entry"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Journal Tips */}
              <Card className="mt-6 border-border bg-muted/30">
                <CardHeader>
                  <CardTitle className="text-lg">Journaling Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm leading-relaxed text-muted-foreground">
                  <p>• Write freely without worrying about grammar or structure</p>
                  <p>• Focus on how you feel, not just what happened</p>
                  <p>• Be honest with yourself - this is your private space</p>
                  <p>• Try to journal regularly to track patterns over time</p>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="space-y-4">
              {entries.length === 0 ? (
                <Card className="border-border">
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <BookOpen className="mb-4 h-12 w-12 text-muted-foreground" />
                    <h3 className="mb-2 text-lg font-semibold">No entries yet</h3>
                    <p className="text-center text-sm text-muted-foreground">
                      Start writing your first journal entry to see it here
                    </p>
                    <Button onClick={() => setViewMode("write")} className="mt-6">
                      Write First Entry
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                entries.map((journalEntry) => (
                  <Card key={journalEntry.id} className="border-border">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Calendar className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <CardTitle className="text-lg">{journalEntry.date}</CardTitle>
                            <CardDescription className="flex items-center gap-2 mt-1">
                              {getMoodIcon(journalEntry.mood)}
                              <span>Feeling {journalEntry.mood}</span>
                            </CardDescription>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(journalEntry.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="whitespace-pre-wrap text-base leading-relaxed">{journalEntry.content}</p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
