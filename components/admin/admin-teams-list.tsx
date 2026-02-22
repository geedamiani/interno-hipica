"use client"

import { TeamBadge } from "@/components/team-badge"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Users } from "lucide-react"
import Link from "next/link"

interface AdminTeamsListProps {
  teams: Record<string, unknown>[]
  tournamentId: string
}

export function AdminTeamsList({ teams }: AdminTeamsListProps) {
  return (
    <div className="p-4 lg:p-8">
      <div className="mb-6">
        <h1 className="font-sans text-2xl font-bold">Times</h1>
        <p className="text-sm text-muted-foreground">Gerenciar times do campeonato</p>
      </div>

      <div className="flex flex-col gap-2">
        {teams.map((team) => (
            <Link key={team.id as string} href={`/admin/times/${team.id}`}>
              <Card className="transition-colors hover:bg-muted/30">
                <CardContent className="flex items-center gap-3 py-3">
                  <TeamBadge
                    name={team.name as string}
                    shortName={team.short_name as string}
                    primaryColor={team.primary_color as string}
                    logoUrl={team.logo_url as string}
                    size="md"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{team.name as string}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    Grupo {team.group_name as string}
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        {teams.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
            <Users className="h-8 w-8" />
            <p className="text-sm">Nenhum time cadastrado.</p>
          </div>
        )}
      </div>
    </div>
  )
}
