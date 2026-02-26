"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Trophy, CalendarDays, Target } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", label: "Classificação", icon: Trophy },
  { href: "/jogos", label: "Jogos", icon: CalendarDays },
  { href: "/artilharia", label: "Artilharia", icon: Target },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card">
      <div className="mx-auto flex max-w-lg items-center justify-around">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-semibold transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className={cn("h-6 w-6", isActive && "stroke-[2.5]")} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
