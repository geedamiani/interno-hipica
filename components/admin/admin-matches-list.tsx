"use client"

import { useState } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { TeamBadge } from "@/components/team-badge"
import { Edit, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface AdminMatchesListProps {
  rounds: Record<string, unknown>[]
  matches: Record<string, unknown>[]
  teams: Record<string, unknown>[]
  tournamentId: string
}

export function AdminMatchesList({ rounds, matches }: AdminMatchesListProps) {
  const [activeRound, setActiveRound] = useState(
    rounds.length > 0 ? (rounds[0].id as string) : ""
  )

  const roundMatches = matches.filter((m) => m.round_id === activeRound)

  return (
    <div className="p-4 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-sans text-2xl font-bold">Partidas</h1>
          <p className="text-sm text-muted-foreground">Registrar resultados e eventos</p>
        </div>
      </div>

      {/* Round Selector */}
      <div className="mb-4 overflow-x-auto">
        <div className="flex gap-2">
          {rounds.map((round) => {
            const isActive = activeRound === (round.id as string)
            return (
              <button
                key={round.id as string}
                onClick={() => setActiveRound(round.id as string)}
                className={cn(
                  "whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                {`Rodada ${round.round_number}`}
              </button>
            )
          })}
        </div>
      </div>

      {/* Matches */}
      <div className="flex flex-col gap-3">
        {roundMatches.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Nenhuma partida nesta rodada.</p>
        ) : (
          roundMatches.map((match) => {
            const homeTeam = match.home_team as Record<string, unknown>
            const awayTeam = match.away_team as Record<string, unknown>
            const isFinished = match.status === "finished"
            const matchDate = match.match_date as string
            const matchTime = match.match_time as string
            const field = match.field_number as number
            return (
              <Card key={match.id as string}>
                <div className="flex items-center gap-2 border-b border-border px-4 py-1.5">
                  <span className="text-[10px] text-muted-foreground">
                    {matchDate} {matchTime && `- ${matchTime}`}
                  </span>
                  {field && (
                    <span className="text-[10px] text-muted-foreground">
                      Campo {field}
                    </span>
                  )}
                </div>
                <CardContent className="flex items-center gap-3 py-3">
                  <div className="flex flex-1 items-center gap-2">
                    <TeamBadge
                      name={homeTeam?.name as string}
                      shortName={homeTeam?.short_name as string}
                      primaryColor={homeTeam?.primary_color as string}
                      logoUrl={homeTeam?.logo_url as string}
                      size="sm"
                    />
                    <span className="text-sm font-medium">{homeTeam?.short_name as string}</span>
                  </div>

                  <div className="flex flex-col items-center">
                    {isFinished ? (
                      <span className="font-mono text-lg font-bold">
                        {match.home_score as number} x {match.away_score as number}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">vs</span>
                    )}
                    <Badge
                      variant={isFinished ? "default" : "outline"}
                      className={cn("text-[10px]", isFinished && "bg-green-600 hover:bg-green-700")}
                    >
                      {isFinished ? (
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Encerrado
                        </span>
                      ) : (
                        "Agendado"
                      )}
                    </Badge>
                  </div>

                  <div className="flex flex-1 items-center justify-end gap-2">
                    <span className="text-sm font-medium">{awayTeam?.short_name as string}</span>
                    <TeamBadge
                      name={awayTeam?.name as string}
                      shortName={awayTeam?.short_name as string}
                      primaryColor={awayTeam?.primary_color as string}
                      logoUrl={awayTeam?.logo_url as string}
                      size="sm"
                    />
                  </div>

                  <Link href={`/admin/partidas/${match.id}`}>
                    <Button variant="outline" size="icon" className="h-8 w-8">
                      <Edit className="h-3.5 w-3.5" />
                      <span className="sr-only">Editar partida</span>
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
