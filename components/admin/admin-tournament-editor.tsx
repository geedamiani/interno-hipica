"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TeamBadge } from "@/components/team-badge"
import {
  ArrowLeft, Save, Plus, Trash2, Users, ChevronRight,
  CalendarDays, Shield, Search, X,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import type { Tables } from "@/lib/database.types"

interface Category { id: string; name: string }

interface TournamentTeam {
  tournamentTeamId: string
  teamId: string
  name: string
  short_name: string | null
  logo_url: string | null
  primary_color: string | null
  group_name: string | null
  playerCount: number
}

type Stage = Tables<"stages">
type Round = Tables<"rounds"> & { stages: Tables<"stages"> | null }
type Match = Tables<"matches"> & {
  home_team: Tables<"teams"> | null
  away_team: Tables<"teams"> | null
  rounds: (Tables<"rounds"> & { stages: Tables<"stages"> | null }) | null
}

type TabKey = "info" | "times" | "jogos"

const tabs: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: "info", label: "Info", icon: Shield },
  { key: "times", label: "Times", icon: Users },
  { key: "jogos", label: "Jogos", icon: CalendarDays },
]

const GROUPS = ["A", "B", "C", "D", "E", "F"]

interface Props {
  tournament: Tables<"tournaments">
  categories: Category[]
  teams: TournamentTeam[]
  allTeams: { id: string; name: string; short_name: string | null; logo_url: string | null }[]
  stages: Stage[]
  rounds: Round[]
  matches: Match[]
}

function slugify(text: string) {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
}

