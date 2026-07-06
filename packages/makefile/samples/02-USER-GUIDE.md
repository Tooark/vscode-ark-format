# 📚 Exemplos de Uso — Makefile Formatter Extension

## 🚀 Como Usar

### 1. Definir Formatador Padrão

```jsonc
// settings.json
"[makefile]": {
  "editor.defaultFormatter": "tooark.ark-format-makefile",
  "editor.formatOnSave": true
}
```

### 2. Aplicar EditorConfig

```jsonc
// settings.json
"arkFormatMakefile.useEditorConfig": true
```

Propriedades lidas do `.editorconfig` (aplicadas sobre as configurações da extensão):

| Propriedade | Efeito |
| --- | --- |
| `indent_style` / `indent_size` | Tamanho da indentação de blocos condicionais (sempre com espaços) |
| `end_of_line` | Estilo de fim de linha (`lf` → LF, `crlf` → CRLF) |
| `insert_final_newline` | Nova linha ao final do arquivo |
| `trim_trailing_whitespace` | Remoção de espaços finais |

> Nota: recipes SEMPRE usam TAB — é regra do `make`, não do formatador. O
> `indent_style`/`indent_size` do EditorConfig afeta apenas condicionais.

### 3. Ajustar as Regras de Espaçamento

```jsonc
"arkFormatMakefile.spacing.spaceAroundAssignment": true,   // VAR := valor
"arkFormatMakefile.spacing.spaceAfterTargetColon": true,   // alvo: deps
"arkFormatMakefile.spacing.spaceAfterCommentMarker": true  // # comentário
```

### 4. Formatar Arquivos

- Documento completo: `Shift + Alt + F` (Windows/Linux) ou `Shift + Option + F` (Mac)
- Seleção: `Ctrl + K Ctrl + F` (Windows/Linux) ou `Cmd + K Cmd + F` (Mac)

## 🔧 Principais Funcionalidades

| Funcionalidade | Configuração | Padrão |
| --- | --- | --- |
| Espaço em torno de atribuições | `spacing.spaceAroundAssignment` | `true` |
| Espaço após `:` em alvos | `spacing.spaceAfterTargetColon` | `true` |
| Espaço após `#` em comentários | `spacing.spaceAfterCommentMarker` | `true` |
| Indentação de condicionais | `indentConditionals` + `indentSize` | `true` / `2` |
| Normalização do prefixo de recipe | `normalizeRecipePrefix` | `true` |
| Alinhamento vertical de atribuições (opt-in) | `alignAssignments` | `false` |
| Colapso de espaços múltiplos | `collapseSpaces` | `true` |
| Limpeza de linhas em branco | `maxConsecutiveBlankLines`, `removeLeadingBlankLines` | `1` / `true` |
| Fim de linha e newline final | `lineEnding`, `insertFinalNewline` | `LF` / `true` |
| Formatação de seleção | `rangeFormatting.*` | habilitada |

## 📝 Dicas de Formatação

### Range Formatting com Contexto

Com `rangeFormatting.reindent` e `rangeFormatting.useDocumentContext` habilitados,
a seleção é reindentada considerando a profundidade de condicionais das linhas
anteriores do documento — útil ao mover blocos entre `ifeq`/`endif`.

### O Que o Formatador NUNCA Faz

- Alterar o corpo de uma recipe (tudo após o TAB pertence ao shell).
- Tocar no conteúdo de blocos `define ... endef`.
- Quebrar continuações de linha (`\`).
- Colapsar espaços em valores de atribuição (`CFLAGS := -Wall  -O2` mantém os espaços do valor).
- Formatar arquivos que redefinem `.RECIPEPREFIX`.

### Recipes com Espaços

Um erro clássico em Makefiles é indentar recipes com espaços (gera `missing separator`).
Com `normalizeRecipePrefix: true`, o formatador converte essas linhas para TAB — mas
somente quando a linha não é interpretável como sintaxe de Makefile (uma atribuição
indentada com espaços, por exemplo, é preservada como atribuição).

## ❓ Troubleshooting

| Sintoma | Causa provável | Ação |
| --- | --- | --- |
| Nada acontece ao formatar | Formatador desabilitado ou arquivo já formatado | Verifique `arkFormatMakefile.enabled` |
| Linguagem errada | Arquivo aberto como `plaintext` | Selecione `Makefile` na barra de status |
| Condicionais não indentam | `indentConditionals: false` | Habilite a opção |
| EditorConfig ignorado | `useEditorConfig: false` ou arquivo `untitled` | Habilite a opção e salve o arquivo em disco |
| Arquivo inteiro preservado | `.RECIPEPREFIX` redefinido | Comportamento intencional de segurança |

## 📚 Recursos

- [README da extensão](https://github.com/Tooark/vscode-ark-format/blob/main/packages/makefile/README.md)
- [Manual do GNU make](https://www.gnu.org/software/make/manual/make.html)
- [EditorConfig](https://editorconfig.org)
