# Instruções de pesquisa do catálogo

Este arquivo é a referência para qualquer rodada de coleta de dados (manual ou
pela rotina automática quinzenal). Ele acumula as regras das rodadas 1 a 8:
**as seções "RODADA 6", "RODADA 7" e "RODADA 8" são as que valem hoje** e
prevalecem sobre as anteriores.
Em `consultado_em` e `verificado_br_em` use sempre a data do dia da coleta.

---

# Instruções de pesquisa — Plataforma de Inteligência Automotiva BR

Projeto Supabase: `npmsgjpjfflawluyuisl` (use a ferramenta `mcp__Supabase__execute_sql`; carregue-a com ToolSearch `select:mcp__Supabase__execute_sql` se necessário).

A rede deste container é bloqueada. TODA leitura de páginas web é feita por SQL, em 2 passos:

1. Disparar (até 6 páginas por chamada):
```sql
select interno.pesquisar_midia($j${"acao":"trechos","paginas":[
  {"id":"tracker","url":"https://www.chevrolet.com.br/suvs/novo-tracker","palavras":["tela","carplay","android auto","sem fio","farol","faróis","motor","cv","câmbio"],"raio":130,"max":3}
]}$j$::jsonb) as id;
```
2. Em OUTRA chamada, ler o resultado: `select status_code, content from net._http_response where id = <id>;`
   Se vier vazio, leia de novo (a requisição leva de 5 a 90 s). Para economizar, use `left(content, 25000)`.

Ações disponíveis da função:
- `trechos` — `{id, url, palavras[], raio (≤400), max (≤12)}` → trechos de texto ao redor de cada palavra. `[v]` = texto visível; `[d]` = dados estruturados (JSON-LD, __NEXT_DATA__).
- `pagina` — `{id, url, palavras?}` → título, og:image, canonical, descrição, `links` e `imagens` cujas URLs contêm alguma das palavras (bom para achar subpáginas "ficha-tecnica", "especificacoes", "versoes", PDFs e fotos).
- `commons` — `{"acao":"commons","consultas":[{"id":"x","termo":"GAC GS4 Brazil","limite":10}]}` → arquivos do Wikimedia Commons com autor, licença, descrição e categorias.
- `commons-categoria` — `{"acao":"commons-categoria","categorias":[{"id":"x","categoria":"GAC Aion Y","limite":20}]}`.

Domínios aceitos: qualquer `*.com.br` / `*.br`, wikimedia/wikipedia/wikidata, byd.com, denza.com, stellantis.com, volvocars.com, nissan-cdn.net, gacmotor.com, gac-motor.com, gacinternational.com, omodajaecoo.com, omodaauto.com, jaecoo.com, leapmotor.com, leapmotor-international.com, geely.com, geelyauto.com, zeekr.com, zeekrlife.com, xpeng.com, heyxpeng.com, changan.com, changanauto.com, mgmotor.com, kia.com. Só HTTPS.

