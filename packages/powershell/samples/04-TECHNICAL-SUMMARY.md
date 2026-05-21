# 🔧 Exemplos Gerados — Resumo Executivo

**Ordem sugerida:** 4 de 7 (complementar)  
**Anterior:** [`03-FEATURE-INDEX.md`](https://github.com/Tooark/vscode-ark-format/blob/main/packages/powershell/samples/03-FEATURE-INDEX.md)  
**Próximo:** [`05-STRUCTURE.md`](https://github.com/Tooark/vscode-ark-format/blob/main/packages/powershell/samples/05-STRUCTURE.md)

---

## 🎯 Arquivos dos `samples`

A pasta `samples` do pacote PowerShell contém **14 arquivos** para demonstrar uso, configuração e documentação da extensão.

### 📋 Lista Completa

| #   | Arquivo                   | Tipo      | Propósito                                   |
| --- | ------------------------- | --------- | ------------------------------------------- |
| 1   | `example.ps1`             | Script    | Exemplo geral de script PowerShell          |
| 2   | `example.psm1`            | Módulo    | Estrutura de módulo e exportação de funções |
| 3   | `example.psd1`            | Manifesto | Definição de metadados do módulo            |
| 4   | `example.complex.ps1`     | Script    | Cenário robusto para testes de formatação   |
| 5   | `.editorconfig`           | Config    | Regras de formatação por arquivo            |
| 6   | `settings.example.json`   | Config    | Configurações recomendadas no VS Code       |
| 7   | `00-START-HERE.md`        | Docs      | Entrada rápida dos exemplos                 |
| 8   | `01-QUICK-START.md`       | Docs      | Guia inicial                                |
| 9   | `02-USER-GUIDE.md`        | Docs      | Guia completo                               |
| 10  | `03-FEATURE-INDEX.md`     | Docs      | Índice por feature e caso de uso            |
| 11  | `04-TECHNICAL-SUMMARY.md` | Docs      | Resumo técnico                              |
| 12  | `05-STRUCTURE.md`         | Docs      | Mapa da estrutura de arquivos               |
| 13  | `06-MANIFEST.md`          | Docs      | Inventário e referência                     |
| 14  | `07-FINAL-REPORT.md`      | Docs      | Fechamento e visão consolidada              |

---

## 🦾 Formatos Suportados Documentados

### Linguagens/arquivos

```plaintext
✅ PowerShell Script (.ps1)
✅ PowerShell Module (.psm1)
✅ PowerShell Module Manifest (.psd1)
```

### Versões de PowerShell

```plaintext
✅ Windows PowerShell 5.1
✅ PowerShell 7+ (pwsh)
```

---

## 📖 Conteúdo por Arquivo

### 1️⃣ example.ps1

```plaintext
Tópicos:
  • if/else, switch e loops
  • funções e parâmetros
  • cmdlets comuns
  • organização de script
```

### 2️⃣ example.psm1

```plaintext
Tópicos:
  • estrutura de módulo
  • funções públicas e privadas
  • Export-ModuleMember
  • boas práticas de organização
```

### 3️⃣ example.psd1

```plaintext
Tópicos:
  • metadados de módulo
  • hashtable de manifesto
  • versões e dependências
  • definição de funções exportadas
```

### 4️⃣ example.complex.ps1

```plaintext
Tópicos:
  • [CmdletBinding()] e param multilinha
  • try/catch/finally
  • hashtable e PSCustomObject
  • pipeline e filtros
  • comentários e here-string
```

---

## 🔧 Configuração Incluída

### `.editorconfig`

```ini
[*]
indent_style = space
indent_size = 4
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true
root = true
```

Aplicado principalmente para: `*.ps1`, `*.psm1`, `*.psd1`

### `settings.example.json`

```json
{
  "arkFormatPowerShell.enabled": true,
  "arkFormatPowerShell.indentSize": 4,
  "arkFormatPowerShell.indentStyle": "space",
  "arkFormatPowerShell.useEditorConfig": true,
  "arkFormatPowerShell.rangeFormatting.useDocumentContext": true,
  "[powershell]": {
    "editor.defaultFormatter": "tooark.ark-format-powershell",
    "editor.formatOnSave": true
  }
}
```

---

## 📊 Features Demonstradas

| Feature              | Arquivo(s)                                           | ✓   |
| -------------------- | ---------------------------------------------------- | --- |
| `if/elseif/else`     | `example.ps1`, `example.complex.ps1`                 | ✅  |
| `switch`             | `example.ps1`                                        | ✅  |
| `foreach/for/while`  | `example.ps1`, `example.complex.ps1`                 | ✅  |
| funções com `param`  | todos os scripts                                     | ✅  |
| `try/catch/finally`  | `example.complex.ps1`                                | ✅  |
| hashtable (`@{}`)    | `example.ps1`, `example.psd1`, `example.complex.ps1` | ✅  |
| `PSCustomObject`     | `example.complex.ps1`                                | ✅  |
| here-string          | `example.ps1`, `example.complex.ps1`                 | ✅  |
| formatação de módulo | `example.psm1`                                       | ✅  |
| manifesto de módulo  | `example.psd1`                                       | ✅  |

---

## 🚀 Como Usar nos Exemplos

### Formatar arquivo inteiro

```plaintext
VS Code: Shift + Alt + F
```

### Formatar seleção

```plaintext
VS Code: Ctrl + K, Ctrl + F
```

### Testar módulo (`.psm1`)

```powershell
Import-Module ./samples/example.psm1 -Force
Get-Command -Module example
```

### Validar manifesto (`.psd1`)

```powershell
Test-ModuleManifest ./samples/example.psd1
```

---

## 📁 Estrutura Final da Pasta `/samples`

```plaintext
samples/
├── example.ps1
├── example.psm1
├── example.psd1
├── example.complex.ps1
├── .editorconfig
├── settings.example.json
├── 00-START-HERE.md
├── 01-QUICK-START.md
├── 02-USER-GUIDE.md
├── 03-FEATURE-INDEX.md
├── 04-TECHNICAL-SUMMARY.md
├── 05-STRUCTURE.md
├── 06-MANIFEST.md
└── 07-FINAL-REPORT.md
```
