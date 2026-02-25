import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { AdminTournamentEditor } from "@/components/admin/admin-tournament-editor"

export default async function EditTournamentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: tournament } = await supabase
    .from("tournaments")
    .select("*, categories(name)")
    .eq("id", id)
    .single()

  if (!tournament) notFound()

  const [
    { data: categories },
    { data: tournamentTeams },
    { data: allTeams },
    { data: stages },
    { data: rounds },
    { data: matches },
  ] = await Promise.all([
    supabase.from("categories").select("id, name").order("name"),
    supabase
      .from("tournament_teams")
      .select("*, teams(id, name, short_name, logo_url, primary_color)")
      .eq("tournament_id", id)
      .order("group_name"),
    supabase.from("teams").select("id, name, short_name, logo_url").order("name"),
    supabase.from("stages").select("*").eq("tournament_id", id).order("order_num"),
    supabase
      .from("rounds")
      .select("*, stages(name)")
      .eq("tournament_id", id)
      .order("round_number"),
    supabase
      .from("matches")
      .select(
        "*, home_team:teams!matches_home_team_id_fkey(id, name, short_name, primary_color, logo_url), away_team:teams!matches_away_team_id_fkey(id, name, short_name, primary_color, logo_url), rounds(round_number, name, stages(name))"
      )
      .eq("tournament_id", id)
      .order("match_date")
      .order("match_time"),
  ])

  // Count players per team for this tournament
  const teamIds = (tournamentTeams || []).map((tt) => (tt.teams as { id: string })?.id).filter(Boolean)
  const { data: rosterCounts } = teamIds.length > 0
    ? await supabase
        .from("team_players")
        .select("team_id")
        .eq("tournament_id", id)
        .in("team_id", teamIds)
    : { data: [] }

  const countMap = new Map<string, number>()
  for (const r of rosterCounts || []) {
    countMap.set(r.team_id, (countMap.get(r.team_id) || 0) + 1)
  }

  const teamsInTournament = (tournamentTeams || []).map((tt) => {
    const team = tt.teams as { id: string; name: string; short_name: string | null; logo_url: string | null; primary_color: string | null } | null
    return {
      tournamentTeamId: tt.id,
      teamId: team?.id || "",
      name: team?.name || "",
      short_name: team?.short_name || null,
      logo_url: team?.logo_url || null,
      primary_color: team?.primary_color || null,
      group_name: tt.group_name,
      playerCount: countMap.get(team?.id || "") || 0,
    }
  })

  return (
    <AdminTournamentEditor
      tournament={tournament}
      categories={categories || []}
      teams={teamsInTournament}
      allTeams={allTeams || []}
      stages={stages || []}
      rounds={rounds || []}
      matches={matches || []}
    />
  )
}
