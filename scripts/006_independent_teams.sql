-- Make teams independent from tournaments.
-- tournament_teams junction holds the many-to-many + group assignment.
-- team_players gains tournament_id so each roster is per-tournament.

-- 1. Junction table
CREATE TABLE IF NOT EXISTS tournament_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  group_name VARCHAR(10),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tournament_id, team_id)
);

-- 2. Migrate existing team→tournament relationships
INSERT INTO tournament_teams (tournament_id, team_id, group_name)
SELECT tournament_id, id, group_name FROM teams WHERE tournament_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- 3. Add tournament_id to team_players
ALTER TABLE team_players ADD COLUMN IF NOT EXISTS tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE;

-- 4. Populate tournament_id in team_players from teams
UPDATE team_players tp SET tournament_id = t.tournament_id
FROM teams t WHERE t.id = tp.team_id AND tp.tournament_id IS NULL;

-- 5. Drop the old standings view (it depends on teams.tournament_id and teams.group_name)
DROP VIEW IF EXISTS standings;

-- 6. Now safe to drop old columns from teams
ALTER TABLE teams DROP COLUMN IF EXISTS tournament_id;
ALTER TABLE teams DROP COLUMN IF EXISTS group_name;

-- 7. Recreate standings view using tournament_teams for group_name and tournament_id
CREATE OR REPLACE VIEW standings AS
SELECT
  t.id as team_id,
  tt.tournament_id,
  t.name as team_name,
  t.short_name,
  tt.group_name,
  t.logo_url,
  t.primary_color,
  COUNT(CASE WHEN m.status = 'finished' THEN 1 END) as played,
  COUNT(CASE WHEN (m.home_team_id = t.id AND m.home_score > m.away_score) OR (m.away_team_id = t.id AND m.away_score > m.home_score) THEN 1 END) as wins,
  COUNT(CASE WHEN m.status = 'finished' AND m.home_score = m.away_score THEN 1 END) as draws,
  COUNT(CASE WHEN (m.home_team_id = t.id AND m.home_score < m.away_score) OR (m.away_team_id = t.id AND m.away_score < m.home_score) THEN 1 END) as losses,
  COALESCE(SUM(CASE WHEN m.home_team_id = t.id AND m.status = 'finished' THEN m.home_score WHEN m.away_team_id = t.id AND m.status = 'finished' THEN m.away_score ELSE 0 END), 0) as goals_for,
  COALESCE(SUM(CASE WHEN m.home_team_id = t.id AND m.status = 'finished' THEN m.away_score WHEN m.away_team_id = t.id AND m.status = 'finished' THEN m.home_score ELSE 0 END), 0) as goals_against,
  COALESCE(SUM(CASE WHEN m.home_team_id = t.id AND m.status = 'finished' THEN m.home_score - m.away_score WHEN m.away_team_id = t.id AND m.status = 'finished' THEN m.away_score - m.home_score ELSE 0 END), 0) as goal_difference,
  COUNT(CASE WHEN (m.home_team_id = t.id AND m.home_score > m.away_score) OR (m.away_team_id = t.id AND m.away_score > m.home_score) THEN 1 END) * 3 +
  COUNT(CASE WHEN m.status = 'finished' AND m.home_score = m.away_score THEN 1 END) as points
FROM tournament_teams tt
JOIN teams t ON t.id = tt.team_id
LEFT JOIN matches m ON (m.home_team_id = t.id OR m.away_team_id = t.id)
  AND m.tournament_id = tt.tournament_id
  AND m.stage_id IN (SELECT id FROM stages WHERE type = 'group' AND tournament_id = tt.tournament_id)
GROUP BY t.id, tt.tournament_id, t.name, t.short_name, tt.group_name, t.logo_url, t.primary_color;
