"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { TeamBadge } from "@/components/team-badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  ArrowLeft,
  Save,
  Pencil,
  ImageIcon,
  Trash2,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import type { Tables } from "@/lib/database.types"

interface Props {
  team: Tables<"teams">
}

export function AdminTeamDetail({ team }: Props) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const supabase = createClient()

  const [editing, setEditing] = useState(false)
  const [teamName, setTeamName] = useState(team.name)
  const [teamShort, setTeamShort] = useState(team.short_name || "")
  const [teamLogo, setTeamLogo] = useState(team.logo_url || "")

  async function handleSave() {
    setIsSaving(true)
    const { error } = await supabase.from("teams").update({
      name: teamName,
      short_name: teamShort || null,
      logo_url: teamLogo || null,
    }).eq("id", team.id)
    setIsSaving(false)
    if (error) { toast.error("Erro ao salvar"); return }
    toast.success("Time atualizado")
    setEditing(false)
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const ext = file.name.split(".").pop()
    const path = `teams/${team.id}/logo.${ext}`
    const { error: uploadError } = await supabase.storage.from("logos").upload(path, file, { upsert: true })
    if (uploadError) { toast.error("Erro no upload: " + uploadError.message); return }
    const { data: urlData } = supabase.storage.from("logos").getPublicUrl(path)
    await supabase.from("teams").update({ logo_url: urlData.publicUrl }).eq("id", team.id)
    setTeamLogo(urlData.publicUrl)
    toast.success("Logo atualizado")
  }

  async function handleDeleteLogo() {
    const { error } = await supabase.from("teams").update({ logo_url: null }).eq("id", team.id)
    if (error) { toast.error("Erro"); return }
    setTeamLogo("")
    toast.success("Logo removido")
  }

  async function handleDelete() {
    if (!confirm(`Remover "${team.name}"? Isso removera o time de todos os torneios.`)) return
    const { error } = await supabase.from("teams").delete().eq("id", team.id)
    if (error) { toast.error("Erro: " + error.message); return }
    toast.success("Time removido")
    router.push("/admin/times")
    router.refresh()
  }

  return (
    <div className="px-4 py-5">
      {/* Header */}
      <div className="mb-5 flex items-center gap-3">
        <Link href="/admin/times">
          <button className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted">
            <ArrowLeft className="h-5 w-5" />
          </button>
        </Link>
        <TeamBadge name={teamName} shortName={teamShort} logoUrl={teamLogo || null} size="lg" />
        <div className="flex-1 min-w-0">
          <h1 className="truncate text-lg font-bold">{teamName}</h1>
          {teamShort && <p className="text-xs text-muted-foreground">{teamShort}</p>}
        </div>
      </div>

      {/* Team Info */}
      <section className="mb-5 rounded-xl bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase text-muted-foreground">Dados do Time</h2>
          {!editing && (
            <button onClick={() => setEditing(true)} className="flex items-center gap-1 text-xs font-semibold text-primary">
              <Pencil className="h-3 w-3" /> Editar
            </button>
          )}
        </div>

        {editing ? (
          <div className="flex flex-col gap-3">
            <div>
              <Label className="text-xs">Nome</Label>
              <Input value={teamName} onChange={(e) => setTeamName(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Sigla</Label>
              <Input value={teamShort} onChange={(e) => setTeamShort(e.target.value)} maxLength={4} />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave} disabled={isSaving}>
                <Save className="mr-1.5 h-3.5 w-3.5" /> Salvar
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancelar</Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nome</span>
              <span className="font-medium">{teamName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sigla</span>
              <span className="font-medium">{teamShort || "—"}</span>
            </div>
          </div>
        )}

        {/* Logo management */}
        <div className="mt-4 flex items-center gap-3 border-t border-border pt-3">
          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-primary">
            <ImageIcon className="h-4 w-4" />
            <span>{teamLogo ? "Alterar logo" : "Adicionar logo"}</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
          </label>
          {teamLogo && (
            <button onClick={handleDeleteLogo} className="flex items-center gap-1 text-sm font-medium text-destructive">
              <Trash2 className="h-3.5 w-3.5" /> Remover logo
            </button>
          )}
        </div>
      </section>

      {/* Info note */}
      <section className="rounded-xl border border-dashed border-border p-4">
        <p className="text-center text-xs text-muted-foreground">
          O elenco e o grupo sao definidos por torneio.
          <br />
          Gerencie em <span className="font-semibold">Torneios &gt; Torneio &gt; Times</span>.
        </p>
      </section>

      {/* Delete */}
      <div className="mt-8 flex justify-center">
        <button onClick={handleDelete} className="flex items-center gap-1.5 text-xs font-medium text-destructive">
          <Trash2 className="h-3.5 w-3.5" /> Excluir time
        </button>
      </div>
    </div>
  )
}
