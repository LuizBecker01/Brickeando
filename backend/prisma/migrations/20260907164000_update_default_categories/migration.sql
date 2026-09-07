DELETE FROM "ProductCategory"
WHERE "categoryId" IN (
  SELECT "id" FROM "Category"
  WHERE "slug" IN ('moveis', 'esporte', 'casa-e-decoracao', 'moda', 'veiculos')
);

DELETE FROM "Category"
WHERE "slug" IN ('moveis', 'esporte', 'casa-e-decoracao', 'moda', 'veiculos');

INSERT INTO "Category" ("id", "name", "slug", "description")
VALUES
  ('00000000-0000-0000-0000-000000000011', 'Casa e jardim', 'casa-e-jardim', 'Itens para casa, jardim e decoração'),
  ('00000000-0000-0000-0000-000000000012', 'Entretenimento', 'entretenimento', 'Filmes, música, jogos e lazer'),
  ('00000000-0000-0000-0000-000000000013', 'Roupas e acessórios', 'roupas-e-acessorios', 'Roupas, calçados e acessórios'),
  ('00000000-0000-0000-0000-000000000014', 'Eletrônicos', 'eletronicos', 'Celulares, computadores e eletrônicos'),
  ('00000000-0000-0000-0000-000000000015', 'Hobbies', 'hobbies', 'Coleções, artesanato e hobbies'),
  ('00000000-0000-0000-0000-000000000016', 'Veículos', 'veiculos', 'Carros, motos e outros veículos')
ON CONFLICT ("slug") DO NOTHING;
