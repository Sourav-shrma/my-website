"use client"

import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js"

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
  refreshAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
  refreshAuth: async () => {},
})

// Global auth state shared across all AuthProvider instances
let globalAuthState: {
  user: User | null
  session: Session | null
  loading: boolean
  listeners: Set<(state: { user: User | null; session: Session | null; loading: boolean }) => void>
} = {
  user: null,
  session: null,
  loading: true,
  listeners: new Set(),
}

let authSubscription: ReturnType<ReturnType<typeof createBrowserClient>["auth"]["onAuthStateChange"]> | null = null
let initInProgress = false

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(globalAuthState.user)
  const [session, setSession] = useState<Session | null>(globalAuthState.session)
  const [loading, setLoading] = useState(globalAuthState.loading)
  const initRef = useRef(false)

  useEffect(() => {
    // Register listener for global auth state changes
    const updateLocalState = (state: { user: User | null; session: Session | null; loading: boolean }) => {
      setUser(state.user)
      setSession(state.session)
      setLoading(state.loading)
    }

    globalAuthState.listeners.add(updateLocalState)

    // If not already initialized, do it now
    if (!initRef.current && !authSubscription && !initInProgress) {
      initRef.current = true
      initializeAuth()
    } else if (authSubscription) {
      // Already initialized, just update local state from global state
      updateLocalState(globalAuthState)
    }

    return () => {
      globalAuthState.listeners.delete(updateLocalState)
    }
  }, [])

  const signOut = async () => {
    const supabase = createBrowserClient()
    globalAuthState.loading = true
    notifyListeners()

    await supabase.auth.signOut()
    globalAuthState.user = null
    globalAuthState.session = null
    notifyListeners()

    window.location.href = "/"
  }

  const refreshAuth = async () => {
    const supabase = createBrowserClient()
    const {
      data: { session: currentSession },
    } = await supabase.auth.getSession()
    if (currentSession) {
      globalAuthState.session = currentSession
      globalAuthState.user = currentSession.user
      notifyListeners()
    }
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut, refreshAuth }}>{children}</AuthContext.Provider>
  )
}

async function initializeAuth() {
  initInProgress = true

  try {
    const supabase = createBrowserClient()

    // Get current session - no retry delay, just get it once
    const {
      data: { session: currentSession },
    } = await supabase.auth.getSession()

    globalAuthState.session = currentSession
    globalAuthState.user = currentSession?.user ?? null
    globalAuthState.loading = false
    notifyListeners()

    // Set up single global listener
    if (!authSubscription) {
      const { data } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, currentSession: Session | null) => {

  globalAuthState.session = currentSession
  globalAuthState.user = currentSession?.user ?? null
  globalAuthState.loading = false

  notifyListeners()

  // redirect after login
  

})

      authSubscription = data.subscription
    }
  } catch (err) {
    globalAuthState.user = null
    globalAuthState.session = null
    globalAuthState.loading = false
    notifyListeners()
  } finally {
    initInProgress = false
  }
}

function notifyListeners() {
  globalAuthState.listeners.forEach((listener) => {
    listener({
      user: globalAuthState.user,
      session: globalAuthState.session,
      loading: globalAuthState.loading,
    })
  })
}

export const useAuth = () => useContext(AuthContext)
