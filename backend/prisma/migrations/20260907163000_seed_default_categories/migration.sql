INSERT INTO "Category" ("id", "name", "slug", "description")
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Móveis', 'moveis', 'Móveis e itens para casa'),
  ('00000000-0000-0000-0000-000000000002', 'Eletrônicos', 'eletronicos', 'Celulares, computadores e eletrônicos'),
  ('00000000-0000-0000-0000-000000000003', 'Esporte', 'esporte', 'Artigos esportivos'),
  ('00000000-0000-0000-0000-000000000004', 'Casa e decoração', 'casa-e-decoracao', 'Itens para casa e decoração'),
  ('00000000-0000-0000-0000-000000000005', 'Moda', 'moda', 'Roupas, calçados e acessórios'),
  ('00000000-0000-0000-0000-000000000006', 'Veículos', 'veiculos', 'Carros, motos e bicicletas')
ON CONFLICT ("slug") DO NOTHING;
