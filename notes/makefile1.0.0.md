# Release makefile1.0.0

## Notes in en-US

### Changes in this version

- Initial version of the `ark-format-makefile` package (`1.0.0`), following the structure of the Shell and PowerShell extensions and reusing the `@tooark/ark-format-shared` package (config, editorConfig, document and types).
- Full document and selection formatting (range formatting), with the base conditional depth calculated from the document context.
- Safety invariants:
  - Recipe lines (prefixed with TAB) never have their body changed.
  - `define ... endef` blocks preserved unchanged.
  - Line continuations (`\`) preserved.
  - The whole document is preserved when `.RECIPEPREFIX` is redefined.
- Spacing rules: assignment operators (`=`, `:=`, `::=`, `?=`, `+=`, `!=`), target separator (`:`/`::`), conditional keywords (`ifeq (`) and comment marker (`#`/`##`).
- Alignment of assignment line continuations (`\`) with the start of the value on the first line.
- Optional vertical alignment of assignment operators in contiguous variable blocks (`alignAssignments`, off by default to avoid diff noise; padding always uses spaces, never TAB).
- Configurable indentation of conditional blocks using spaces (TAB is never used, since it has its own meaning in Makefiles).
- Optional recipe prefix normalization: recipes indented with spaces get the required TAB (only when the content is not Makefile syntax), and excessive leading whitespace (multiple TABs or mixtures) is reduced to exactly 1 TAB, preserving the inner indentation of continuations.
- Configurable cleanup: trailing spaces, consecutive blank lines, leading blank lines, final newline and line ending style (LF/CRLF/Auto).
- Optional `.editorconfig` support, EN/PT-BR localization and samples in `samples/`.
- Unit tests for the formatter and the extension layer (activation, providers and conditional depth calculation, ignoring recipes and `define` blocks), integrated into the monorepo's consolidated coverage.
- Support section in the READMEs (EN/PT-BR).

## Notas em pt-BR

### Alterações desta versão

- Versão inicial do pacote `ark-format-makefile` (`1.0.0`), seguindo a estrutura das extensões Shell e PowerShell e reutilizando o pacote `@tooark/ark-format-shared` (config, editorConfig, document e types).
- Formatação de documento completo e de seleção (range formatting), com cálculo da profundidade base de condicionais a partir do contexto do documento.
- Invariantes de segurança:
  - Linhas de recipe (prefixadas com TAB) nunca têm o corpo alterado.
  - Blocos `define ... endef` preservados sem alterações.
  - Continuações de linha (`\`) preservadas.
  - Preservação integral do documento quando `.RECIPEPREFIX` é redefinido.
- Regras de espaçamento: operadores de atribuição (`=`, `:=`, `::=`, `?=`, `+=`, `!=`), separador de alvos (`:`/`::`), palavras-chave condicionais (`ifeq (`) e marcador de comentário (`#`/`##`).
- Alinhamento de continuações de linha (`\`) de atribuições com o início do valor da primeira linha.
- Alinhamento vertical opcional dos operadores de atribuição em blocos contíguos de variáveis (`alignAssignments`, desligado por padrão para evitar ruído de diff; preenchimento sempre com espaços, nunca TAB).
- Indentação configurável de blocos condicionais usando espaços (TAB nunca é usado por ter significado próprio em Makefiles).
- Normalização opcional do prefixo de recipe: recipes indentadas com espaços recebem o TAB obrigatório (apenas quando o conteúdo não é sintaxe de Makefile) e whitespace inicial excessivo (múltiplos TABs ou misturas) é reduzido para exatamente 1 TAB, preservando a indentação interna de continuações.
- Limpeza configurável: espaços finais, linhas em branco consecutivas, linhas em branco iniciais, nova linha final e estilo de fim de linha (LF/CRLF/Auto).
- Suporte opcional a `.editorconfig`, localização EN/PT-BR e amostras em `samples/`.
- Testes de unidade do formatador e da camada de extensão (ativação, providers e cálculo da profundidade de condicionais, ignorando recipes e blocos `define`), integrados à cobertura consolidada do monorepo.
- Seção de apoio (Support) nos READMEs (EN/PT-BR).

## Additional Information / Informações Adicionais

- Tag: `makefile1.0.0`
- Release date / Data de lançamento: **2026-07-05**
