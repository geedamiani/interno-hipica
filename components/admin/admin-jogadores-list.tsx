"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Users, Search, Pencil, Trash2, Save, X, ArrowUpDown, ChevronUp, ChevronDown } from "lucide-react"
import { toast } from "sonner"
import type { Tables } from "@/lib/database.types"

const POSITIONS = [
  "Goleiro",
  "Zagueiro",
  "Lateral Direito",
  "Lateral Esquerdo",
  "Volante",
  "Meia",
  "Atacante",
]

type SortColumn = "name" | "nickname" | "position"
type SortDir = "asc" | "desc"

interface Props {
  players: Tables<"players">[]
}

export function AdminJogadoresList({ players: initial }: Props) {
  const supabase = createClient()

  const [players, setPlayers] = useState(initial)
  const [search, setSearch] = useState("")
  const [posFilter, setPosFilter] = useState("all")
  const [sortCol, setSortCol] = useState<SortColumn>("name")
  const [sortDir, setSortDir] = useState<SortDir>("asc")
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: "", nickname: "", position: "" })

  function handleSort(col: SortColumn) {
    if (sortCol === col) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortCol(col)
      setSortDir("asc")
    }
  }

  const filtered = players
    .filter((p) => {
      if (search) {
        const q = search.toLowerCase()
        if (!p.name.toLowerCase().includes(q) && !(p.nickname?.toLowerCase().includes(q) ?? false)) return false
      }
      if (posFilter !== "all" && p.position !== posFilter) return false
      return true
    })
    .sort((a, b) => {
      let av = ""
      let bv = ""
      if (sortCol === "name") { av = a.name; bv = b.name }
      else if (sortCol === "nickname") { av = a.nickname || a.name; bv = b.nickname || b.name }
      else if (sortCol === "position") { av = a.position || ""; bv = b.position || "" }
      const cmp = av.localeCompare(bv)
      return sortDir === "asc" ? cmp : -cmp
    })

  function startEdit(player: Tables<"players">) {
    setEditingId(player.id)
    setForm({ name: player.name, nickname: player.nickname || "", position: player.position || "" })
    setAdding(false)
  }

  function cancelEdit() {
    setEditingId(null)
    setForm({ name: "", nickname: "", position: "" })
  }

  async function handleAdd() {
    if (!form.name.trim()) { toast.error("Nome obrigatório"); return }
    const { data, error } = await supabase.from("players").insert({
      name: form.name.trim(),
      nickname: form.nickname.trim() || null,
      position: form.position || null,
    }).select().single()

    if (error || !data) { toast.error("Erro: " + (error?.message || "")); return }
    setPlayers((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
    setForm({ name: "", nickname: "", position: "" })
    setAdding(false)
    toast.success("Jogador criado")
  }

  async function handleSaveEdit() {
    if (!editingId || !form.name.trim()) return
    const { error } = await supabase.from("players").update({
      name: form.name.trim(),
      nickname: form.nickname.trim() || null,
      position: form.position || null,
    }).eq("id", editingId)

    if (error) { toast.error("Erro: " + error.message); return }
    setPlayers((prev) => prev.map((p) =>
      p.id === editingId
        ? { ...p, name: form.name.trim(), nickname: form.nickname.trim() || null, position: form.position || null }
        : p
    ))
    cancelEdit()
    toast.success("Jogador atualizado")
  }

  async function handleDelete(id: string) {
    if (!confirm("Remover jogador?")) return
    const { error } = await supabase.from("players").delete().eq("id", id)
    if (error) { toast.error("Erro: " + error.message); return }
    setPlayers((prev) => prev.filter((p) => p.id !== id))
    toast.success("Jogador removido")
  }

  function SortIcon({ col }: { col: SortColumn }) {
    if (sortCol !== col) return <ArrowUpDown className="ml-1 h-3 w-3 opacity-40" />
    return sortDir === "asc"
      ? <ChevronUp className="ml-1 h-3 w-3" />
      : <ChevronDown className="ml-1 h-3 w-3" />
  }

  return (
    <div className="px-4 py-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Jogadores</h1>
          <p className="text-sm text-muted-foreground">{players.length} cadastrados</p>
        </div>
        <Button size="sm" onClick={() => { setAdding(true); cancelEdit() }}>
          <Plus className="mr-1 h-3.5 w-3.5" />
          Novo
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-4 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar jogador..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={posFilter} onValueChange={setPosFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Posição" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as posições</SelectItem>
            {POSITIONS.map((p) => (
              <SelectItem key={p} value={p}>{p}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Add form */}
      {adding && (
        <div className="mb-4 rounded-xl border border-border bg-card p-4">
          <h3 className="mb-3 text-sm font-bold">Novo Jogador</h3>
          <PlayerForm form={form} setForm={setForm} />
          <div className="mt-3 flex gap-2">
            <Button size="sm" onClick={handleAdd}>
              <Plus className="mr-1 h-3.5 w-3.5" />Criar
            </Button>
            <Button size="sm" variant="ghost" onClick={() => { setAdding(false); setForm({ name: "", nickname: "", position: "" }) }}>
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
          <Users className="h-8 w-8" />
          <p className="text-sm">{search || posFilter !== "all" ? "Nenhum resultado." : "Nenhum jogador."}</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <button
                    className="flex items-center text-xs font-medium uppercase tracking-wide hover:text-foreground transition-colors"
                    onClick={() => handleSort("name")}
                  >
                    Nome <SortIcon col="name" />
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    className="flex items-center text-xs font-medium uppercase tracking-wide hover:text-foreground transition-colors"
                    onClick={() => handleSort("nickname")}
                  >
                    Apelido <SortIcon col="nickname" />
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    className="flex items-center text-xs font-medium uppercase tracking-wide hover:text-foreground transition-colors"
                    onClick={() => handleSort("position")}
                  >
                    Posição <SortIcon col="position" />
                  </button>
                </TableHead>
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((player) =>
                editingId === player.id ? (
                  <TableRow key={player.id} className="bg-muted/30">
                    <TableCell>
                      <Input
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Nome completo"
                        className="h-8 text-sm"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={form.nickname}
                        onChange={(e) => setForm({ ...form, nickname: e.target.value })}
                        placeholder="Apelido"
                        className="h-8 text-sm"
                      />
                    </TableCell>
                    <TableCell>
                      <Select value={form.position} onValueChange={(v) => setForm({ ...form, position: v })}>
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue placeholder="Posição" />
                        </SelectTrigger>
                        <SelectContent>
                          {POSITIONS.map((p) => (
                            <SelectItem key={p} value={p}>{p}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <button
                          onClick={handleSaveEdit}
                          className="flex h-7 w-7 items-center justify-center rounded-md text-green-600 hover:bg-green-100"
                        >
                          <Save className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  <TableRow key={player.id}>
                    <TableCell className="font-medium">{player.name}</TableCell>
                    <TableCell className="text-muted-foreground">{player.nickname || "—"}</TableCell>
                    <TableCell>
                      {player.position
                        ? <Badge variant="outline" className="text-[10px]">{player.position}</Badge>
                        : <span className="text-muted-foreground text-sm">—</span>
                      }
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <button
                          onClick={() => startEdit(player)}
                          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(player.id)}
                          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

function PlayerForm({
  form,
  setForm,
}: {
  form: { name: string; nickname: string; position: string }
  setForm: (f: { name: string; nickname: string; position: string }) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      <div>
        <Label className="text-xs">Nome Completo *</Label>
        <Input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Nome completo do jogador"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs">Apelido</Label>
          <Input
            value={form.nickname}
            onChange={(e) => setForm({ ...form, nickname: e.target.value })}
            placeholder="Nome de exibição"
          />
        </div>
        <div>
          <Label className="text-xs">Posição</Label>
          <Select value={form.position} onValueChange={(v) => setForm({ ...form, position: v })}>
            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              {POSITIONS.map((p) => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
