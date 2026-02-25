import { createClient } from "@/lib/supabase/server"
import { MatchesContent } from "@/components/matches-content"
import type { MatchesContentProps } from "@/components/matches-content"

export const dynamic = "force-dynamic"

export default async function MatchesPage() {
  try {
    const supabase = await createClient()

    const { data: tournament } = await supabase
      .from("tournaments")
      .select("id")
      .eq("status", "active")
      .limit(1)
      .maybeSingle()

    if (!tournament) {
      return <MatchesContent rounds={[]} matches={[]} />
    }

    const [{ data: rounds }, { data: matches }] = await Promise.all([
      supabase
        .from("rounds")
        .select("*, stages(name)")
        .eq("tournament_id", tournament.id)
        .order("round_number", { ascending: true }),
      supabase
        .from("matches")
        .select(
          "*, home_team:teams!matches_home_team_id_fkey(id, name, short_name, primary_color, logo_url), away_team:teams!matches_away_team_id_fkey(id, name, short_name, primary_color, logo_url), rounds(round_number, stages(name))"
        )
        .eq("tournament_id", tournament.id)
        .order("match_date", { ascending: true })
        .order("match_time", { ascending: true }),
    ])

    return (
      <MatchesContent
        rounds={(rounds || []) as MatchesContentProps["rounds"]}
        matches={(matches || []) as unknown as MatchesContentProps["matches"]}
      />
    )
  } catch (error) {
    console.log("[v0] Jogos page error:", error)
    return <MatchesContent rounds={[]} matches={[]} />
  }
}
