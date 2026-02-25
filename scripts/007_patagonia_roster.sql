-- Add Patagonia roster players (names with first letter cap only).
-- Resolves Patagonia team and tournament by name so it works with any UUIDs.

-- Insert players (global registry) — use valid hex UUIDs only (0-9, a-f)
INSERT INTO players (id, name) VALUES
  ('a2000000-0000-0000-0000-000000000001', 'Bruno Bonturi Von Zuben'),
  ('a2000000-0000-0000-0000-000000000002', 'Bruno Da Rocha Barros'),
  ('a2000000-0000-0000-0000-000000000003', 'Caio Pikunas'),
  ('a2000000-0000-0000-0000-000000000004', 'Diego Serra Fernandes'),
  ('a2000000-0000-0000-0000-000000000005', 'Eduardo Ribeiro De Oliveira'),
  ('a2000000-0000-0000-0000-000000000006', 'Felipe Reymond Simoes'),
  ('a2000000-0000-0000-0000-000000000007', 'Fernando Cesar Barbosa Siqueira'),
  ('a2000000-0000-0000-0000-000000000008', 'Francisco Carlos Hossri'),
  ('a2000000-0000-0000-0000-000000000009', 'Guilherme Barbi'),
  ('a2000000-0000-0000-0000-000000000010', 'Guilherme Castelli Damiani'),
  ('a2000000-0000-0000-0000-000000000011', 'Jose Eduardo Souza De Araujo Teixeira'),
  ('a2000000-0000-0000-0000-000000000012', 'Jose Verni Neto'),
  ('a2000000-0000-0000-0000-000000000013', 'Leonardo Balloni Farias'),
  ('a2000000-0000-0000-0000-000000000014', 'Luiz Felipe De Araujo Teixeira Goncalves'),
  ('a2000000-0000-0000-0000-000000000015', 'Mairaue De Araujo Teixeira Strazzacappa'),
  ('a2000000-0000-0000-0000-000000000016', 'Pedro Henrique Rodrigues Pupo Nogueira'),
  ('a2000000-0000-0000-0000-000000000017', 'Rene Formigari De Almeida Barbosa')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- Assign all to Patagonia elenco (resolve team and tournament by name)
INSERT INTO team_players (team_id, player_id, tournament_id)
SELECT
  (SELECT id FROM teams WHERE name ILIKE '%Patagonia%' LIMIT 1),
  p.id,
  (SELECT id FROM tournaments ORDER BY start_date DESC NULLS LAST LIMIT 1)
FROM players p
WHERE p.id IN (
  'a2000000-0000-0000-0000-000000000001',
  'a2000000-0000-0000-0000-000000000002',
  'a2000000-0000-0000-0000-000000000003',
  'a2000000-0000-0000-0000-000000000004',
  'a2000000-0000-0000-0000-000000000005',
  'a2000000-0000-0000-0000-000000000006',
  'a2000000-0000-0000-0000-000000000007',
  'a2000000-0000-0000-0000-000000000008',
  'a2000000-0000-0000-0000-000000000009',
  'a2000000-0000-0000-0000-000000000010',
  'a2000000-0000-0000-0000-000000000011',
  'a2000000-0000-0000-0000-000000000012',
  'a2000000-0000-0000-0000-000000000013',
  'a2000000-0000-0000-0000-000000000014',
  'a2000000-0000-0000-0000-000000000015',
  'a2000000-0000-0000-0000-000000000016',
  'a2000000-0000-0000-0000-000000000017'
)
ON CONFLICT (team_id, player_id) DO NOTHING;
