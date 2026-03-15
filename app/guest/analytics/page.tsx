"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function GuestAnalyticsRedirect() {
  const router = useRouter()
  
  useEffect(() => {
    router.replace("/analytics")
  }, [router])
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">Redirecting to Analytics...</p>
    </div>
  )
}
