# Release powershell1.2.0

## Notes in en-US

### Changes in this version

- Version bump of the `ark-format-powershell` package: `1.1.0` -> `1.2.0`.
- New `arkFormatPowerShell.alignAssignments` option (default `false`, opt-in):
  - Vertically aligns assignment operators (`=`, `+=`, `-=`, `*=`, `/=`, `%=`, `??=`) in contiguous blocks of variable assignments (`$var = ...`) and hashtable entries (`Chave = valor`), in the spirit of PSScriptAnalyzer's `PSAlignAssignmentStatement` rule.
  - Alignment on the operator's final `=` character, computed per line: the longest name in the block gets exactly one space before its operator.
  - Blocks end at a blank line, a comment or another statement; assignments at different indentation levels are aligned separately; names longer than 40 characters are left out of the alignment.
  - The content of here-strings and comment blocks (`<# ... #>`) is never changed; backtick (`` ` ``) or pipe (`|`) continuations belong to the previous assignment and do not break the block.
  - Compatible with all line endings (`LF`, `CRLF` and `Auto`), preserving the configured line ending.
  - Off by default by design: vertical alignment creates diff noise (adding a longer name reformats the neighboring lines). With the option off, `collapseSpaces` normalizes existing alignment to one space.
- Indentation fix: `else`/`elseif`/`catch`/`finally` clauses on their own line (after a standalone `}`) are no longer dedented twice; they now align at the same level as the previous block, as already happened with the `} catch {` style.
- Indentation fix: the content of multi-line parentheses (`@(...)`, `$(...)`, `(...)` of calls with wrapped arguments and `param (...)` blocks) now gets one indentation level, with the closing `)` aligned to the line that opened it; nesting (array in hashtable, hashtable in array) accumulates levels correctly. Single-line arrays and here-string content are left untouched; parentheses inside strings and comments do not count toward balancing.
- Localization cleanup: removed the unused `ark.incompatible.flag` key from the l10n bundles (EN and pt-BR); it belongs to the shfmt scenario and is only consumed by the Shell formatter.
- Block alignment engine promoted to the shared package (`@tooark/ark-format-shared/align`), with a per-language injected parser; the Makefile formatter was refactored to use the same engine, with no behavior change.
- Applied to document and selection formatting (range formatting).
- Internal refactoring with no behavior change:
  - Edit helpers (`buildFullDocumentEdits`/`buildRangeEdits`) and spacing helpers (`collapseDoubleSpaces`/`normalizeCommentSpacing`) promoted to the shared package `@tooark/ark-format-shared`.
  - Removal of unused code (an inert diagnostics collection and orphaned re-exports) and range provider guards aligned with the pattern of the other extensions.
- New extension-layer tests: activation, document/range providers (`CRLF` default), selection reindentation with context, and here-strings ignored when computing the context.
- Support section added to the READMEs (EN/PT-BR).
- Consolidated monorepo test coverage available via `pnpm test:coverage`.

## Notas em pt-BR

### Alterações desta versão

- Bump de versão do pacote `ark-format-powershell`: `1.1.0` -> `1.2.0`.
- Nova opção `arkFormatPowerShell.alignAssignments` (padrão `false`, opt-in):
  - Alinha verticalmente os operadores de atribuição (`=`, `+=`, `-=`, `*=`, `/=`, `%=`, `??=`) em blocos contíguos de atribuições de variáveis (`$var = ...`) e entradas de hashtable (`Chave = valor`), no espírito da regra `PSAlignAssignmentStatement` do PSScriptAnalyzer.
  - Alinhamento pelo caractere `=` final do operador, calculado por linha: o nome mais longo do bloco fica com exatamente um espaço antes do seu operador.
  - Blocos encerram em linha em branco, comentário ou outra instrução; atribuições em níveis de indentação diferentes alinham separadamente; nomes acima de 40 caracteres ficam fora do alinhamento.
  - Conteúdo de here-strings e blocos de comentário (`<# ... #>`) nunca é alterado; continuações com crase (`` ` ``) ou pipe (`|`) pertencem à atribuição anterior e não quebram o bloco.
  - Compatível com todos os fins de linha (`LF`, `CRLF` e `Auto`), preservando o fim de linha configurado.
  - Padrão desligado por decisão de design: alinhamento vertical gera ruído de diff (adicionar um nome mais longo reformata as linhas vizinhas). Com a opção desligada, o `collapseSpaces` normaliza alinhamentos existentes para um espaço.
- Correção de indentação: cláusulas `else`/`elseif`/`catch`/`finally` em linha própria (após um `}` isolado) não são mais dedentadas duas vezes; passam a alinhar no mesmo nível do bloco anterior, como já acontecia no estilo `} catch {`.
- Correção de indentação: conteúdo de parênteses multilinha (`@(...)`, `$(...)`, `(...)` de chamadas com argumentos quebrados e blocos `param (...)`) passa a receber um nível de indentação, com o `)` de fechamento alinhado à linha que abriu; aninhamentos (array em hashtable, hashtable em array) acumulam níveis corretamente. Arrays em linha única e conteúdo de here-strings permanecem intocados; parênteses dentro de strings e comentários não contam para o balanceamento.
- Limpeza de localização: remoção da chave não utilizada `ark.incompatible.flag` dos bundles l10n (EN e pt-BR); ela pertence ao cenário do shfmt e só é consumida pelo formatador de Shell.
- Motor de alinhamento em blocos promovido ao pacote compartilhado (`@tooark/ark-format-shared/align`), com parser injetado por linguagem; o formatador de Makefile foi refatorado para consumir o mesmo motor, sem mudança de comportamento.
- Aplicado na formatação de documento e de seleção (range formatting).
- Refatoração interna sem mudança de comportamento:
  - Helpers de edição (`buildFullDocumentEdits`/`buildRangeEdits`) e de espaçamento (`collapseDoubleSpaces`/`normalizeCommentSpacing`) promovidos ao pacote compartilhado `@tooark/ark-format-shared`.
  - Remoção de código sem uso (coleção de diagnósticos inerte e re-exports órfãos) e guards do provider de intervalo alinhados ao padrão das demais extensões.
- Novos testes da camada de extensão: ativação, providers de documento/intervalo (padrão `CRLF`), reindentação de seleção com contexto e here-strings ignoradas no cálculo do contexto.
- Seção de apoio (Support) adicionada aos READMEs (EN/PT-BR).
- Cobertura de testes consolidada do monorepo disponível via `pnpm test:coverage`.

## Additional Information / Informações Adicionais

- Tag: `powershell1.2.0`
- Release date / Data de lançamento: **2026-07-05**
