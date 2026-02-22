-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

-- Sponsors (reusable across tournaments)
CREATE TABLE IF NOT EXISTS sponsors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Teams (linked to tournaments, with sponsor)
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  sponsor_id UUID REFERENCES sponsors(id),
  name TEXT NOT NULL,
  short_name TEXT,
  group_name TEXT,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#2d4a9e',
  secondary_color TEXT DEFAULT '#ffffff',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Players
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
