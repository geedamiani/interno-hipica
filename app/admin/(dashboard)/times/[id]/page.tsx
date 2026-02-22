import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TeamBadge } from "@/components/team-badge"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Users } from "lucide-react"

export default async function AdminTeamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: team }, { data: players }] = await Promise.all([
    supabase.from("teams").select("*, sponsors(*)").eq("id", id).single(),
    supabase.from("players").select("*").eq("team_id", id).order("shirt_number"),
  ])

  if (!team) notFound()

  return (
    <div className="p-4 lg:p-8">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/admin/times">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Voltar</span>
          </Button>
        </Link>
        <TeamBadge
          name={team.name}
          shortName={team.short_name}
          primaryColor={team.primary_color}
          logoUrl={team.logo_url}
          size="lg"
        />
        <div>
          <h1 className="font-sans text-xl font-bold">{team.name}</h1>
          <Badge variant="outline" className="text-[10px]">Grupo {team.group_name}</Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-primary" />
            Elenco ({players?.length || 0} jogadores)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(!players || players.length === 0) ? (
            <p className="py-4 text-center text-xs text-muted-foreground">Nenhum jogador cadastrado.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-2 py-2 text-left text-xs font-semibold text-muted-foreground">#</th>
                    <th className="px-2 py-2 text-left text-xs font-semibold text-muted-foreground">Nome</th>
                    <th className="px-2 py-2 text-left text-xs font-semibold text-muted-foreground">Apelido</th>
                    <th className="px-2 py-2 text-left text-xs font-semibold text-muted-foreground">Posicao</th>
                    <th className="px-2 py-2 text-left text-xs font-semibold text-muted-foreground">CPF</th>
                  </tr>
                </thead>
                <tbody>
                  {players.map((player) => (
                    <tr key={player.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                      <td className="px-2 py-2 font-mono text-xs">{player.shirt_number ?? "-"}</td>
                      <td className="px-2 py-2 font-medium">{player.name}</td>
                      <td className="px-2 py-2 text-muted-foreground">{player.nickname || "-"}</td>
                      <td className="px-2 py-2">
                        <Badge variant="outline" className="text-[10px]">{player.position || "N/A"}</Badge>
                      </td>
                      <td className="px-2 py-2 font-mono text-xs text-muted-foreground">{player.cpf || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
