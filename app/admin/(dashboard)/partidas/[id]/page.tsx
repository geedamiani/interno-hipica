import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { AdminMatchEditor } from "@/components/admin/admin-match-editor"

export default async function AdminMatchEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: match } = await supabase
    .from("matches")
    .select("*, home_team:teams!matches_home_team_id_fkey(*), away_team:teams!matches_away_team_id_fkey(*)")
    .eq("id", id)
    .single()

  if (!match) notFound()

  const homeTeamId = match.home_team_id
  const awayTeamId = match.away_team_id
  const tournamentId = match.tournament_id || ""

  // Fetch rosters via team_players junction, scoped to this tournament
  const [{ data: homeRoster }, { data: awayRoster }, { data: events }] = await Promise.all([
    supabase
      .from("team_players")
      .select("shirt_number, players(id, name, nickname)")
      .eq("team_id", homeTeamId || "")
      .eq("tournament_id", tournamentId),
    supabase
      .from("team_players")
      .select("shirt_number, players(id, name, nickname)")
      .eq("team_id", awayTeamId || "")
      .eq("tournament_id", tournamentId),
    supabase
      .from("match_events")
      .select("*, players(name, nickname)")
      .eq("match_id", id)
      .order("minute", { ascending: true }),
  ])

  // Flatten roster into player-like objects for the editor
  const flattenRoster = (roster: typeof homeRoster) =>
    (roster || []).filter((r) => r.players).map((r) => ({
      id: (r.players as { id: string }).id,
      name: (r.players as { name: string }).name,
      nickname: (r.players as { nickname: string | null }).nickname,
      shirt_number: r.shirt_number,
    }))

  return (
    <AdminMatchEditor
      match={match as any}
      homePlayers={flattenRoster(homeRoster) as any}
      awayPlayers={flattenRoster(awayRoster) as any}
      events={(events || []) as any}
    />
  )
}
