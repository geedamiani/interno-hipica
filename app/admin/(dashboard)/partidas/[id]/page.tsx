import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { AdminMatchEditor } from "@/components/admin/admin-match-editor"

export default async function AdminMatchEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: match } = await supabase
    .from("matches")
    .select("*, home_team:teams!matches_home_team_id_fkey(*, sponsors(*)), away_team:teams!matches_away_team_id_fkey(*, sponsors(*))")
    .eq("id", id)
    .single()

  if (!match) notFound()

  const homeTeamId = match.home_team_id
  const awayTeamId = match.away_team_id

  const [{ data: homePlayers }, { data: awayPlayers }, { data: events }] = await Promise.all([
    supabase.from("players").select("*").eq("team_id", homeTeamId).order("shirt_number"),
    supabase.from("players").select("*").eq("team_id", awayTeamId).order("shirt_number"),
    supabase
      .from("match_events")
      .select("*, players(name, nickname, shirt_number)")
      .eq("match_id", id)
      .order("minute", { ascending: true }),
  ])

  return (
    <AdminMatchEditor
      match={match}
      homePlayers={homePlayers || []}
      awayPlayers={awayPlayers || []}
      events={events || []}
    />
  )
}
