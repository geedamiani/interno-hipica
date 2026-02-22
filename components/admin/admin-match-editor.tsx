"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { TeamBadge } from "@/components/team-badge"
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { toast } from "sonner"

interface AdminMatchEditorProps {
  match: Record<string, unknown>
  homePlayers: Record<string, unknown>[]
  awayPlayers: Record<string, unknown>[]
  events: Record<string, unknown>[]
}

const eventTypes = [
  { value: "goal", label: "Gol" },
  { value: "penalty_goal", label: "Gol de Penalti" },
  { value: "own_goal", label: "Gol Contra" },
  { value: "assist", label: "Assistencia" },
  { value: "yellow_card", label: "Cartao Amarelo" },
  { value: "red_card", label: "Cartao Vermelho" },
  { value: "penalty_miss", label: "Penalti Perdido" },
]

interface MatchEvent {
  id?: string
  event_type: string
  player_id: string
  team_id: string
  minute: number | null
  isNew?: boolean
}

export function AdminMatchEditor({ match, homePlayers, awayPlayers, events: initialEvents }: AdminMatchEditorProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const homeTeam = match.home_team as Record<string, unknown>
  const awayTeam = match.away_team as Record<string, unknown>

  const [homeScore, setHomeScore] = useState<number>((match.home_score as number) ?? 0)
  const [awayScore, setAwayScore] = useState<number>((match.away_score as number) ?? 0)
  const [status, setStatus] = useState<string>((match.status as string) || "scheduled")

  const [matchEvents, setMatchEvents] = useState<MatchEvent[]>(
    initialEvents.map((e) => ({
      id: e.id as string,
      event_type: e.event_type as string,
      player_id: e.player_id as string,
      team_id: e.team_id as string,
      minute: e.minute as number | null,
    }))
  )
  const [deletedEventIds, setDeletedEventIds] = useState<string[]>([])

  function addEvent(teamId: string) {
    setMatchEvents((prev) => [
      ...prev,
      {
        event_type: "goal",
        player_id: "",
        team_id: teamId,
        minute: null,
        isNew: true,
      },
    ])
  }

  function removeEvent(index: number) {
    const event = matchEvents[index]
    if (event.id) {
      setDeletedEventIds((prev) => [...prev, event.id!])
    }
    setMatchEvents((prev) => prev.filter((_, i) => i !== index))
  }

  function updateEvent(index: number, field: keyof MatchEvent, value: string | number | null) {
    setMatchEvents((prev) =>
      prev.map((e, i) => (i === index ? { ...e, [field]: value } : e))
    )
  }

  async function handleSave() {
    startTransition(async () => {
      const supabase = createClient()

      // Update match score and status
      const { error: matchError } = await supabase
        .from("matches")
        .update({
          home_score: homeScore,
          away_score: awayScore,
          status,
        })
        .eq("id", match.id as string)

      if (matchError) {
        toast.error("Erro ao salvar resultado: " + matchError.message)
        return
      }

      // Delete removed events
      for (const id of deletedEventIds) {
        await supabase.from("match_events").delete().eq("id", id)
      }

      // Upsert events
      for (const event of matchEvents) {
        if (!event.player_id) continue
        if (event.id && !event.isNew) {
          await supabase.from("match_events").update({
            event_type: event.event_type,
            player_id: event.player_id,
            team_id: event.team_id,
            minute: event.minute,
          }).eq("id", event.id)
        } else {
          await supabase.from("match_events").insert({
            match_id: match.id as string,
            event_type: event.event_type,
            player_id: event.player_id,
            team_id: event.team_id,
            minute: event.minute,
          })
        }
      }

      toast.success("Resultado salvo com sucesso!")
      router.push("/admin/partidas")
      router.refresh()
    })
  }

  const homeEvents = matchEvents.filter((e) => e.team_id === (homeTeam?.id as string))
  const awayEvents = matchEvents.filter((e) => e.team_id === (awayTeam?.id as string))

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <Link href="/admin/partidas">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Voltar</span>
          </Button>
        </Link>
        <div>
          <h1 className="font-sans text-xl font-bold">Editar Partida</h1>
          <p className="text-xs text-muted-foreground">
            {homeTeam?.name as string} vs {awayTeam?.name as string}
          </p>
        </div>
      </div>

      {/* Score */}
      <Card className="mb-4">
        <CardContent className="py-6">
          <div className="flex items-center justify-center gap-6">
            <div className="flex flex-col items-center gap-2">
              <TeamBadge
                name={homeTeam?.name as string}
                shortName={homeTeam?.short_name as string}
                primaryColor={homeTeam?.primary_color as string}
                logoUrl={homeTeam?.logo_url as string}
                size="lg"
              />
              <span className="text-xs font-semibold">{homeTeam?.short_name as string}</span>
              <Input
                type="number"
                min={0}
                className="w-16 text-center font-mono text-2xl font-bold"
                value={homeScore}
                onChange={(e) => setHomeScore(parseInt(e.target.value) || 0)}
              />
            </div>

            <span className="text-xl font-bold text-muted-foreground">x</span>

            <div className="flex flex-col items-center gap-2">
              <TeamBadge
                name={awayTeam?.name as string}
                shortName={awayTeam?.short_name as string}
                primaryColor={awayTeam?.primary_color as string}
                logoUrl={awayTeam?.logo_url as string}
                size="lg"
              />
              <span className="text-xs font-semibold">{awayTeam?.short_name as string}</span>
              <Input
                type="number"
                min={0}
                className="w-16 text-center font-mono text-2xl font-bold"
                value={awayScore}
                onChange={(e) => setAwayScore(parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="mt-4 flex justify-center">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-center">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Agendado</SelectItem>
                  <SelectItem value="in_progress">Em andamento</SelectItem>
                  <SelectItem value="finished">Encerrado</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Events */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Home Team Events */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">
              Eventos - {homeTeam?.short_name as string}
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addEvent(homeTeam?.id as string)}
            >
              <Plus className="mr-1 h-3 w-3" /> Adicionar
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {homeEvents.length === 0 && (
              <p className="py-4 text-center text-xs text-muted-foreground">Nenhum evento registrado.</p>
            )}
            {matchEvents.map((event, i) => {
              if (event.team_id !== (homeTeam?.id as string)) return null
              return (
                <EventRow
                  key={event.id || `new-${i}`}
                  event={event}
                  index={i}
                  players={homePlayers}
                  onUpdate={updateEvent}
                  onRemove={removeEvent}
                />
              )
            })}
          </CardContent>
        </Card>

        {/* Away Team Events */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">
              Eventos - {awayTeam?.short_name as string}
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addEvent(awayTeam?.id as string)}
            >
              <Plus className="mr-1 h-3 w-3" /> Adicionar
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {awayEvents.length === 0 && (
              <p className="py-4 text-center text-xs text-muted-foreground">Nenhum evento registrado.</p>
            )}
            {matchEvents.map((event, i) => {
              if (event.team_id !== (awayTeam?.id as string)) return null
              return (
                <EventRow
                  key={event.id || `new-${i}`}
                  event={event}
                  index={i}
                  players={awayPlayers}
                  onUpdate={updateEvent}
                  onRemove={removeEvent}
                />
              )
            })}
          </CardContent>
        </Card>
      </div>

      {/* Save */}
      <div className="mt-6 flex justify-end gap-3">
        <Link href="/admin/partidas">
          <Button variant="outline">Cancelar</Button>
        </Link>
        <Button onClick={handleSave} disabled={isPending}>
          <Save className="mr-2 h-4 w-4" />
          {isPending ? "Salvando..." : "Salvar Resultado"}
        </Button>
      </div>
    </div>
  )
}

