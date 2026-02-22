import { createClient } from "@/lib/supabase/server"
import { HomeContent } from "@/components/home-content"

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
          nextMatches={[]}
          topScorers={[]}
        />
      )
    }

    const tournamentId = tournament.id

    const [{ data: standings }, { data: nextMatches }, { data: events }] = await Promise.all([
      supabase
        .from("standings")
        .select("*")
        .eq("tournament_id", tournamentId)
        .order("points", { ascending: false })
        .order("goal_difference", { ascending: false }),
      supabase
        .from("matches")
        .select(
          "id, match_date, match_time, home_score, away_score, status, field_number, home_team:teams!matches_home_team_id_fkey(id, name, short_name, primary_color, logo_url), away_team:teams!matches_away_team_id_fkey(id, name, short_name, primary_color, logo_url), rounds(round_number, stages(name))"
        )
        .eq("tournament_id", tournamentId)
        .in("status", ["scheduled", "in_progress"])
        .order("match_date", { ascending: true })
        .order("match_time", { ascending: true })
        .limit(4),
      supabase
        .from("match_events")
        .select("player_id, team_id")
        .eq("event_type", "goal"),
    ])

    // Build top scorers
    let topScorersList: {
      name: string
      nickname: string | null
      teamShort: string | null
      teamColor: string | null
      teamLogoUrl: string | null
      goals: number
    }[] = []

    if (events && events.length > 0) {
      const goalCounts = new Map<string, { playerId: string; teamId: string; goals: number }>()
      for (const e of events) {
        const existing = goalCounts.get(e.player_id)
        if (existing) existing.goals++
        else goalCounts.set(e.player_id, { playerId: e.player_id, teamId: e.team_id, goals: 1 })
      }

      const topPlayers = Array.from(goalCounts.values())
        .sort((a, b) => b.goals - a.goals)
        .slice(0, 5)
      const playerIds = topPlayers.map((p) => p.playerId)
      const teamIds = [...new Set(topPlayers.map((p) => p.teamId))]

      const [playersRes, teamsRes] = await Promise.all([
        supabase.from("players").select("id, name, nickname").in("id", playerIds),
        supabase.from("teams").select("id, short_name, primary_color, logo_url").in("id", teamIds),
      ])

      const pMap = new Map((playersRes.data || []).map((p: Record<string, unknown>) => [p.id as string, p]))
      const tMap = new Map((teamsRes.data || []).map((t: Record<string, unknown>) => [t.id as string, t]))

      topScorersList = topPlayers.map((tp) => {
        const p = pMap.get(tp.playerId)
        const t = tMap.get(tp.teamId)
        return {
          name: (p?.name as string) || "Desconhecido",
          nickname: (p?.nickname as string) || null,
          teamShort: (t?.short_name as string) || null,
          teamColor: (t?.primary_color as string) || null,
          teamLogoUrl: (t?.logo_url as string) || null,
          goals: tp.goals,
        }
      })
    }

    return (
      <HomeContent
        tournament={tournament}
        standings={standings || []}
        nextMatches={nextMatches || []}
        topScorers={topScorersList}
      />
    )
  } catch {
    return (
      <HomeContent
        tournament={null}
        standings={[]}
        nextMatches={[]}
        topScorers={[]}
      />
    )
  }
}
