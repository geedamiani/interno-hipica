import { createClient } from "@/lib/supabase/server"
import { AdminMatchesList } from "@/components/admin/admin-matches-list"

export default async function AdminMatchesPage() {
  const supabase = await createClient()

  const { data: tournament } = await supabase
    .from("tournaments")
    .select("id")
    .eq("status", "active")
    .single()

  const tournamentId = tournament?.id || ""

  const [{ data: rounds }, { data: matches }, { data: teams }] = await Promise.all([
    supabase
      .from("rounds")
      .select("*, stages(*)")
      .eq("tournament_id", tournamentId)
      .order("round_number", { ascending: true }),
    supabase
      .from("matches")
      .select("*, home_team:teams!matches_home_team_id_fkey(id, name, short_name, primary_color, logo_url), away_team:teams!matches_away_team_id_fkey(id, name, short_name, primary_color, logo_url), rounds(name)")
      .eq("tournament_id", tournamentId)
      .order("match_date", { ascending: true })
      .order("match_time", { ascending: true }),
    supabase
      .from("teams")
      .select("id, name, short_name")
      .eq("tournament_id", tournamentId),
  ])

  return (
    <AdminMatchesList
      rounds={rounds || []}
      matches={matches || []}
      teams={teams || []}
      tournamentId={tournamentId}
    />
  )
}
