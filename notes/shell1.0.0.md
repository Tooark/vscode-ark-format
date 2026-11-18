# Release shell1.0.0

## Notes in en-US

First release of the **Ark Format: Shell** extension — a dedicated formatter for Shell/Bash scripts in VS Code.

### Features

#### Supported Languages

- Shell Script (`.sh`), Bash (`.bash`), POSIX Shell (`.sh.posix`), Zsh (`.zsh`)
- Korn Shell (`.ksh`), TCSH (`.tcsh`), Azure CLI (`.azcli`), BATS (`.bats`)
- Configurable language scope via `effectLanguages`

#### Formatting Engines

- **Internal engine** (`internal`) — pure TypeScript formatter with no external dependencies
- **shfmt engine** (`shfmt`) — optional integration with the [shfmt](https://github.com/mvdan/sh) binary
  - Configurable path and flags
  - Automatic detection of `.bats` files
  - Syntax errors reported in the Problems panel with the exact line/column

#### Full Document and Selection Formatting

- Full document formatting
- Selection/range formatting with reindentation and document context options

#### Smart Indentation

- Automatic block indentation: `if/then/elif/else/fi`, `for/while/until/do/done`, `case/esac`, functions `{ }`
- tcsh support: `switch/endsw`, `foreach/end`, `case label:/default:`, `breaksw`
- `case` patterns with `;;`, `;&`, `;;&` terminators
- Line continuation with `\` — subsequent lines are indented automatically
- Content inside heredocs preserved (no reformatting)
- Configurable style: spaces or tabs, adjustable size

#### Quote-Aware Lexer

- Tokenizer that distinguishes code from string literals
- Recognized modes: `code`, `sq` (single quotes), `dq` (double quotes), `ansi` (`$'...'`), `bt` (backtick)
- Quote mode tracking across lines (multi-line strings)
- Heredoc detection (`<<EOF`, `<<-EOF`, `<<"EOF"`, `<<'EOF'`)
- Shebang and full-line comment detection

#### Spacing Rules

- Normalization of `;then` → `; then` and `;do` → `; do`
- Space between keywords (`if`, `while`, `until`) and `[`, and between `for` and `(`
- Normalization of function definitions: `name() {`, `function name() {`, `function name {`
- Collapsing of multiple internal spaces
- Comment normalization (`#` followed by a space)

#### Whitespace and Blank Line Control

- Trailing whitespace removal
- Configurable limit of consecutive blank lines
- Removal of blank lines at the start of the file
- Final newline insertion

#### Line Endings

- Support for `LF`, `CRLF` and `Auto` (automatic detection of the dominant style)

#### .editorconfig Integration

- Opt-in support for honoring the project's `.editorconfig` settings
- Applies: `indent_style`, `indent_size`, `trim_trailing_whitespace`, `insert_final_newline`, `end_of_line`

#### Settings

| Setting                              | Default               |
| ------------------------------------ | --------------------- |
| `enabled`                            | `true`                |
| `effectLanguages`                    | all 8 languages       |
| `useEditorConfig`                    | `false`               |
| `engine`                             | `"internal"`          |
| `shfmt.path`                         | `null`                |
| `shfmt.flags`                        | `null`                |
| `indentStyle`                        | `"space"`             |
| `indentSize`                         | `2`                   |
| `lineEnding`                         | `"LF"`                |
| `trimTrailingWhitespace`             | `true`                |
| `maxConsecutiveBlankLines`           | `1`                   |
| `removeLeadingBlankLines`            | `true`                |
| `insertFinalNewline`                 | `true`                |
| `collapseSpaces`                     | `true`                |
| `spacing.spaceBeforeThenDo`          | `true`                |
| `spacing.spaceAfterKeywords`         | `true`                |
| `spacing.spaceBeforeFunctionBrace`   | `true`                |
| `rangeFormatting.enabled`            | `true`                |
| `rangeFormatting.reindent`           | `false`               |
| `rangeFormatting.useDocumentContext` | `true`                |

#### Localization

- Full support for English and Brazilian Portuguese (PT-BR)

#### Diagnostics

- Formatting errors reported in the Problems panel
- shfmt errors with the exact position (line/column)
- Diagnostics cleared automatically after a successful format

#### Architecture

- Bundled with esbuild for optimized performance
- Shared package `@tooark/ark-format-shared` for common logic
- Minimum engine: VS Code 1.85.0

## Notas em pt-BR

Primeira versão da extensão **Ark Format: Shell** — um formatador dedicado para scripts Shell/Bash no VS Code.

### Funcionalidades

#### Linguagens Suportadas

- Shell Script (`.sh`), Bash (`.bash`), POSIX Shell (`.sh.posix`), Zsh (`.zsh`)
- Korn Shell (`.ksh`), TCSH (`.tcsh`), Azure CLI (`.azcli`), BATS (`.bats`)
- Escopo de linguagens configurável via `effectLanguages`

#### Engines de Formatação

- **Engine interna** (`internal`) — formatador puro em TypeScript, sem dependências externas
- **Engine shfmt** (`shfmt`) — integração opcional com o binário [shfmt](https://github.com/mvdan/sh)
  - Caminho e flags configuráveis
  - Detecção automática de arquivos `.bats`
  - Erros de sintaxe reportados no painel Problems com linha/coluna exata

#### Formatação Completa e por Seleção

- Formatação de documento completo
- Formatação de seleção/intervalo (range formatting) com opções de reindentação e contexto do documento

#### Indentação Inteligente

- Indentação automática por blocos: `if/then/elif/else/fi`, `for/while/until/do/done`, `case/esac`, funções `{ }`
- Suporte a tcsh: `switch/endsw`, `foreach/end`, `case label:/default:`, `breaksw`
- Padrões de `case` com terminadores `;;`, `;&`, `;;&`
- Continuação de linha com `\` — indenta linhas subsequentes automaticamente
- Preservação de conteúdo dentro de heredocs (sem reformatação)
- Estilo configurável: espaços ou tabs, tamanho ajustável

#### Lexer Quote-Aware

- Tokenizador que distingue código de literais de string
- Modos reconhecidos: `code`, `sq` (aspas simples), `dq` (aspas duplas), `ansi` (`$'...'`), `bt` (backtick)
- Rastreamento de modo de aspas entre linhas (strings multi-linha)
- Detecção de heredocs (`<<EOF`, `<<-EOF`, `<<"EOF"`, `<<'EOF'`)
- Detecção de shebangs e comentários de linha inteira

#### Regras de Espaçamento

- Normalização de `;then` → `; then` e `;do` → `; do`
- Espaço entre keywords (`if`, `while`, `until`) e `[`, entre `for` e `(`
- Normalização de definições de função: `name() {`, `function name() {`, `function name {`
- Colapso de espaços múltiplos internos
- Normalização de comentários (`#` seguido de espaço)

#### Controle de Whitespace e Linhas em Branco

- Remoção de trailing whitespace
- Limite configurável de linhas em branco consecutivas
- Remoção de blank lines no início do arquivo
- Inserção de newline final

#### Line Endings

- Suporte a `LF`, `CRLF` e `Auto` (detecção automática do estilo dominante)

#### Integração .editorconfig

- Suporte opt-in para respeitar configurações de `.editorconfig` do projeto
- Aplica: `indent_style`, `indent_size`, `trim_trailing_whitespace`, `insert_final_newline`, `end_of_line`

#### Configurações

| Setting                              | Padrão                |
| ------------------------------------ | --------------------- |
| `enabled`                            | `true`                |
| `effectLanguages`                    | todas as 8 linguagens |
| `useEditorConfig`                    | `false`               |
| `engine`                             | `"internal"`          |
| `shfmt.path`                         | `null`                |
| `shfmt.flags`                        | `null`                |
| `indentStyle`                        | `"space"`             |
| `indentSize`                         | `2`                   |
| `lineEnding`                         | `"LF"`                |
| `trimTrailingWhitespace`             | `true`                |
| `maxConsecutiveBlankLines`           | `1`                   |
| `removeLeadingBlankLines`            | `true`                |
| `insertFinalNewline`                 | `true`                |
| `collapseSpaces`                     | `true`                |
| `spacing.spaceBeforeThenDo`          | `true`                |
| `spacing.spaceAfterKeywords`         | `true`                |
| `spacing.spaceBeforeFunctionBrace`   | `true`                |
| `rangeFormatting.enabled`            | `true`                |
| `rangeFormatting.reindent`           | `false`               |
| `rangeFormatting.useDocumentContext` | `true`                |

#### Localização

- Suporte completo em Inglês e Português Brasileiro (PT-BR)

#### Diagnósticos

- Erros de formatação reportados no painel Problems
- Erros do shfmt com posição exata (linha/coluna)
- Diagnósticos limpos automaticamente ao formatar com sucesso

#### Arquitetura

- Bundled com esbuild para desempenho otimizado
- Pacote compartilhado `@tooark/ark-format-shared` para lógica comum
- Motor mínimo: VS Code 1.85.0

## Additional Information / Informações Adicionais

- Tag: `shell1.0.0`
- Release date / Data de lançamento: **2026-05-21**
