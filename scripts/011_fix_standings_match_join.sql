-- Fix standings: matches with NULL stage_id or tournament_id are not counted.
-- Run this in Supabase SQL Editor (production + local).
-- Requires: migration 006_independent_teams.sql must have been run (tournament_teams exists).
--
-- 1. Backfill match.stage_id and match.tournament_id from round when missing
-- 2. Recreate standings view to derive stage/tournament from round when null

-- Backfill matches missing stage_id (get from round)
UPDATE matches m
SET stage_id = r.stage_id
FROM rounds r
WHERE m.round_id = r.id AND m.stage_id IS NULL;

-- Backfill matches missing tournament_id (get from round)
UPDATE matches m
SET tournament_id = r.tournament_id
FROM rounds r
WHERE m.round_id = r.id AND m.tournament_id IS NULL;

-- Recreate standings view: use COALESCE so matches without stage_id/tournament_id
-- still count when round provides them (defensive for future inserts)
DROP VIEW IF EXISTS standings;

CREATE OR REPLACE VIEW standings AS
SELECT
  t.id AS team_id,
  tt.tournament_id,
  t.name AS team_name,
  t.short_name,
  tt.group_name,
  t.logo_url,
  t.primary_color,
  COUNT(CASE WHEN m.status = 'finished' THEN 1 END) AS played,
  COUNT(CASE WHEN (m.home_team_id = t.id AND m.home_score > m.away_score) OR (m.away_team_id = t.id AND m.away_score > m.home_score) THEN 1 END) AS wins,
  COUNT(CASE WHEN m.status = 'finished' AND m.home_score = m.away_score THEN 1 END) AS draws,
  COUNT(CASE WHEN (m.home_team_id = t.id AND m.home_score < m.away_score) OR (m.away_team_id = t.id AND m.away_score < m.home_score) THEN 1 END) AS losses,
  COALESCE(SUM(CASE WHEN m.home_team_id = t.id AND m.status = 'finished' THEN m.home_score WHEN m.away_team_id = t.id AND m.status = 'finished' THEN m.away_score ELSE 0 END), 0) AS goals_for,
  COALESCE(SUM(CASE WHEN m.home_team_id = t.id AND m.status = 'finished' THEN m.away_score WHEN m.away_team_id = t.id AND m.status = 'finished' THEN m.home_score ELSE 0 END), 0) AS goals_against,
  COALESCE(SUM(CASE WHEN m.home_team_id = t.id AND m.status = 'finished' THEN m.home_score - m.away_score WHEN m.away_team_id = t.id AND m.status = 'finished' THEN m.away_score - m.home_score ELSE 0 END), 0) AS goal_difference,
  COUNT(CASE WHEN (m.home_team_id = t.id AND m.home_score > m.away_score) OR (m.away_team_id = t.id AND m.away_score > m.home_score) THEN 1 END) * 3 +
  COUNT(CASE WHEN m.status = 'finished' AND m.home_score = m.away_score THEN 1 END) AS points
FROM tournament_teams tt
JOIN teams t ON t.id = tt.team_id
LEFT JOIN matches m ON (m.home_team_id = t.id OR m.away_team_id = t.id)
  AND COALESCE(m.tournament_id, (SELECT r.tournament_id FROM rounds r WHERE r.id = m.round_id)) = tt.tournament_id
  AND COALESCE(m.stage_id, (SELECT r.stage_id FROM rounds r WHERE r.id = m.round_id)) IN (
    SELECT id FROM stages WHERE type = 'group' AND tournament_id = tt.tournament_id
  )
GROUP BY t.id, tt.tournament_id, t.name, t.short_name, tt.group_name, t.logo_url, t.primary_color;
