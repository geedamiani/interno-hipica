"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Users, Search, Pencil, Trash2, Save, X } from "lucide-react"
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

interface Props {
  players: Tables<"players">[]
}

export function AdminJogadoresList({ players: initial }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [players, setPlayers] = useState(initial)
  const [search, setSearch] = useState("")
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: "", nickname: "", position: "" })

  const filtered = players.filter((p) => {
    if (!search) return true
    const q = search.toLowerCase()
    return p.name.toLowerCase().includes(q) || (p.nickname?.toLowerCase().includes(q) ?? false)
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
    if (!form.name.trim()) { toast.error("Nome obrigatorio"); return }
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
    setPlayers((prev) => prev.map((p) => p.id === editingId ? { ...p, name: form.name.trim(), nickname: form.nickname.trim() || null, position: form.position || null } : p))
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

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar jogador..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Add form */}
      {adding && (
        <div className="mb-4 rounded-xl border border-border bg-card p-4">
          <h3 className="mb-3 text-sm font-bold">Novo Jogador</h3>
          <PlayerForm form={form} setForm={setForm} />
          <div className="mt-3 flex gap-2">
            <Button size="sm" onClick={handleAdd}><Plus className="mr-1 h-3.5 w-3.5" />Criar</Button>
            <Button size="sm" variant="ghost" onClick={() => { setAdding(false); setForm({ name: "", nickname: "", position: "" }) }}>Cancelar</Button>
          </div>
        </div>
      )}

      {/* List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
          <Users className="h-8 w-8" />
          <p className="text-sm">{search ? "Nenhum resultado." : "Nenhum jogador."}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          {filtered.map((player) => (
            <div key={player.id}>
              {editingId === player.id ? (
                <div className="rounded-xl border border-primary/30 bg-card p-3">
                  <PlayerForm form={form} setForm={setForm} />
                  <div className="mt-2 flex gap-2">
                    <Button size="sm" onClick={handleSaveEdit}><Save className="mr-1 h-3.5 w-3.5" />Salvar</Button>
                    <Button size="sm" variant="ghost" onClick={cancelEdit}>Cancelar</Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 rounded-xl bg-card p-3">
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {player.nickname || player.name}
                    </p>
                    {player.nickname && (
                      <p className="truncate text-xs text-muted-foreground">{player.name}</p>
                    )}
                  </div>
                  {player.position && (
                    <Badge variant="outline" className="shrink-0 text-[10px]">{player.position}</Badge>
                  )}
                  <button onClick={() => startEdit(player)} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => handleDelete(player.id)} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function PlayerForm({ form, setForm }: { form: { name: string; nickname: string; position: string }; setForm: (f: { name: string; nickname: string; position: string }) => void }) {
  return (
    <div className="flex flex-col gap-2">
      <div>
        <Label className="text-xs">Nome Completo *</Label>
        <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nome completo do jogador" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs">Apelido</Label>
          <Input value={form.nickname} onChange={(e) => setForm({ ...form, nickname: e.target.value })} placeholder="Nome de exibicao" />
        </div>
        <div>
          <Label className="text-xs">Posicao</Label>
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
