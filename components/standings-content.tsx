"use client"

import { useState } from "react"
import Link from "next/link"
import { TeamBadge } from "@/components/team-badge"
import { cn } from "@/lib/utils"
import type { Tables } from "@/lib/database.types"

type StandingsRow = Tables<"standings">

interface StandingsContentProps {
  standings: StandingsRow[]
}

export function StandingsContent({ standings }: StandingsContentProps) {
  const [activeTab, setActiveTab] = useState<"A" | "B" | "geral">("A")

  const tabs = [
    { key: "A" as const, label: "Grupo A" },
    { key: "B" as const, label: "Grupo B" },
    { key: "geral" as const, label: "Geral" },
  ]

  const sortStandings = (list: StandingsRow[]) =>
    [...list].sort((a, b) =>
      ((b.points) || 0) - ((a.points) || 0) ||
      ((b.goal_difference) || 0) - ((a.goal_difference) || 0) ||
      ((b.goals_for) || 0) - ((a.goals_for) || 0)
    )

  const filteredStandings = activeTab === "geral"
    ? sortStandings(standings)
    : sortStandings(standings.filter((s) => s.group_name === activeTab))

  const isGroupView = activeTab !== "geral"

  return (
    <main className="bg-background">
      <header className="border-b border-border bg-card px-4 pb-3 pt-12">
        <h1 className="text-xl font-bold uppercase tracking-tight text-foreground">Tabela</h1>
        <p className="mt-0.5 text-xs text-muted-foreground">Fase de Grupos</p>
      </header>

      {/* Tabs: Grupo A, Grupo B, Geral */}
      <div className="flex bg-card">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "flex-1 border-b-2 py-2.5 text-center text-xs font-bold uppercase transition-colors",
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
      <div className="overflow-x-auto bg-card">
        <table className="w-full min-w-[420px] text-xs">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="w-7 py-2.5 text-center text-[10px] font-semibold uppercase"></th>
              <th className="py-2.5 text-left text-[10px] font-semibold uppercase pl-1">Classificacao</th>
              <th className="w-8 py-2.5 text-center text-[10px] font-bold uppercase">P</th>
              <th className="w-7 py-2.5 text-center text-[10px] font-semibold uppercase">J</th>
              <th className="w-7 py-2.5 text-center text-[10px] font-semibold uppercase">V</th>
              <th className="w-7 py-2.5 text-center text-[10px] font-semibold uppercase">E</th>
              <th className="w-7 py-2.5 text-center text-[10px] font-semibold uppercase">D</th>
              <th className="w-7 py-2.5 text-center text-[10px] font-semibold uppercase">GP</th>
              <th className="w-7 py-2.5 text-center text-[10px] font-semibold uppercase">GC</th>
              <th className="w-7 py-2.5 text-center text-[10px] font-semibold uppercase">SG</th>
            </tr>
          </thead>
          <tbody>
            {filteredStandings.map((team, i) => {
              // In group view: top 2 = direct, 3-6 = repescagem
              // In geral view: no classification indicators
              const showClassification = isGroupView
              const isDirectQualified = showClassification && i < 2
              const isRepescagem = showClassification && i >= 2

              return (
                <tr
                  key={team.team_id}
                  className="border-b border-border/50 transition-colors hover:bg-muted/30"
                >
                  <td className="py-3 text-center">
                    <div className="flex items-center justify-center gap-0.5">
                      {showClassification && (
                        <div
                          className={cn(
                            "w-0.5 rounded-full",
                            isDirectQualified ? "bg-primary" : isRepescagem ? "bg-secondary" : "bg-transparent"
                          )}
                          style={{ minHeight: 16 }}
                        />
                      )}
                      <span className="font-mono text-xs font-medium text-muted-foreground w-4 text-center">{i + 1}</span>
                    </div>
                  </td>
                  <td className="py-3 pl-1">
                    <Link href={`/times/${team.team_id}`} className="flex items-center gap-2">
                      <TeamBadge
                        name={team.team_name || ""}
                        shortName={team.short_name}
                        primaryColor={team.primary_color}
                        logoUrl={team.logo_url}
                        size="sm"
                      />
                      <span className="truncate text-xs font-medium text-foreground">
                        {team.team_name}
                      </span>
                      {!isGroupView && (
                        <span className="text-[9px] font-medium text-muted-foreground ml-auto shrink-0 pr-1">
                          {team.group_name}
                        </span>
                      )}
                    </Link>
                  </td>
                  <td className="py-3 text-center font-mono text-xs font-bold text-foreground">{team.points || 0}</td>
                  <td className="py-3 text-center font-mono text-xs text-muted-foreground">{team.played || 0}</td>
                  <td className="py-3 text-center font-mono text-xs text-muted-foreground">{team.wins || 0}</td>
                  <td className="py-3 text-center font-mono text-xs text-muted-foreground">{team.draws || 0}</td>
                  <td className="py-3 text-center font-mono text-xs text-muted-foreground">{team.losses || 0}</td>
                  <td className="py-3 text-center font-mono text-xs text-muted-foreground">{team.goals_for || 0}</td>
                  <td className="py-3 text-center font-mono text-xs text-muted-foreground">{team.goals_against || 0}</td>
                  <td className="py-3 text-center font-mono text-xs text-muted-foreground">{team.goal_difference || 0}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Legend - only in group view */}
      {isGroupView && (
        <div className="flex items-center gap-4 bg-card px-4 py-3 text-[10px] text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-1 rounded-full bg-primary" />
            <span>Classificado direto</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-1 rounded-full bg-secondary" />
            <span>Repescagem</span>
          </div>
        </div>
      )}
    </main>
  )
}
