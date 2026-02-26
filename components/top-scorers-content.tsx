"use client"

import { useState } from "react"
import { TeamBadge } from "@/components/team-badge"
import { cn } from "@/lib/utils"

interface PlayerStat {
  name: string
  nickname: string | null
  shirtNumber: number | null
  teamName: string
  teamShort: string | null
  teamColor: string | null
  teamLogo: string | null
  goals: number
  assists: number
}

interface TopScorersContentProps {
  topGoals: PlayerStat[]
  topAssists: PlayerStat[]
}

export function TopScorersContent({ topGoals, topAssists }: TopScorersContentProps) {
  const [tab, setTab] = useState<"goals" | "assists">("goals")

  const list = tab === "goals" ? topGoals : topAssists
  const isEmpty = list.length === 0

  return (
    <main className="bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card px-4 pb-3 pt-12">
        <h1 className="text-xl font-bold uppercase tracking-tight text-foreground">Artilharia</h1>
        <p className="mt-0.5 text-xs text-muted-foreground">Goleadores e Garçons</p>
      </header>

      {/* Tabs */}
      <div className="flex bg-card">
        <button
          onClick={() => setTab("goals")}
          className={cn(
            "flex-1 border-b-2 py-2.5 text-center text-xs font-bold uppercase transition-colors",
            tab === "goals"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Gols
        </button>
        <button
          onClick={() => setTab("assists")}
          className={cn(
            "flex-1 border-b-2 py-2.5 text-center text-xs font-bold uppercase transition-colors",
            tab === "assists"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Assistências
        </button>
      </div>

      {/* Table header */}
      <div className="bg-card">
        {!isEmpty && (
          <div className="flex items-center border-b border-border px-4 py-2 text-[10px] font-semibold uppercase text-muted-foreground">
            <span className="w-7 text-center">#</span>
            <span className="flex-1 pl-10">Jogador</span>
            <span className="w-12 text-center">{tab === "goals" ? "Gols" : "Assist."}</span>
          </div>
        )}

        {/* List */}
        {isEmpty ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            Nenhuma estatística registrada ainda.
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {list.map((player, i) => (
              <div
                key={player.name + player.teamName + i}
                className="flex items-center gap-2 px-4 py-2.5 transition-colors hover:bg-muted/30"
              >
                <span className="w-5 text-center font-mono text-xs font-bold text-muted-foreground">
                  {i + 1}
                </span>
                <TeamBadge
                  name={player.teamName}
                  shortName={player.teamShort}
                  primaryColor={player.teamColor}
                  logoUrl={player.teamLogo}
                  size="sm"
                />
                <div className="flex-1">
                  <p className="text-xs font-medium text-foreground">
                    {player.nickname || player.name}
                    {player.shirtNumber != null && (
                      <span className="ml-1 font-mono text-[10px] text-muted-foreground">
                        #{player.shirtNumber}
                      </span>
                    )}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{player.teamName}</p>
                </div>
                <span className="w-12 text-center font-mono text-sm font-bold text-foreground">
                  {tab === "goals" ? player.goals : player.assists}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
