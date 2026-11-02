-- Armazenamento público só para logotipos de marcas (versões leves dos logos
-- oficiais). Público para leitura por endereço; ninguém lista nem envia
-- arquivos pela API — só a função preparar-logo (chave de serviço) grava.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('marcas', 'marcas', true, 524288, array['image/png'])
on conflict (id) do update set public = true, file_size_limit = 524288, allowed_mime_types = array['image/png'];