export function AdminTournamentEditor({ tournament, categories, teams: initialTeams, allTeams, stages, rounds, matches }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const supabase = createClient()

  const [activeTab, setActiveTab] = useState<TabKey>("info")
  const [teams, setTeams] = useState(initialTeams)

  // ====== INFO TAB STATE ======
  const [name, setName] = useState(tournament.name)
  const [year, setYear] = useState(tournament.year.toString())
  const [semester, setSemester] = useState(tournament.semester.toString())
  const [categoryId, setCategoryId] = useState(tournament.category_id || "")
  const [status, setStatus] = useState(tournament.status || "draft")
  const [startDate, setStartDate] = useState(tournament.start_date || "")
  const [endDate, setEndDate] = useState(tournament.end_date || "")
  const [location, setLocation] = useState(tournament.location || "")

  // ====== TEAMS TAB STATE ======
  const [showAddTeam, setShowAddTeam] = useState(false)
  const [teamSearch, setTeamSearch] = useState("")
  const [selectedGroup, setSelectedGroup] = useState("")
  const [creatingNew, setCreatingNew] = useState(false)
  const [newTeamName, setNewTeamName] = useState("")
  const [newTeamShort, setNewTeamShort] = useState("")

  // ====== MATCHES TAB STATE ======
  const [addingMatch, setAddingMatch] = useState(false)
  const [newMatch, setNewMatch] = useState({ home_team_id: "", away_team_id: "", match_date: "", match_time: "", field_number: "", round_id: "" })

  // ====== INFO HANDLERS ======
  async function handleSaveInfo() {
    startTransition(async () => {
      const { error } = await supabase.from("tournaments").update({
        name: name.trim(),
        slug: slugify(name.trim()),
        year: parseInt(year),
        semester: parseInt(semester),
        category_id: categoryId || null,
        status,
        start_date: startDate || null,
        end_date: endDate || null,
        location: location.trim() || null,
      }).eq("id", tournament.id)
      if (error) { toast.error("Erro: " + error.message); return }
      toast.success("Torneio atualizado")
      router.refresh()
    })
  }

  // ====== TEAMS HANDLERS ======
  const teamIdsInTournament = new Set(teams.map((t) => t.teamId))

  const searchResults = teamSearch.length >= 2
    ? allTeams.filter((t) => {
        if (teamIdsInTournament.has(t.id)) return false
        const q = teamSearch.toLowerCase()
        return t.name.toLowerCase().includes(q) || (t.short_name?.toLowerCase().includes(q) ?? false)
      }).slice(0, 15)
    : []

  async function handleAddExistingTeam(teamId: string) {
    const { data, error } = await supabase.from("tournament_teams").insert({
      tournament_id: tournament.id,
      team_id: teamId,
      group_name: selectedGroup || null,
    }).select("*, teams(id, name, short_name, logo_url, primary_color)").single()

    if (error || !data) { toast.error("Erro: " + (error?.message || "")); return }
    const t = data.teams as { id: string; name: string; short_name: string | null; logo_url: string | null; primary_color: string | null }
    setTeams((prev) => [...prev, {
      tournamentTeamId: data.id,
      teamId: t.id,
      name: t.name,
      short_name: t.short_name,
      logo_url: t.logo_url,
      primary_color: t.primary_color,
      group_name: data.group_name,
      playerCount: 0,
    }])
    setTeamSearch("")
    toast.success(`${t.name} adicionado`)
  }

  async function handleCreateAndAddTeam() {
    if (!newTeamName.trim()) { toast.error("Nome obrigatorio"); return }
    const { data: team, error: tErr } = await supabase.from("teams").insert({
      name: newTeamName.trim(),
      short_name: newTeamShort.trim() || null,
    }).select().single()
    if (tErr || !team) { toast.error("Erro: " + (tErr?.message || "")); return }

    const { data: tt, error: ttErr } = await supabase.from("tournament_teams").insert({
      tournament_id: tournament.id,
      team_id: team.id,
      group_name: selectedGroup || null,
    }).select().single()
    if (ttErr || !tt) { toast.error("Erro ao vincular"); return }

    setTeams((prev) => [...prev, {
      tournamentTeamId: tt.id,
      teamId: team.id,
      name: team.name,
      short_name: team.short_name,
      logo_url: team.logo_url,
      primary_color: team.primary_color,
      group_name: tt.group_name,
      playerCount: 0,
    }])
    setNewTeamName("")
    setNewTeamShort("")
    setCreatingNew(false)
    toast.success(`${team.name} criado e adicionado`)
  }

  async function handleRemoveTeam(tournamentTeamId: string, teamId: string) {
    const teamName = teams.find((t) => t.tournamentTeamId === tournamentTeamId)?.name || "Time"
    if (!confirm(`Remover "${teamName}" deste torneio e todas as partidas associadas?`)) return

    const { data: relatedMatches } = await supabase
      .from("matches")
      .select("id")
      .eq("tournament_id", tournament.id)
      .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`)

    if (relatedMatches && relatedMatches.length > 0) {
      const matchIds = relatedMatches.map((m) => m.id)
      await supabase.from("match_events").delete().in("match_id", matchIds)
      await supabase.from("matches").delete().in("id", matchIds)
    }

    await supabase.from("team_players").delete().eq("team_id", teamId).eq("tournament_id", tournament.id)
    await supabase.from("tournament_teams").delete().eq("id", tournamentTeamId)

    setTeams((prev) => prev.filter((t) => t.tournamentTeamId !== tournamentTeamId))
    toast.success("Time removido do torneio")
    startTransition(() => router.refresh())
  }

  async function handleUpdateGroup(tournamentTeamId: string, group: string) {
    const { error } = await supabase.from("tournament_teams").update({ group_name: group || null }).eq("id", tournamentTeamId)
    if (error) { toast.error("Erro"); return }
    setTeams((prev) => prev.map((t) => t.tournamentTeamId === tournamentTeamId ? { ...t, group_name: group || null } : t))
  }

  // ====== MATCHES HANDLERS ======
  async function handleAddMatch() {
    if (!newMatch.home_team_id || !newMatch.away_team_id) { toast.error("Selecione os dois times"); return }
    if (newMatch.home_team_id === newMatch.away_team_id) { toast.error("Times devem ser diferentes"); return }
    const { error } = await supabase.from("matches").insert({
      tournament_id: tournament.id,
      home_team_id: newMatch.home_team_id,
      away_team_id: newMatch.away_team_id,
      match_date: newMatch.match_date || null,
      match_time: newMatch.match_time || null,
      field_number: newMatch.field_number ? parseInt(newMatch.field_number) : null,
      round_id: newMatch.round_id || null,
      status: "scheduled",
    })
    if (error) { toast.error("Erro: " + error.message); return }
    toast.success("Partida adicionada")
    setNewMatch({ home_team_id: "", away_team_id: "", match_date: "", match_time: "", field_number: "", round_id: "" })
    setAddingMatch(false)
    startTransition(() => router.refresh())
  }

  async function handleDeleteMatch(matchId: string) {
    const { error } = await supabase.from("matches").delete().eq("id", matchId)
    if (error) { toast.error("Erro: " + error.message); return }
    toast.success("Partida removida")
    startTransition(() => router.refresh())
  }

  const groupedTeams = teams.reduce<Record<string, TournamentTeam[]>>((acc, team) => {
    const g = team.group_name || "Sem grupo"
    if (!acc[g]) acc[g] = []
    acc[g].push(team)
    return acc
  }, {})

  const matchesByRound = matches.reduce<Record<string, Match[]>>((acc, m) => {
    const roundName = m.rounds ? `${m.rounds.name || `Rodada ${m.rounds.round_number}`}` : "Sem rodada"
    if (!acc[roundName]) acc[roundName] = []
    acc[roundName].push(m)
    return acc
  }, {})

  function formatDate(d: string) {
    return new Date(d + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
  }

  return (
    <div className="px-4 py-5">
      {/* Header */}
      <div className="mb-4 flex items-center gap-3">
        <Link href="/admin/campeonatos">
          <button className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted">
            <ArrowLeft className="h-5 w-5" />
          </button>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="truncate text-lg font-bold">{tournament.name}</h1>
          <p className="text-xs text-muted-foreground">{tournament.year}/{tournament.semester}</p>
        </div>
        <Badge variant={status === "active" ? "default" : "outline"} className="text-[10px]">
          {status === "active" ? "Ativo" : status === "finished" ? "Encerrado" : "Rascunho"}
        </Badge>
      </div>

      {/* Tabs */}
      <div className="mb-4 flex border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 border-b-2 py-3 text-sm font-bold uppercase transition-colors",
              activeTab === tab.key ? "border-primary text-primary" : "border-transparent text-muted-foreground"
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ====== INFO TAB ====== */}
      {activeTab === "info" && (
        <div className="flex flex-col gap-4 rounded-xl bg-card p-4">
          <div>
            <Label className="text-xs">Nome</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Ano</Label>
              <Input type="number" value={year} onChange={(e) => setYear(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Semestre</Label>
              <Select value={semester} onValueChange={setSemester}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1o Semestre</SelectItem>
                  <SelectItem value="2">2o Semestre</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Categoria</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Rascunho</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="finished">Encerrado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Data inicio</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Data fim</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
          <div>
            <Label className="text-xs">Local</Label>
            <Input value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>
          <Button onClick={handleSaveInfo} disabled={isPending}>
            <Save className="mr-1.5 h-4 w-4" />
            {isPending ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      )}

      {/* ====== TEAMS TAB ====== */}
      {activeTab === "times" && (
        <div>
          <div className="mb-3">
            <Button size="sm" onClick={() => { setShowAddTeam(true); setCreatingNew(false); setTeamSearch("") }}>
              <Plus className="mr-1 h-3.5 w-3.5" /> Adicionar Time
            </Button>
          </div>

          {/* Add team panel */}
          {showAddTeam && (
            <div className="mb-4 rounded-xl border border-border bg-card p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold">Adicionar Time ao Torneio</h3>
                <button onClick={() => { setShowAddTeam(false); setTeamSearch(""); setCreatingNew(false) }}>
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>

              {/* Group selector */}
              <div className="mb-3">
                <Label className="text-xs">Grupo</Label>
                <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                  <SelectTrigger className="text-xs"><SelectValue placeholder="Selecione o grupo" /></SelectTrigger>
                  <SelectContent>
                    {GROUPS.map((g) => (<SelectItem key={g} value={g}>Grupo {g}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>

              {/* Search existing teams */}
              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar time existente..."
                  value={teamSearch}
                  onChange={(e) => setTeamSearch(e.target.value)}
                  className="pl-9"
                />
              </div>

              {teamSearch.length >= 2 && searchResults.length > 0 && (
                <div className="mb-2 flex max-h-48 flex-col gap-1 overflow-y-auto">
                  {searchResults.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => handleAddExistingTeam(t.id)}
                      className="flex items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-muted/50 active:bg-muted"
                    >
                      <TeamBadge name={t.name} shortName={t.short_name} logoUrl={t.logo_url} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium">{t.name}</p>
                        {t.short_name && <p className="text-[10px] text-muted-foreground">{t.short_name}</p>}
                      </div>
                      <Plus className="h-4 w-4 shrink-0 text-primary" />
                    </button>
                  ))}
                </div>
              )}

              {teamSearch.length >= 2 && searchResults.length === 0 && !creatingNew && (
                <p className="mb-2 text-center text-xs text-muted-foreground">Nenhum time encontrado.</p>
              )}

              <button
                onClick={() => setCreatingNew(true)}
                className="flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-border py-2 text-xs font-semibold text-primary hover:bg-muted/30"
              >
                <Plus className="h-3.5 w-3.5" /> Criar novo time
              </button>

              {creatingNew && (
                <div className="mt-3 flex flex-col gap-2 rounded-lg border border-border p-3">
                  <div>
                    <Label className="text-xs">Nome *</Label>
                    <Input value={newTeamName} onChange={(e) => setNewTeamName(e.target.value)} placeholder="Nome do time" />
                  </div>
                  <div>
                    <Label className="text-xs">Sigla</Label>
                    <Input value={newTeamShort} onChange={(e) => setNewTeamShort(e.target.value)} placeholder="Ex: ABC" maxLength={4} />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleCreateAndAddTeam}><Plus className="mr-1 h-3.5 w-3.5" />Criar e Adicionar</Button>
                    <Button size="sm" variant="ghost" onClick={() => { setCreatingNew(false); setNewTeamName(""); setNewTeamShort("") }}>Cancelar</Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Teams list grouped */}
          {teams.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
              <Shield className="h-8 w-8" />
              <p className="text-sm">Nenhum time neste torneio.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {Object.keys(groupedTeams).sort().map((group) => (
                <section key={group}>
                  <h2 className="mb-2 text-xs font-bold uppercase text-muted-foreground">
                    {group === "Sem grupo" ? group : `Grupo ${group}`}
                  </h2>
                  <div className="flex flex-col gap-1.5">
                    {groupedTeams[group].map((team) => (
                      <div key={team.tournamentTeamId} className="rounded-xl bg-card">
                        <div className="flex items-center gap-3 p-3">
                          <TeamBadge name={team.name} shortName={team.short_name} logoUrl={team.logo_url} size="md" />
                          <div className="flex-1 min-w-0">
                            <p className="truncate text-sm font-semibold">{team.name}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Users className="h-3 w-3" />
                              <span>{team.playerCount} jogadores</span>
                            </div>
                          </div>
                          {/* Group selector inline */}
                          <Select value={team.group_name || ""} onValueChange={(v) => handleUpdateGroup(team.tournamentTeamId, v)}>
                            <SelectTrigger className="h-7 w-16 text-[10px]"><SelectValue placeholder="Grp" /></SelectTrigger>
                            <SelectContent>
                              {GROUPS.map((g) => (<SelectItem key={g} value={g}>{g}</SelectItem>))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between border-t border-border/50 px-3 py-1.5">
                          <Link
                            href={`/admin/campeonatos/${tournament.id}/times/${team.teamId}`}
                            className="flex items-center gap-1 text-[10px] font-medium text-primary"
                          >
                            Elenco <ChevronRight className="h-3 w-3" />
                          </Link>
                          <button
                            onClick={() => handleRemoveTeam(team.tournamentTeamId, team.teamId)}
                            className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" /> Remover
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ====== MATCHES TAB ====== */}
      {activeTab === "jogos" && (
        <div>
          <div className="mb-3">
            <Button size="sm" onClick={() => setAddingMatch(true)}>
              <Plus className="mr-1 h-3.5 w-3.5" /> Nova Partida
            </Button>
          </div>

          {addingMatch && (
            <div className="mb-4 rounded-xl border border-border bg-card p-4">
              <h3 className="mb-3 text-sm font-bold">Nova Partida</h3>
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Mandante</Label>
                    <Select value={newMatch.home_team_id} onValueChange={(v) => setNewMatch((p) => ({ ...p, home_team_id: v }))}>
                      <SelectTrigger className="text-xs"><SelectValue placeholder="Time casa" /></SelectTrigger>
                      <SelectContent>
                        {teams.map((t) => (<SelectItem key={t.teamId} value={t.teamId}>{t.short_name || t.name}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Visitante</Label>
                    <Select value={newMatch.away_team_id} onValueChange={(v) => setNewMatch((p) => ({ ...p, away_team_id: v }))}>
                      <SelectTrigger className="text-xs"><SelectValue placeholder="Time fora" /></SelectTrigger>
                      <SelectContent>
                        {teams.map((t) => (<SelectItem key={t.teamId} value={t.teamId}>{t.short_name || t.name}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-xs">Data</Label>
                    <Input type="date" value={newMatch.match_date} onChange={(e) => setNewMatch((p) => ({ ...p, match_date: e.target.value }))} />
                  </div>
                  <div>
                    <Label className="text-xs">Horario</Label>
                    <Input type="time" value={newMatch.match_time} onChange={(e) => setNewMatch((p) => ({ ...p, match_time: e.target.value }))} />
                  </div>
                  <div>
                    <Label className="text-xs">Campo</Label>
                    <Select value={newMatch.field_number} onValueChange={(v) => setNewMatch((p) => ({ ...p, field_number: v }))}>
                      <SelectTrigger className="text-xs"><SelectValue placeholder="#" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Campo 1</SelectItem>
                        <SelectItem value="2">Campo 2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {rounds.length > 0 && (
                  <div>
                    <Label className="text-xs">Rodada</Label>
                    <Select value={newMatch.round_id} onValueChange={(v) => setNewMatch((p) => ({ ...p, round_id: v }))}>
                      <SelectTrigger className="text-xs"><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        {rounds.map((r) => (
                          <SelectItem key={r.id} value={r.id}>
                            {r.name || `Rodada ${r.round_number}`}{r.stages ? ` (${r.stages.name})` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleAddMatch}><Plus className="mr-1 h-3.5 w-3.5" />Adicionar</Button>
                  <Button size="sm" variant="ghost" onClick={() => setAddingMatch(false)}>Cancelar</Button>
                </div>
              </div>
            </div>
          )}

          {matches.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
              <CalendarDays className="h-8 w-8" />
              <p className="text-sm">Nenhuma partida cadastrada.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {Object.entries(matchesByRound).map(([roundName, roundMatches]) => (
                <section key={roundName}>
                  <h2 className="mb-2 text-xs font-bold uppercase text-muted-foreground">{roundName}</h2>
                  <div className="flex flex-col gap-1.5">
                    {roundMatches.map((m) => {
                      const home = m.home_team
                      const away = m.away_team
                      const isFinished = m.status === "finished"
                      return (
                        <div key={m.id} className="rounded-xl bg-card">
                          <Link href={`/admin/partidas/${m.id}`} className="flex items-center gap-2 p-3 transition-colors active:bg-muted/50">
                            <div className="flex flex-1 items-center gap-2">
                              <TeamBadge name={home?.name ?? ""} shortName={home?.short_name ?? ""} logoUrl={home?.logo_url ?? null} size="sm" />
                              <span className="text-xs font-bold">{home?.short_name ?? "?"}</span>
                              <div className="flex items-center gap-1 font-mono text-sm font-bold">
                                {isFinished ? (
                                  <>{m.home_score} <span className="text-muted-foreground">x</span> {m.away_score}</>
                                ) : (
                                  <span className="text-xs text-muted-foreground">{m.match_time ? m.match_time.slice(0, 5) : "vs"}</span>
                                )}
                              </div>
                              <span className="text-xs font-bold">{away?.short_name ?? "?"}</span>
                              <TeamBadge name={away?.name ?? ""} shortName={away?.short_name ?? ""} logoUrl={away?.logo_url ?? null} size="sm" />
                            </div>
                            <div className="flex shrink-0 flex-col items-end gap-0.5">
                              {m.match_date && <span className="text-[10px] text-muted-foreground">{formatDate(m.match_date)}</span>}
                              {m.field_number && (
                                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">Campo {m.field_number}</span>
                              )}
                            </div>
                            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                          </Link>
                          <div className="flex justify-end border-t border-border/50 px-3 py-1.5">
                            <button
                              onClick={(e) => { e.preventDefault(); handleDeleteMatch(m.id) }}
                              className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="h-3 w-3" /> Remover
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
