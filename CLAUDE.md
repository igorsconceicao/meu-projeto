# meu-projeto

Instrucoes para o Claude Code neste repositorio.

## Comunicacao

- Responda sempre em **portugues do Brasil**.
- Seja direto: o que foi feito, o que falta, o que quebrou.

## Estado atual

O projeto ainda nao tem stack definida (apenas README e a configuracao do
Claude Code). Quando a stack for escolhida, **atualize este arquivo** com:

- linguagem, framework e gerenciador de pacotes;
- comando de instalacao;
- comando de teste;
- comando de lint / formatacao;
- comando de build;
- estrutura de pastas.

Enquanto isso, ao criar a base do projeto, escolha ferramentas com
lockfile e adicione teste e linter desde o inicio, para que o hook de
startup e os comandos abaixo passem a funcionar sozinhos.

## Fluxo de trabalho no git

- Trabalhe sempre em branch propria (`claude/<descricao-curta>`), nunca em `main`.
- Commits pequenos, mensagem no imperativo e em portugues: `adiciona validacao de CPF`.
- Faca `git push -u origin <branch>` ao concluir uma tarefa.
- **Nao abra pull request sem o usuario pedir.**
- Nao reescreva historico de branch que ja foi enviada (sem `--force`, sem `rebase`).

## Regras do codigo

- Nunca comite segredos: chaves de API, senhas, tokens, `.env`. Use variaveis
  de ambiente do ambiente de execucao.
- Siga o estilo do codigo existente (nomes, formatacao, densidade de comentarios)
  em vez de impor um estilo novo.
- Antes de enviar, rode os testes e o linter do projeto e relate o resultado
  real, inclusive quando falhar.

## Ambiente na nuvem

As sessoes do Claude Code na web rodam em container efemero: o repositorio e
clonado do zero e o container e descartado depois. **Nada sobrevive sem commit
e push.** Dependencias sao instaladas automaticamente por
`.claude/hooks/session-start.sh`, que detecta a stack pelos manifestos
(package.json, pyproject.toml, go.mod, Cargo.toml, Gemfile, composer.json).
