"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { TeamBadge } from "@/components/team-badge"
import { cn } from "@/lib/utils"

interface HomeContentProps {
  tournament: Record<string, unknown> | null
  standings: Record<string, unknown>[]
  nextMatches: Record<string, unknown>[]
  topScorers: {
    name: string
    nickname: string | null
    teamShort: string | null
    teamColor: string | null
    teamLogoUrl: string | null
    goals: number
  }[]
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr + "T12:00:00")
  return date.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit" })
}

function formatTime(timeStr: string) {
  return timeStr.slice(0, 5)
}

export function HomeContent({ tournament, standings, nextMatches, topScorers }: HomeContentProps) {
  const [activeTab, setActiveTab] = useState<"geral" | "A" | "B">("geral")
  const category = tournament?.categories as Record<string, unknown> | null

  const tabs = [
    { key: "geral" as const, label: "Geral" },
    { key: "A" as const, label: "Grupo A" },
    { key: "B" as const, label: "Grupo B" },
  ]

  const sortStandings = (list: Record<string, unknown>[]) =>
    [...list].sort(
      (a, b) =>
        ((b.points as number) || 0) - ((a.points as number) || 0) ||
        ((b.goal_difference as number) || 0) - ((a.goal_difference as number) || 0) ||
        ((b.goals_for as number) || 0) - ((a.goals_for as number) || 0)
    )

  const filteredStandings =
    activeTab === "geral"
      ? sortStandings(standings)
      : sortStandings(standings.filter((s) => s.group_name === activeTab))

  const isGroupView = activeTab !== "geral"

  return (
    <main className="bg-background pb-4">
      {/* Tournament Header */}
      <header className="bg-card px-5 pb-4 pt-14">
        <div className="flex items-center gap-2">
          {category && (
            <span className="rounded-sm bg-primary px-2 py-0.5 text-xs font-bold uppercase text-primary-foreground">
              {category.name as string}
            </span>
          )}
          <span className="text-sm text-muted-foreground">
            {tournament?.year as number}/{tournament?.semester as number}
          </span>
        </div>
        <h1 className="mt-1.5 text-2xl font-bold uppercase tracking-tight text-foreground text-balance">
          {(tournament?.name as string) || "Campeonato"}
        </h1>
        {tournament?.location && (
          <p className="mt-1 text-sm text-muted-foreground">{tournament.location as string}</p>
        )}
      </header>

      {/* ===== CLASSIFICACAO ===== */}
      <section className="mt-3 bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h2 className="text-lg font-bold uppercase text-foreground">Classificacao</h2>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex-1 border-b-2 py-3 text-center text-sm font-bold uppercase transition-colors",
                activeTab === tab.key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[400px]">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="w-9 py-3 text-center text-xs font-semibold uppercase"></th>
                <th className="py-3 pl-1 text-left text-xs font-semibold uppercase">Time</th>
                <th className="w-10 py-3 text-center text-xs font-bold uppercase">P</th>
                <th className="w-9 py-3 text-center text-xs font-semibold uppercase">J</th>
                <th className="w-9 py-3 text-center text-xs font-semibold uppercase">V</th>
                <th className="w-9 py-3 text-center text-xs font-semibold uppercase">E</th>
                <th className="w-9 py-3 text-center text-xs font-semibold uppercase">D</th>
                <th className="w-9 py-3 text-center text-xs font-semibold uppercase">SG</th>
              </tr>
            </thead>
            <tbody>
              {filteredStandings.map((team, i) => {
                const isDirectQualified = isGroupView && i < 2
                const isRepescagem = isGroupView && i >= 2
                return (
                  <tr key={team.team_id as string} className="border-b border-border/50">
                    <td className="py-3.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {isGroupView && (
                          <div
                            className={cn(
                              "h-5 w-1 rounded-full",
                              isDirectQualified ? "bg-primary" : isRepescagem ? "bg-secondary" : "bg-transparent"
                            )}
                          />
                        )}
                        <span className="w-5 text-center font-mono text-sm font-medium text-muted-foreground">
                          {i + 1}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 pl-1">
                      <Link href={`/times/${team.team_id}`} className="flex items-center gap-2.5">
                        <TeamBadge
                          name={team.team_name as string}
                          shortName={team.short_name as string}
                          primaryColor={team.primary_color as string}
                          logoUrl={team.logo_url as string}
                          size="sm"
                        />
                        <span className="truncate text-sm font-semibold text-foreground">
                          {team.team_name as string}
                        </span>
                        {!isGroupView && (
                          <span className="ml-auto shrink-0 pr-1 text-[10px] font-medium text-muted-foreground">
                            {team.group_name as string}
                          </span>
                        )}
                      </Link>
                    </td>
                    <td className="py-3.5 text-center font-mono text-sm font-bold text-foreground">
                      {(team.points as number) || 0}
                    </td>
                    <td className="py-3.5 text-center font-mono text-sm text-muted-foreground">
                      {(team.played as number) || 0}
                    </td>
                    <td className="py-3.5 text-center font-mono text-sm text-muted-foreground">
                      {(team.wins as number) || 0}
                    </td>
                    <td className="py-3.5 text-center font-mono text-sm text-muted-foreground">
                      {(team.draws as number) || 0}
                    </td>
                    <td className="py-3.5 text-center font-mono text-sm text-muted-foreground">
                      {(team.losses as number) || 0}
                    </td>
                    <td className="py-3.5 text-center font-mono text-sm text-muted-foreground">
                      {(team.goal_difference as number) || 0}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        {isGroupView && (
          <div className="flex items-center gap-5 px-5 py-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="h-4 w-1 rounded-full bg-primary" />
              <span>Classificado direto</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-1 rounded-full bg-secondary" />
              <span>Repescagem</span>
            </div>
          </div>
        )}
      </section>

      {/* ===== PROXIMOS JOGOS - GE Globo style ===== */}
      {nextMatches.length > 0 && (
        <section className="mt-3 bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <h2 className="text-lg font-bold uppercase text-foreground">Proximos Jogos</h2>
            <Link href="/jogos" className="flex items-center gap-1 text-sm font-bold text-primary">
              Mais jogos <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="divide-y divide-border/50">
            {nextMatches.map((match) => {
              const homeTeam = match.home_team as Record<string, unknown>
              const awayTeam = match.away_team as Record<string, unknown>
              const round = match.rounds as Record<string, unknown> | null
              const stages = round?.stages as Record<string, unknown> | null
              const roundLabel = stages?.name
                ? `${stages.name} - Rodada ${round?.round_number}`
                : round?.round_number
                  ? `Rodada ${round.round_number}`
                  : ""
              const isFinished = match.status === "finished"
              return (
                <Link
                  key={match.id as string}
                  href={`/jogos/${match.id}`}
                  className="block px-5 py-4 transition-colors hover:bg-muted/30"
                >
                  {/* Round label */}
                  <p className="mb-3 text-center text-xs text-muted-foreground">
                    {roundLabel}
                    {match.match_date && ` - ${formatDate(match.match_date as string)}`}
                  </p>
                  {/* Match row: SHORT + Logo | Score/Time | Logo + SHORT */}
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
                    <div className="mx-4 flex min-w-[72px] flex-col items-center">
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
                        <span className="font-mono text-2xl font-bold text-foreground">
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
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* ===== ARTILHARIA - GE Globo style ===== */}
      {topScorers.length > 0 && (
        <section className="mt-3 bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <h2 className="text-lg font-bold uppercase text-foreground">Artilharia</h2>
            <Link href="/artilharia" className="flex items-center gap-1 text-sm font-bold text-primary">
              Ver tudo <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="border-b border-border px-5 py-2">
            <div className="flex items-center justify-between text-xs font-semibold uppercase text-muted-foreground">
              <span>Ranking</span>
              <span>Gols</span>
            </div>
          </div>
          <div className="divide-y divide-border/50">
            {topScorers.map((scorer, i) => (
              <div key={scorer.name + i} className="flex items-center gap-4 px-5 py-4">
                <span className="w-6 text-center font-mono text-lg font-bold text-muted-foreground">
                  {i + 1}
                </span>
                <TeamBadge
                  name={scorer.teamShort || ""}
                  shortName={scorer.teamShort}
                  primaryColor={scorer.teamColor}
                  logoUrl={scorer.teamLogoUrl}
                  size="sm"
                />
                <div className="flex-1">
                  <p className="text-base font-semibold text-foreground">
                    {scorer.nickname || scorer.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{scorer.teamShort}</p>
                </div>
                <span className="font-mono text-2xl font-bold text-foreground">{scorer.goals}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
