import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { AdminTournamentRoster } from "@/components/admin/admin-tournament-roster"

export default async function TournamentRosterPage({
  params,
}: {
  params: Promise<{ id: string; teamId: string }>
}) {
  const { id: tournamentId, teamId } = await params
  const supabase = await createClient()

  const [{ data: tournament }, { data: team }, { data: roster }, { data: allPlayers }] = await Promise.all([
    supabase.from("tournaments").select("id, name, year, semester").eq("id", tournamentId).single(),
    supabase.from("teams").select("id, name, short_name, logo_url").eq("id", teamId).single(),
    supabase
      .from("team_players")
      .select("*, players(*)")
      .eq("team_id", teamId)
      .eq("tournament_id", tournamentId)
      .order("shirt_number", { ascending: true, nullsFirst: false }),
    supabase.from("players").select("*").order("name"),
  ])

  if (!tournament || !team) notFound()

  return (
    <AdminTournamentRoster
      tournament={tournament}
      team={team}
      roster={roster || []}
      allPlayers={allPlayers || []}
    />
  )
}
