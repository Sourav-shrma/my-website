"use client"

import { ArrowLeft, MoreVertical } from "lucide-react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

interface PageHeaderProps {
  title: string
  showMenu?: boolean
}

export function PageHeader({ title, showMenu = true }: PageHeaderProps) {
  const router = useRouter()

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push("/")
    }
  }

  return (
    <motion.header
      className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Left: Back Arrow */}
        <motion.button
          onClick={handleBack}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-accent"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </motion.button>

        {/* Center: Page Title */}
        <h2 className="absolute left-1/2 -translate-x-1/2 text-lg font-semibold text-foreground">{title}</h2>

        {/* Right: Menu Icon Placeholder */}
        {showMenu && (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground">
            <MoreVertical className="h-5 w-5" />
          </div>
        )}
      </div>
    </motion.header>
  )
}
