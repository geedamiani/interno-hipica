-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_events ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public read categories" ON categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read tournaments" ON tournaments FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read sponsors" ON sponsors FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read teams" ON teams FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read players" ON players FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read stages" ON stages FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read rounds" ON rounds FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read matches" ON matches FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read match_events" ON match_events FOR SELECT TO anon, authenticated USING (true);

-- Admin write policies (authenticated users only)
CREATE POLICY "Admin insert categories" ON categories FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admin update categories" ON categories FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admin delete categories" ON categories FOR DELETE TO authenticated USING (true);

CREATE POLICY "Admin insert tournaments" ON tournaments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admin update tournaments" ON tournaments FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admin delete tournaments" ON tournaments FOR DELETE TO authenticated USING (true);

CREATE POLICY "Admin insert sponsors" ON sponsors FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admin update sponsors" ON sponsors FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admin delete sponsors" ON sponsors FOR DELETE TO authenticated USING (true);

CREATE POLICY "Admin insert teams" ON teams FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admin update teams" ON teams FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admin delete teams" ON teams FOR DELETE TO authenticated USING (true);

CREATE POLICY "Admin insert players" ON players FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admin update players" ON players FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admin delete players" ON players FOR DELETE TO authenticated USING (true);

CREATE POLICY "Admin insert stages" ON stages FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admin update stages" ON stages FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admin delete stages" ON stages FOR DELETE TO authenticated USING (true);

CREATE POLICY "Admin insert rounds" ON rounds FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admin update rounds" ON rounds FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admin delete rounds" ON rounds FOR DELETE TO authenticated USING (true);

CREATE POLICY "Admin insert matches" ON matches FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admin update matches" ON matches FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admin delete matches" ON matches FOR DELETE TO authenticated USING (true);

CREATE POLICY "Admin insert match_events" ON match_events FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admin update match_events" ON match_events FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admin delete match_events" ON match_events FOR DELETE TO authenticated USING (true);

-- Storage bucket for logos
INSERT INTO storage.buckets (id, name, public) VALUES ('logos', 'logos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Public read logos" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'logos');
CREATE POLICY "Admin upload logos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'logos');
CREATE POLICY "Admin update logos" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'logos');
CREATE POLICY "Admin delete logos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'logos');
