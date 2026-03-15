"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function GuestJournalRedirect() {
  const router = useRouter()
  
  useEffect(() => {
    router.replace("/journal")
  }, [router])
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">Redirecting to Journal...</p>
    </div>
  )
}
