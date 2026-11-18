# Release shell1.0.11

## Notes in en-US

### Changes in this version

- Version bump of the `ark-format-shell` package: `1.0.10` -> `1.0.11`.
- Fixes in selection formatting (range formatting):
  - Multi-line strings are now tracked as in the document formatter: literal content is preserved without reprocessing (no space collapsing or reindentation), and keywords inside strings (e.g. `do`, `then`) no longer change the indentation of the following lines.
  - Heredocs are also preserved in no-reindent mode (`rangeFormatting.reindent` off); previously the heredoc body had its spaces collapsed when formatting the selection.
  - Indentation decisions now use only the code parts of the line (outside quotes), aligning selection behavior with full document formatting.
- Fix in the base context level calculation (`rangeFormatting.useDocumentContext`): keywords inside strings in the lines before the selection no longer inflate the base indentation level.
- Internal refactoring with no behavior change:
  - Edit helpers (`buildFullDocumentEdits`/`buildRangeEdits`) and spacing helpers (`collapseDoubleSpaces`/`normalizeCommentSpacing`) promoted to the shared package `@tooark/ark-format-shared`.
  - Unused code removed from the shared package and from the extension's internal re-exports.
- New tests:
  - Selection formatting regressions with multi-line strings and heredocs.
  - Extension-layer tests: activation, document/range providers, `shfmt` engine (success, identical text and a syntax error converted into a diagnostic) and the security protection that ignores `shfmt.path`/`shfmt.flags` set in workspace scopes.
- Support section added to the READMEs (EN/PT-BR).
- Consolidated monorepo test coverage available via `pnpm test:coverage`.

## Notas em pt-BR

### Alterações desta versão

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

## Additional Information / Informações Adicionais

- Tag: `shell1.0.11`
- Release date / Data de lançamento: **2026-07-05**
