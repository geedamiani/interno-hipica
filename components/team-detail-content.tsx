"use client"

import Link from "next/link"
import { ArrowLeft, Target } from "lucide-react"
import { TeamBadge } from "@/components/team-badge"
import { cn } from "@/lib/utils"

interface TeamDetailContentProps {
  team: Record<string, unknown>
  players: Record<string, unknown>[]
  standings: Record<string, unknown> | null
  matches: Record<string, unknown>[]
  playerEvents: Record<string, unknown>[]
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr + "T12:00:00")
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
}

export function TeamDetailContent({ team, players, standings, matches, playerEvents }: TeamDetailContentProps) {
  const playerStats = new Map<string, { goals: number; assists: number; yellowCards: number; redCards: number }>()
  playerEvents.forEach((e) => {
    const pid = e.player_id as string
    if (!pid) return
    const stats = playerStats.get(pid) || { goals: 0, assists: 0, yellowCards: 0, redCards: 0 }
    if (e.event_type === "goal" || e.event_type === "penalty_goal") stats.goals++
    if (e.event_type === "assist") stats.assists++
    if (e.event_type === "yellow_card") stats.yellowCards++
    if (e.event_type === "red_card") stats.redCards++
    playerStats.set(pid, stats)
  })

  return (
    <main className="bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card px-4 pb-4 pt-12">
        <Link href="/times" className="flex items-center gap-1 text-xs font-medium text-primary">
          <ArrowLeft className="h-4 w-4" />
          Times
        </Link>
        <div className="mt-3 flex items-center gap-3">
          <TeamBadge
            name={team.name as string}
            shortName={team.short_name as string}
            primaryColor={team.primary_color as string}
            logoUrl={team.logo_url as string}
            size="lg"
          />
          <div>
            <h1 className="text-lg font-bold text-foreground">{team.name as string}</h1>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
              <span className="rounded bg-muted px-1.5 py-0.5 font-bold uppercase">
                Grupo {team.group_name as string}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Row */}
      {standings && (
        <div className="grid grid-cols-4 border-b border-border bg-card">
          {[
            { label: "Pts", value: (standings.points as number) || 0 },
            { label: "J", value: (standings.played as number) || 0 },
            { label: "V", value: (standings.wins as number) || 0 },
            { label: "SG", value: (standings.goal_difference as number) || 0 },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center border-r border-border/50 py-3 last:border-r-0">
              <span className="font-mono text-lg font-bold text-foreground">{stat.value}</span>
              <span className="text-[10px] font-semibold uppercase text-muted-foreground">{stat.label}</span>
            </div>
          ))}
        </div>
      )}

      {standings && (
        <div className="grid grid-cols-4 border-b border-border bg-card">
          {[
            { label: "E", value: (standings.draws as number) || 0 },
            { label: "D", value: (standings.losses as number) || 0 },
            { label: "GP", value: (standings.goals_for as number) || 0 },
            { label: "GC", value: (standings.goals_against as number) || 0 },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center border-r border-border/50 py-3 last:border-r-0">
              <span className="font-mono text-lg font-bold text-foreground">{stat.value}</span>
              <span className="text-[10px] font-semibold uppercase text-muted-foreground">{stat.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Squad */}
      <div className="bg-card">
        <div className="border-b border-border px-4 py-2.5">
          <h3 className="text-xs font-bold uppercase text-foreground">Elenco</h3>
        </div>
        {players.length === 0 ? (
          <p className="py-8 text-center text-xs text-muted-foreground">
            Elenco ainda nao cadastrado.
          </p>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-[10px] font-semibold uppercase text-muted-foreground">
                <th className="w-10 py-2 text-center">#</th>
                <th className="py-2 text-left">Nome</th>
                <th className="w-16 py-2 text-center">Pos</th>
                <th className="w-8 py-2 text-center">G</th>
                <th className="w-8 py-2 text-center">A</th>
                <th className="w-8 py-2 text-center">CA</th>
                <th className="w-8 py-2 text-center">CV</th>
              </tr>
            </thead>
            <tbody>
              {players.map((player) => {
                const pid = player.id as string
                const stats = playerStats.get(pid)
                return (
                  <tr key={pid} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="py-2.5 text-center font-mono text-muted-foreground">
                      {player.shirt_number != null ? player.shirt_number as number : "-"}
                    </td>
                    <td className="py-2.5">
                      <span className="font-medium text-foreground">
                        {player.nickname as string || player.name as string}
                      </span>
                      {player.is_captain && (
                        <span className="ml-1 rounded bg-primary px-1 py-0 text-[8px] font-bold text-primary-foreground">C</span>
                      )}
                    </td>
                    <td className="py-2.5 text-center text-muted-foreground">
                      {player.position as string || "-"}
                    </td>
                    <td className="py-2.5 text-center font-mono font-bold">
                      {stats?.goals || 0}
                    </td>
                    <td className="py-2.5 text-center font-mono">
                      {stats?.assists || 0}
                    </td>
                    <td className="py-2.5 text-center">
                      {(stats?.yellowCards || 0) > 0 && (
                        <div className="mx-auto flex items-center justify-center gap-0.5">
                          <div className="h-3 w-2 rounded-[1px] bg-yellow-400" />
                          <span className="font-mono text-[10px]">{stats?.yellowCards}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-2.5 text-center">
                      {(stats?.redCards || 0) > 0 && (
                        <div className="mx-auto flex items-center justify-center gap-0.5">
                          <div className="h-3 w-2 rounded-[1px] bg-destructive" />
                          <span className="font-mono text-[10px]">{stats?.redCards}</span>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Recent Matches */}
      {matches.length > 0 && (
        <div className="mt-2 bg-card">
          <div className="border-b border-border px-4 py-2.5">
            <h3 className="text-xs font-bold uppercase text-foreground">Jogos</h3>
          </div>
          <div className="divide-y divide-border/50">
            {matches.map((match) => {
              const homeTeam = match.home_team as Record<string, unknown>
              const awayTeam = match.away_team as Record<string, unknown>
              const round = match.rounds as Record<string, unknown> | null
              const stg = round?.stages as Record<string, unknown> | null
              const isFinished = match.status === "finished"
              const isHome = (match.home_team_id as string) === (team.id as string)

              let result: "win" | "draw" | "loss" | null = null
              if (isFinished) {
                const hScore = match.home_score as number
                const aScore = match.away_score as number
                if (hScore === aScore) result = "draw"
                else if ((isHome && hScore > aScore) || (!isHome && aScore > hScore)) result = "win"
                else result = "loss"
              }

              return (
                <Link
                  key={match.id as string}
                  href={`/jogos/${match.id}`}
                  className="flex items-center gap-2 px-4 py-2.5 hover:bg-muted/30"
                >
                  <div
                    className={cn(
                      "h-2 w-2 shrink-0 rounded-full",
                      result === "win" && "bg-green-500",
                      result === "draw" && "bg-muted-foreground",
                      result === "loss" && "bg-destructive",
                      !result && "bg-muted-foreground/30"
                    )}
                  />
                  <div className="flex flex-1 items-center gap-1.5 text-xs">
                    <span className="font-medium text-foreground">{homeTeam?.short_name as string}</span>
                    {isFinished ? (
                      <span className="font-mono font-bold text-foreground">
                        {match.home_score as number} x {match.away_score as number}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">x</span>
                    )}
                    <span className="font-medium text-foreground">{awayTeam?.short_name as string}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {stg?.name ? `${stg.name as string} - ` : ""}R{round?.round_number}
                  </span>
                  {match.match_date && (
                    <span className="text-[10px] text-muted-foreground">
                      {formatDate(match.match_date as string)}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </main>
  )
}
