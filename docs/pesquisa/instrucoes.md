# Instruções de pesquisa do catálogo

Este arquivo é a referência para qualquer rodada de coleta de dados (manual ou
pela rotina automática quinzenal). Ele acumula as regras das rodadas 1 a 9:
**as seções "RODADA 6" a "RODADA 9" são as que valem hoje** e
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
4b. **Versões (obrigatório desde 28/10/2026).** Todo modelo cadastrado precisa da sua linha de versões, da de entrada à topo — siga a RODADA 11.
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
- **Mais vendidos que não estão no catálogo**: em 25/10 todos os do top 10 de cada bloco da página inicial já estão cadastrados (Hilux, SW4, Corolla, Tiggo 7, Jetta, City Hatchback, XC40/EX40, XC90 entraram nesta rodada). Se a página mostrar "Ainda não cadastrado", primeiro veja se o modelo existe com outro nome e, se existir, peça para incluir o nome da Fenabrave em `APELIDOS` (`lib/dados/emplacamentos.ts`; a rotina não mexe em código, então só registre no resumo final).

### Marcas e modelos cadastrados em 25/10/2026
- Marcas novas (logo do Wikimedia Commons, domínio público/CC0): Porsche, Lexus, MINI, Kia, Jetour, MG Motor.
- Linhas completadas: Honda (HR-V, WR-V, City Hatchback, Civic híbrido, CR-V, ZR-V, Accord, Civic Type R, Prelude), Toyota (Yaris hatch, Corolla, Hilux, SW4, RAV4, GR Yaris), Porsche (7), Lexus (5), MINI (6), Kia (9), MG (3), Changan (5), Chery Tiggo 7, VW (Taos, Polo Track, Jetta, Amarok, ID. Buzz, Virtus, Saveiro), Fiat (Fiorino, Scudo, Ducato), Citroën (Jumpy, Jumper), Jeep Grand Cherokee, Ford (Mustang, Mach-E, Transit), Nissan Frontier, Mitsubishi Outlander, Volvo (EX40, XC90, EX90, XC60, EX30).
- Mercedes-Benz: a tabela de preços oficial (PDF de agosto/2025 em imprensa.mercedes-benz.com.br) também lista Classe A (AMG A 45 S), EQS (AMG EQS 53), Classe S (AMG S 63), SL, AMG GT 4 portas, AMG GT Coupé e Classe G — cadastrados, ainda sem CarPlay/AA. Procure uma tabela de preços mais nova na sala de imprensa e confira se algum saiu de linha.
- **Não cadastrar ainda**: VW Tukan (página no site da VW, mas lançamento só em 2027).

### Fotos — o que aprendemos
- **VW**: a foto principal oficial está nos dados estruturados da página do modelo. Use a ação `trechos` com a palavra `assets.volkswagen.com` e pegue o `contentUrl` do `ImageObject` cuja `caption` diz "imagem principal". Atenção: a página do Taos traz uma imagem de 2020 (`taos2020_gal01`) — não usar.
- **Renault**: a imagem `r_brandSite_carPicker_1.png?uri=...` da página do modelo é o desenho oficial do carro.
- **Commons**: confira a geração E a reestilização brasileira antes de usar. Ex.: o HR-V vendido aqui desde 2025 tem grade diferente do europeu (foto removida); o RAV4 vendido aqui é a nova geração lançada em abril/2026 (não usar fotos do RAV4 anterior, XA50). Fotos com título numerado sem indicação de ângulo ("(7).jpg") podem ser de interior — prefira as que dizem "front", "– f" ou têm número de câmera (1X7A..., DSC ...).
- Ainda sem foto: Audi Q3, Q7, Q8; Changan (5); Chery Tiggo 7; Citroën Jumpy/Jumper; Fiat Ducato/Fiorino/Scudo; Ford Transit; Honda Accord, City, City Hatchback, CR-V, HR-V, WR-V; Jeep Wrangler; Range Rover Velar; Mercedes AMG GT 4 portas, Classe A, EQB, GLB, GLS; Nissan Frontier; Porsche Cayenne, Panamera; Ram 2500/3500; Toyota SW4, Yaris Cross, Yaris hatch; VW Taos; Volvo EX30, XC60.

