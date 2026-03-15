"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { MessageSquare, BookOpen, BarChart3, Shield, LogIn, LogOut, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Navigation() {
  const pathname = usePathname()
  const { user, loading, signOut } = useAuth()

  const links = [
    { href: "/", label: "Home", icon: null },
    { href: "/chat", label: "Chat", icon: MessageSquare },
    { href: "/journal", label: "Journal", icon: BookOpen },
    { href: "/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/privacy", label: "Privacy", icon: Shield },
  ]

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/50 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 text-xl font-semibold">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-white shadow-md">
            <MessageSquare className="h-5 w-5" />
          </div>
          <span className="hidden sm:inline bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-bold">
            Talk To Me
          </span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          {links.slice(1).map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href
            return (
              <motion.div key={link.href} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href={link.href}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                    isActive
                      ? "bg-gradient-to-r from-primary/10 to-secondary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {Icon && <Icon className={cn("h-4 w-4", isActive && "text-primary")} />}
                  <span className="hidden sm:inline">{link.label}</span>
                </Link>
              </motion.div>
            )
          })}

          <div className="ml-2 pl-2 border-l border-border/50">
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 rounded-full px-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-white">
                      <User className="h-4 w-4" />
                    </div>
                    <span className="hidden md:inline text-sm font-medium truncate max-w-[120px]">
                      {user.email?.split("@")[0] || "User"}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem className="text-muted-foreground text-xs">{user.email}</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/chat" className="cursor-pointer">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      My Chats
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="text-destructive cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <LogIn className="h-4 w-4" />
                    <span className="hidden sm:inline">Sign In</span>
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm" className="bg-gradient-to-r from-primary to-secondary hover:opacity-90">
                    <span className="hidden sm:inline">Sign Up</span>
                    <span className="sm:hidden">Join</span>
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
