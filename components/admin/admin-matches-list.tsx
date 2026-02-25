"use client"

import { useState } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { TeamBadge } from "@/components/team-badge"
import { CheckCircle2, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Tables } from "@/lib/database.types"

type MatchWithTeams = Tables<"matches"> & {
  home_team: Tables<"teams"> | null
  away_team: Tables<"teams"> | null
}

interface AdminMatchesListProps {
  rounds: Tables<"rounds">[]
  matches: MatchWithTeams[]
  teams: Tables<"teams">[]
  tournamentId: string
}

export function AdminMatchesList({ rounds, matches }: AdminMatchesListProps) {
  const [activeRound, setActiveRound] = useState(
    rounds.length > 0 ? rounds[0].id : ""
  )

  const roundMatches = matches.filter((m) => m.round_id === activeRound)

  return (
    <div className="px-4 py-5">
      <div className="mb-5">
        <h1 className="text-xl font-bold">Partidas</h1>
        <p className="text-sm text-muted-foreground">Registrar resultados e eventos</p>
      </div>

      {/* Round Selector */}
      <div className="mb-4 overflow-x-auto">
        <div className="flex gap-2">
          {rounds.map((round) => {
            const isActive = activeRound === round.id
            return (
              <button
                key={round.id}
                onClick={() => setActiveRound(round.id)}
                className={cn(
                  "whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                {round.name || `Rodada ${round.round_number}`}
              </button>
            )
          })}
        </div>
      </div>

      {/* Matches */}
      <div className="flex flex-col gap-2">
        {roundMatches.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Nenhuma partida nesta rodada.</p>
        ) : (
          roundMatches.map((match) => {
            const homeTeam = match.home_team
            const awayTeam = match.away_team
            const isFinished = match.status === "finished"
            const matchDate = match.match_date
            const matchTime = match.match_time
            const field = match.field_number
            return (
              <Link
                key={match.id}
                href={`/admin/partidas/${match.id}`}
                className="rounded-xl bg-card transition-colors active:bg-muted/50"
              >
                <div className="flex items-center gap-2 border-b border-border/50 px-4 py-1.5">
                  <span className="text-[10px] text-muted-foreground">
                    {matchDate} {matchTime && `- ${matchTime.slice(0, 5)}`}
                  </span>
                  {field && (
                    <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                      Campo {field}
                    </span>
                  )}
                  {isFinished && (
                    <Badge className="ml-auto bg-green-600 text-[10px] hover:bg-green-700">
                      <CheckCircle2 className="mr-0.5 h-3 w-3" /> Encerrado
                    </Badge>
                  )}
                </div>
                <div className="flex items-center px-4 py-3">
                  <div className="flex flex-1 items-center gap-2">
                    <TeamBadge
                      name={homeTeam?.name ?? ""}
                      shortName={homeTeam?.short_name ?? null}
                      primaryColor={homeTeam?.primary_color ?? null}
                      logoUrl={homeTeam?.logo_url ?? null}
                      size="sm"
                    />
                    <span className="text-sm font-bold">{homeTeam?.short_name}</span>
                  </div>

                  <div className="mx-3 flex items-center gap-1.5 font-mono">
                    {isFinished ? (
                      <>
                        <span className="text-lg font-bold">{match.home_score}</span>
                        <span className="text-sm text-muted-foreground">x</span>
                        <span className="text-lg font-bold">{match.away_score}</span>
                      </>
                    ) : (
                      <span className="text-sm text-muted-foreground">vs</span>
                    )}
                  </div>

                  <div className="flex flex-1 items-center justify-end gap-2">
                    <span className="text-sm font-bold">{awayTeam?.short_name}</span>
                    <TeamBadge
                      name={awayTeam?.name ?? ""}
                      shortName={awayTeam?.short_name ?? null}
                      primaryColor={awayTeam?.primary_color ?? null}
                      logoUrl={awayTeam?.logo_url ?? null}
                      size="sm"
                    />
                  </div>

                  <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-muted-foreground" />
                </div>
              </Link>
            )
          })
        )}
      </div>
    </div>
  )
}
