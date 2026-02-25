import Link from "next/link"
import { TeamBadge } from "@/components/team-badge"
import { ChevronRight } from "lucide-react"

interface TeamRow {
  id: string
  name: string
  short_name: string | null
  primary_color: string | null
  logo_url: string | null
  group_name: string | null
}

interface TeamsContentProps {
  teams: TeamRow[]
}

export function TeamsContent({ teams }: TeamsContentProps) {
  const groups = [...new Set(teams.map((t) => t.group_name).filter(Boolean))] as string[]
  groups.sort()

  return (
    <main className="bg-background">
      <header className="border-b border-border bg-card px-4 pb-3 pt-12">
        <h1 className="text-xl font-bold uppercase tracking-tight text-foreground">Times</h1>
        <p className="mt-0.5 text-xs text-muted-foreground">Todos os participantes</p>
      </header>

      {groups.map((group) => {
        const groupTeams = teams.filter((t) => t.group_name === group)
        if (groupTeams.length === 0) return null
        return (
          <div key={group} className="bg-card">
            <div className="bg-muted/50 px-4 py-1.5">
              <span className="text-[11px] font-bold uppercase text-muted-foreground">
                Grupo {group}
              </span>
            </div>
            <div className="divide-y divide-border/50">
              {groupTeams.map((team) => (
                <Link
                  key={team.id}
                  href={`/times/${team.id}`}
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/30"
                >
                  <TeamBadge
                    name={team.name}
                    shortName={team.short_name}
                    primaryColor={team.primary_color}
                    logoUrl={team.logo_url}
                    size="md"
                  />
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-foreground">{team.name}</p>
                    <p className="text-[10px] text-muted-foreground">Grupo {team.group_name}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </div>
        )
      })}

      {/* Teams without a group */}
      {teams.filter((t) => !t.group_name).length > 0 && (
        <div className="bg-card">
          <div className="divide-y divide-border/50">
            {teams.filter((t) => !t.group_name).map((team) => (
              <Link
                key={team.id}
                href={`/times/${team.id}`}
                className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/30"
              >
                <TeamBadge name={team.name} shortName={team.short_name} primaryColor={team.primary_color} logoUrl={team.logo_url} size="md" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-foreground">{team.name}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </main>
  )
}
