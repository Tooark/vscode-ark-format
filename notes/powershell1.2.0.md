# Release powershell1.2.0

## Alterações desta versão

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

## Informações Adicionais

- Tag relacionada: `powershell1.2.0`
- Data de lançamento: **2026-07-05**
