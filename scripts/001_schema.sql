-- Categories (veterano, adulto, master)
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  min_age INT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tournaments (each semester edition)
CREATE TABLE IF NOT EXISTS tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES categories(id),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  year INT NOT NULL,
  semester INT NOT NULL CHECK (semester IN (1, 2)),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'finished')),
  start_date DATE,
  end_date DATE,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Teams (linked to tournaments; team name = sponsor name, team logo = sponsor logo)
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  short_name TEXT,
  group_name TEXT,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#2d4a9e',
  secondary_color TEXT DEFAULT '#ffffff',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Players (linked to teams, different each semester)
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  nickname TEXT,
  shirt_number INT,
  position TEXT,
  is_captain BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Stages
CREATE TABLE IF NOT EXISTS stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  order_num INT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('group', 'knockout'))
);

-- Rounds
CREATE TABLE IF NOT EXISTS rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_id UUID REFERENCES stages(id) ON DELETE CASCADE,
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  round_number INT NOT NULL,
  date DATE,
  name TEXT
);

-- Matches
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id UUID REFERENCES rounds(id) ON DELETE CASCADE,
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  home_team_id UUID REFERENCES teams(id),
  away_team_id UUID REFERENCES teams(id),
  home_score INT,
  away_score INT,
  field_number INT,
  match_time TIME,
  match_date DATE,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'finished', 'postponed')),
  stage_id UUID REFERENCES stages(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Match Events
CREATE TABLE IF NOT EXISTS match_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id),
  team_id UUID REFERENCES teams(id),
  event_type TEXT NOT NULL CHECK (event_type IN ('goal', 'assist', 'yellow_card', 'red_card', 'own_goal', 'penalty_goal', 'penalty_miss')),
  minute INT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Standings VIEW (auto-calculated from matches)
CREATE OR REPLACE VIEW standings AS
SELECT
  t.id as team_id,
  t.tournament_id,
  t.name as team_name,
  t.short_name,
  t.group_name,
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
FROM teams t
LEFT JOIN matches m ON (m.home_team_id = t.id OR m.away_team_id = t.id)
  AND m.stage_id IN (SELECT id FROM stages WHERE type = 'group' AND tournament_id = t.tournament_id)
GROUP BY t.id, t.tournament_id, t.name, t.short_name, t.group_name, t.logo_url, t.primary_color;
