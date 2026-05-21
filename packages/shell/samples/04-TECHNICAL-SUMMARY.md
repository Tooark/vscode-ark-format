# 🔧 Exemplos Gerados — Resumo Executivo

**Ordem sugerida:** 4 de 7 (complementar)  
**Anterior:** [`03-FEATURE-INDEX.md`](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/samples/03-FEATURE-INDEX.md)  
**Próximo:** [`05-STRUCTURE.md`](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/samples/05-STRUCTURE.md)

---

## 🎯 Arquivos dos `samples`

Gerados **17 arquivos** de exemplos e configuração para demonstrar todos os formatos suportados pela extensão.

### 📋 Lista Completa

| #   | Arquivo                   | Tipo       | Linhas | Propósito                                                |
| --- | ------------------------- | ---------- | ------ | -------------------------------------------------------- |
| 1   | `example.azcli`           | Azure CLI  | 103    | Cloud operations (resource groups, storage, app service) |
| 2   | `example.bash`            | Bash 4+    | 53     | Features avançadas (arrays, string manipulation)         |
| 3   | `example.bats`            | BATS       | 59     | Testing framework, fixtures                              |
| 4   | `example.ksh`             | Korn Shell | 58     | Typed vars, coprocess, pattern matching                  |
| 5   | `example.sh`              | Shell      | 94     | POSIX básico                                             |
| 6   | `example.sh.posix`        | POSIX      | 59     | Máxima portabilidade                                     |
| 7   | `example.tcsh`            | C Shell    | 78     | Legacy shell com enhancements                            |
| 8   | `.editorconfig`           | Config     | 29     | Formatação automática via EditorConfig                   |
| 9   | `settings.example.json`   | Config     | 89     | Configurações VS Code recomendadas                       |
| 10  | `00-START-HERE.md`        | Docs       | 47     | Introdução e instruções iniciais                         |
| 11  | `01-QUICK-START.md`       | Docs       | 169    | Guia de início rápido                                    |
| 12  | `02-USER-GUIDE.md`        | Docs       | 121    | Guia do usuário                                          |
| 13  | `03-FEATURE-INDEX.md`     | Docs       | 118    | Índice de funcionalidades                                |
| 14  | `04-TECHNICAL-SUMMARY.md` | Docs       | 276    | Resumo técnico                                           |
| 15  | `05-STRUCTURE.md`         | Docs       | 390    | Estrutura do projeto                                     |
| 16  | `06-MANIFEST.md`          | Docs       | 318    | Manifesto do projeto                                     |
| 17  | `07-FINAL-REPORT.md`      | Docs       | 344    | Relatório final                                          |

**Total:** 622 linhas de exemplos + 1783 linhas de documentação

---

## 🦾 Formatos Suportados Documentados

### Linguagens

```plaintext
✅ shellscript (.sh)        — POSIX Shell padrão
✅ bash        (.bash)      — Bash 4+ com features GNU
✅ bats        (.bats)      — Bash Automated Testing System
✅ azcli       (.azcli)     — Azure CLI Cloud Scripts
✅ ksh         (.ksh)       — Korn Shell 93+
✅ tcsh        (.tcsh)      — C Shell moderno
```

### Versão POSIX

```plaintext
✅ POSIX padrão             — Máxima portabilidade
✅ Compatível com sh/dash   — Mínimo de dependências
✅ Suporta zsh              — Com modo POSIX
```

---

## 📖 Conteúdo por Arquivo

### 1️⃣ example.sh

```plaintext
Tópicos:
  • if/then/else/fi
  • Nested if statements
  • Funções definidas
  • case/esac com ;;, ;&, ;;&
  • Heredoc (<<EOF)
```

### 2️⃣ example.bash

```plaintext
Tópicos:
  • Associative arrays (declare -A)
  • String manipulation (${var%pattern})
  • Process substitution (<(cmd))
  • Printf formatting
  • Conditional expansion (${var:-default})
  • While loop com process substitution
```

### 3️⃣ example.sh.posix

```plaintext
Tópicos:
  • Variáveis simples
  • Case statement com alternativas
  • Aritmética POSIX ($((expr)))
  • Test conditions [-f, -r, etc]
  • Command substitution $(cmd)
  • Trap e cleanup handlers
```

### 4️⃣ example.ksh

```plaintext
Tópicos:
  • Typed variables (integer, typeset)
  • Arrays indexed
  • Aritmética com (( ))
  • Coprocess (|&)
  • Extended pattern matching
  • POSIX character classes
  • Function exports
```

