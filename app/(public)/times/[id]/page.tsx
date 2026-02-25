import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { TeamDetailContent } from "@/components/team-detail-content"
import type { TeamDetailContentProps } from "@/components/team-detail-content"

export const dynamic = "force-dynamic"

export default async function TeamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: activeTournament } = await supabase
    .from("tournaments")
    .select("id")
    .eq("status", "active")
    .limit(1)
    .maybeSingle()

  const tournamentId = activeTournament?.id

  const [{ data: team }, { data: tournamentTeam }, { data: roster }, { data: standings }, { data: matches }] = await Promise.all([
    supabase
      .from("teams")
      .select("id, name, short_name, primary_color, logo_url")
      .eq("id", id)
      .single(),
    tournamentId
      ? supabase
          .from("tournament_teams")
          .select("group_name")
          .eq("team_id", id)
          .eq("tournament_id", tournamentId)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    supabase
      .from("team_players")
      .select("shirt_number, is_captain, players(id, name, nickname, position)")
      .eq("team_id", id)
      .eq("tournament_id", tournamentId || "")
      .order("shirt_number", { ascending: true, nullsFirst: false }),
    supabase
      .from("standings")
      .select("*")
      .eq("team_id", id)
      .eq("tournament_id", tournamentId || "")
      .maybeSingle(),
    supabase
      .from("matches")
      .select(
        "*, home_team:teams!matches_home_team_id_fkey(name, short_name, primary_color, logo_url), away_team:teams!matches_away_team_id_fkey(name, short_name, primary_color, logo_url), rounds(round_number, stages(name))"
      )
      .or(`home_team_id.eq.${id},away_team_id.eq.${id}`)
      .eq("tournament_id", tournamentId || "")
      .order("match_date", { ascending: true }),
  ])

  if (!team) notFound()

  const teamWithGroup = { ...team, group_name: tournamentTeam?.group_name ?? null }

  const players = (roster || [])
    .filter((r) => r.players)
    .map((r) => ({
      id: (r.players as { id: string }).id,
      name: (r.players as { name: string }).name,
      nickname: (r.players as { nickname: string | null }).nickname,
      position: (r.players as { position: string | null }).position,
      shirt_number: r.shirt_number,
      is_captain: r.is_captain,
    }))

  const { data: playerEvents } = await supabase
    .from("match_events")
    .select("event_type, player_id")
    .eq("team_id", id)

  return (
    <TeamDetailContent
      team={teamWithGroup}
      players={players as TeamDetailContentProps["players"]}
      standings={standings as TeamDetailContentProps["standings"]}
      matches={(matches || []) as TeamDetailContentProps["matches"]}
      playerEvents={playerEvents || []}
    />
  )
}
