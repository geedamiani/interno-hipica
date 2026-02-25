"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { TeamBadge } from "@/components/team-badge"
import { cn } from "@/lib/utils"
import type { Tables } from "@/lib/database.types"

type TeamRow = Pick<Tables<"teams">, "id" | "name" | "short_name" | "primary_color" | "logo_url"> & { group_name: string | null }

type StandingsRow = Tables<"standings">

type TeamMatch = Tables<"matches"> & {
  home_team: Pick<Tables<"teams">, "name" | "short_name" | "primary_color" | "logo_url"> | null
  away_team: Pick<Tables<"teams">, "name" | "short_name" | "primary_color" | "logo_url"> | null
  rounds: (Pick<Tables<"rounds">, "round_number"> & { stages: Pick<Tables<"stages">, "name"> | null }) | null
}

type PlayerEvent = Pick<Tables<"match_events">, "event_type" | "player_id">

export interface TeamDetailContentProps {
  team: TeamRow
  players: Tables<"players">[]
  standings: StandingsRow | null
  matches: TeamMatch[]
  playerEvents: PlayerEvent[]
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr + "T12:00:00")
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
}

export function TeamDetailContent({ team, players, standings, matches, playerEvents }: TeamDetailContentProps) {
  const playerStats = new Map<string, { goals: number; assists: number; yellowCards: number; redCards: number }>()
  playerEvents.forEach((e) => {
    const pid = e.player_id
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
            name={team.name}
            shortName={team.short_name}
            primaryColor={team.primary_color}
            logoUrl={team.logo_url}
            size="lg"
          />
          <div>
            <h1 className="text-lg font-bold text-foreground">{team.name}</h1>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
              <span className="rounded bg-muted px-1.5 py-0.5 font-bold uppercase">
                Grupo {team.group_name}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Row */}
      {standings && (
        <div className="grid grid-cols-4 border-b border-border bg-card">
          {[
            { label: "Pts", value: standings.points || 0 },
            { label: "J", value: standings.played || 0 },
            { label: "V", value: standings.wins || 0 },
            { label: "SG", value: standings.goal_difference || 0 },
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
            { label: "E", value: standings.draws || 0 },
            { label: "D", value: standings.losses || 0 },
            { label: "GP", value: standings.goals_for || 0 },
            { label: "GC", value: standings.goals_against || 0 },
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
                const pid = player.id
                const stats = playerStats.get(pid)
                return (
                  <tr key={pid} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="py-2.5 text-center font-mono text-muted-foreground">
                      {player.shirt_number != null ? player.shirt_number : "-"}
                    </td>
                    <td className="py-2.5">
                      <span className="font-medium text-foreground">
                        {player.nickname || player.name}
                      </span>
                      {player.is_captain && (
                        <span className="ml-1 rounded bg-primary px-1 py-0 text-[8px] font-bold text-primary-foreground">C</span>
                      )}
                    </td>
                    <td className="py-2.5 text-center text-muted-foreground">
                      {player.position || "-"}
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
              const homeTeam = match.home_team
              const awayTeam = match.away_team
              const round = match.rounds
              const stg = round?.stages
              const isFinished = match.status === "finished"
              const isHome = match.home_team_id === team.id

              let result: "win" | "draw" | "loss" | null = null
              if (isFinished) {
                const hScore = match.home_score ?? 0
                const aScore = match.away_score ?? 0
                if (hScore === aScore) result = "draw"
                else if ((isHome && hScore > aScore) || (!isHome && aScore > hScore)) result = "win"
                else result = "loss"
              }

              return (
                <Link
                  key={match.id}
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
                    <span className="font-medium text-foreground">{homeTeam?.short_name}</span>
                    {isFinished ? (
                      <span className="font-mono font-bold text-foreground">
                        {match.home_score} x {match.away_score}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">x</span>
                    )}
                    <span className="font-medium text-foreground">{awayTeam?.short_name}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {stg?.name ? `${stg.name} - ` : ""}R{round?.round_number}
                  </span>
                  {match.match_date && (
                    <span className="text-[10px] text-muted-foreground">
                      {formatDate(match.match_date)}
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
