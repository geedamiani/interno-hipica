import { createClient } from "@/lib/supabase/server"
import { TeamsContent } from "@/components/teams-content"

export const dynamic = "force-dynamic"

export default async function TeamsPage() {
  try {
    const supabase = await createClient()

    const { data: tournament } = await supabase
      .from("tournaments")
      .select("id")
      .eq("status", "active")
      .limit(1)
      .maybeSingle()

    if (!tournament) {
      return <TeamsContent teams={[]} />
    }

    const { data: teams } = await supabase
      .from("teams")
      .select("id, name, short_name, primary_color, logo_url, group_name")
      .eq("tournament_id", tournament.id)
      .order("group_name", { ascending: true })
      .order("name", { ascending: true })

    return <TeamsContent teams={teams || []} />
  } catch (error) {
    console.log("[v0] Times page error:", error)
    return <TeamsContent teams={[]} />
  }
}
