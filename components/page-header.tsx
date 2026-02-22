import { cn } from "@/lib/utils"

interface PageHeaderProps {
  title: string
  subtitle?: string
  className?: string
}

export function PageHeader({ title, subtitle, className }: PageHeaderProps) {
  return (
    <header className={cn("border-b border-border bg-card px-4 pb-3 pt-12", className)}>
      <h1 className="text-balance text-xl font-bold uppercase tracking-tight text-foreground">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
      )}
    </header>
  )
}
