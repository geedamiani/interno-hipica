import { createClient } from "@/lib/supabase/server"
import { TopScorersContent } from "@/components/top-scorers-content"

export const dynamic = "force-dynamic"

export default async function ArtilhariaPage() {
  try {
    const supabase = await createClient()

    const { data: events } = await supabase
      .from("match_events")
      .select("event_type, player_id, team_id")
      .in("event_type", ["goal", "penalty_goal", "assist"])

    if (!events || events.length === 0) {
      return <TopScorersContent topGoals={[]} topAssists={[]} />
    }

    // One event row = 1 goal or 1 assist
    const playerMap = new Map<string, { playerId: string; teamId: string; goals: number; assists: number }>()
    for (const e of events) {
      if (!e.player_id || !e.team_id) continue
      const existing = playerMap.get(e.player_id)
      const isAssist = e.event_type === "assist"
      if (existing) {
        if (isAssist) existing.assists += 1
        else existing.goals += 1
      } else {
        playerMap.set(e.player_id, {
          playerId: e.player_id,
          teamId: e.team_id,
          goals: isAssist ? 0 : 1,
          assists: isAssist ? 1 : 0,
        })
      }
    }

    const allPlayers = Array.from(playerMap.values())
    const playerIds = allPlayers.map((p) => p.playerId)
    const teamIds = [...new Set(allPlayers.map((p) => p.teamId))]

    const [playersRes, teamsRes] = await Promise.all([
      supabase.from("players").select("id, name, nickname").in("id", playerIds),
      supabase.from("teams").select("id, name, short_name, primary_color, logo_url").in("id", teamIds),
    ])

    const pMap = new Map((playersRes.data || []).map((p) => [p.id, p]))
    const tMap = new Map((teamsRes.data || []).map((t) => [t.id, t]))

    const scorers = allPlayers.map((ap) => {
      const p = pMap.get(ap.playerId)
      const t = tMap.get(ap.teamId)
      return {
        name: p?.name || "Desconhecido",
        nickname: p?.nickname || null,
        shirtNumber: null,
        teamName: t?.name || "",
        teamShort: t?.short_name || null,
        teamColor: t?.primary_color || null,
        teamLogo: t?.logo_url || null,
        goals: ap.goals,
        assists: ap.assists,
      }
    })

    const topGoals = scorers.filter((s) => s.goals > 0).sort((a, b) => b.goals - a.goals || b.assists - a.assists)
    const topAssists = scorers.filter((s) => s.assists > 0).sort((a, b) => b.assists - a.assists || b.goals - a.goals)

    return <TopScorersContent topGoals={topGoals} topAssists={topAssists} />
  } catch (error) {
    console.log("[v0] Artilharia page error:", error)
    return <TopScorersContent topGoals={[]} topAssists={[]} />
  }
}