### CarPlay/Android Auto — fontes novas
- **Toyota**: a sala de imprensa oficial é toyotacomunica.com.br, mas ela responde 403 à leitura automática. Use o trecho do resultado de busca (`allowed_domains: ["toyotacomunica.com.br"]`), marcado "(trecho do resultado de busca)", junto com imprensa .com.br legível (Canaltech, Vrum, AutoPapo). Hilux: sem fio só citado para as cabines duplas (`depende_versao`). SW4: fontes divergem (cabo × sem fio) — ainda em aberto.
- **Porsche**: porsche.com não é domínio aceito. A Revista Carro (revistacarro.com.br) tem o anúncio do PCM 6.0 (Android Auto sem fio para 911, Taycan, Panamera e Cayenne) e do 911 2025 no Brasil (CarPlay). Gravado como `nao_confirmado`; troque por fonte brasileira do modelo quando achar. Faltam 718 Boxster/Cayman e Macan (o Macan elétrico usa outro sistema).
- **Lexus**: o site lexus.com.br carrega os textos por JavaScript (a leitura não vê CarPlay). UX gravado pela imprensa (linha 2023). ES: as matérias de 2025 são da geração anterior e o ES novo voltou ao Brasil — não usar até achar fonte do ES atual. Faltam NX, RX, RZ, ES.
- **Honda City Hatchback**: sem fio citado para a central de 10" (Touring e RS); versões de 8" com fontes divergentes (`depende_versao`).
- Continuam sem CarPlay/AA identificado (prioridade da próxima rotina, pelos mais vendidos): BMW Série 3 (4º premium), X2, Série 2 Gran Coupé, i4, i7, iX2, iX3, X5, X6, X7, M2, M3; Audi (8); Volvo EX30, EX40, XC90, EX90; Toyota SW4, RAV4, Yaris hatch, GR Yaris; Honda HR-V, WR-V, Civic, CR-V, ZR-V, Accord, Type R, Prelude; VW Taos, Jetta, Polo Track, Amarok, ID. Buzz; Mercedes GLE e os 7 AMG; Kia Carnival, EV9, Bongo; Lexus (4); MINI (4); MG (3); Changan (5); Fiat/Citroën/Peugeot furgões; Ford Mustang, Mach-E, Transit; Nissan Frontier; Mitsubishi Outlander; Jeep Grand Cherokee; Jetour T2; Porsche 718 e Macan; Denza Z; GAC Aion ES; Leapmotor C10.

