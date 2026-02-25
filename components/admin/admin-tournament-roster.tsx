"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { TeamBadge } from "@/components/team-badge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ArrowLeft, Users, Plus, Trash2, Search, X,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import type { Tables } from "@/lib/database.types"

const POSITIONS = [
  "Goleiro", "Zagueiro", "Lateral Direito", "Lateral Esquerdo",
  "Volante", "Meia", "Atacante",
]

type RosterEntry = Tables<"team_players"> & { players: Tables<"players"> | null }

interface Props {
  tournament: { id: string; name: string; year: number; semester: number }
  team: { id: string; name: string; short_name: string | null; logo_url: string | null }
  roster: RosterEntry[]
  allPlayers: Tables<"players">[]
}

export function AdminTournamentRoster({ tournament, team, roster: initialRoster, allPlayers: initialAllPlayers }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [roster, setRoster] = useState(initialRoster)
  const [allPlayers, setAllPlayers] = useState(initialAllPlayers)
  const [searchQuery, setSearchQuery] = useState("")
  const [showSearch, setShowSearch] = useState(false)
  const [addingNew, setAddingNew] = useState(false)
  const [newPlayer, setNewPlayer] = useState({ name: "", nickname: "", position: "" })

  const rosterPlayerIds = new Set(roster.map((r) => r.player_id))

  const searchResults = searchQuery.length >= 2
    ? allPlayers.filter((p) => {
        if (rosterPlayerIds.has(p.id)) return false
        const q = searchQuery.toLowerCase()
        return p.name.toLowerCase().includes(q) || (p.nickname?.toLowerCase().includes(q) ?? false)
      }).slice(0, 10)
    : []

  async function handleAddExistingPlayer(player: Tables<"players">) {
    const { data, error } = await supabase.from("team_players").insert({
      team_id: team.id,
      player_id: player.id,
      tournament_id: tournament.id,
    }).select("*, players(*)").single()

    if (error || !data) { toast.error("Erro: " + (error?.message || "")); return }
    setRoster((prev) => [...prev, data as RosterEntry])
    setSearchQuery("")
    setShowSearch(false)
    toast.success(`${player.nickname || player.name} adicionado ao elenco`)
  }

  async function handleCreateAndAdd() {
    if (!newPlayer.name.trim()) { toast.error("Nome obrigatorio"); return }

    const { data: player, error: pErr } = await supabase.from("players").insert({
      name: newPlayer.name.trim(),
      nickname: newPlayer.nickname.trim() || null,
      position: newPlayer.position || null,
    }).select().single()

    if (pErr || !player) { toast.error("Erro: " + (pErr?.message || "")); return }

    const { data: tp, error: tpErr } = await supabase.from("team_players").insert({
      team_id: team.id,
      player_id: player.id,
      tournament_id: tournament.id,
    }).select("*, players(*)").single()

    if (tpErr || !tp) { toast.error("Erro ao vincular"); return }

    setAllPlayers((prev) => [...prev, player])
    setRoster((prev) => [...prev, tp as RosterEntry])
    setNewPlayer({ name: "", nickname: "", position: "" })
    setAddingNew(false)
    setShowSearch(false)
    toast.success(`${player.nickname || player.name} criado e adicionado`)
  }

  async function handleRemoveFromRoster(tpId: string) {
    const { error } = await supabase.from("team_players").delete().eq("id", tpId)
    if (error) { toast.error("Erro"); return }
    setRoster((prev) => prev.filter((r) => r.id !== tpId))
    toast.success("Removido do elenco")
  }

  return (
    <div className="px-4 py-5">
      {/* Header */}
      <div className="mb-5 flex items-center gap-3">
        <Link href={`/admin/campeonatos/${tournament.id}`}>
          <button className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted">
            <ArrowLeft className="h-5 w-5" />
          </button>
        </Link>
        <TeamBadge name={team.name} shortName={team.short_name} logoUrl={team.logo_url} size="lg" />
        <div className="flex-1 min-w-0">
          <h1 className="truncate text-lg font-bold">{team.name}</h1>
          <p className="text-xs text-muted-foreground">{tournament.name} — {tournament.year}/{tournament.semester}</p>
        </div>
      </div>

      {/* Elenco */}
      <section className="rounded-xl bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-bold uppercase text-muted-foreground">
            <Users className="h-4 w-4" /> Elenco ({roster.length})
          </h2>
          <button
            onClick={() => { setShowSearch(true); setAddingNew(false) }}
            className="flex items-center gap-1 text-xs font-semibold text-primary"
          >
            <Plus className="h-3 w-3" /> Adicionar
          </button>
        </div>

        {/* Search / Add UI */}
        {showSearch && (
          <div className="mb-4 rounded-lg border border-border bg-muted/30 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-bold">Buscar jogador existente</span>
              <button onClick={() => { setShowSearch(false); setSearchQuery(""); setAddingNew(false) }}>
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou apelido..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                autoFocus
              />
            </div>

            {searchQuery.length >= 2 && searchResults.length > 0 && (
              <div className="mb-2 flex max-h-48 flex-col gap-1 overflow-y-auto">
                {searchResults.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleAddExistingPlayer(p)}
                    className="flex items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-muted/50 active:bg-muted"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium">{p.nickname || p.name}</p>
                      {p.nickname && <p className="text-[10px] text-muted-foreground">{p.name}</p>}
                    </div>
                    {p.position && <Badge variant="outline" className="text-[10px]">{p.position}</Badge>}
                    <Plus className="h-4 w-4 shrink-0 text-primary" />
                  </button>
                ))}
              </div>
            )}

            {searchQuery.length >= 2 && searchResults.length === 0 && !addingNew && (
              <p className="mb-2 text-center text-xs text-muted-foreground">Nenhum jogador encontrado.</p>
            )}

            <button
              onClick={() => setAddingNew(true)}
              className="flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-border py-2 text-xs font-semibold text-primary hover:bg-muted/30"
            >
              <Plus className="h-3.5 w-3.5" /> Criar novo jogador
            </button>

            {addingNew && (
              <div className="mt-3 flex flex-col gap-2 rounded-lg border border-border p-3">
                <div>
                  <Label className="text-xs">Nome Completo *</Label>
                  <Input value={newPlayer.name} onChange={(e) => setNewPlayer((p) => ({ ...p, name: e.target.value }))} placeholder="Nome completo" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Apelido</Label>
                    <Input value={newPlayer.nickname} onChange={(e) => setNewPlayer((p) => ({ ...p, nickname: e.target.value }))} placeholder="Nome exibicao" />
                  </div>
                  <div>
                    <Label className="text-xs">Posicao</Label>
                    <Select value={newPlayer.position} onValueChange={(v) => setNewPlayer((p) => ({ ...p, position: v }))}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        {POSITIONS.map((pos) => (<SelectItem key={pos} value={pos}>{pos}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleCreateAndAdd}><Plus className="mr-1 h-3.5 w-3.5" />Criar e Adicionar</Button>
                  <Button size="sm" variant="ghost" onClick={() => { setAddingNew(false); setNewPlayer({ name: "", nickname: "", position: "" }) }}>Cancelar</Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Roster list */}
        {roster.length === 0 ? (
          <p className="py-6 text-center text-xs text-muted-foreground">Nenhum jogador no elenco deste torneio.</p>
        ) : (
          <div className="flex flex-col gap-1">
            {roster.map((entry) => {
              const player = entry.players
              if (!player) return null
              return (
                <div key={entry.id} className="flex items-center gap-3 rounded-lg px-2 py-2.5 hover:bg-muted/30">
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium">
                      {player.nickname || player.name}
                      {entry.is_captain && <span className="ml-1.5 text-[10px] font-bold text-primary">C</span>}
                    </p>
                    {player.nickname && <p className="truncate text-xs text-muted-foreground">{player.name}</p>}
                  </div>
                  {player.position && <Badge variant="outline" className="shrink-0 text-[10px]">{player.position}</Badge>}
                  <button
                    onClick={() => handleRemoveFromRoster(entry.id)}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
