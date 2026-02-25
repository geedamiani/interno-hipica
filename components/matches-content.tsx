"use client"

import { useState } from "react"
import Link from "next/link"
import { TeamBadge } from "@/components/team-badge"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Tables } from "@/lib/database.types"

type RoundWithStage = Tables<"rounds"> & {
  stages: Pick<Tables<"stages">, "name"> | null
}

type MatchWithTeams = Tables<"matches"> & {
  home_team: Pick<Tables<"teams">, "id" | "name" | "short_name" | "primary_color" | "logo_url"> | null
  away_team: Pick<Tables<"teams">, "id" | "name" | "short_name" | "primary_color" | "logo_url"> | null
}

export interface MatchesContentProps {
  rounds: RoundWithStage[]
  matches: MatchWithTeams[]
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
    ? matches.filter((m) => m.round_id === activeRound.id)
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
            ? `${activeRound.stages?.name || "Fase"} - Rodada ${activeRound.round_number}`
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
              const homeTeam = match.home_team
              const awayTeam = match.away_team
              const isFinished = match.status === "finished"
              return (
                <Link
                  key={match.id}
                  href={`/jogos/${match.id}`}
                  className="block px-5 py-5 transition-colors hover:bg-muted/30"
                >
                  {/* Date + Field */}
                  <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{match.field_number ? `Campo ${match.field_number}` : ""}</span>
                    <span className="font-medium">
                      {match.match_date ? formatMatchDate(match.match_date) : "A definir"}
                    </span>
                  </div>
                  {/* Teams + Score */}
                  <div className="flex items-center">
                    <div className="flex flex-1 items-center justify-end gap-3">
                      <span className="text-base font-bold text-foreground">
                        {homeTeam?.short_name}
                      </span>
                      <TeamBadge
                        name={homeTeam?.name || ""}
                        shortName={homeTeam?.short_name}
                        primaryColor={homeTeam?.primary_color}
                        logoUrl={homeTeam?.logo_url}
                        size="lg"
                      />
                    </div>
                    <div className="mx-4 flex min-w-[80px] flex-col items-center">
                      {isFinished ? (
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-3xl font-bold text-foreground">
                            {match.home_score}
                          </span>
                          <span className="text-lg text-muted-foreground">x</span>
                          <span className="font-mono text-3xl font-bold text-foreground">
                            {match.away_score}
                          </span>
                        </div>
                      ) : (
                        <span className="font-mono text-2xl font-bold text-muted-foreground">
                          {match.match_time ? formatTime(match.match_time) : "x"}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-1 items-center gap-3">
                      <TeamBadge
                        name={awayTeam?.name || ""}
                        shortName={awayTeam?.short_name}
                        primaryColor={awayTeam?.primary_color}
                        logoUrl={awayTeam?.logo_url}
                        size="lg"
                      />
                      <span className="text-base font-bold text-foreground">
                        {awayTeam?.short_name}
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
