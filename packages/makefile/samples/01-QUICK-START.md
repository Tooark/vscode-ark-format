# ⚡ Quick Start — Guia Rápido

## 🚀 5 Minutos de Setup

### Passo 1: Abrir Arquivo Makefile

```bash
# Abra qualquer Makefile, GNUmakefile ou arquivo .mk no VS Code
code samples/example.mk
```

### Passo 2: Formatar

- **Windows/Linux:** `Shift + Alt + F`
- **Mac:** `Shift + Option + F`

Pronto! O arquivo será formatado com as regras padrão:

- `VAR:=valor` → `VAR := valor`
- `all :build` → `all: build`
- `ifeq($(OS),...)` → `ifeq ($(OS),...)` com corpo indentado
- recipes indentadas com espaço por engano → prefixo TAB

## 🎯 Cenários Comuns

### ✋ Formatar Apenas Uma Seleção

1. Selecione as linhas desejadas
2. Pressione `Ctrl + K Ctrl + F` (Windows/Linux) ou `Cmd + K Cmd + F` (Mac)

### 📝 Aplicar EditorConfig

```jsonc
// settings.json
"arkFormatMakefile.useEditorConfig": true
```

Com essa opção habilitada, o formatador lê o `.editorconfig` do projeto e aplica
`indent_size`, `end_of_line`, `insert_final_newline` e `trim_trailing_whitespace`
sobre as configurações da extensão. Veja o exemplo em [`samples/.editorconfig`](https://github.com/Tooark/vscode-ark-format/blob/main/packages/makefile/samples/.editorconfig).

### 🎨 Formatar ao Salvar

```jsonc
// settings.json
"[makefile]": {
  "editor.defaultFormatter": "tooark.ark-format-makefile",
  "editor.formatOnSave": true
}
```

### 🧱 Desabilitar Indentação de Condicionais

```jsonc
// settings.json
"arkFormatMakefile.indentConditionals": false
```

A indentação original das linhas é preservada; apenas as regras de espaçamento são aplicadas.

## 🔧 Dicas Profissionais

### Dica 1: Range Formatting Inteligente

```jsonc
"arkFormatMakefile.rangeFormatting.reindent": true,
"arkFormatMakefile.rangeFormatting.useDocumentContext": true
```

```text
# Com essas opções habilitadas:
# A profundidade de condicionais de uma seleção será calculada
# com base nas linhas anteriores do documento - perfeito para refatoração!
```

### Dica 2: EditorConfig + Formatter

Mantenha o `.editorconfig` como fonte de verdade do projeto e habilite
`useEditorConfig` — o time inteiro formata igual, mesmo com settings pessoais diferentes.

### Dica 3: Segurança em Primeiro Lugar

O formatador nunca altera o corpo de recipes (conteúdo após o TAB), nunca toca em
blocos `define ... endef` e preserva o arquivo inteiro se `.RECIPEPREFIX` for redefinido.
Formatar não muda o que o `make` executa.

## ❓ Troubleshooting Rápido

| Problema | Solução |
| --- | --- |
| Formatador não ativa | Verifique se o arquivo está com a linguagem `makefile` na barra de status |
| Nada muda ao formatar | O arquivo pode já estar formatado, ou `arkFormatMakefile.enabled` está `false` |
| Recipe não vira TAB | A linha é interpretável como sintaxe de make (comportamento intencional de segurança) |
| Arquivo inteiro ignorado | O arquivo redefine `.RECIPEPREFIX` (preservação intencional) |

## 🎓 Aprenda Mais

- [`02-USER-GUIDE.md`](https://github.com/Tooark/vscode-ark-format/blob/main/packages/makefile/samples/02-USER-GUIDE.md) — guia completo
- [`03-FEATURE-INDEX.md`](https://github.com/Tooark/vscode-ark-format/blob/main/packages/makefile/samples/03-FEATURE-INDEX.md) — índice de features

## ⏱️ Tempos Estimados

| Atividade | Tempo |
| --- | --- |
| Instalar e formatar o primeiro arquivo | 2 min |
| Configurar format on save | 3 min |
| Explorar todos os exemplos | 15 min |

## 🎯 Próximo Passo

```bash
code samples/example.complex.mk
# Depois pressione: Shift + Alt + F
```
