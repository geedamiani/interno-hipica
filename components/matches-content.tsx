"use client"

import { useState } from "react"
import Link from "next/link"
import { TeamBadge } from "@/components/team-badge"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface MatchesContentProps {
  rounds: Record<string, unknown>[]
  matches: Record<string, unknown>[]
}

function formatMatchDate(dateStr: string) {
  const date = new Date(dateStr + "T12:00:00")
  const dayStr = date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
  const weekday = date.toLocaleDateString("pt-BR", { weekday: "long" })
  const cap = weekday.charAt(0).toUpperCase() + weekday.slice(1)
  return `${cap}, ${dayStr}`
}

function formatTime(timeStr: string) {
  return timeStr.slice(0, 5)
}

export function MatchesContent({ rounds, matches }: MatchesContentProps) {
  const [roundIndex, setRoundIndex] = useState(0)

  const activeRound = rounds[roundIndex]
  const roundMatches = activeRound
    ? matches.filter((m) => m.round_id === (activeRound.id as string))
    : []

  const goBack = () => setRoundIndex((i) => Math.max(0, i - 1))
  const goForward = () => setRoundIndex((i) => Math.min(rounds.length - 1, i + 1))

  return (
    <main className="bg-background">
      {/* Header */}
      <header className="bg-card px-5 pb-4 pt-14">
        <h1 className="text-2xl font-bold uppercase tracking-tight text-foreground">Jogos</h1>
      </header>

      {/* Round Navigator */}
      <div className="flex items-center justify-between border-b border-border bg-card px-3 py-3">
        <button
          onClick={goBack}
          disabled={roundIndex === 0}
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full transition-colors",
            roundIndex === 0 ? "text-muted-foreground/30" : "text-primary hover:bg-muted"
          )}
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <span className="text-sm font-bold uppercase text-foreground">
          {activeRound
            ? `${(activeRound.stages as Record<string, unknown>)?.name || "Fase"} - Rodada ${activeRound.round_number}`
            : ""}
        </span>
        <button
          onClick={goForward}
          disabled={roundIndex === rounds.length - 1}
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full transition-colors",
            roundIndex === rounds.length - 1 ? "text-muted-foreground/30" : "text-primary hover:bg-muted"
          )}
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      {/* Matches */}
      <div className="bg-card">
        {roundMatches.length === 0 ? (
          <div className="py-20 text-center text-base text-muted-foreground">
            Nenhum jogo nesta rodada.
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {roundMatches.map((match) => {
              const homeTeam = match.home_team as Record<string, unknown>
              const awayTeam = match.away_team as Record<string, unknown>
              const isFinished = match.status === "finished"
              return (
                <Link
                  key={match.id as string}
                  href={`/jogos/${match.id}`}
                  className="block px-5 py-5 transition-colors hover:bg-muted/30"
                >
                  {/* Date + Field */}
                  <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{match.field_number ? `Campo ${match.field_number as number}` : ""}</span>
                    <span className="font-medium">
                      {match.match_date ? formatMatchDate(match.match_date as string) : "A definir"}
                    </span>
                  </div>
                  {/* Teams + Score */}
                  <div className="flex items-center">
                    <div className="flex flex-1 items-center justify-end gap-3">
                      <span className="text-base font-bold text-foreground">
                        {homeTeam?.short_name as string}
                      </span>
                      <TeamBadge
                        name={homeTeam?.name as string}
                        shortName={homeTeam?.short_name as string}
                        primaryColor={homeTeam?.primary_color as string}
                        logoUrl={homeTeam?.logo_url as string}
                        size="lg"
                      />
                    </div>
                    <div className="mx-4 flex min-w-[80px] flex-col items-center">
                      {isFinished ? (
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-3xl font-bold text-foreground">
                            {match.home_score as number}
                          </span>
                          <span className="text-lg text-muted-foreground">x</span>
                          <span className="font-mono text-3xl font-bold text-foreground">
                            {match.away_score as number}
                          </span>
                        </div>
                      ) : (
                        <span className="font-mono text-2xl font-bold text-muted-foreground">
                          {match.match_time ? formatTime(match.match_time as string) : "x"}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-1 items-center gap-3">
                      <TeamBadge
                        name={awayTeam?.name as string}
                        shortName={awayTeam?.short_name as string}
                        primaryColor={awayTeam?.primary_color as string}
                        logoUrl={awayTeam?.logo_url as string}
                        size="lg"
                      />
                      <span className="text-base font-bold text-foreground">
                        {awayTeam?.short_name as string}
                      </span>
                    </div>
                  </div>
                  {isFinished && (
                    <p className="mt-2 text-center text-xs font-semibold uppercase text-primary">
                      Encerrado
                    </p>
                  )}
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
