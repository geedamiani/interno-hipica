import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { MatchDetailContent } from "@/components/match-detail-content"
import type { MatchDetailContentProps } from "@/components/match-detail-content"

export const dynamic = "force-dynamic"

export default async function MatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: match } = await supabase
    .from("matches")
    .select(
      "*, home_team:teams!matches_home_team_id_fkey(id, name, short_name, primary_color, logo_url), away_team:teams!matches_away_team_id_fkey(id, name, short_name, primary_color, logo_url), rounds(round_number, stages(name))"
    )
    .eq("id", id)
    .single()

  if (!match) notFound()

  const { data: events } = await supabase
    .from("match_events")
    .select("*, players(name, nickname)")
    .eq("match_id", id)
    .order("created_at", { ascending: true })

  return (
    <MatchDetailContent
      match={match as unknown as MatchDetailContentProps["match"]}
      events={(events || []) as MatchDetailContentProps["events"]}
    />
  )
}
