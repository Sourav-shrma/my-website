"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heart, Mail, Phone, Loader2, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react"

const PHONE_AUTH_ENABLED = false // Set to true once SMS provider is configured in Supabase

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailSent, setEmailSent] = useState(false)
  const [success, setSuccess] = useState(false) // Declare setSuccess variable
  const router = useRouter()

  // Listen for auth state changes and redirect when user signs up
  useEffect(() => {
    if (!success) return

    // Redirect immediately - the session is already set
    window.location.href = "/"
  }, [success])

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      setLoading(false)
      return
    }

    const supabase = createBrowserClient()
    const redirectUrl = process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL
      ? `${process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL}/auth/callback`
      : `${window.location.origin}/auth/callback`

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else if (data.user && data.user.identities && data.user.identities.length === 0) {
      setError("An account with this email already exists. Please sign in instead.")
      setLoading(false)
    } else if (data.session) {
      // Session immediately available, set success flag to trigger redirect
      setLoading(false)
      setSuccess(true)
    } else {
      // Email confirmation required
      setEmailSent(true)
      setLoading(false)
    }
  }

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createBrowserClient()
    const formattedPhone = phone.startsWith("+") ? phone : `+91${phone}`

    const { error } = await supabase.auth.signInWithOtp({
      phone: formattedPhone,
    })

    if (error) {
      setError(error.message)
    } else {
      setOtpSent(true)
    }
    setLoading(false)
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createBrowserClient()
    const formattedPhone = phone.startsWith("+") ? phone : `+91${phone}`

    const { error } = await supabase.auth.verifyOtp({
      phone: formattedPhone,
      token: otp,
      type: "sms",
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4">
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="p-3 bg-green-100 rounded-full mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Account created!</h2>
            <p className="text-muted-foreground">Redirecting you to the app...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4">
        <Card className="w-full max-w-md border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-xl">Check your email</CardTitle>
            <CardDescription>
              We sent a confirmation link to <strong>{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center text-sm text-muted-foreground space-y-3">
            <p>Click the link in the email to confirm your account and start using MindfulU.</p>
            <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded-md">
              Note: Check your spam folder if you don't see the email within a few minutes.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Link href="/auth/login" className="w-full">
              <Button variant="outline" className="w-full bg-transparent">
                Back to Sign In
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              MindfulU
            </span>
          </div>
          <p className="text-muted-foreground">Create an account to save your progress.</p>
        </div>

        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl">Create Account</CardTitle>
            <CardDescription>Choose your preferred sign up method</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="email" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </TabsTrigger>
                <TabsTrigger value="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone
                </TabsTrigger>
              </TabsList>

              <TabsContent value="email">
                <form onSubmit={handleEmailSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Create a password (min 6 characters)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                  {error && <p className="text-sm text-red-500 bg-red-50 p-2 rounded-md">{error}</p>}
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      <>
                        <Mail className="mr-2 h-4 w-4" />
                        Create Account
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="phone">
                {!PHONE_AUTH_ENABLED ? (
                  <div className="space-y-4 py-4">
                    <div className="flex flex-col items-center text-center p-6 bg-amber-50 rounded-lg border border-amber-200">
                      <AlertCircle className="h-10 w-10 text-amber-500 mb-3" />
                      <h3 className="font-semibold text-amber-800 mb-2">Phone Sign Up Coming Soon</h3>
                      <p className="text-sm text-amber-700 mb-4">
                        Phone authentication requires SMS provider configuration. Please use email sign up for now.
                      </p>
                      <p className="text-xs text-amber-600">
                        Admin: Configure Twilio, Vonage, or MessageBird in{" "}
                        <a
                          href="https://supabase.com/dashboard/project/_/auth/providers"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline hover:text-amber-800"
                        >
                          Supabase Dashboard
                        </a>
                      </p>
                    </div>
                  </div>
                ) : !otpSent ? (
                  <form onSubmit={handleSendOtp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="flex gap-2">
                        <div className="flex items-center px-3 bg-muted rounded-md border text-sm text-muted-foreground">
                          +91
                        </div>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="9876543210"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                          maxLength={10}
                          required
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">Enter your 10-digit Indian mobile number</p>
                    </div>
                    {error && <p className="text-sm text-red-500 bg-red-50 p-2 rounded-md">{error}</p>}
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending OTP...
                        </>
                      ) : (
                        <>
                          <Phone className="mr-2 h-4 w-4" />
                          Send OTP
                        </>
                      )}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="otp">Enter OTP</Label>
                      <Input
                        id="otp"
                        type="text"
                        placeholder="Enter 6-digit OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                        maxLength={6}
                        required
                      />
                      <p className="text-xs text-muted-foreground">OTP sent to +91{phone}</p>
                    </div>
                    {error && <p className="text-sm text-red-500 bg-red-50 p-2 rounded-md">{error}</p>}
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        "Verify OTP"
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full"
                      onClick={() => {
                        setOtpSent(false)
                        setOtp("")
                        setError(null)
                      }}
                    >
                      Change Phone Number
                    </Button>
                  </form>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">Or</span>
              </div>
            </div>
            <div className="flex flex-col gap-2 w-full">
              <Link href="/auth/login" className="w-full">
                <Button variant="outline" className="w-full bg-transparent">
                  Already have an account? Sign in
                </Button>
              </Link>
              <Link href="/guest" className="w-full">
                <Button variant="ghost" className="w-full text-muted-foreground">
                  Continue as Guest
                </Button>
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
