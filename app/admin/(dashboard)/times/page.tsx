import { createClient } from "@/lib/supabase/server"
import { AdminTeamsList } from "@/components/admin/admin-teams-list"

export default async function AdminTeamsPage() {
  const supabase = await createClient()

  const { data: teams } = await supabase
    .from("teams")
    .select("*")
    .order("name")

  return <AdminTeamsList teams={teams || []} />
}
