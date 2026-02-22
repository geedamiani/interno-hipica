import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy } from "lucide-react"

export default async function AdminTournamentsPage() {
  const supabase = await createClient()

  const { data: tournaments } = await supabase
    .from("tournaments")
    .select("*, categories(name)")
    .order("created_at", { ascending: false })

  return (
    <div className="p-4 lg:p-8">
      <div className="mb-6">
        <h1 className="font-sans text-2xl font-bold">Campeonatos</h1>
        <p className="text-sm text-muted-foreground">Gerenciar campeonatos</p>
      </div>

      <div className="flex flex-col gap-3">
        {(tournaments || []).map((t) => {
          const category = t.categories as Record<string, unknown> | null
          return (
            <Card key={t.id}>
              <CardContent className="flex items-center gap-3 py-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Trophy className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {category?.name as string || ""} - {t.year}/{t.semester}
                    {t.location && ` - ${t.location}`}
                  </p>
                </div>
                <Badge variant={t.status === "active" ? "default" : "outline"} className="text-[10px]">
                  {t.status === "active" ? "Ativo" : t.status === "finished" ? "Encerrado" : "Rascunho"}
                </Badge>
              </CardContent>
            </Card>
          )
        })}
        {(!tournaments || tournaments.length === 0) && (
          <p className="py-8 text-center text-sm text-muted-foreground">Nenhum campeonato cadastrado.</p>
        )}
      </div>
    </div>
  )
}
