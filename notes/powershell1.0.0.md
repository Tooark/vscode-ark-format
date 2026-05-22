# Release powershell1.0.0

Primeira versão da extensão **Ark Format: PowerShell** — um formatador dedicado para arquivos PowerShell no VS Code.

## Funcionalidades

### Formatação Completa e por Seleção

- Formatação de documento completo (`.ps1`, `.psm1`, `.psd1`)
- Formatação de seleção/intervalo (range formatting) com opções de reindentação e contexto do documento

### Indentação Inteligente

- Indentação automática por blocos `{ }` (funções, `if`/`else`, `foreach`, `switch`, `try`/`catch`/`finally`)
- Dedentação automática em `}`, `else`, `elseif`, `catch`, `finally`
- Suporte a blocos `param()` multilinha
- Continuação de linha com backtick (`` ` ``)
- Estilo de indentação configurável: espaços ou tabs, tamanho ajustável

### Lexer Quote-Aware

- Tokenizador que distingue código de literais de string
- Suporte completo a here-strings (`@'...'@` e `@"..."@`)
- Preservação de conteúdo de strings — nenhuma modificação dentro de literais
- Detecção correta de comentários inline e shebangs

### Regras de Espaçamento

- Espaço antes de `{` em funções, keywords e após parênteses
- Colapso de espaços múltiplos internos
- Normalização de comentários (`#` seguido de espaço)

### Controle de Whitespace e Linhas em Branco

- Remoção de trailing whitespace
- Limite configurável de linhas em branco consecutivas
- Remoção de blank lines no início do arquivo
- Inserção de newline final

### Line Endings

- Suporte a `LF`, `CRLF` e `Auto` (detecção automática do estilo dominante)

### Integração .editorconfig

- Suporte opt-in para respeitar configurações de `.editorconfig` do projeto
- Aplica: `indent_style`, `indent_size`, `trim_trailing_whitespace`, `insert_final_newline`, `end_of_line`

### Configurações

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

### Localização

- Suporte completo em Inglês e Português Brasileiro (PT-BR)

### Arquitetura

- Bundled com esbuild para desempenho otimizado
- Pacote compartilhado `@tooark/ark-format-shared` para lógica comum
- Motor mínimo: VS Code 1.85.0

## Informações Adicionais

- Tag relacionada: `powershell1.0.0`
- Data de lançamento: **2026-05-21**
