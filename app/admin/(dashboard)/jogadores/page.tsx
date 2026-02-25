import { createClient } from "@/lib/supabase/server"
import { AdminJogadoresList } from "@/components/admin/admin-jogadores-list"

export default async function AdminPlayersPage() {
  const supabase = await createClient()

  const { data: players } = await supabase
    .from("players")
    .select("*")
    .order("name")

  return <AdminJogadoresList players={players || []} />
}
