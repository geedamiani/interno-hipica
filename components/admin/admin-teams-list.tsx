"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { TeamBadge } from "@/components/team-badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, ChevronRight, Plus, Search } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import type { Tables } from "@/lib/database.types"

interface Props {
  teams: Tables<"teams">[]
}

export function AdminTeamsList({ teams: initial }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [teams, setTeams] = useState(initial)
  const [search, setSearch] = useState("")
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState("")
  const [newShort, setNewShort] = useState("")

  const filtered = search
    ? teams.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()) || (t.short_name?.toLowerCase().includes(search.toLowerCase()) ?? false))
    : teams

  async function handleCreate() {
    if (!newName.trim()) { toast.error("Nome obrigatorio"); return }
    const { data, error } = await supabase.from("teams").insert({
      name: newName.trim(),
      short_name: newShort.trim() || null,
    }).select().single()
    if (error || !data) { toast.error("Erro: " + (error?.message || "")); return }
    setTeams((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
    setNewName("")
    setNewShort("")
    setAdding(false)
    toast.success("Time criado")
  }

  return (
    <div className="px-4 py-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Times</h1>
          <p className="text-sm text-muted-foreground">{teams.length} cadastrados</p>
        </div>
        <Button size="sm" onClick={() => setAdding(true)}>
          <Plus className="mr-1 h-3.5 w-3.5" /> Novo
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Buscar time..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {/* Create form */}
      {adding && (
        <div className="mb-4 rounded-xl border border-border bg-card p-4">
          <h3 className="mb-3 text-sm font-bold">Novo Time</h3>
          <div className="flex flex-col gap-2">
            <div>
              <Label className="text-xs">Nome *</Label>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nome do time / patrocinador" />
            </div>
            <div>
              <Label className="text-xs">Sigla</Label>
              <Input value={newShort} onChange={(e) => setNewShort(e.target.value)} placeholder="Ex: ABC" maxLength={4} />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleCreate}><Plus className="mr-1 h-3.5 w-3.5" />Criar</Button>
              <Button size="sm" variant="ghost" onClick={() => { setAdding(false); setNewName(""); setNewShort("") }}>Cancelar</Button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
          <Shield className="h-10 w-10" />
          <p className="text-sm">{search ? "Nenhum resultado." : "Nenhum time cadastrado."}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          {filtered.map((team) => (
            <Link
              key={team.id}
              href={`/admin/times/${team.id}`}
              className="flex items-center gap-3 rounded-xl bg-card p-3 transition-colors active:bg-muted/50"
            >
              <TeamBadge
                name={team.name}
                shortName={team.short_name}
                logoUrl={team.logo_url}
                size="md"
              />
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-semibold">{team.name}</p>
                {team.short_name && <p className="text-xs text-muted-foreground">{team.short_name}</p>}
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
