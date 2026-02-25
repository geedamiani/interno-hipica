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

    const { data: tournamentTeams } = await supabase
      .from("tournament_teams")
      .select("group_name, teams(id, name, short_name, primary_color, logo_url)")
      .eq("tournament_id", tournament.id)
      .order("group_name")

    const teams = (tournamentTeams || [])
      .filter((tt) => tt.teams)
      .map((tt) => {
        const t = tt.teams as { id: string; name: string; short_name: string | null; primary_color: string | null; logo_url: string | null }
        return { ...t, group_name: tt.group_name }
      })

    return <TeamsContent teams={teams} />
  } catch (error) {
    console.log("[v0] Times page error:", error)
    return <TeamsContent teams={[]} />
  }
}
