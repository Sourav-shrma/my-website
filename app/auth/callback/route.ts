import { createClient } from "@/lib/supabase/server"
import { NextResponse, type NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const next = requestUrl.searchParams.get("next") || "/"

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Successful authentication - redirect to the intended destination
      return NextResponse.redirect(new URL(next, requestUrl.origin))
    }

    // If there's an error, redirect to error page
    console.error("[v0] Auth callback error:", error.message)
    return NextResponse.redirect(new URL(`/auth/error?message=${encodeURIComponent(error.message)}`, requestUrl.origin))
  }

  // No code provided - redirect to login
  return NextResponse.redirect(new URL("/auth/login", requestUrl.origin))
}
