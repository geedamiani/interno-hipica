import { createClient } from "@/lib/supabase/server"
import { HomeContent } from "@/components/home-content"
import type { HomeContentProps } from "@/components/home-content"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  try {
    const supabase = await createClient()

    const { data: tournament } = await supabase
      .from("tournaments")
      .select("id, name, status, year, semester, location, categories(name)")
      .eq("status", "active")
      .limit(1)
      .maybeSingle()

    if (!tournament) {
      return (
        <HomeContent
          tournament={null}
          standings={[]}
          topScorers={[]}
          assists={[]}
        />
      )
    }

    const tournamentId = tournament.id

    const [{ data: standings }, { data: events }] = await Promise.all([
      supabase
        .from("standings")
        .select("*")
        .eq("tournament_id", tournamentId)
        .order("points", { ascending: false })
        .order("goal_difference", { ascending: false }),
      supabase
        .from("match_events")
        .select("player_id, team_id, event_type")
        .in("event_type", ["goal", "assist"]),
    ])

    // Build top scorers
    let topScorersList: HomeContentProps["topScorers"] = []
    let topAssistsList: HomeContentProps["assists"] = []

    if (events && events.length > 0) {
      const goalCounts = new Map<string, { playerId: string; teamId: string; goals: number }>()
      const assistCounts = new Map<string, { playerId: string; teamId: string; assists: number }>()

      for (const e of events) {
        if (!e.player_id || !e.team_id || !e.event_type) continue
        if (e.event_type === "goal") {
          const existing = goalCounts.get(e.player_id)
          if (existing) existing.goals += 1
          else goalCounts.set(e.player_id, { playerId: e.player_id, teamId: e.team_id, goals: 1 })
        } else if (e.event_type === "assist") {
          const existing = assistCounts.get(e.player_id)
          if (existing) existing.assists += 1
          else assistCounts.set(e.player_id, { playerId: e.player_id, teamId: e.team_id, assists: 1 })
        }
      }

      const topScorerPlayers = Array.from(goalCounts.values())
        .sort((a, b) => b.goals - a.goals)
        .slice(0, 5)

      const topAssistPlayers = Array.from(assistCounts.values())
        .sort((a, b) => b.assists - a.assists)
        .slice(0, 5)

      const playerIds = [
        ...new Set([
          ...topScorerPlayers.map((p) => p.playerId),
          ...topAssistPlayers.map((p) => p.playerId),
        ]),
      ]
      const teamIds = [
        ...new Set([
          ...topScorerPlayers.map((p) => p.teamId),
          ...topAssistPlayers.map((p) => p.teamId),
        ]),
      ]

      if (playerIds.length > 0 && teamIds.length > 0) {
        const [playersRes, teamsRes] = await Promise.all([
          supabase.from("players").select("id, name, nickname").in("id", playerIds),
          supabase.from("teams").select("id, short_name, primary_color, logo_url").in("id", teamIds),
        ])

        const pMap = new Map((playersRes.data || []).map((p) => [p.id, p]))
        const tMap = new Map((teamsRes.data || []).map((t) => [t.id, t]))

        topScorersList = topScorerPlayers.map((tp) => {
          const p = pMap.get(tp.playerId)
          const t = tMap.get(tp.teamId)
          return {
            name: p?.name || "Desconhecido",
            nickname: p?.nickname || null,
            teamShort: t?.short_name || null,
            teamColor: t?.primary_color || null,
            teamLogoUrl: t?.logo_url || null,
            goals: tp.goals,
          }
        })

        topAssistsList = topAssistPlayers.map((tp) => {
          const p = pMap.get(tp.playerId)
          const t = tMap.get(tp.teamId)
          return {
            name: p?.name || "Desconhecido",
            nickname: p?.nickname || null,
            teamShort: t?.short_name || null,
            teamColor: t?.primary_color || null,
            teamLogoUrl: t?.logo_url || null,
            assists: tp.assists,
          }
        })
      }
    }

    return (
      <HomeContent
        tournament={tournament}
        standings={(standings || []) as HomeContentProps["standings"]}
        topScorers={topScorersList}
        assists={topAssistsList}
      />
    )
  } catch {
    return (
      <HomeContent
        tournament={null}
        standings={[]}
        topScorers={[]}
        assists={[]}
      />
    )
  }
}