Palavras úteis: "tela", "polegadas", "multimídia", "central", "carplay", "android auto", "sem fio", "wireless", "espelhamento", "projeção", "farol", "faróis", "led", "halógen", "neblina", "lanterna", "motor", "cv", "kgfm", "nm", "câmbio", "transmissão", "marchas", "cvt", "tração", "autonomia", "kwh", "bateria", "palheta", "limpador".
Atenção: a palavra "polegadas" muitas vezes não aparece (o site usa 11"), por isso use também "tela".

## REGRAS ABSOLUTAS (dados para uma importadora de autopeças — erro é grave)

1. Só registre um valor se ele aparecer LITERALMENTE em trecho de página OFICIAL BRASILEIRA da montadora: site da marca no Brasil (.com.br ou seção /br/ do site global) ou sala de imprensa oficial brasileira (ex.: media.stellantis.com/br-pt). Wikipedia, blogs, revistas, concessionárias e sites de outros países NÃO servem como fonte técnica.
2. Nunca deduza, estime ou complete com conhecimento próprio. Não achou → NULL / 'nao_identificado'.
3. CarPlay / Android Auto (estados: confirmado | nao_disponivel | nao_identificado | depende_versao):
   - `carplay` e `android_auto` (disponibilidade geral): 'confirmado' se a fonte diz que a central é compatível/integra; 'depende_versao' se a fonte diz que só algumas versões têm; 'nao_disponivel' só se a fonte disser explicitamente que não tem; senão 'nao_identificado'.
   - `carplay_sem_fio` / `android_auto_sem_fio`: 'confirmado' somente se a fonte disser explicitamente sem fio / wireless / "projeção sem fio" / "espelhamento sem fio" referente ao CarPlay/Android Auto ou à central. NÃO confundir com carregador de celular por indução "sem fio". 'depende_versao' se só em versões específicas.
   - `carplay_cabo` / `android_auto_cabo`: 'confirmado' só se a fonte disser explicitamente conexão por cabo/USB para CarPlay/AA.
   - Nunca presuma cabo nem sem fio só porque a fonte diz "compatível".
4. Tela: texto como na fonte (ex.: `8" ou 11" (conforme versão)`, `10,1"`). `sistema`: nome comercial da central se citado (MyLink, VW Play, Uconnect...).
5. Faróis → tabela `iluminacao`, `posicao` = 'Farol principal', `tecnologia` = 'LED' / 'Full LED' / 'Halógeno' / 'Projetor' etc., SOMENTE se a fonte citar. Se variar por versão, descreva em `versoes` apenas o que a fonte diz. Outras posições citadas explicitamente na fonte podem entrar ('Luz diurna (DRL)', 'Farol de neblina', 'Lanterna traseira', 'Farol alto'). `codigo` (H4, H7…) e `oem` só se aparecerem literalmente em fonte oficial (normalmente ficam NULL).
6. Ficha técnica: `versao_referencia` = versão(ões) a que os números se referem. Se houver várias motorizações, descreva todas (ex.: motor `1.0 MPI / 170 TSI / 200 TSI`, potência `84 cv / 116 cv / 128 cv`). Inclua unidade e combustível quando a fonte informa (`141 cv (etanol) / 139 cv (gasolina)`). Câmbio como na fonte (`automático de 6 marchas`). Elétricos: `bateria` (kWh/tipo) e `autonomia` (com o padrão, ex.: `280 km (PBEV/Inmetro)`). Câmbio de elétrico só se a fonte citar.
7. `evidencia`: cole os trechos literais (curtos, até ~800 caracteres no total) que sustentam os valores. `fonte_url`: URL exata da página dos trechos. `consultado_em`: '2026-10-15'. `confianca`: 'confirmado' quando vem do site oficial BR da marca; 'bem_fundamentado' quando vem da sala de imprensa oficial BR.
8. Se a página do modelo não abrir (403/erro) ou não tiver os dados, tente subpáginas oficiais (ação `pagina` com palavras ['ficha','especifica','tecnic','versao','versoes','compare','imprensa']) e a sala de imprensa oficial brasileira. Nunca fontes não oficiais.

## Como gravar (execute_sql, com upsert; ache o veículo pelo slug)

Use dollar quoting (`$t$texto$t$`) para textos. NÃO use DELETE nem DROP (travam esperando confirmação). Só crie uma linha quando tiver pelo menos um valor real com evidência.

```sql
insert into fichas_tecnicas (veiculo_id, versao_referencia, motor, potencia, torque, cambio, tracao, bateria, autonomia, evidencia, fonte_url, consultado_em, confianca)
select id, $t$...$t$, $t$...$t$, ..., '2026-10-15', 'confirmado' from veiculos where slug = 'SLUG'
on conflict (veiculo_id) do update set versao_referencia=excluded.versao_referencia, motor=excluded.motor, potencia=excluded.potencia, torque=excluded.torque, cambio=excluded.cambio, tracao=excluded.tracao, bateria=excluded.bateria, autonomia=excluded.autonomia, evidencia=excluded.evidencia, fonte_url=excluded.fonte_url, consultado_em=excluded.consultado_em, confianca=excluded.confianca, atualizado_em=now();

insert into multimidias (veiculo_id, tela_polegadas, sistema, carplay, android_auto, carplay_cabo, carplay_sem_fio, android_auto_cabo, android_auto_sem_fio, observacoes, evidencia, fonte_url, consultado_em, confianca)
select id, ... from veiculos where slug = 'SLUG'
on conflict (veiculo_id) do update set tela_polegadas=excluded.tela_polegadas, sistema=excluded.sistema, carplay=excluded.carplay, android_auto=excluded.android_auto, carplay_cabo=excluded.carplay_cabo, carplay_sem_fio=excluded.carplay_sem_fio, android_auto_cabo=excluded.android_auto_cabo, android_auto_sem_fio=excluded.android_auto_sem_fio, observacoes=excluded.observacoes, evidencia=excluded.evidencia, fonte_url=excluded.fonte_url, consultado_em=excluded.consultado_em, confianca=excluded.confianca, atualizado_em=now();

insert into iluminacao (veiculo_id, posicao, tecnologia, codigo, potencia, oem, versoes, evidencia, fonte_url, consultado_em, confianca)
select id, 'Farol principal', 'LED', null, null, null, $t$...$t$, $t$...$t$, 'URL', '2026-10-15', 'confirmado' from veiculos where slug = 'SLUG'
on conflict (veiculo_id, posicao) do update set tecnologia=excluded.tecnologia, codigo=excluded.codigo, potencia=excluded.potencia, oem=excluded.oem, versoes=excluded.versoes, evidencia=excluded.evidencia, fonte_url=excluded.fonte_url, consultado_em=excluded.consultado_em, confianca=excluded.confianca, atualizado_em=now();
```
Tabelas `palhetas` (posicao, medida_mm, medida_pol, encaixe, oem) e `interruptores_vidro` (posicao, tipo, oem, pinos, conector) seguem o mesmo padrão — só se a fonte oficial trouxer (raro).

Enums: categoria_veiculo = Hatch | Sedã | SUV | Picape | Utilitário | Esportivo | Minivan | Coupé; tipo_propulsao = Combustão | Flex | Híbrido | Híbrido Plug-in | Elétrico; situacao_veiculo = Lançado | Pré-venda | Atualizado | A confirmar | Descontinuado; nivel_confianca = confirmado | bem_fundamentado | nao_confirmado.

## Fotos (só quando a tarefa pedir)
Foto principal deve ser REAL e da versão vendida no Brasil (nunca de outro modelo da mesma marca, nunca versão estrangeira com visual diferente). Ordem de preferência: imagem de divulgação da própria página oficial BR do modelo (og:image ou `imagens` da ação `pagina`) → foto da sala de imprensa oficial BR → foto do Wikimedia Commons cuja descrição/categoria indique Brasil ou América do Sul e a mesma geração. Para fotos do site oficial: `foto_principal_credito` = 'Divulgação <Marca> Brasil (site oficial)' e `foto_principal_fonte_url` = página do modelo. Para Commons: URL `https://commons.wikimedia.org/wiki/Special:FilePath/<Arquivo_com_underscores>?width=1280`, crédito `<Autor> · <Licença> (via Wikimedia Commons) · <nota da versão>`, fonte `https://commons.wikimedia.org/wiki/File:<Arquivo>`.
Prefira URLs de imagem .jpg/.png/.webp absolutas e estáveis; evite URLs com tokens temporários.

## Resposta final
Responda SOMENTE com uma tabela compacta em markdown: `slug | motor | câmbio | tela | CarPlay (geral/cabo/sem fio) | AA (geral/cabo/sem fio) | farol | fonte | faltou`. Depois, no máximo 5 linhas de observações (páginas bloqueadas, dúvidas). Sem prosa longa.

## Cadastro da linha completa de uma marca (rodada 2 — 2026-10-16)

1. Antes de tudo, veja o que já existe: `select v.slug, v.nome_comercial, v.link_oficial_url from veiculos v join montadoras m on m.id=v.montadora_id where m.slug='<marca>';` — NUNCA duplique um modelo já cadastrado (mesmo modelo com slug diferente = duplicado). Para os existentes, só complete o que falta.
2. Liste os modelos à venda hoje no site oficial brasileiro (menu "Modelos"/"Veículos" da home; use a ação `pagina` com palavras do padrão de URL dos modelos). Ignore páginas de ofertas, acessórios, seminovos, frotistas, consórcio e modelos "em breve" sem página própria.
3. Cadastre cada modelo novo (página do modelo com status 200), com foto de divulgação da página oficial BR do modelo:
```sql
insert into veiculos (slug, montadora_id, nome_comercial, ano_modelo, categoria, propulsao, situacao, confianca, resumo, foto_principal_url, foto_principal_credito, foto_principal_fonte_url, galeria_urls, link_oficial_url, verificado_br_url, verificado_br_em)
select '<marca>-<modelo>', id, '<Nome>', <ano só se a fonte disser, senão null>, '<categoria>', '<propulsao>', 'Lançado', 'confirmado', $t$<resumo factual curto, 1 frase, baseado na fonte>$t$, '<url foto>', 'Divulgação <Marca> Brasil (site oficial)', '<url modelo>', '[]'::jsonb, '<url modelo>', '<url modelo>', '2026-10-16' from montadoras where slug='<marca>'
on conflict (slug) do nothing;
```
4. Grave fichas_tecnicas / multimidias / iluminacao (regras acima; `consultado_em` = '2026-10-16').
5. Correções: UPDATE solto às vezes trava — prefira `insert ... on conflict ... do update`. Para corrigir campos de `veiculos` use `update veiculos set ... where slug='...'` e, se travar (60 s), avise no relatório em vez de insistir.
6. Economia: use `left(content, 12000)` e extraia só o necessário via SQL (ex.: `jsonb_array_elements(content::jsonb)`); raio 100–150; não releia a mesma página.
7. Relatório final: tabela compacta `slug | novo/existente | foto | motor | câmbio | tela | CarPlay/AA | farol | faltou`, mais até 5 linhas de observações.

## IMPORTANTE (rodada 3)
- NUNCA use `UPDATE` (fica esperando confirmação e estoura o tempo). Para corrigir dados técnicos use `insert ... on conflict ... do update`. Para mudar campos de `veiculos` de um modelo existente:
```sql
insert into veiculos (slug, montadora_id, nome_comercial, categoria, propulsao)
select slug, montadora_id, nome_comercial, categoria, propulsao from veiculos where slug='SLUG'
on conflict (slug) do update set link_oficial_url='URL', verificado_br_url='URL', verificado_br_em='2026-10-17', atualizado_em=now();
```
- Data de consulta desta rodada: '2026-10-17'.
- Seja MUITO econômico: no máximo ~25 chamadas de ferramenta no total; leia só os campos necessários do JSON (`jsonb_array_elements`), `left(...)` curto, raio 100.

## RODADA 4 (2026-10-17) — modelos que faltam no catálogo
O monitoramento automático encontrou estes modelos nas páginas oficiais das marcas e eles NÃO estão no catálogo. Cada pesquisador recebe uma lista com a URL oficial exata de cada modelo (descoberta no próprio site da marca — use exatamente essa URL; não monte outras por suposição).

Para cada modelo da sua lista:
1. Confira se já existe (mesma marca, mesmo modelo, ainda que com nome um pouco diferente): `select v.slug, v.nome_comercial from veiculos v join montadoras m on m.id=v.montadora_id where m.slug='<marca>';`. Se existir, só complete o que falta.
2. Leia a página com `pagina` (palavras do modelo + 'ficha','especifica','tecnic','versoes','jpg','png','webp') para pegar título, og:image, PDFs de ficha técnica e fotos; depois `trechos` (na própria página e/ou no PDF de ficha técnica oficial, se houver) para motor, câmbio, tela, CarPlay/Android Auto (com e sem fio) e faróis.
3. Cadastre o veículo (template da rodada 2, `verificado_br_em` = '2026-10-17', `consultado_em` = '2026-10-17'). Slug = '<slug-da-marca>-<modelo>' em minúsculas com hífens (ex.: 'chevrolet-onix-plus', 'jeep-compass', 'fiat-argo').
   - Página da sala de imprensa Stellantis (media.stellantis.com/br-pt/...): `confianca` = 'bem_fundamentado', crédito da foto = 'Divulgação <Marca> / Stellantis Media Brasil', `link_oficial_url` e `verificado_br_url` = a URL da página do modelo na sala de imprensa.
   - Categoria e propulsão só conforme a fonte (Flex se a fonte disser flex/etanol; Elétrico se 100% elétrico; etc.). Em dúvida entre duas, use a que a fonte descreve; nunca invente ano-modelo.
4. Grave fichas_tecnicas, multimidias e iluminacao com evidência literal. O que não achar fica NULL/'nao_identificado' — o site mostra como pendência.
5. Limite: ~8 chamadas de ferramenta por modelo, no máximo ~70 no total. Se uma página der 403/erro, registre no relatório e siga para o próximo.
6. Relatório final: tabela `slug | novo/existente | foto | motor | câmbio | tela | CarPlay/AA (geral/sem fio) | farol | faltou` + até 5 linhas de observações.

## RODADA 5 (2026-10-17) — completar o que falta nos mais vendidos
Os modelos abaixo já estão cadastrados e só não aparecem no site por falta de 1 a 4 itens obrigatórios. Sua tarefa é SOMENTE preencher os itens indicados como faltantes, sem alterar nenhum valor que já exista.

1. Primeiro leia a linha atual: `select * from multimidias where veiculo_id=(select id from veiculos where slug='SLUG');` (idem fichas_tecnicas e iluminacao).
2. Procure o dado faltante em fontes oficiais brasileiras: página do modelo, fichas técnicas/catálogos em PDF da marca, manual do proprietário no site oficial BR, releases da sala de imprensa oficial BR (media.stellantis.com/br-pt para Fiat/Jeep/Citroën/Ram; caoa.com.br para CAOA Chery). Use a ação `pagina` para achar links de PDF/ficha e `trechos` para ler.
3. Ao completar um campo numa linha que JÁ EXISTE:
   - mantenha `fonte_url` e todos os outros valores como estão;
   - acrescente a nova evidência ao fim de `evidencia` no formato ` | [fonte adicional: URL] "trecho literal"`;
   - use `insert ... select ... from <tabela> where veiculo_id=... on conflict (...) do update set <só o campo faltante>=..., evidencia = <tabela>.evidencia || ' | [fonte adicional: URL] "..."', atualizado_em=now()`.
   Exemplo (completar CarPlay/AA):
```sql
insert into multimidias (veiculo_id, fonte_url) select veiculo_id, fonte_url from multimidias where veiculo_id=(select id from veiculos where slug='SLUG')
on conflict (veiculo_id) do update set carplay='confirmado', android_auto='confirmado',
  evidencia = coalesce(multimidias.evidencia,'') || $t$ | [fonte adicional: URL] "trecho"$t$, atualizado_em=now();
```
   Se a linha NÃO existir, crie com a fonte do dado (templates da rodada 2).
4. Farol principal sem linha: crie a linha `iluminacao` com posicao 'Farol principal' e a própria fonte (template normal).
5. Regras de sempre: só valor literal de fonte oficial BR; CarPlay/AA "confirmado" só se a fonte citar CarPlay/Android Auto pelo nome (projeção "sem fio" sem citar CarPlay/AA não basta); sem fio só se disser sem fio/wireless. Não achou → deixe como está e diga no relatório.
6. Limite: ~6 chamadas por modelo, ~50 no total. NUNCA UPDATE/DELETE.
7. Relatório: tabela `slug | item completado | valor | fonte | ainda falta` + até 4 linhas de observações.

## RODADA 6 (2026-10-23) — MULTIMÍDIA E PALHETAS (prioridade máxima do usuário)
O usuário mudou a prioridade: o que importa agora é (1) CarPlay e Android Auto — disponibilidade, por CABO e SEM FIO — e tela da central; (2) PALHETAS do limpador: dianteira (motorista e passageiro) e traseira, com medidas. Mecânica, faróis e fotos NÃO fazem parte desta rodada.

### Fontes aceitas (agora a internet vale, sempre com link e trecho literal)
Ordem de preferência e `confianca` a gravar:
1. Site oficial BR da marca, manual do proprietário, catálogo/ficha oficial em PDF → 'confirmado'.
2. Sala de imprensa oficial; catálogo de aplicação de fabricante de palhetas (Bosch, DYNA, Valeo, Trico, Hella etc.); imprensa automotiva especializada (Quatro Rodas, Autoesporte, Motor1, AutoPapo, Jornal do Carro, Webmotors, iCarros, Mobiauto, Carplace, Notícias Automotivas, UOL Carros) → 'bem_fundamentado'.
3. Lojas/marketplaces de autopeças, fóruns, vídeos → 'nao_confirmado' (use só se não houver nada melhor).
Como achar: carregue também a busca com ToolSearch `select:WebSearch` e pesquise em português, ex.: `"Onix 2027" "Apple CarPlay" "sem fio"` ou `palheta limpador "Onix" 2025 medida dianteira traseira`. Leia a página achada com a ação `trechos` da função (aceita sites .com.br/.br e os domínios das montadoras). Se a página for de domínio não aceito, você pode usar o trecho que o próprio resultado da busca mostra, com `confianca` 'nao_confirmado' e a evidência marcada "(trecho do resultado de busca)" + a URL do resultado.

### Regras que continuam valendo
- Só grave o que a fonte diz LITERALMENTE. Nada de dedução ("tem CarPlay, então deve ter cabo" — NÃO).
- Sem fio = a fonte diz sem fio/wireless/"sem cabo" para CarPlay/Android Auto (não confundir com carregador por indução). Cabo = a fonte diz cabo/USB para CarPlay/Android Auto. Se a fonte diz que só algumas versões têm → 'depende_versao' e explique em `observacoes`.
- Mesma geração e ano-modelo vendidos hoje no Brasil (veja `ano_modelo`/`resumo` do veículo). Fonte de geração anterior não serve; de ano-modelo anterior da mesma geração serve, dizendo o ano na evidência.
- NUNCA UPDATE/DELETE. Use insert ... on conflict.

### Como gravar
Multimídia — linha já existe: complete só os campos que estão 'nao_identificado'/NULL; mantenha `fonte_url`; acrescente ao fim de `evidencia` ` | [fonte adicional: URL] "trecho"`; se a fonte nova for de nível menor que o `confianca` atual, baixe o `confianca` para o nível da fonte nova (honestidade). Linha não existe: crie com a fonte do dado.
```sql
insert into multimidias (veiculo_id, fonte_url) select veiculo_id, fonte_url from multimidias where veiculo_id=(select id from veiculos where slug='SLUG')
on conflict (veiculo_id) do update set carplay_sem_fio='confirmado', android_auto_sem_fio='confirmado',
  evidencia = coalesce(multimidias.evidencia,'') || $t$ | [fonte adicional: URL] "trecho"$t$,
  confianca = 'bem_fundamentado', atualizado_em = now();
```
Palhetas — uma linha por posição: posicao = 'Dianteira (motorista)', 'Dianteira (passageiro)', 'Traseira'. `medida_pol` (número, ex. 26) e/ou `medida_mm` (ex. 650) como a fonte informar (não converta se a fonte não der os dois); `encaixe` e `oem` só se a fonte disser. Se o carro não tem limpador traseiro e a fonte disser isso, não crie a linha traseira e anote no relatório.
```sql
insert into palhetas (veiculo_id, posicao, medida_mm, medida_pol, encaixe, oem, evidencia, fonte_url, consultado_em, confianca)
select id, 'Dianteira (motorista)', null, 26, null, null, $t$"trecho literal" (aplicação: Onix 2020 em diante)$t$, 'URL', '2026-10-23', 'bem_fundamentado' from veiculos where slug='SLUG'
on conflict (veiculo_id, posicao) do update set medida_mm=excluded.medida_mm, medida_pol=excluded.medida_pol, encaixe=excluded.encaixe, oem=excluded.oem, evidencia=excluded.evidencia, fonte_url=excluded.fonte_url, consultado_em=excluded.consultado_em, confianca=excluded.confianca, atualizado_em=now();
```
Atenção nas palhetas: catálogos listam por ano de aplicação ("Onix 2020→"); confira que o intervalo cobre o modelo atual e copie o intervalo na evidência. Nunca use medida de outro modelo da marca.

### Critérios fixados na revisão de 24/10/2026 (valem para todas as rodadas)
- Catálogo/loja do próprio fabricante da palheta (Rodex, Wega/Autoimpact, Bosch, Dyna...): 'bem_fundamentado' **só se o intervalo de anos cobre o `ano_modelo` do veículo** (ex.: "2022 a 2025" serve para o Corolla Cross 2025). Se o intervalo termina antes (ex.: "até 2025" para um modelo 2026/2027, mesmo que seja a mesma geração) → 'nao_confirmado', dizendo o intervalo na evidência.
- Nome do modelo diferente no catálogo (ex.: "Poer P3" para o P30) → 'nao_confirmado', com o aviso na evidência.
- Só um lado com medida: grave só esse lado (o site mostra "passageiro 16"" para não parecer o jogo completo).
- "Não tem sem fio" ('nao_disponivel') exige fonte do ano-modelo atual. Matéria de ano-modelo anterior dizendo "só por cabo" → deixe 'nao_identificado' e anote em `observacoes` (atualizações de software mudam isso).
- Fonte que cita um aplicativo de espelhamento próprio (EasyConnection, CarbitLink, QDLink) não confirma CarPlay/Android Auto nem cabo deles.
- Manual de outro modelo (o nome do arquivo ou a capa cita outro carro) não serve como fonte do modelo pesquisado.
- Ao mudar um valor que antes estava como divergente ou "não identificado", reescreva também a frase antiga de `observacoes` (ela aparece no site; não pode continuar dizendo "não confirmado" ao lado do valor novo).
- Catálogo Wega 2026 (https://www.autoimpact.com.br/wp-content/uploads/2026/08/Catalogo-Palhetas-WEGA-2026-WEB-otimizado.pdf): leia com `trechos` usando palavras "MARCA Modelo" (ex.: "FIAT Argo", "BYD Song"), `raio` 200, `max` 2. Cada linha da tabela segue a ordem: Marca, Veículo, De, Até, códigos Wega, **Motorista, Passageiro**, palheta traseira (código), **polegada traseira**, encaixe traseiro — ex.: "FIAT Argo 2025 → - - - WPSD WFBM PD 24 16 WTSM 10 B" = 24" motorista, 16" passageiro, 10" traseira. "-" = não listado (não deduza que não existe). Em 25/10/2026 ele já cobriu ~90 modelos do catálogo; os que faltam não estão nele.
- Fontes de palheta que funcionaram: catálogo Wega 2026 em PDF (autoimpact.com.br), páginas de produto da Rodex (palhetasrodex.com.br), loja de peças oficial VW (pecas.vw.com.br, só OEM). Manuais oficiais em PDF da GWM e da BYD trazem cabo/sem fio de CarPlay e Android Auto.

## RODADA 7 (2026-10-25) — CABO × SEM FIO (Streambox), MARCAS PREMIUM E OEM DAS PALHETAS
Por que: a importadora vende o **Streambox**, que se conecta pela porta USB via CarPlay/Android Auto **por cabo**, e vai lançar um **Streambox sem fio** para centrais em que o CarPlay **só funciona sem fio** (ex.: BMW). Para cada modelo precisamos dos 4 campos: `carplay_cabo`, `carplay_sem_fio`, `android_auto_cabo`, `android_auto_sem_fio`.
- `nao_disponivel` só com frase explícita da fonte ("não funciona pela porta USB", "apenas por cabo", "só sem fio"). Ausência de menção = `nao_identificado`.
- Fonte por sistema vale para o modelo quando a fonte do modelo cita **o mesmo nome de sistema** (ex.: FAQ do "VW Play" vale para modelos com "VW Play"; tutorial do "MyLink" vale para Chevrolet com MyLink). Cite os dois trechos.
- Fontes que funcionaram: FAQ VW Play (vw.com.br/idhub/.../FAQ_VW_Play.pdf); tutorial MyLink (chevrolet.com.br/tutoriais/mylink); manual NissanConnect do Versa e o acessório oficial "Interface Sem Fio para Multimídia 2.0" (nissan.com.br, lista de modelos no JSON da página); páginas Renault de sistema (openR link, Display Link, Media Nav Evolution — só valem se o modelo cita o mesmo sistema); manuais BYD e GWM em PDF.
- Busca: `WebSearch` com `allowed_domains` = site da marca (ex.: ["chevrolet.com.br"]) acha manuais e FAQs; a busca sem domínio traz lojas de adaptadores.
- Bloqueios conhecidos: manuais em servicos.fiat.com.br e jeep.com.br respondem com página de bloqueio (não é PDF); toyota.com.br e audi.com.br dão 403; www2.mercedes-benz.com.br dá erro de conexão; press.bmwgroup.com e faq.bmwusa.com não são aceitos pela função — use o trecho do resultado de busca com `confianca` 'nao_confirmado' e a marcação "(trecho do resultado de busca)".
- Marcas premium cadastradas em 25/10 (BMW, Mercedes-Benz, Audi, Land Rover — 41 modelos): só X1, iX1, Série 5, Discovery Sport e Discovery têm multimídia; os demais precisam de CarPlay/Android Auto (geral, cabo e sem fio). Fontes BR: imprensa.mercedes-benz.com.br (tabelas e releases), landrover.com.br, bmw.com.br, imprensa especializada (.com.br).
- OEM das palhetas: lojas oficiais de peças das marcas (pecas.vw.com.br funcionou: código do jogo dianteiro por modelo). Grave `oem` na linha da posição (sem apagar a medida) e cite a aplicação da loja.

### Orçamento e relatório
~4 a 6 chamadas por veículo, no máximo ~110 no total. Ordem: primeiro os veículos SEM CarPlay/AA identificado, depois cabo/sem fio, depois palhetas. Pule 'volkswagen-tukan' e 'denza-d9' (não vendidos ainda).
Relatório final: tabela `slug | CarPlay (geral/cabo/sem fio) | AA (geral/cabo/sem fio) | tela | palheta dianteira | palheta traseira | fonte principal | confiança` + até 5 linhas de observações.

## RODADA 8 (2026-10-25) — MARCAS PREMIUM PELOS SITES OFICIAIS E VENDAS POR CLASSE

### Ação nova da função de leitura
`{"acao":"texto","paginas":[{"id","url","inicio?","tamanho?"}]}` devolve um pedaço contínuo do texto (até 200 mil caracteres) de páginas e PDFs nos domínios aceitos. Use para ler fichas, manuais e o informativo da Fenabrave inteiros, e depois procure com regex no SQL (`content::jsonb->0->>'texto'`).

### O que cada site premium entrega (testado em 25/10/2026)
- **BMW** (bmw.com.br): a lista oficial `/pt/all-models.html` tem todos os modelos com preço e ano/modelo; o título de cada página traz a geração ("BMW X1 SUV (U11)"). O texto de CarPlay das páginas carrega por JavaScript; a página do X3 M50 diz "Use a integração com smartphone para conectar seu iPhone ou smartphone Android sem fio ao seu BMW." Os comunicados de press.bmwgroup.com/brazil só chegam pelo resultado de busca (marque "(trecho do resultado de busca)", `nao_confirmado`). Cabo: o FAQ oficial da BMW dos EUA (resultado de busca) diz que o CarPlay não funciona pela porta USB → `carplay_cabo = nao_disponivel`, `nao_confirmado`. Imprensa .com.br que republica os comunicados (autoo, car.blog.br, vrum) dá o trecho literal.
- **Mercedes-Benz**: www2.mercedes-benz.com.br derruba a conexão; use imprensa.mercedes-benz.com.br/releases — as listas de equipamentos trazem "Integração para Smartphones sem fio (Apple CarPlay/Android Auto)" e o tamanho das telas. Comunicado de ano-modelo anterior, mesma geração → `bem_fundamentado`.
- **Land Rover** (landrover.com.br): ficha em `.../<modelo>/models-and-specifications.html` (lista "Apple CarPlay® | Android Auto™ | Pivi Pro | Tela Touchscreen de X”"); anúncios de estoque em veiculos.landrover.com.br/showroom/... (saem do ar quando o carro é vendido). Cabo: o suporte oficial do Pivi (`/ownership/infotainment-systems/pivi-faqs.html`) diz que as duas portas USB do painel são compatíveis com Apple CarPlay e Android Auto → vale para modelo cuja ficha cita "Pivi Pro".
- **Audi**: audi.com.br responde 403 a leitura automática. Use imprensa .com.br (ex.: bemparana.com.br) e cite o trecho. "Audi Smartphone Interface, com conexão sem fio" sem citar CarPlay pelo nome não confirma CarPlay.

### Situação em 25/10/2026
- BMW: cadastrados também Série 1 (M135), Série 4 Cabrio, M2, M3 e M4. Com multimídia: X1, iX1, X3, Série 5, Série 1, Série 4 Cabrio, M4. Faltam CarPlay/AA de X2, iX2, iX3, X5, X6, X7, Série 2 Gran Coupé, Série 3, i4, i7, M2, M3. O site mostra também o novo X5 (G65) e o iX5 (sem preço) — cadastrar quando tiverem preço.
- Mercedes-Benz: falta só o GLE.
- Land Rover: os 6 modelos completos (cabo confirmado pelo suporte do Pivi; sem fio ainda sem fonte por modelo).
- Audi: Q3 completo; A5 só com tela; faltam A3, A6 e-tron, Q5, Q6 e-tron, Q7, Q8, e-tron GT.
- **Mais vendidos que não estão no catálogo** (aparecem como "Ainda não cadastrado" na página inicial): VW Virtus, VW Saveiro, Toyota Hilux e a Volvo inteira (XC60 e EX30 estão no top premium). Cadastre-os (rodada 2) e colete multimídia e palhetas.

### Vendas por segmento (automático)
- `interno.atualizar_segmentos_fenabrave()` roda pelo pg_cron nos dias 1 a 15 (11:47 e 13:47 UTC): pede o texto do informativo mais recente e grava em `emplacamentos_segmentos` (fonte 'fenabrave') e `participacao_segmentos`. Se falhar, rode à mão: `select interno.atualizar_segmentos_fenabrave();` (repita depois de alguns minutos).
- **Ranking premium** (manual, uma vez por mês): a Bright Consulting divulga "carros e marcas premium mais vendidos"; o CarBlog publica a tabela (ex.: https://www.car.blog.br/2026/10/carros-e-marcas-premium-mais-vendidos.html). Grave em `emplacamentos_segmentos` com `fonte = 'bright_consulting'`, `grupo = 'Premium'`, `segmento = 'Premium — modelos'` (modelo) ou `'Premium — marcas'` (modelo = ''), `unidades` do mês, `participacao` = market share, `fonte_url` = página lida, `edicao` = 'Bright Consulting (via CarBlog, dd/mm/aaaa)'. Marca e modelo como na tabela (ex.: 'M.BENZ', 'GLC 300').

---

## ROTINA QUINZENAL (automática, dias 2 e 16 de cada mês)

A rotina roda numa sessão nova, sem memória das anteriores. Passos:

1. **Novos modelos.** O monitoramento (`monitorar-novidades`, dias 1 e 15) grava em `monitor_novidades` os links de modelo novos nos sites das marcas:
   `select n.id, m.slug as marca, n.titulo, n.url from monitor_novidades n left join montadoras m on m.id = n.montadora_id where n.status = 'pendente' and n.tipo = 'link_novo' order by n.detectado_em;`
   Para cada um que seja de fato um modelo novo vendido no Brasil (não versão, campanha ou página institucional), cadastre o veículo (template da rodada 2, foto opcional) e colete multimídia e palhetas (rodada 6). Depois marque a novidade:
   `insert into monitor_novidades (id, tipo, titulo, url) select id, tipo, titulo, url from monitor_novidades where id = '<id>' on conflict (id) do update set status = 'resolvido', resolvido_em = now();`
   (ou `status = 'ignorado'` quando não for modelo). Novidades `link_removido`/`pagina_fora_do_ar` ficam para revisão humana.
0. **Vendas do mês (na execução do dia 2 e, se faltar, na do dia 16).** Confira `select periodo, count(*) from emplacamentos_segmentos group by 1 order by 1 desc limit 2;`. Se o mês mais recente de `emplacamentos` ainda não tem segmentos, rode `select interno.atualizar_segmentos_fenabrave();` (duas vezes, com alguns minutos entre elas). Se o ranking premium do mês (`fonte = 'bright_consulting'`) ainda não existe, procure a publicação da Bright Consulting e grave (RODADA 8).
1b. **Mais vendidos fora do catálogo.** Cadastre os modelos do top 10 de cada categoria da página inicial que ainda não estão no catálogo (lista atual na RODADA 8).
2. **Lacunas de dados (prioridade do usuário: zerar as pendências).** Escolha até 25 veículos, nesta ordem: sem CarPlay/Android Auto identificado (inclui as marcas premium); sem informação de sem fio; sem informação de cabo (Streambox — siga a RODADA 7); sem palhetas ou sem OEM de palheta. Comece pelos mais vendidos. Além dos sites oficiais e da imprensa, procure em fóruns de donos, vídeos do YouTube (título e descrição) e no Google; esses valem só como `nao_confirmado`, com o link e o trecho, marcados "(fórum)", "(vídeo)" ou "(trecho do resultado de busca)". Na execução seguinte, tente trocar uma fonte `nao_confirmado` por uma oficial.
   `select v.slug, m.carplay, m.android_auto, m.carplay_cabo, m.carplay_sem_fio, m.android_auto_cabo, m.android_auto_sem_fio, m.tela_polegadas, (select count(*) from palhetas p where p.veiculo_id = v.id) as palhetas from veiculos v left join multimidias m on m.veiculo_id = v.id where v.situacao <> 'Descontinuado' order by (m.veiculo_id is null or m.carplay = 'nao_identificado' or m.android_auto = 'nao_identificado') desc, (m.carplay_sem_fio = 'nao_identificado' and m.android_auto_sem_fio = 'nao_identificado') desc, (m.carplay_cabo = 'nao_identificado' and m.android_auto_cabo = 'nao_identificado') desc, (select count(*) from palhetas p where p.veiculo_id = v.id) asc limit 25;`
   Pesquise e grave seguindo a RODADA 6 (fonte com link e trecho, confiança conforme o tipo de fonte, nunca deduzir).
3. **Limites.** No máximo ~150 chamadas de ferramenta. Nunca UPDATE/DELETE (use `insert ... on conflict`). Não mexa em código do site.
4. **Fim.** Responda com um resumo curto: modelos novos cadastrados, veículos completados (o que entrou em cada um) e o que ficou sem fonte.
