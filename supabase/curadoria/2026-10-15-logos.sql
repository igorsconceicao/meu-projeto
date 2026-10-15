-- Curadoria de logotipos (15/10/2026)
-- Critério: logotipo vigente da marca. Fonte preferida: Wikimedia Commons
-- (arquivos de domínio público/CC com autor e licença); quando o Commons não tem
-- a versão atual, usa-se o arquivo publicado pela própria montadora na sala de
-- imprensa oficial brasileira.

CREATE OR REPLACE FUNCTION pg_temp.commons(arquivo text, largura int DEFAULT 256)
RETURNS text LANGUAGE sql IMMUTABLE AS $$
  SELECT 'https://commons.wikimedia.org/wiki/Special:FilePath/'
    || replace(replace(arquivo, ' ', '_'), '&', '%26') || '?width=' || largura
$$;

CREATE OR REPLACE FUNCTION pg_temp.pagina_commons(arquivo text)
RETURNS text LANGUAGE sql IMMUTABLE AS $$
  SELECT 'https://commons.wikimedia.org/wiki/File:' || replace(arquivo, ' ', '_')
$$;

UPDATE montadoras m SET
  logotipo_url = CASE WHEN v.arquivo LIKE 'https://%' THEN v.arquivo ELSE pg_temp.commons(v.arquivo) END,
  logotipo_fonte_url = CASE WHEN v.arquivo LIKE 'https://%' THEN v.fonte ELSE pg_temp.pagina_commons(v.arquivo) END,
  logotipo_credito = v.credito
FROM (VALUES
  ('byd',        'BYD Auto 2022 logo.svg',            NULL, 'BYD Auto (logotipo usado desde 2022) · domínio público (via Wikimedia Commons)'),
  ('chery',      'Chery logo.svg',                    NULL, 'Chery Automobile · domínio público (via Wikimedia Commons)'),
  ('chevrolet',  'Chevrolet bowtie 2023.svg',         NULL, 'Chevrolet (gravata 2023) · domínio público (via Wikimedia Commons)'),
  ('citroen',    'Citroen 2022.svg',                  NULL, 'Citroën (logotipo de 2022) · domínio público (via Wikimedia Commons)'),
  ('fiat',       'FIAT logo (2020).svg',              NULL, 'FIAT (logotipo usado desde 2020) · domínio público (via Wikimedia Commons)'),
  ('ford',       'Ford logo flat.svg',                NULL, 'Ford Motor Company · domínio público (via Wikimedia Commons)'),
  ('gwm',        'GWM 2025 logo.svg',                 NULL, 'Great Wall Motor (logotipo 2025) · domínio público (via Wikimedia Commons)'),
  ('honda',      'Honda Logo.svg',                    NULL, 'Honda Motor Co. · domínio público (via Wikimedia Commons)'),
  ('hyundai',    'Hyundai Motor Company logo.svg',    NULL, 'Hyundai Motor Company · domínio público (via Wikimedia Commons)'),
  ('jac',        'New Jac motors logo.png',           NULL, 'JAC Motors (logotipo usado no Brasil desde 2017) · domínio público (via Wikimedia Commons)'),
  ('jeep',       'Jeep wordmark.svg',                 NULL, 'Jeep · domínio público (via Wikimedia Commons)'),
  ('mitsubishi', 'Mitsubishi motors new logo.svg',    NULL, 'Mitsubishi Motors Corporation · domínio público (via Wikimedia Commons)'),
  ('nissan',     'Nissan 2020 logo.svg',              NULL, 'Nissan (logotipo usado desde 2020) · domínio público (via Wikimedia Commons)'),
  ('peugeot',    'https://www.media.stellantis.com/uploads/br/peugeot-logo.png',
                 'https://www.media.stellantis.com/br-pt/peugeot',
                 'Peugeot · sala de imprensa oficial Stellantis Brasil'),
  ('ram',        'Ram Trucks 2009 wordmark.svg',      NULL, 'Ram (FCA US LLC) · domínio público (via Wikimedia Commons)'),
  ('renault',    'Renault 2021.svg',                  NULL, 'Renault (logotipo usado desde 2021) · domínio público (via Wikimedia Commons)'),
  ('toyota',     'Toyota Symbol.svg',                 NULL, 'Toyota Motor Corporation · domínio público (via Wikimedia Commons)'),
  ('volkswagen', 'Volkswagen logo 2019.svg',          NULL, 'Volkswagen (logotipo 2019) · domínio público (via Wikimedia Commons)'),
  ('volvo',      'Volvo-Iron-Mark-Black.svg',         NULL, 'Volvo (Iron Mark) · domínio público (via Wikimedia Commons)')
) AS v(slug, arquivo, fonte, credito)
WHERE m.slug = v.slug;

-- GWM: o domínio gwm.com.br pertence a uma empresa de medicina do trabalho.
UPDATE montadoras SET site_oficial_url = 'https://www.gwmmotors.com.br/' WHERE slug = 'gwm';

-- Chery é vendida no Brasil como CAOA Chery. "Caoa" isolada não é marca de
-- veículos (é o grupo que fabrica/distribui) e não tem modelos no catálogo.
UPDATE montadoras SET nome = 'CAOA Chery', grupo = 'CAOA / Chery Automobile'
WHERE slug = 'chery';
DELETE FROM montadoras m
WHERE m.slug = 'caoa' AND NOT EXISTS (SELECT 1 FROM veiculos v WHERE v.montadora_id = m.id);
