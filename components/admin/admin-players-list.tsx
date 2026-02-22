"use client"

import { useState } from "react"
import { TeamBadge } from "@/components/team-badge"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface AdminPlayersListProps {
  players: Record<string, unknown>[]
}

export function AdminPlayersList({ players }: AdminPlayersListProps) {
  const [search, setSearch] = useState("")

  const filtered = players.filter((p) => {
    const name = (p.name as string).toLowerCase()
    const nickname = ((p.nickname as string) || "").toLowerCase()
    const query = search.toLowerCase()
    return name.includes(query) || nickname.includes(query)
  })

  return (
    <div className="p-4 lg:p-8">
      <div className="mb-6">
        <h1 className="font-sans text-2xl font-bold">Jogadores</h1>
        <p className="text-sm text-muted-foreground">{players.length} jogadores cadastrados</p>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar jogador..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Players table */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground">#</th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground">Nome</th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground">Time</th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground">Posicao</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((player) => {
              const team = player.teams as Record<string, unknown> | null
              return (
                <tr key={player.id as string} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="px-3 py-2 font-mono text-xs text-muted-foreground">
                    {player.shirt_number != null ? player.shirt_number as number : "-"}
                  </td>
                  <td className="px-3 py-2">
                    <div>
                      <p className="font-medium">{player.nickname as string || player.name as string}</p>
                      {player.nickname && (
                        <p className="text-[10px] text-muted-foreground">{player.name as string}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    {team && (
                      <div className="flex items-center gap-2">
                        <TeamBadge
                          name={team.name as string}
                          shortName={team.short_name as string}
                          primaryColor={team.primary_color as string}
                          logoUrl={team.logo_url as string}
                          size="sm"
                        />
                        <span className="text-xs">{team.short_name as string}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <Badge variant="outline" className="text-[10px]">
                      {player.position as string || "N/A"}
                    </Badge>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">Nenhum jogador encontrado.</p>
      )}
    </div>
  )
}
