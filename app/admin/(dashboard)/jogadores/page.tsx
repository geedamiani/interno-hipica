import { createClient } from "@/lib/supabase/server"
import { AdminPlayersList } from "@/components/admin/admin-players-list"

export default async function AdminPlayersPage() {
  const supabase = await createClient()

  const { data: tournament } = await supabase
    .from("tournaments")
    .select("id")
    .eq("status", "active")
    .single()

  const { data: players } = await supabase
    .from("players")
    .select("*, teams(name, short_name, primary_color, logo_url)")
    .eq("tournament_id", tournament?.id || "")
    .order("name")

  return <AdminPlayersList players={players || []} />
}
