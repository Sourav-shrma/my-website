"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, BarChart3, Heart, Brain, Lock, LogIn, UserPlus, BookOpen } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { motion } from "framer-motion"
import { useAuth } from "@/contexts/auth-context"

export default function HomePage() {
  const { user, loading } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-teal-50">
      <Navigation />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 sm:py-24">
        <motion.div
          className="mx-auto max-w-4xl text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <motion.div
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 px-4 py-2 mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-sm font-medium bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              {loading
                ? "Loading..."
                : user
                  ? `Welcome back, ${user.email?.split("@")[0]}!`
                  : "Your Safe Space for Mental Wellness"}
            </span>
          </motion.div>

          <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Talk To Me
            </span>
            <span className="block mt-2 text-foreground">Express, Reflect, and Heal</span>
          </h1>
          <p className="mt-6 text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl max-w-2xl mx-auto">
            {user
              ? "Continue your journey to better mental health. Chat with our AI companion, journal your thoughts, or review your progress."
              : "An AI-based emotional support companion designed specifically for students. Share your thoughts, track your mood, and find clarity in a judgment-free environment."}
          </p>

          {loading ? (
            <div className="mt-10 flex justify-center">
              <div className="h-12 w-48 rounded-lg bg-muted animate-pulse" />
            </div>
          ) : user ? (
            <motion.div
              className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            >
              <Button
                asChild
                size="lg"
                className="text-base px-8 py-6 text-lg bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity shadow-lg shadow-primary/25"
              >
                <Link href="/chat">
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Start Chatting
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                className="text-base px-8 py-6 text-lg bg-gradient-to-r from-secondary to-pink-500 hover:opacity-90 transition-opacity shadow-lg shadow-secondary/25"
              >
                <Link href="/journal">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Write in Journal
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="text-base px-8 py-6 text-lg border-2 border-accent/50 hover:bg-accent/10 hover:border-accent bg-white/50"
              >
                <Link href="/analytics">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  View Analytics
                </Link>
              </Button>
            </motion.div>
          ) : (
            <>
              <motion.div
                className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              >
                <Button
                  asChild
                  size="lg"
                  className="text-base px-8 py-6 text-lg bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity shadow-lg shadow-primary/25"
                >
                  <Link href="/auth/login">
                    <LogIn className="mr-2 h-5 w-5" />
                    Sign In
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  className="text-base px-8 py-6 text-lg bg-gradient-to-r from-secondary to-pink-500 hover:opacity-90 transition-opacity shadow-lg shadow-secondary/25"
                >
                  <Link href="/auth/signup">
                    <UserPlus className="mr-2 h-5 w-5" />
                    Create Account
                  </Link>
                </Button>
              </motion.div>

              <motion.div
                className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="text-base border-2 border-accent/50 hover:bg-accent/10 hover:border-accent bg-white/50"
                >
                  <Link href="/guest">Try as Guest</Link>
                </Button>
              </motion.div>

              <motion.p
                className="mt-4 text-sm text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                No credit card required. Start your wellness journey today.
              </motion.p>
            </>
          )}
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            className="mx-auto max-w-2xl text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Features Built for Your Well-being
              </span>
            </h2>
            <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
              Everything you need to understand and improve your emotional health
            </p>
          </motion.div>

          <div className="mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Brain,
                title: "Emotion Detection",
                description: "AI-powered analysis to understand your emotional state and provide empathetic responses",
                gradient: "from-indigo-500 to-purple-500",
                bgGradient: "from-indigo-50 to-purple-50",
              },
              {
                icon: MessageSquare,
                title: "Anonymous Chat",
                description: "Express yourself freely without fear of judgment. Your conversations are private",
                gradient: "from-purple-500 to-pink-500",
                bgGradient: "from-purple-50 to-pink-50",
              },
              {
                icon: BarChart3,
                title: "Mood Tracking",
                description: "Visualize your emotional patterns over time and identify triggers",
                gradient: "from-teal-500 to-cyan-500",
                bgGradient: "from-teal-50 to-cyan-50",
              },
              {
                icon: Lock,
                title: "Privacy-First",
                description: "Your data is encrypted and never shared. You control your information",
                gradient: "from-amber-500 to-orange-500",
                bgGradient: "from-amber-50 to-orange-50",
              },
            ].map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                >
                  <Card
                    className={`h-full border-0 bg-gradient-to-br ${feature.bgGradient} shadow-lg hover:shadow-xl transition-shadow`}
                  >
                    <CardHeader>
                      <div
                        className={`mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} text-white shadow-lg`}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <CardTitle className="text-xl text-foreground">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="leading-relaxed text-muted-foreground">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-white via-indigo-50/50 to-purple-50/50">
        <div className="container mx-auto px-4">
          <motion.div
            className="mx-auto max-w-2xl text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
              <span className="bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
                Simple, Safe, and Supportive
              </span>
            </h2>
            <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
              Your journey to better mental health starts here
            </p>
          </motion.div>

          <div className="mx-auto mt-12 max-w-3xl space-y-8">
            {[
              {
                number: 1,
                title: "Start a Conversation",
                description:
                  "Open the chat and share what's on your mind. No registration, no commitment—just support when you need it.",
                gradient: "from-primary to-secondary",
              },
              {
                number: 2,
                title: "Track Your Mood",
                description:
                  "Journal your thoughts and track your emotional patterns to gain insights into your mental health.",
                gradient: "from-secondary to-pink-500",
              },
              {
                number: 3,
                title: "Review Your Progress",
                description:
                  "View analytics and insights to understand your emotional journey and celebrate your growth.",
                gradient: "from-accent to-teal-400",
              },
            ].map((step, index) => (
              <motion.div
                key={step.number}
                className="flex gap-4"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${step.gradient} text-lg font-bold text-white shadow-lg`}
                >
                  {step.number}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-2 leading-relaxed text-muted-foreground">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            className="mx-auto max-w-2xl text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
          >
            <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg shadow-pink-500/25">
              <Heart className="h-8 w-8 text-white" />
            </div>
            <h2 className="mt-6 text-balance text-3xl font-bold tracking-tight sm:text-4xl">
              <span className="bg-gradient-to-r from-pink-500 via-rose-500 to-primary bg-clip-text text-transparent">
                You're Not Alone
              </span>
            </h2>
            <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
              Take the first step towards better mental health. Your safe space is waiting.
            </p>
            <Button
              asChild
              size="lg"
              className="mt-8 text-base bg-gradient-to-r from-primary via-secondary to-pink-500 hover:opacity-90 transition-opacity shadow-lg"
            >
              <Link href="/chat">Get Started Now</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-gradient-to-r from-indigo-50/50 via-purple-50/50 to-teal-50/50 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2026 Talk To Me. Your privacy is our priority.</p>
          <div className="mt-4 flex justify-center gap-6">
            <Link href="/privacy" className="hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link href="/chat" className="hover:text-primary transition-colors">
              Support
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
