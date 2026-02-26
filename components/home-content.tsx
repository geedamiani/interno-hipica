"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { TeamBadge } from "@/components/team-badge"
import { cn } from "@/lib/utils"
import type { Tables } from "@/lib/database.types"

type TournamentWithCategory = Pick<Tables<"tournaments">, "id" | "name" | "status" | "year" | "semester" | "location"> & {
  categories: { name: string } | null
}

type StandingsRow = Tables<"standings">

export interface HomeContentProps {
  tournament: TournamentWithCategory | null
  standings: StandingsRow[]
  topScorers: {
    name: string
    nickname: string | null
    teamShort: string | null
    teamColor: string | null
    teamLogoUrl: string | null
    goals: number
  }[]
  assists: {
    name: string
    nickname: string | null
    teamShort: string | null
    teamColor: string | null
    teamLogoUrl: string | null
    assists: number
  }[]
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr + "T12:00:00")
  return date.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit" })
}

export function HomeContent({ tournament, standings, topScorers, assists }: HomeContentProps) {
  const [activeTab, setActiveTab] = useState<"geral" | "A" | "B">("geral")
  const category = tournament?.categories

  const tabs = [
    { key: "geral" as const, label: "Geral" },
    { key: "A" as const, label: "Grupo A" },
    { key: "B" as const, label: "Grupo B" },
  ]

  const sortStandings = (list: StandingsRow[]) =>
    [...list].sort(
      (a, b) =>
        ((b.points) || 0) - ((a.points) || 0) ||
        ((b.goal_difference) || 0) - ((a.goal_difference) || 0) ||
        ((b.goals_for) || 0) - ((a.goals_for) || 0)
    )

  // Rank within group (1-based) for indicators in Geral and group tabs
  const rankInGroupByTeamId = (() => {
    const map = new Map<string, number>()
    const byGroup = new Map<string, StandingsRow[]>()
    for (const row of standings) {
      const g = row.group_name?.trim() ?? ""
      if (g === "") continue
      if (!byGroup.has(g)) byGroup.set(g, [])
      byGroup.get(g)!.push(row)
    }
    byGroup.forEach((rows) => {
      sortStandings(rows).forEach((row, idx) => {
        map.set(row.team_id, idx + 1)
      })
    })
    return map
  })()

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
              {category.name}
            </span>
          )}
          <span className="text-sm text-muted-foreground">
            {tournament?.year}/{tournament?.semester}
          </span>
        </div>
        <h1 className="mt-1.5 text-2xl font-bold uppercase tracking-tight text-foreground text-balance">
          {tournament?.name || "Campeonato"}
        </h1>
        {tournament?.location && (
          <p className="mt-1 text-sm text-muted-foreground">{tournament.location}</p>
        )}
      </header>

      {/* ===== CLASSIFICAÇÃO ===== */}
      <section className="mt-3 bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h2 className="text-lg font-bold uppercase text-foreground">Classificação</h2>
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
                const rankInGroup = rankInGroupByTeamId.get(team.team_id)
                const isDirectQualified = rankInGroup != null && rankInGroup <= 2
                const isRepescagem = rankInGroup != null && rankInGroup >= 3
                const showIndicator = rankInGroup != null
                return (
                  <tr key={team.team_id} className="border-b border-border/50">
                    <td className="py-3.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {showIndicator && (
                          <div
                            className={cn(
                              "h-5 w-1 rounded-full",
                              isDirectQualified ? "bg-primary" : isRepescagem ? "bg-destructive" : "bg-transparent"
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
                          name={team.team_name || ""}
                          shortName={team.short_name}
                          primaryColor={team.primary_color}
                          logoUrl={team.logo_url}
                          size="md"
                        />
                        <span className="truncate text-sm font-semibold text-foreground">
                          {team.short_name || team.team_name}
                        </span>
                        {!isGroupView && (
                          <span className="ml-auto shrink-0 pr-1 text-[10px] font-medium text-muted-foreground">
                            {team.group_name}
                          </span>
                        )}
                      </Link>
                    </td>
                    <td className="py-3.5 text-center font-mono text-sm font-bold text-foreground">
                      {team.points || 0}
                    </td>
                    <td className="py-3.5 text-center font-mono text-sm text-muted-foreground">
                      {team.played || 0}
                    </td>
                    <td className="py-3.5 text-center font-mono text-sm text-muted-foreground">
                      {team.wins || 0}
                    </td>
                    <td className="py-3.5 text-center font-mono text-sm text-muted-foreground">
                      {team.draws || 0}
                    </td>
                    <td className="py-3.5 text-center font-mono text-sm text-muted-foreground">
                      {team.losses || 0}
                    </td>
                    <td className="py-3.5 text-center font-mono text-sm text-muted-foreground">
                      {team.goal_difference || 0}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Legend - show when any team has a group (Geral or group tab) */}
        {standings.some((s) => s.group_name) && (
          <div className="flex items-center gap-5 px-5 py-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="h-4 w-1 rounded-full bg-primary" />
              <span>Classificado direto</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-1 rounded-full bg-destructive" />
              <span>Repescagem</span>
            </div>
          </div>
        )}
      </section>

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

      {/* ===== ASSISTÊNCIAS ===== */}
      {assists.length > 0 && (
        <section className="mt-3 bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <h2 className="text-lg font-bold uppercase text-foreground">Assistências</h2>
          </div>
          <div className="border-b border-border px-5 py-2">
            <div className="flex items-center justify-between text-xs font-semibold uppercase text-muted-foreground">
              <span>Ranking</span>
              <span>Assistências</span>
            </div>
          </div>
          <div className="divide-y divide-border/50">
            {assists.map((player, i) => (
              <div key={player.name + i} className="flex items-center gap-4 px-5 py-4">
                <span className="w-6 text-center font-mono text-lg font-bold text-muted-foreground">
                  {i + 1}
                </span>
                <TeamBadge
                  name={player.teamShort || ""}
                  shortName={player.teamShort}
                  primaryColor={player.teamColor}
                  logoUrl={player.teamLogoUrl}
                  size="sm"
                />
                <div className="flex-1">
                  <p className="text-base font-semibold text-foreground">
                    {player.nickname || player.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{player.teamShort}</p>
                </div>
                <span className="font-mono text-2xl font-bold text-foreground">{player.assists}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
