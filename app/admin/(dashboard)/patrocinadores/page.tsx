import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Handshake } from "lucide-react"

export default async function AdminSponsorsPage() {
  const supabase = await createClient()

  const { data: sponsors } = await supabase
    .from("sponsors")
    .select("*, teams(name, short_name)")
    .order("name")

  return (
    <div className="p-4 lg:p-8">
      <div className="mb-6">
        <h1 className="font-sans text-2xl font-bold">Patrocinadores</h1>
        <p className="text-sm text-muted-foreground">Gerenciar patrocinadores</p>
      </div>

      <div className="flex flex-col gap-3">
        {(sponsors || []).map((s) => {
          const teams = s.teams as Record<string, unknown>[] | null
          return (
            <Card key={s.id}>
              <CardContent className="flex items-center gap-3 py-3">
                {s.logo_url ? (
                  <img src={s.logo_url} alt={s.name} className="h-10 w-10 rounded-lg object-contain" />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10">
                    <Handshake className="h-5 w-5 text-secondary" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-sm font-semibold">{s.name}</p>
                  {s.website && (
                    <p className="text-[10px] text-muted-foreground">{s.website}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
        {(!sponsors || sponsors.length === 0) && (
          <p className="py-8 text-center text-sm text-muted-foreground">Nenhum patrocinador cadastrado.</p>
        )}
      </div>
    </div>
  )
}
