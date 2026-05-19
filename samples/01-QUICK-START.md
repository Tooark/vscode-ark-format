# ⚡ Quick Start — Guia Rápido

**Ordem sugerida:** 1 de 7 (essencial)  
**Próximo:** [`02-USER-GUIDE.md`](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/samples/02-USER-GUIDE.md)  
**Primeiros passos com a extensão ark-format-shell**

---

## 🚀 5 Minutos de Setup

### Passo 1: Abrir Arquivo Shell

```bash
# Abra qualquer arquivo .sh, .bash, .bats, etc em VS Code
code samples/example.sh
```

### Passo 2: Formatar

```plaintext
Windows/Linux:  Shift + Alt + F
Mac:            Shift + Option + F
```

✅ Pronto! Seu arquivo está formatado.

---

## 🎯 Cenários Comuns

### ✋ Formatar Apenas Uma Seleção

```plaintext
1. Selecione o bloco de código
2. Ctrl + K, Ctrl + F (Windows/Linux)
    Cmd + K,  Cmd + F (Mac)
```

### 🦾 Suportar Múltiplas Linguagens

No VS Code, adicione a `.vscode/settings.json`:

```json
{
  "arkFormatShell.effectLanguages": ["shellscript", "bash", "bats", "azcli"]
}
```

### ⚙️ Usar shfmt Externo

Se tem `shfmt` instalado:

```json
{
  "arkFormatShell.engine": "shfmt",
  "arkFormatShell.shfmt.path": "shfmt"
}
```

### 📝 Aplicar EditorConfig

Crie `.editorconfig` na raiz:

```ini
[*.sh]
indent_style = space
indent_size = 2
end_of_line = lf
```

Depois habilite:

```json
{
  "arkFormatShell.useEditorConfig": true
}
```

### 🎨 Formatar ao Salvar

```json
{
  "[shellscript]": {
    "editor.defaultFormatter": "tooark.ark-format-shell",
    "editor.formatOnSave": true
  }
}
```

---

## 🔧 Dicas Profissionais

### Dica 1: Range Formatting Inteligente

```bash
# Com essa opção habilitada:
"rangeFormatting.useDocumentContext": true

# A indentação de uma seleção será calculada baseada
# no contexto do documento - perfeito para refatoração!
```

### Dica 2: EditorConfig + Formatter

EditorConfig + extensão = sem configuração manual

```ini
[*.sh]
indent_size = 4
```

A extensão lerá automaticamente!

### Dica 3: Diagnostics com shfmt

Se usar `shfmt`, erros aparecem no Problems panel:

```json
{
  "arkFormatShell.engine": "shfmt"
}
```

**Vantagem:** Erros aparecem enquanto você digita!

---

## ❓ Troubleshooting Rápido

| Problema                     | Solução                                      |
| ---------------------------- | -------------------------------------------- |
| Arquivo não formata          | Verifique se `.sh` está em `effectLanguages` |
| Indentação errada            | Ative `useDocumentContext: true`             |
| shfmt não encontrado         | Instale: `npm install -g shfmt`              |
| EditorConfig não funciona    | Ative: `useEditorConfig: true`               |
| Conflito com outro formatter | Defina como default formatter                |

---

## 🎓 Aprenda Mais

- 📖 [`02-USER-GUIDE.md`](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/samples/02-USER-GUIDE.md) — Guia completo
- 🗺️ [`03-FEATURE-INDEX.md`](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/samples/03-FEATURE-INDEX.md) — Índice de referência
- 📊 [`04-TECHNICAL-SUMMARY.md`](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/samples/04-TECHNICAL-SUMMARY.md) — Detalhes técnicos

---

## ⏱️ Tempos Estimados

```plaintext
              Setup básico: 2 min
          Primeiro formato: 30 seg
   Configurar EditorConfig: 1 min
Setup múltiplas linguagens: 3 min
Aprender todas as features: 20 min
```

---

## 🎯 Próximo Passo

👉 **Abra VS Code e tente:** `Shift + Alt + F` em qualquer arquivo `.sh`

```bash
code samples/example.sh
# Depois pressione: Shift + Alt + F
```
