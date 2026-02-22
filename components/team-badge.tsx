import { cn } from "@/lib/utils"

interface TeamBadgeProps {
  name: string
  shortName?: string | null
  primaryColor?: string | null
  logoUrl?: string | null
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  className?: string
}

export function TeamBadge({ name, shortName, primaryColor, logoUrl, size = "md", className }: TeamBadgeProps) {
  const sizeClasses = {
    xs: "h-5 w-5 text-[8px]",
    sm: "h-8 w-8 text-[10px]",
    md: "h-10 w-10 text-xs",
    lg: "h-14 w-14 text-sm",
    xl: "h-16 w-16 text-base",
  }

  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={name}
        className={cn("shrink-0 object-contain", sizeClasses[size], className)}
      />
    )
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-bold text-white",
        sizeClasses[size],
        className
      )}
      style={{ backgroundColor: primaryColor || "#333" }}
    >
      {(shortName || name).slice(0, 3).toUpperCase()}
    </div>
  )
}
