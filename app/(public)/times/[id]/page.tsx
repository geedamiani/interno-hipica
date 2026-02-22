import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { TeamDetailContent } from "@/components/team-detail-content"

export const dynamic = "force-dynamic"

export default async function TeamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: team }, { data: players }, { data: standings }, { data: matches }] = await Promise.all([
    supabase
      .from("teams")
      .select("id, name, short_name, primary_color, logo_url, group_name")
      .eq("id", id)
      .single(),
    supabase
      .from("players")
      .select("*")
      .eq("team_id", id)
      .order("shirt_number", { ascending: true }),
    supabase
      .from("standings")
      .select("*")
      .eq("team_id", id)
      .maybeSingle(),
    supabase
      .from("matches")
      .select(
        "*, home_team:teams!matches_home_team_id_fkey(name, short_name, primary_color, logo_url), away_team:teams!matches_away_team_id_fkey(name, short_name, primary_color, logo_url), rounds(round_number, stages(name))"
      )
      .or(`home_team_id.eq.${id},away_team_id.eq.${id}`)
      .order("match_date", { ascending: true }),
  ])

  if (!team) notFound()

  const { data: playerEvents } = await supabase
    .from("match_events")
    .select("event_type, player_id")
    .eq("team_id", id)

  return (
    <TeamDetailContent
      team={team}
      players={players || []}
      standings={standings}
      matches={matches || []}
      playerEvents={playerEvents || []}
    />
  )
}
