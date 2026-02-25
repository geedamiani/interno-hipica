-- Add M&M (M&M Contabil) roster players (names with first letter cap only).
-- Resolves M&M team and tournament by name so it works with any UUIDs.

-- Insert players (global registry) — use valid hex UUIDs only (0-9, a-f)
INSERT INTO players (id, name, position) VALUES
  ('a4000000-0000-0000-0000-000000000001', 'Marcos Rollo Niza', 'Goleiro'),
  ('a4000000-0000-0000-0000-000000000002', 'Jorge Camilo Trabulsi', NULL),
  ('a4000000-0000-0000-0000-000000000003', 'Jose Ricardo Daniel Vieira', NULL),
  ('a4000000-0000-0000-0000-000000000004', 'Sergio Couto Pupo Nogueira', NULL),
  ('a4000000-0000-0000-0000-000000000005', 'Ricardo Guimaraes Zambrone', NULL),
  ('a4000000-0000-0000-0000-000000000006', 'Mario Sergio Valentini Junior', NULL),
  ('a4000000-0000-0000-0000-000000000007', 'Bruno Gedra Iorio', NULL),
  ('a4000000-0000-0000-0000-000000000008', 'Jose Henrique Ricci Grossi', NULL),
  ('a4000000-0000-0000-0000-000000000009', 'Ricardo Santos Moraes De Burgos', NULL),
  ('a4000000-0000-0000-0000-000000000010', 'Rafael Destro Mangabeira Albernaz', NULL),
  ('a4000000-0000-0000-0000-000000000011', 'Marcel Suzigan', NULL),
  ('a4000000-0000-0000-0000-000000000012', 'Gustavo Zuliani Felicio', NULL),
  ('a4000000-0000-0000-0000-000000000013', 'Claudio Roberto Fernandes Filho', NULL),
  ('a4000000-0000-0000-0000-000000000014', 'Gustavo Pierro Postal', NULL),
  ('a4000000-0000-0000-0000-000000000015', 'Rafael Bertassolli Angi', NULL),
  ('a4000000-0000-0000-0000-000000000016', 'Mauricio Cruz Gontijo', NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, position = EXCLUDED.position;

-- Assign all to M&M elenco (resolve team and tournament by name)
INSERT INTO team_players (team_id, player_id, tournament_id)
SELECT
  (SELECT id FROM teams WHERE name ILIKE '%M&M%' LIMIT 1),
  p.id,
  (SELECT id FROM tournaments ORDER BY start_date DESC NULLS LAST LIMIT 1)
FROM players p
WHERE p.id IN (
  'a4000000-0000-0000-0000-000000000001',
  'a4000000-0000-0000-0000-000000000002',
  'a4000000-0000-0000-0000-000000000003',
  'a4000000-0000-0000-0000-000000000004',
  'a4000000-0000-0000-0000-000000000005',
  'a4000000-0000-0000-0000-000000000006',
  'a4000000-0000-0000-0000-000000000007',
  'a4000000-0000-0000-0000-000000000008',
  'a4000000-0000-0000-0000-000000000009',
  'a4000000-0000-0000-0000-000000000010',
  'a4000000-0000-0000-0000-000000000011',
  'a4000000-0000-0000-0000-000000000012',
  'a4000000-0000-0000-0000-000000000013',
  'a4000000-0000-0000-0000-000000000014',
  'a4000000-0000-0000-0000-000000000015',
  'a4000000-0000-0000-0000-000000000016'
)
ON CONFLICT (team_id, player_id) DO NOTHING;
