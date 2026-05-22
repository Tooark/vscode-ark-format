# Release shell1.0.0

Primeira versão da extensão **Ark Format: Shell** — um formatador dedicado para scripts Shell/Bash no VS Code.

## Funcionalidades

### Linguagens Suportadas

- Shell Script (`.sh`), Bash (`.bash`), POSIX Shell (`.sh.posix`), Zsh (`.zsh`)
- Korn Shell (`.ksh`), TCSH (`.tcsh`), Azure CLI (`.azcli`), BATS (`.bats`)
- Escopo de linguagens configurável via `effectLanguages`

### Engines de Formatação

- **Engine interna** (`internal`) — formatador puro em TypeScript, sem dependências externas
- **Engine shfmt** (`shfmt`) — integração opcional com o binário [shfmt](https://github.com/mvdan/sh)
  - Caminho e flags configuráveis
  - Detecção automática de arquivos `.bats`
  - Erros de sintaxe reportados no painel Problems com linha/coluna exata

### Formatação Completa e por Seleção

- Formatação de documento completo
- Formatação de seleção/intervalo (range formatting) com opções de reindentação e contexto do documento

### Indentação Inteligente

- Indentação automática por blocos: `if/then/elif/else/fi`, `for/while/until/do/done`, `case/esac`, funções `{ }`
- Suporte a tcsh: `switch/endsw`, `foreach/end`, `case label:/default:`, `breaksw`
- Padrões de `case` com terminadores `;;`, `;&`, `;;&`
- Continuação de linha com `\` — indenta linhas subsequentes automaticamente
- Preservação de conteúdo dentro de heredocs (sem reformatação)
- Estilo configurável: espaços ou tabs, tamanho ajustável

### Lexer Quote-Aware

- Tokenizador que distingue código de literais de string
- Modos reconhecidos: `code`, `sq` (aspas simples), `dq` (aspas duplas), `ansi` (`$'...'`), `bt` (backtick)
- Rastreamento de modo de aspas entre linhas (strings multi-linha)
- Detecção de heredocs (`<<EOF`, `<<-EOF`, `<<"EOF"`, `<<'EOF'`)
- Detecção de shebangs e comentários de linha inteira

### Regras de Espaçamento

- Normalização de `;then` → `; then` e `;do` → `; do`
- Espaço entre keywords (`if`, `while`, `until`) e `[`, entre `for` e `(`
- Normalização de definições de função: `name() {`, `function name() {`, `function name {`
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

### Localização

- Suporte completo em Inglês e Português Brasileiro (PT-BR)

### Diagnósticos

- Erros de formatação reportados no painel Problems
- Erros do shfmt com posição exata (linha/coluna)
- Diagnósticos limpos automaticamente ao formatar com sucesso

### Arquitetura

- Bundled com esbuild para desempenho otimizado
- Pacote compartilhado `@tooark/ark-format-shared` para lógica comum
- Motor mínimo: VS Code 1.85.0

## Informações Adicionais

- Tag relacionada: `shell1.0.0`
- Data de lançamento: **2026-05-21**
