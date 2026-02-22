import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Users, CalendarDays, Target, Shield, Handshake } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const [
    { count: tournamentsCount },
    { count: teamsCount },
    { count: playersCount },
    { count: matchesCount },
    { count: eventsCount },
    { count: sponsorsCount },
  ] = await Promise.all([
    supabase.from("tournaments").select("*", { count: "exact", head: true }),
    supabase.from("teams").select("*", { count: "exact", head: true }),
    supabase.from("players").select("*", { count: "exact", head: true }),
    supabase.from("matches").select("*", { count: "exact", head: true }),
    supabase.from("match_events").select("*", { count: "exact", head: true }),
    supabase.from("sponsors").select("*", { count: "exact", head: true }),
  ])

  const stats = [
    { label: "Campeonatos", value: tournamentsCount || 0, icon: Trophy, href: "/admin/campeonatos", color: "text-primary" },
    { label: "Times", value: teamsCount || 0, icon: Shield, href: "/admin/times", color: "text-secondary" },
    { label: "Jogadores", value: playersCount || 0, icon: Users, href: "/admin/jogadores", color: "text-primary" },
    { label: "Partidas", value: matchesCount || 0, icon: CalendarDays, href: "/admin/partidas", color: "text-secondary" },
    { label: "Eventos", value: eventsCount || 0, icon: Target, href: "/admin/partidas", color: "text-primary" },
    { label: "Patrocinadores", value: sponsorsCount || 0, icon: Handshake, href: "/admin/patrocinadores", color: "text-secondary" },
  ]

  return (
    <div className="p-4 lg:p-8">
      <div className="mb-6">
        <h1 className="font-sans text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Visao geral do campeonato</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="transition-colors hover:bg-muted/30">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">{stat.label}</CardTitle>
                <stat.icon className={cn("h-4 w-4", stat.color)} />
              </CardHeader>
              <CardContent>
                <p className="font-mono text-2xl font-bold">{stat.value}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}