function EventRow({
  event,
  index,
  players,
  onUpdate,
  onRemove,
}: {
  event: MatchEvent
  index: number
  players: Record<string, unknown>[]
  onUpdate: (index: number, field: keyof MatchEvent, value: string | number | null) => void
  onRemove: (index: number) => void
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border p-2">
      <Select
        value={event.event_type}
        onValueChange={(val) => onUpdate(index, "event_type", val)}
      >
        <SelectTrigger className="h-8 w-28 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {eventTypes.map((t) => (
            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={event.player_id || ""}
        onValueChange={(val) => onUpdate(index, "player_id", val)}
      >
        <SelectTrigger className="h-8 flex-1 text-xs">
          <SelectValue placeholder="Jogador" />
        </SelectTrigger>
        <SelectContent>
          {players.map((p) => (
            <SelectItem key={p.id as string} value={p.id as string}>
              {p.shirt_number != null ? `#${p.shirt_number} ` : ""}
              {(p.nickname as string) || (p.name as string)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        type="number"
        min={0}
        max={120}
        placeholder={"Min"}
        className="h-8 w-14 text-center text-xs"
        value={event.minute ?? ""}
        onChange={(e) => onUpdate(index, "minute", e.target.value ? parseInt(e.target.value) : null)}
      />

      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => onRemove(index)}>
        <Trash2 className="h-3.5 w-3.5" />
        <span className="sr-only">Remover evento</span>
      </Button>
    </div>
  )
}


