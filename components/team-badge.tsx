import { cn } from "@/lib/utils"
import { Shield } from "lucide-react"

interface TeamBadgeProps {
  name: string
  shortName?: string | null
  primaryColor?: string | null
  logoUrl?: string | null
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  className?: string
}

const sizeMap = {
  xs: { container: "h-5 w-5", icon: "h-3 w-3" },
  sm: { container: "h-8 w-8", icon: "h-4 w-4" },
  md: { container: "h-10 w-10", icon: "h-5 w-5" },
  lg: { container: "h-14 w-14", icon: "h-7 w-7" },
  xl: { container: "h-16 w-16", icon: "h-8 w-8" },
}

export function TeamBadge({ name, shortName, logoUrl, size = "md", className }: TeamBadgeProps) {
  const s = sizeMap[size]
  const altText = (shortName && shortName.trim()) || name

  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={altText}
        className={cn("shrink-0 object-contain", s.container, className)}
      />
    )
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground",
        s.container,
        className
      )}
    >
      <Shield className={s.icon} />
    </div>
  )
}
