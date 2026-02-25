import { createClient } from "@/lib/supabase/server"
import { AdminTournamentForm } from "@/components/admin/admin-tournament-form"

export default async function NewTournamentPage() {
  const supabase = await createClient()
  const { data: categories } = await supabase.from("categories").select("id, name").order("name")

  return (
    <AdminTournamentForm
      categories={categories || []}
      tournament={null}
    />
  )
}