### 5️⃣ example.bats

```plaintext
Tópicos:
  • @test assertions
  • setup() e teardown() fixtures
  • Output capture (run, $output)
  • Status codes ($status)
  • Multiple output lines (${lines[@]})
  • Regex matching ([[ $output =~ pattern ]])
  • Conditional skips
  • Heredoc em tests
```

### 6️⃣ example.tcsh

```plaintext
Tópicos:
  • Variable assignments (set)
  • Lists/arrays (set svc = (...))
  • @-operator for arithmetic
  • String modification (:r, :e)
  • switch/case/default/endsw
  • Conditional (if/then/else/endif)
  • Aliases
  • File tests (-d, -r, -w)
```

### 7️⃣ example.azcli

```plaintext
Tópicos:
  • Login e subscription management
  • Resource group operations
  • Storage account creation
  • Container e blob operations
  • App Service deployment
  • Function App creation
  • Query results com --query
  • Output formatting (table, tsv, json)
```

---

## 🔧 Configuração Incluída

### `.editorconfig`

```ini
[*]
indent_style = space
indent_size = 2
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true
root = true
```

Aplicado para: `*.sh`, `*.bash`, `*.ksh`, `*.tcsh`, `*.azcli`, `*.bats`

### `settings.example.json`

```json
{
  "arkFormatShell.enabled": true,
  "arkFormatShell.engine": "internal",
  "arkFormatShell.effectLanguages": [
    "shellscript",
    "bash",
    "bats",
    "azcli",
    "tcsh",
    "ksh"
  ],
  "arkFormatShell.useEditorConfig": true,
  "arkFormatShell.rangeFormatting.useDocumentContext": true,
  "[shellscript]": {
    "editor.defaultFormatter": "tooark.ark-format-shell",
    "editor.formatOnSave": true
  }
  // ... mais linguagens
}
```

---

## 📊 Features Demonstradas

| Feature              | Arquivo               | ✓   |
| -------------------- | --------------------- | --- |
| if/then/else         | Todos                 | ✅  |
| case/esac            | sh, bash, posix, bats | ✅  |
| Loops (for/while)    | Todos                 | ✅  |
| Funções              | Todos                 | ✅  |
| Arrays               | bash, ksh             | ✅  |
| Heredoc              | sh, bash, bats        | ✅  |
| Process substitution | bash                  | ✅  |
| String manipulation  | bash, ksh             | ✅  |
| Aritmética           | ksh, tcsh             | ✅  |
| Testing (BATS)       | bats                  | ✅  |
| Cloud (Azure CLI)    | azcli                 | ✅  |
| Coprocess            | ksh                   | ✅  |

---

## 🚀 Como Usar Nos Exemplos

### Formatar Arquivo Inteiro

```bash
# VS Code: Shift + Alt + F (Windows/Linux)
# VS Code: Shift + Option + F (Mac)
```

### Formatar Seleção

```bash
# VS Code: Ctrl + K Ctrl + F (Windows/Linux)
# VS Code: Cmd + K Cmd + F (Mac)
```

### Testar BATS

```bash
bats samples/example.bats
```

### Executar Azure CLI Script

```bash
# Primeiro fazer login
az login

# Depois executar
bash samples/example.azcli
```

### Usar EditorConfig

````bash
# Copiar para projeto
cp samples/.editorconfig ./

# A formatação será aplicada automaticamente
# (se useEditorConfig: true)

---

## 📁 Estrutura Final da Pasta `/samples`

```plaintext
samples/
├── example.azcli           ← Azure Cloud
├── example.bash            ← Bash avançado
├── example.bats            ← BATS testing
├── example.ksh             ← Korn Shell
├── example.sh              ← POSIX básico
├── example.sh.posix        ← POSIX máxima portabilidade
├── example.tcsh            ← C Shell
├── .editorconfig           ← Formatação automática
├── settings.example.json   ← Config VS Code
├── 00-START-HERE.md        ← Introdução e instruções iniciais
├── 01-QUICK-START.md       ← Guia de início rápido
├── 02-USER-GUIDE.md        ← Guia do usuário
├── 03-FEATURE-INDEX.md     ← Índice de funcionalidades
├── 04-TECHNICAL-SUMMARY.md ← Resumo técnico
├── 05-STRUCTURE.md         ← Estrutura do projeto
├── 06-MANIFEST.md          ← Manifesto do projeto
└── 07-FINAL-REPORT.md      ← Relatório final
````
