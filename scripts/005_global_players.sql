-- Make players a global registry and use team_players junction for rosters.
-- Players: name, nickname, position (global)
-- team_players: links players to teams per tournament

CREATE TABLE IF NOT EXISTS team_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  shirt_number INT,
  is_captain BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(team_id, player_id)
);

-- Migrate existing players into team_players
INSERT INTO team_players (team_id, player_id, shirt_number, is_captain)
SELECT team_id, id, shirt_number, is_captain FROM players WHERE team_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- Remove team-specific fields from players (now in team_players)
ALTER TABLE players DROP COLUMN IF EXISTS shirt_number;
ALTER TABLE players DROP COLUMN IF EXISTS is_captain;
ALTER TABLE players DROP COLUMN IF EXISTS team_id;
