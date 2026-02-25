"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface Category {
  id: string
  name: string
}

interface Tournament {
  id: string
  name: string
  slug: string
  year: number
  semester: number
  status: string | null
  start_date: string | null
  end_date: string | null
  location: string | null
  category_id: string | null
}

interface Props {
  categories: Category[]
  tournament: Tournament | null
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export function AdminTournamentForm({ categories, tournament }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const supabase = createClient()
  const isEditing = !!tournament

  const [name, setName] = useState(tournament?.name || "")
  const [year, setYear] = useState(tournament?.year?.toString() || new Date().getFullYear().toString())
  const [semester, setSemester] = useState(tournament?.semester?.toString() || "1")
  const [categoryId, setCategoryId] = useState(tournament?.category_id || "")
  const [status, setStatus] = useState(tournament?.status || "draft")
  const [startDate, setStartDate] = useState(tournament?.start_date || "")
  const [endDate, setEndDate] = useState(tournament?.end_date || "")
  const [location, setLocation] = useState(tournament?.location || "")

  async function handleSave() {
    if (!name.trim()) {
      toast.error("Nome obrigatorio")
      return
    }

    startTransition(async () => {
      const payload = {
        name: name.trim(),
        slug: slugify(name.trim()),
        year: parseInt(year),
        semester: parseInt(semester),
        category_id: categoryId || null,
        status,
        start_date: startDate || null,
        end_date: endDate || null,
        location: location.trim() || null,
      }

      if (isEditing) {
        const { error } = await supabase
          .from("tournaments")
          .update(payload)
          .eq("id", tournament.id)

        if (error) {
          toast.error("Erro ao atualizar: " + error.message)
          return
        }
        toast.success("Torneio atualizado")
        router.refresh()
      } else {
        const { data, error } = await supabase
          .from("tournaments")
          .insert(payload)
          .select("id")
          .single()

        if (error || !data) {
          toast.error("Erro ao criar: " + (error?.message || ""))
          return
        }
        toast.success("Torneio criado")
        router.push(`/admin/campeonatos/${data.id}`)
      }
    })
  }

  return (
    <div className="px-4 py-5">
      <div className="mb-5 flex items-center gap-3">
        <Link href="/admin/campeonatos">
          <button className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted">
            <ArrowLeft className="h-5 w-5" />
          </button>
        </Link>
        <h1 className="text-lg font-bold">{isEditing ? "Editar Torneio" : "Novo Torneio"}</h1>
      </div>

      <div className="flex flex-col gap-4 rounded-xl bg-card p-4">
        <div>
          <Label className="text-xs">Nome *</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Interno Hipica 2026/1" />
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
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
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
          <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Ex: Hipica / Hospital Santa Tereza" />
        </div>

        <Button onClick={handleSave} disabled={isPending} className="mt-2">
          <Save className="mr-1.5 h-4 w-4" />
          {isPending ? "Salvando..." : isEditing ? "Salvar Alteracoes" : "Criar Torneio"}
        </Button>
      </div>
    </div>
  )
}
