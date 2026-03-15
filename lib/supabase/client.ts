import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr"

let supabaseInstance: ReturnType<typeof createSupabaseBrowserClient> | null = null

export function createClient() {
  if (supabaseInstance) {
    return supabaseInstance
  }

  supabaseInstance = createSupabaseBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  return supabaseInstance
}

export const createBrowserClient = createClient
