import { createClient } from "@/lib/supabase/server"
import { Badge } from "@/components/ui/badge"
import { Trophy, Plus, ChevronRight } from "lucide-react"
import Link from "next/link"
import type { Tables } from "@/lib/database.types"

type TournamentWithCategory = Tables<"tournaments"> & {
  categories: { name: string } | null
}

const statusMap: Record<string, { label: string; variant: "default" | "outline" | "secondary" }> = {
  active: { label: "Ativo", variant: "default" },
  finished: { label: "Encerrado", variant: "secondary" },
  draft: { label: "Rascunho", variant: "outline" },
}

export default async function AdminTournamentsPage() {
  const supabase = await createClient()

  const { data: tournaments } = await supabase
    .from("tournaments")
    .select("*, categories(name)")
    .order("year", { ascending: false })
    .order("semester", { ascending: false })
    .returns<TournamentWithCategory[]>()

  return (
    <div className="px-4 py-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Torneios</h1>
          <p className="text-sm text-muted-foreground">Gerenciar campeonatos</p>
        </div>
        <Link
          href="/admin/campeonatos/novo"
          className="flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground"
        >
          <Plus className="h-4 w-4" />
          Novo
        </Link>
      </div>

      {(!tournaments || tournaments.length === 0) ? (
        <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
          <Trophy className="h-10 w-10" />
          <p className="text-sm">Nenhum torneio cadastrado.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {tournaments.map((t) => {
            const st = statusMap[t.status || "draft"] || statusMap.draft
            return (
              <Link
                key={t.id}
                href={`/admin/campeonatos/${t.id}`}
                className="flex items-center gap-3 rounded-xl bg-card p-4 transition-colors active:bg-muted/50"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Trophy className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.categories?.name || ""} &middot; {t.year}/{t.semester}
                    {t.location ? ` &middot; ${t.location}` : ""}
                  </p>
                </div>
                <Badge variant={st.variant} className="shrink-0 text-[10px]">
                  {st.label}
                </Badge>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
