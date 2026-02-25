-- Remove sponsors: teams ARE the sponsors (team name = sponsor name, team logo = sponsor logo)
-- The teams table already has name, logo_url, etc. so sponsor_id is redundant.

ALTER TABLE teams DROP COLUMN IF EXISTS sponsor_id;
DROP TABLE IF EXISTS sponsors;
