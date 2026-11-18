# Release powershell1.0.0

## Notes in en-US

First release of the **Ark Format: PowerShell** extension — a dedicated formatter for PowerShell files in VS Code.

### Features

#### Full Document and Selection Formatting

- Full document formatting (`.ps1`, `.psm1`, `.psd1`)
- Selection/range formatting with reindentation and document-context options

#### Smart Indentation

- Automatic indentation for `{ }` blocks (functions, `if`/`else`, `foreach`, `switch`, `try`/`catch`/`finally`)
- Automatic dedent on `}`, `else`, `elseif`, `catch`, `finally`
- Support for multi-line `param()` blocks
- Line continuation with backtick (`` ` ``)
- Configurable indentation style: spaces or tabs, adjustable size

#### Quote-Aware Lexer

- Tokenizer that distinguishes code from string literals
- Full support for here-strings (`@'...'@` and `@"..."@`)
- String content preservation — no changes inside literals
- Correct detection of inline comments and shebangs

#### Spacing Rules

- Space before `{` in functions, keywords and after parentheses
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

| Setting                              | Default          |
| ------------------------------------ | ---------------- |
| `enabled`                            | `true`           |
| `effectLanguages`                    | `["powershell"]` |
| `useEditorConfig`                    | `false`          |
| `indentStyle`                        | `"space"`        |
| `indentSize`                         | `2`              |
| `lineEnding`                         | `"CRLF"`         |
| `trimTrailingWhitespace`             | `true`           |
| `maxConsecutiveBlankLines`           | `1`              |
| `removeLeadingBlankLines`            | `true`           |
| `insertFinalNewline`                 | `true`           |
| `collapseSpaces`                     | `true`           |
| `rangeFormatting.enabled`            | `true`           |
| `rangeFormatting.reindent`           | `false`          |
| `rangeFormatting.useDocumentContext` | `true`           |

#### Localization

- Full support for English and Brazilian Portuguese (PT-BR)

#### Architecture

- Bundled with esbuild for optimized performance
- Shared package `@tooark/ark-format-shared` for common logic
- Minimum engine: VS Code 1.85.0

## Notas em pt-BR

Primeira versão da extensão **Ark Format: PowerShell** — um formatador dedicado para arquivos PowerShell no VS Code.

### Funcionalidades

#### Formatação Completa e por Seleção

- Formatação de documento completo (`.ps1`, `.psm1`, `.psd1`)
- Formatação de seleção/intervalo (range formatting) com opções de reindentação e contexto do documento

#### Indentação Inteligente

- Indentação automática por blocos `{ }` (funções, `if`/`else`, `foreach`, `switch`, `try`/`catch`/`finally`)
- Dedentação automática em `}`, `else`, `elseif`, `catch`, `finally`
- Suporte a blocos `param()` multilinha
- Continuação de linha com backtick (`` ` ``)
- Estilo de indentação configurável: espaços ou tabs, tamanho ajustável

#### Lexer Quote-Aware

- Tokenizador que distingue código de literais de string
- Suporte completo a here-strings (`@'...'@` e `@"..."@`)
- Preservação de conteúdo de strings — nenhuma modificação dentro de literais
- Detecção correta de comentários inline e shebangs

#### Regras de Espaçamento

- Espaço antes de `{` em funções, keywords e após parênteses
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

| Setting                              | Padrão           |
| ------------------------------------ | ---------------- |
| `enabled`                            | `true`           |
| `effectLanguages`                    | `["powershell"]` |
| `useEditorConfig`                    | `false`          |
| `indentStyle`                        | `"space"`        |
| `indentSize`                         | `2`              |
| `lineEnding`                         | `"CRLF"`         |
| `trimTrailingWhitespace`             | `true`           |
| `maxConsecutiveBlankLines`           | `1`              |
| `removeLeadingBlankLines`            | `true`           |
| `insertFinalNewline`                 | `true`           |
| `collapseSpaces`                     | `true`           |
| `rangeFormatting.enabled`            | `true`           |
| `rangeFormatting.reindent`           | `false`          |
| `rangeFormatting.useDocumentContext` | `true`           |

#### Localização

- Suporte completo em Inglês e Português Brasileiro (PT-BR)

#### Arquitetura

- Bundled com esbuild para desempenho otimizado
- Pacote compartilhado `@tooark/ark-format-shared` para lógica comum
- Motor mínimo: VS Code 1.85.0

## Additional Information / Informações Adicionais

- Tag: `powershell1.0.0`
- Release date / Data de lançamento: **2026-05-21**
