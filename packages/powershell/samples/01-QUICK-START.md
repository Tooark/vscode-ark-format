# ⚡ Quick Start — Guia Rápido

**Ordem sugerida:** 1 de 7 (essencial)  
**Próximo:** [`02-USER-GUIDE.md`](https://github.com/Tooark/vscode-ark-format/blob/main/packages/powershell/samples/02-USER-GUIDE.md)  
**Primeiros passos com a extensão ark-format-powershell**

---

## 🚀 5 Minutos de Setup

### Passo 1: Abrir Arquivo PowerShell

```powershell
# Abra qualquer arquivo .ps1, .psm1, .psd1, etc em VS Code
code samples/example.ps1
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
  "arkFormatPowerShell.effectLanguages": ["powershell"]
}
```

### 📝 Aplicar EditorConfig

Crie `.editorconfig` na raiz:

```ini
[*.ps1]
indent_style = space
indent_size = 2
end_of_line = lf
```

Depois habilite:

```json
{
  "arkFormatPowerShell.useEditorConfig": true
}
```

### 🎨 Formatar ao Salvar

```json
{
  "[powershell]": {
    "editor.defaultFormatter": "tooark.ark-format-powershell",
    "editor.formatOnSave": true
  }
}
```

---

## 🔧 Dicas Profissionais

### Dica 1: Range Formatting Inteligente

```powershell
# Com essa opção habilitada:
"rangeFormatting.useDocumentContext": true

# A indentação de uma seleção será calculada baseada
# no contexto do documento - perfeito para refatoração!
```

### Dica 2: EditorConfig + Formatter

EditorConfig + extensão = sem configuração manual

```ini
[*.ps1]
indent_size = 4
```

---

## ❓ Troubleshooting Rápido

| Problema                     | Solução                                       |
| ---------------------------- | --------------------------------------------- |
| Arquivo não formata          | Verifique se `.ps1` está em `effectLanguages` |
| Indentação errada            | Ative `useDocumentContext: true`              |
| EditorConfig não funciona    | Ative: `useEditorConfig: true`                |
| Conflito com outro formatter | Defina como default formatter                 |

---

## 🎓 Aprenda Mais

- 📖 [`02-USER-GUIDE.md`](https://github.com/Tooark/vscode-ark-format/blob/main/packages/powershell/samples/02-USER-GUIDE.md) — Guia completo
- 🗺️ [`03-FEATURE-INDEX.md`](https://github.com/Tooark/vscode-ark-format/blob/main/packages/powershell/samples/03-FEATURE-INDEX.md) — Índice de referência
- 📊 [`04-TECHNICAL-SUMMARY.md`](https://github.com/Tooark/vscode-ark-format/blob/main/packages/powershell/samples/04-TECHNICAL-SUMMARY.md) — Detalhes técnicos

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

👉 **Abra VS Code e tente:** `Shift + Alt + F` em qualquer arquivo `.ps1`

```powershell
code samples/example.ps1
# Depois pressione: Shift + Alt + F
```
