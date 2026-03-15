"use client"

import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import type { User, Session, AuthChangeEvent } from "@supabase/supabase-js"

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

let authSubscription: { unsubscribe: () => void } | null = null
let initInProgress = false

function notifyListeners() {
  globalAuthState.listeners.forEach((listener) => {
    listener({
      user: globalAuthState.user,
      session: globalAuthState.session,
      loading: globalAuthState.loading,
    })
  })
}

async function initializeAuth() {
  initInProgress = true

  try {
    const supabase = createBrowserClient()

    const {
      data: { session: currentSession },
    } = await supabase.auth.getSession()

    globalAuthState.session = currentSession
    globalAuthState.user = currentSession?.user ?? null
    globalAuthState.loading = false
    notifyListeners()

    if (!authSubscription) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event: AuthChangeEvent, currentSession: Session | null) => {
          globalAuthState.session = currentSession
          globalAuthState.user = currentSession?.user ?? null
          globalAuthState.loading = false
          notifyListeners()

          if (event === "SIGNED_IN" && currentSession) {
            const currentPath = window.location.pathname
            if (currentPath === "/auth/login" || currentPath === "/auth/signup") {
              window.location.href = "/dashboard"
            }
          }

          if (event === "SIGNED_OUT") {
            window.location.href = "/"
          }
        }
      )
      authSubscription = subscription
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(globalAuthState.user)
  const [session, setSession] = useState<Session | null>(globalAuthState.session)
  const [loading, setLoading] = useState(globalAuthState.loading)
  const initRef = useRef(false)

  useEffect(() => {
    const updateLocalState = (state: {
      user: User | null
      session: Session | null
      loading: boolean
    }) => {
      setUser(state.user)
      setSession(state.session)
      setLoading(state.loading)
    }

    globalAuthState.listeners.add(updateLocalState)

    if (!initRef.current && !authSubscription && !initInProgress) {
      initRef.current = true
      initializeAuth()
    } else if (authSubscription) {
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
    <AuthContext.Provider value={{ user, session, loading, signOut, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)