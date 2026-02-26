"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, MapPin, Clock } from "lucide-react"
import { TeamBadge } from "@/components/team-badge"
import { cn } from "@/lib/utils"
import type { Tables } from "@/lib/database.types"

type MatchWithTeamsAndRound = Tables<"matches"> & {
  home_team: Pick<Tables<"teams">, "id" | "name" | "short_name" | "primary_color" | "logo_url"> | null
  away_team: Pick<Tables<"teams">, "id" | "name" | "short_name" | "primary_color" | "logo_url"> | null
  rounds: (Pick<Tables<"rounds">, "round_number"> & { stages: Pick<Tables<"stages">, "name"> | null }) | null
}

type EventWithPlayer = Tables<"match_events"> & {
  players: Pick<Tables<"players">, "name" | "nickname"> | null
}

export interface MatchDetailContentProps {
  match: MatchWithTeamsAndRound
  events: EventWithPlayer[]
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr + "T12:00:00")
  return date.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })
}

function formatTime(timeStr: string) {
  return timeStr.slice(0, 5)
}

const eventLabels: Record<string, string> = {
  goal: "Gol",
  penalty_goal: "Gol (Pênalti)",
  own_goal: "Gol Contra",
  yellow_card: "Cartão Amarelo",
  red_card: "Cartão Vermelho",
  assist: "Assistência",
  penalty_miss: "Pênalti Perdido",
}

export function MatchDetailContent({ match, events }: MatchDetailContentProps) {
  const router = useRouter()
  const homeTeam = match.home_team
  const awayTeam = match.away_team
  const round = match.rounds
  const stages = round?.stages
  const isFinished = match.status === "finished"

  const homeEvents = events.filter((e) => e.team_id === homeTeam?.id)
  const awayEvents = events.filter((e) => e.team_id === awayTeam?.id)

  return (
    <main className="bg-background">
      {/* Back nav */}
      <header className="border-b border-border bg-card px-4 pb-3 pt-12">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-1 text-xs font-medium text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </button>
          <span className="text-xs text-muted-foreground">
            {stages?.name ? `${stages.name} - ` : ""}Rodada {round?.round_number}
          </span>
        </div>
      </header>

      {/* Score Card - clean white style */}
      <div className="border-b border-border bg-card px-4 py-6">
        <div className="flex items-center justify-center gap-4">
          <div className="flex flex-col items-center gap-2">
            <TeamBadge
              name={homeTeam?.name || ""}
              shortName={homeTeam?.short_name}
              primaryColor={homeTeam?.primary_color}
              logoUrl={homeTeam?.logo_url}
              size="lg"
            />
            <span className="text-xs font-semibold text-foreground">
              {homeTeam?.short_name}
            </span>
          </div>

          <div className="flex flex-col items-center">
            {isFinished ? (
              <div className="flex items-center gap-2">
                <span className="font-mono text-4xl font-bold text-foreground">
                  {match.home_score}
                </span>
                <span className="text-lg text-muted-foreground">x</span>
                <span className="font-mono text-4xl font-bold text-foreground">
                  {match.away_score}
                </span>
              </div>
            ) : (
              <span className="font-mono text-2xl font-bold text-muted-foreground">x</span>
            )}
            {isFinished && (
              <span className="mt-1 text-[10px] font-bold uppercase text-primary">Encerrado</span>
            )}
          </div>

          <div className="flex flex-col items-center gap-2">
            <TeamBadge
              name={awayTeam?.name || ""}
              shortName={awayTeam?.short_name}
              primaryColor={awayTeam?.primary_color}
              logoUrl={awayTeam?.logo_url}
              size="lg"
            />
            <span className="text-xs font-semibold text-foreground">
              {awayTeam?.short_name}
            </span>
          </div>
        </div>

        {/* Match Info */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-[10px] text-muted-foreground">
          {match.match_date && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDate(match.match_date)}
              {match.match_time && ` - ${formatTime(match.match_time)}`}
            </span>
          )}
          {match.field_number && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              Campo {match.field_number}
            </span>
          )}
        </div>
      </div>

      {/* Events Timeline */}
      {events.length > 0 && (
        <div className="border-b border-border bg-card">
          <div className="px-4 py-2.5">
            <h3 className="text-xs font-bold uppercase text-foreground">Eventos</h3>
          </div>
          <div className="divide-y divide-border/50">
            {events.map((event) => {
              const player = event.players
              const isHome = event.team_id === homeTeam?.id
              const type = event.event_type
              const isGoal = type === "goal" || type === "penalty_goal"
              const isCard = type === "yellow_card" || type === "red_card"
              return (
                <div
                  key={event.id}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2",
                    isHome ? "flex-row" : "flex-row-reverse"
                  )}
                >
                  {/* Event icon */}
                  <div className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded text-[8px] font-bold",
                    isGoal && "bg-primary text-primary-foreground",
                    type === "own_goal" && "bg-destructive text-destructive-foreground",
                    type === "yellow_card" && "bg-yellow-400 text-yellow-900",
                    type === "red_card" && "bg-destructive text-destructive-foreground",
                    type === "assist" && "bg-muted text-muted-foreground",
                    type === "penalty_miss" && "bg-muted text-muted-foreground"
                  )}>
                    {isGoal ? "G" : isCard ? "C" : "A"}
                  </div>
                  <div className={cn("flex-1", !isHome && "text-right")}>
                    <span className="text-xs font-medium text-foreground">
                      {player?.nickname || player?.name || ""}
                    </span>
                    <span className="ml-1 text-[10px] text-muted-foreground">
                      {eventLabels[type] || type}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Stats Summary */}
      {events.length > 0 && (
        <div className="bg-card">
          <div className="px-4 py-2.5">
            <h3 className="text-xs font-bold uppercase text-foreground">Resumo</h3>
          </div>
          <div className="divide-y divide-border/50 px-4 pb-4">
            {[
              { label: "Gols", home: homeEvents.filter(e => ["goal", "penalty_goal"].includes(e.event_type)).length, away: awayEvents.filter(e => ["goal", "penalty_goal"].includes(e.event_type)).length },
              { label: "Cartões Amarelos", home: homeEvents.filter(e => e.event_type === "yellow_card").length, away: awayEvents.filter(e => e.event_type === "yellow_card").length },
              { label: "Cartões Vermelhos", home: homeEvents.filter(e => e.event_type === "red_card").length, away: awayEvents.filter(e => e.event_type === "red_card").length },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center py-2 text-xs">
                <span className="w-8 text-center font-mono font-bold text-foreground">{stat.home}</span>
                <div className="flex-1 text-center text-muted-foreground">{stat.label}</div>
                <span className="w-8 text-center font-mono font-bold text-foreground">{stat.away}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {events.length === 0 && !isFinished && (
        <div className="py-12 text-center text-sm text-muted-foreground">
          Jogo ainda não realizado.
        </div>
      )}
    </main>
  )
}
