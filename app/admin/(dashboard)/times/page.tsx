import { createClient } from "@/lib/supabase/server"
import { AdminTeamsList } from "@/components/admin/admin-teams-list"

export default async function AdminTeamsPage() {
  const supabase = await createClient()

  const { data: tournament } = await supabase
    .from("tournaments")
    .select("id")
    .eq("status", "active")
    .single()

  const { data: teams } = await supabase
    .from("teams")
    .select("*, sponsors(name)")
    .eq("tournament_id", tournament?.id || "")
    .order("group_name")
    .order("name")

  return <AdminTeamsList teams={teams || []} tournamentId={tournament?.id || ""} />
}
