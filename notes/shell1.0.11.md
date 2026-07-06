# Release shell1.0.11

## Alterações desta versão

- Bump de versão do pacote `ark-format-shell`: `1.0.10` -> `1.0.11`.
- Correções na formatação de seleção (range formatting):
  - Strings multilinha passam a ser rastreadas como no formatador de documento: o conteúdo literal é preservado sem reprocessamento (sem colapso de espaços nem reindentação) e palavras-chave dentro de strings (ex.: `do`, `then`) não alteram mais a indentação das linhas seguintes.
  - Heredocs preservados também no modo sem reindentação (`rangeFormatting.reindent` desligado); antes o corpo do heredoc sofria colapso de espaços ao formatar a seleção.
  - As decisões de indentação passam a usar apenas as partes de código da linha (fora de aspas), alinhando o comportamento da seleção ao do documento completo.
- Correção no cálculo do nível base de contexto (`rangeFormatting.useDocumentContext`): palavras-chave dentro de strings nas linhas anteriores à seleção não inflam mais o nível base de indentação.
- Refatoração interna sem mudança de comportamento:
  - Helpers de edição (`buildFullDocumentEdits`/`buildRangeEdits`) e de espaçamento (`collapseDoubleSpaces`/`normalizeCommentSpacing`) promovidos ao pacote compartilhado `@tooark/ark-format-shared`.
  - Remoção de código sem uso no pacote compartilhado e nos re-exports internos da extensão.
- Novos testes:
  - Regressões da formatação de seleção com strings multilinha e heredocs.
  - Testes da camada de extensão: ativação, providers de documento/intervalo, engine `shfmt` (sucesso, texto idêntico e erro de sintaxe convertido em diagnóstico) e a proteção de segurança que ignora `shfmt.path`/`shfmt.flags` definidos em escopos de workspace.
- Seção de apoio (Support) adicionada aos READMEs (EN/PT-BR).
- Cobertura de testes consolidada do monorepo disponível via `pnpm test:coverage`.

## Informações Adicionais

- Tag relacionada: `shell1.0.11`
- Data de lançamento: **2026-07-05**