### Vendas por segmento (automático)
- `interno.atualizar_segmentos_fenabrave()` roda pelo pg_cron nos dias 1 a 15 (11:47 e 13:47 UTC): pede o texto do informativo mais recente e grava em `emplacamentos_segmentos` (fonte 'fenabrave') e `participacao_segmentos`. Se falhar, rode à mão: `select interno.atualizar_segmentos_fenabrave();` (repita depois de alguns minutos).
- **Ranking premium** (manual, uma vez por mês): a Bright Consulting divulga "carros e marcas premium mais vendidos"; o CarBlog publica a tabela (ex.: https://www.car.blog.br/2026/10/carros-e-marcas-premium-mais-vendidos.html). Grave em `emplacamentos_segmentos` com `fonte = 'bright_consulting'`, `grupo = 'Premium'`, `segmento = 'Premium — modelos'` (modelo) ou `'Premium — marcas'` (modelo = ''), `unidades` do mês, `participacao` = market share, `fonte_url` = página lida, `edicao` = 'Bright Consulting (via CarBlog, dd/mm/aaaa)'. Marca e modelo como na tabela (ex.: 'M.BENZ', 'GLC 300').

## RODADA 9 (2026-10-25) — TODOS OS 269 COM CARPLAY/AA IDENTIFICADO E FOTO CONFERIDA

### Situação em 25/10/2026
- 269 de 269 veículos com CarPlay e Android Auto identificados (79 `confirmado`, 151 `bem_fundamentado`, 39 `nao_confirmado`) e 269 de 269 com foto conferida. As listas de "faltam" da RODADA 8 estão superadas.
- Sem CarPlay/Android Auto de fábrica (`nao_disponivel`): Fiat Scudo e Fiorino, Peugeot Partner Rapid e Expert, Citroën Jumpy, Kia Bongo, Leapmotor C10 (donos instalam adaptador Carlinkit) e GAC Aion ES (só Android Auto). Porsche 718 Boxster/Cayman: sem Android Auto; CarPlay só por cabo e opcional.
- `depende_versao`: VW Polo Track (central opcional), Fiat Ducato (pacote) e Citroën Jumper (Minibus).
- Fontes que divergem (anotado em `observacoes`; confirmar em concessionária antes de trocar): Amarok (cabo × sem fio), Leapmotor C10, Avatr 11 (Webmotors × HarmonyOS), Audi Q8 (o sem fio falhou no teste do Vrum).
- Próxima prioridade: trocar os 39 `nao_confirmado` por fonte oficial brasileira e seguir com palhetas/OEM (RODADA 7).

### Fontes novas para CarPlay/Android Auto
- **Fichas da Webmotors**: o JSON-LD da página da versão tem `"name":"Tecnologia","value":"..."`. Use `trechos` com essa palavra e `max` 8 para pegar todas as versões → `bem_fundamentado`.
- **ask.porsche.com** (respostas oficiais da Porsche) → `bem_fundamentado`.
- **Stellantis Media**: documentos de modelo e comunicados específicos (furgões, Ram) → `bem_fundamentado`; **ofertas.vw.com.br** e **ford.com.br** → `confirmado`.
- **YouTube** (ação `youtube`, título e descrição): só `nao_confirmado`, como prova de uso (ex.: donos instalando Carlinkit no Leapmotor C10).
- Ausência deduzida (nenhuma fonte cita CarPlay) nunca vira `nao_disponivel` com confiança alta: grave `nao_confirmado` e explique em `observacoes`.

### Conferência das fotos (ação `imagens`)
`{"acao":"imagens","imagens":[{"id":"<slug>","url":"..."}]}` devolve status HTTP, tipo, tamanho e largura × altura lidas do próprio arquivo. Rode em lotes de 45 e leia `net._http_response` de cada id:
```sql
select n, interno.pesquisar_midia(jsonb_build_object('acao','imagens','imagens',
  (select jsonb_agg(jsonb_build_object('id',slug,'url',foto_principal_url))
   from (select slug, foto_principal_url from veiculos where situacao <> 'Descontinuado'
         order by slug limit 45 offset n*45) s))) from generate_series(0,5) n;
```
Troque a foto quando: status ≠ 200; largura abaixo de 400 px; proporção acima de 2,6:1 ou em retrato (o site recorta em 16:9); ou poucos bytes para o tamanho (800×300 com 522 bytes é imagem vazia). Tipo `application/octet-stream` (Kia, GAC, Caoa) não é problema: o navegador reconhece o arquivo.
- Já apareceram e foram trocados em 25/10: faixas de texto de 40 px de altura no lugar da foto (Haval H6 `…-flex.webp`), seletor de cor vazio (ORA 03 `…-cor.webp`), miniaturas de 200×200 (Lexus `og.jpg`), a imagem de "sem foto" da Stellantis Media (`2beb5427….png`, 510×270) e banners de celular 1080×1920 (GAC `…-m.jpg`; o do Aion Y era um desenho de dimensões).
- Onde achar foto boa: **GWM** — galeria `dianteira-…` da página do modelo; **GAC** — menu de modelos nos dados da página inicial (`operation/ncar/page/…-0.webp` logo depois do nome e do código do modelo); **Nissan** — imagem principal `…hero-d.webp.ximg.l_12_m.smart.webp`; **Renault** — `ONE_DACIA_PP_XLARGE_DENSITY2` no lugar de `LARGE_DENSITY1`.
- A imagem não pode ser vista daqui: a escolha se apoia no nome do arquivo, nas dimensões e na descrição/categorias do Commons. Para foto do Commons de modelo chinês, confirme pela ficha que é a mesma versão (ex.: Aion Y brasileiro = Aion Y Plus, bateria de 63,2 kWh). Na dúvida sobre a geração, prefira a foto oficial brasileira.

### Palhetas pelo catálogo Wega guardado no banco (27/10/2026)
- O texto inteiro do catálogo Wega 2026 está em `interno.textos_fonte` (id `wega-2026`) e a view `interno.wega_linhas` separa cada linha da tabela em colunas (`marca, modelo, de, ate, wfb, wpu, wph, wps, wfbm, adaptador, motorista, passageiro, tras_cod, tras_pol, tras_enc, linha`). Consulte por SQL em vez de reler o PDF: `select * from interno.wega_linhas where marca='TOYOTA' and (ate='→' or ate>='2024');`
- Grave a coluna `linha` como trecho literal na evidência. Encaixe: `Wega: adaptador PX` (coluna `adaptador`), `Wega: palheta específica WPSX` (só `wps`) ou `Gancho (Wega WFB/WPU/WPH)`; traseira `Wega: palheta WTRM/WTSM, encaixe X`.
- Intervalo aberto (`→`) que começou na geração anterior do modelo vendido hoje → `nao_confirmado`, dizendo a geração na evidência. Geração claramente diferente (Macan elétrico, Lexus ES novo, BMW iX3 Neue Klasse, MINI novo) → não usar.
- Situação em 27/10: 183 de 269 com palheta. Sem palheta no Wega: marcas chinesas (BYD Atto 2/Atto 8/Dolphin SE/Sealion 7, Changan, GAC, Geely, Denza, Leapmotor, Jetour, Zeekr 7X, GWM H7/Ora 5, Omoda 5/7, Jaecoo 5), premium (BMW, Mercedes, MINI, Porsche Cayenne/Macan, Range Rover/Sport, Lexus ES/RZ, Audi A6/Q6 e-tron, Volvo EX90/XC60) e Captiva EV, Sonic, Mustang, Prelude, i20, Avenger, EV5, EV9, Tasman, MG, Kait, Dakota, Koleos, Niagara, GR Yaris, Yaris Cross, Golf GTI, ID. Buzz, Polo Track. OEM só em 15 veículos.

## RODADA 10 (2026-10-27) — CÓDIGOS OEM E INTERRUPTORES DE VIDRO

### Onde há código OEM de modelo atual (testado em 27/10/2026)
- **VW — pecas.vw.com.br (loja oficial)**: cada página de produto traz o código, "Lado de Montagem", "Posição de Montagem" e a lista "Aplicações" (modelo + anos). Ache as páginas com `WebSearch` (`allowed_domains: ["pecas.vw.com.br"]`), leia com a ação `texto`, guarde em `interno.textos_fonte` (id `vwpecas:<n>`) e consulte a view `interno.vwpecas_aplicacoes`. A loja comete erros de aplicação (lista palheta traseira para o Virtus sedã) — não grave o que for fisicamente impossível. Botões de vidro: a loja não diz a porta; grave `posicao = 'Botão de vidro (porta não informada)'`.
- **Chevrolet — acciolygm.com.br (concessionária, peças "ORIGINAL GM")**: título "Produto - Modelo ano a ano | REFERÊNCIA: código | MARCA: ORIGINAL GM"; view `interno.accioly_produtos` (ids `accioly:<caminho>`). Os anos da loja vão até 2026 e os Chevrolet do catálogo são 2027 → `nao_confirmado`. Código com prefixo "JG" é o par; a peça é o número sem o prefixo.
- **Fiat/Jeep — fiatpecas.com.br e sogenuinasfiat.com.br (peças Mopar/originais)**: palhetas com "Código de Referência" e "Aplicação". Não há interruptor de vidro de modelo atual nessas lojas.
- **Kostal Brasil (kostalbrasil.com.br)** e **DNI (dni.com.br)**: catálogos de reposição com número original, mas os interruptores de vidro cobrem só gerações antigas (Gol/Voyage/Saveiro até 2021, Palio, Celta, Fit/City antigos). Textos guardados (`kostal:*`, view `interno.kostal_aplicacoes`; `dni-sitemaps`).
- **Dyna 2025** (dyna.com.br, PDF) guardado em `interno.textos_fonte` (`dyna-2025`): usa códigos próprios (S4xx, SDx, DXxx) e traz a tabela código → mm/polegadas. Útil para modelos fora do Wega.
- **Tiger e catálogos Fraga** (catalogofraga.com.br): a página monta tudo no navegador; não dá para ler. Dial: só aparece em marketplaces, sem catálogo próprio.
- Nova ação da função de leitura: `{"acao":"html","paginas":[{"id","url","inicio?","tamanho?"}]}` devolve o HTML bruto (para entender páginas montadas por JavaScript).

### Situação em 27/10/2026
- Palhetas: 182 de 269 com medida dianteira, 104 com traseira, 168 com encaixe e 25 com código OEM.
- Interruptores de vidro: 12 veículos (VW Polo, Virtus, Nivus, Polo Track, T-Cross, Taos, Tera; Chevrolet Onix, Onix Plus, Tracker, S10, Spin). Próximos: Hyundai, Toyota, Fiat/Jeep, Renault, Honda, Nissan — procurar lojas de concessionária com "código original" na página.

---

## RODADA 11 (2026-10-28) — VERSÕES DE CADA MODELO (obrigatório em todo modelo, atual e novo)

Pedido do usuário: para cada modelo, informar **quantas versões tem, quais são, a nomenclatura usada para diferenciá-las, o que muda de uma para outra e o que cada uma tem de melhor em itens/acessórios**, da mais simples à topo. Vale para todos os cadastrados e para **todo modelo novo que entrar**.

### Onde fica no banco
- `linhas_versoes` (uma linha por veículo): `nomenclatura` (como a marca nomeia as versões, em 1 frase), `observacoes` (preços por versão, conflitos da fonte, o que saiu de linha), fonte e confiança.
- `versoes` (uma linha por versão, `ordem` = posição da entrada à topo): nome, posicionamento, motor, câmbio, diferencial (1 frase: o que essa versão tem de diferente/melhor), `itens_adicionais` (lista), `base_comparacao` (nome da versão de que ela parte: os itens listados são o que ela **acrescenta** sobre essa), multimídia, iluminação.
- Ficha do veículo: card "Versões (N)". Checklist "O que ainda falta": item "Versões (da entrada à topo)". Exportação CSV/Excel: colunas de versões.

### Fonte principal: catálogo 0 km da Webmotors (testado em 28–30/10/2026)
- Endereço: `https://www.webmotors.com.br/<marca>/<modelo>/<ano>`. Os slugs exatos saem da página da marca (`https://www.webmotors.com.br/<marca>`, ação `html`, procure `webmotors.com.br/<marca>/<modelo>/202x`). Exemplos: `caoa-chery`, `caoa-changan`, `mercedes-benz/glc-300`, `bmw/320i`, `lexus/nx-350h`, `toyota/hilux-sw4`, `honda/crv`, `citroen/c3-aircross`.
- Página inexistente responde 200: só aceite o texto se contiver "Conheça e compare todas as versões".
- Baixe em lote (ação `texto`, `tamanho` 200000, até 6 páginas por chamada), guarde em `interno.textos_fonte` (id `wm:<marca>/<modelo>/<ano>`) e leia com `select interno.wm('<marca>/<modelo>/<ano>', 6000);` — devolve "Sobre o modelo", motor, "Itens da versão X, mais:" e a lista de preços por versão.
- Tente o ano mais novo (2027, depois 2026, depois 2025) e diga em `observacoes` de que ano é a página.
- Quando o texto não lista itens (só preços), busque reportagem de lançamento (Autoo, Vrum, Mecânica Online, Autodata etc.) com a ação `trechos` e cite-a na chave `fonte` da versão; se nada houver, grave a versão com `itens` vazio e diferencial "itens a confirmar". Nunca deduza itens.

### Como gravar (sempre a linha inteira de uma vez)
```sql
select interno.gravar_versoes('<slug>',
 '<nomenclatura: ex. Comfort (entrada), Luxury e X-Power (topo)>',
 '<observações: preços por versão, conflitos da fonte, o que saiu de linha>',
 '<url da fonte principal>', 'bem_fundamentado', '<trecho literal da fonte>',
 jsonb_build_array(
  jsonb_build_object('nome','<Versão de entrada>','posicionamento','Entrada','motor','...','cambio','...',
    'diferencial','<o que ela já traz>','itens',jsonb_build_array('...'),'multimidia','...','iluminacao','...'),
  jsonb_build_object('nome','<Próxima>','posicionamento','Intermediária','sobre','<Versão de entrada>',
    'diferencial','<o que acrescenta>','itens',jsonb_build_array('<só o que ela acrescenta>'),'fonte','<url se for outra página>')
 ));
```
- Ordem do array = ordem de entrada à topo (pelo preço). Variantes paralelas (carroceria, edição especial, motor diferente) também usam `sobre` apontando para a versão de que derivam.
- Conflitos da fonte (texto × lista de preços, potência divergente) vão para `observacoes`, sem escolher um lado. Item duvidoso fica de fora.
- Quando o cadastro é de uma variante (ex.: "Tiggo 8 Pro Plug-in Hybrid"), grave a linha completa do modelo e diga na `nomenclatura` qual versão é a do cadastro.

### Situação em 30/10/2026
- 269 de 269 veículos com versões gravadas (655 versões; 244 linhas pela Webmotors, 25 por site oficial, tabela oficial ou imprensa).
- 76 versões estão sem lista de itens (a fonte só dá nome e preço). Em 17 modelos, nenhuma versão tem itens: audi-a6-e-tron, bmw-ix1, bmw-x3, bmw-x5, byd-shark, fiat-ducato, ford-f-150, ford-mustang-mach-e, gwm-haval-h7, honda-accord, honda-prelude, kia-sorento, land-rover-range-rover-sport, mercedes-benz-eqs, porsche-718-boxster, porsche-718-cayman e toyota-rav4. Prioridade do passo 2c.
- Linhas `nao_confirmado` (pré-lançamento ou oferta BR incerta): renault-niagara, denza-z e renault-megane-e-tech. Regravar quando houver preço oficial no Brasil.

## ROTINA QUINZENAL (automática, dias 2 e 16 de cada mês)

A rotina roda numa sessão nova, sem memória das anteriores. Passos:

1. **Novos modelos.** O monitoramento (`monitorar-novidades`, dias 1 e 15) grava em `monitor_novidades` os links de modelo novos nos sites das marcas:
   `select n.id, m.slug as marca, n.titulo, n.url from monitor_novidades n left join montadoras m on m.id = n.montadora_id where n.status = 'pendente' and n.tipo = 'link_novo' order by n.detectado_em;`
   Para cada um que seja de fato um modelo novo vendido no Brasil (não versão, campanha ou página institucional), cadastre o veículo (template da rodada 2, foto opcional), colete multimídia e palhetas (rodada 6) e **grave as versões, da de entrada à topo (RODADA 11 — obrigatório)**. Depois marque a novidade:
   `insert into monitor_novidades (id, tipo, titulo, url) select id, tipo, titulo, url from monitor_novidades where id = '<id>' on conflict (id) do update set status = 'resolvido', resolvido_em = now();`
   (ou `status = 'ignorado'` quando não for modelo). Novidades `link_removido`/`pagina_fora_do_ar` ficam para revisão humana.
0. **Vendas do mês (na execução do dia 2 e, se faltar, na do dia 16).** Confira `select periodo, count(*) from emplacamentos_segmentos group by 1 order by 1 desc limit 2;`. Se o mês mais recente de `emplacamentos` ainda não tem segmentos, rode `select interno.atualizar_segmentos_fenabrave();` (duas vezes, com alguns minutos entre elas). Se o ranking premium do mês (`fonte = 'bright_consulting'`) ainda não existe, procure a publicação da Bright Consulting e grave (RODADA 8).
1b. **Mais vendidos fora do catálogo.** Cadastre os modelos do top 10 de cada categoria da página inicial que ainda não estão no catálogo (lista atual na RODADA 8).
2. **Lacunas de dados (prioridade do usuário: zerar as pendências).** Escolha até 25 veículos, nesta ordem: sem CarPlay/Android Auto identificado (inclui as marcas premium); sem informação de sem fio; sem informação de cabo (Streambox — siga a RODADA 7); sem palhetas ou sem OEM de palheta. Comece pelos mais vendidos. Além dos sites oficiais e da imprensa, procure em fóruns de donos, vídeos do YouTube (título e descrição) e no Google; esses valem só como `nao_confirmado`, com o link e o trecho, marcados "(fórum)", "(vídeo)" ou "(trecho do resultado de busca)". Na execução seguinte, tente trocar uma fonte `nao_confirmado` por uma oficial.
   `select v.slug, m.carplay, m.android_auto, m.carplay_cabo, m.carplay_sem_fio, m.android_auto_cabo, m.android_auto_sem_fio, m.tela_polegadas, (select count(*) from palhetas p where p.veiculo_id = v.id) as palhetas from veiculos v left join multimidias m on m.veiculo_id = v.id where v.situacao <> 'Descontinuado' order by (m.veiculo_id is null or m.carplay = 'nao_identificado' or m.android_auto = 'nao_identificado') desc, (m.carplay_sem_fio = 'nao_identificado' and m.android_auto_sem_fio = 'nao_identificado') desc, (m.carplay_cabo = 'nao_identificado' and m.android_auto_cabo = 'nao_identificado') desc, (select count(*) from palhetas p where p.veiculo_id = v.id) asc limit 25;`
   Pesquise e grave seguindo a RODADA 6 (fonte com link e trecho, confiança conforme o tipo de fonte, nunca deduzir).
2b. **Fotos (na execução do dia 2).** Rode a conferência da RODADA 9 em todos os veículos e troque as fotos que falharem, além de dar foto aos modelos novos.
2c. **Versões (em toda execução).** Todo veículo precisa da linha de versões (RODADA 11). Confira quem está sem e quem tem versão sem itens:
   `select v.slug from veiculos v where not exists (select 1 from versoes x where x.veiculo_id = v.id);`
   `select v.slug, x.nome from versoes x join veiculos v on v.id = x.veiculo_id where cardinality(x.itens_adicionais) = 0 order by 1;`
   Grave as que faltam e, quando o ano-modelo virar (nova página 2027/2028 na Webmotors), regrave a linha inteira com a página nova (versões que saíram de linha somem do cadastro só por regravação completa; registre em `observacoes` o que mudou).
3. **Limites.** No máximo ~150 chamadas de ferramenta. Nunca UPDATE/DELETE (use `insert ... on conflict`). Não mexa em código do site.
4. **Fim.** Responda com um resumo curto: modelos novos cadastrados, veículos completados (o que entrou em cada um) e o que ficou sem fonte.
