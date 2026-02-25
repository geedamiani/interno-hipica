import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { AdminTeamDetail } from "@/components/admin/admin-team-detail"

export default async function AdminTeamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: team } = await supabase.from("teams").select("*").eq("id", id).single()

  if (!team) notFound()

  return <AdminTeamDetail team={team} />
}
