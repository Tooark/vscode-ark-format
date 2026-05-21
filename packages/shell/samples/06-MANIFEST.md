# 📦 Manifest de Exemplos — ark-format-shell

**Ordem sugerida:** 6 de 7 (complementar)  
**Anterior:** [`05-STRUCTURE.md`](https://github.com/Tooark/vscode-ark-format/blob/main/packages/shell/samples/05-STRUCTURE.md)  
**Próximo:** [`07-FINAL-REPORT.md`](https://github.com/Tooark/vscode-ark-format/blob/main/packages/shell/samples/07-FINAL-REPORT.md)

---

## 📋 Inventário Completo

### 🐚 Exemplos de Código (8 arquivos)

| Arquivo              | Linguagem      | Objetivo                         |
| -------------------- | -------------- | -------------------------------- |
| `example.azcli`      | Azure CLI      | Exemplo de uso do Azure CLI      |
| `example.bash`       | Bash 4+        | Exemplo de script Bash moderno   |
| `example.bats`       | BATS Testing   | Exemplo de teste automatizado    |
| `example.ksh`        | Korn Shell 93+ | Exemplo de script Korn Shell     |
| `example.sh`         | POSIX Shell    | Exemplo de script POSIX          |
| `example.sh.posix`   | POSIX Portable | Exemplo de script portátil POSIX |
| `example.tcsh`       | C Shell (tcsh) | Exemplo de script C Shell        |
| `example.complex.sh` | Shell Script   | Exemplo de script complexo       |

### ⚙️ Configuração (2 arquivos)

| Arquivo                 | Tipo        | Objetivo              |
| ----------------------- | ----------- | --------------------- |
| `.editorconfig`         | INI Config  | Formatação automática |
| `settings.example.json` | JSON Config | VS Code settings      |

### 📖 Documentação (8 arquivos)

| Arquivo                   | Tipo     | Conteúdo                         |
| ------------------------- | -------- | -------------------------------- |
| `00-START-HERE.md`        | Markdown | Introdução e instruções iniciais |
| `01-QUICK-START.md`       | Markdown | Quick start 5 minutos            |
| `02-USER-GUIDE.md`        | Markdown | Guia completo de uso             |
| `03-FEATURE-INDEX.md`     | Markdown | Índice e mapa de referência      |
| `04-TECHNICAL-SUMMARY.md` | Markdown | Resumo técnico detalhado         |
| `05-STRUCTURE.md`         | Markdown | Estrutura do projeto             |
| `06-MANIFEST.md`          | Markdown | Inventário completo              |
| `07-FINAL-REPORT.md`      | Markdown | Relatório final                  |

---

## 📊 Estatísticas

```plaintext
Total de arquivos: 18
Exemplos de código: 8
Arquivos de configuração: 2
Documentos: 8
```

---

## 🦾 Formatos Suportados por Arquivo

| Formato          | Arquivo            | Exemplo              |
| ---------------- | ------------------ | -------------------- |
| **Azure CLI**    | `example.azcli`    | Cloud scripting      |
| **Bash 4+**      | `example.bash`     | Features modernas    |
| **BATS**         | `example.bats`     | Testing framework    |
| **Korn Shell**   | `example.ksh`      | ksh88, ksh93, oksh   |
| **Standard .sh** | `example.sh`       | Híbrido POSIX/Bash   |
| **POSIX Shell**  | `example.sh.posix` | Máxima portabilidade |
| **C Shell**      | `example.tcsh`     | tcsh moderno         |

---

## 📚 Guias de Documentação

### Para Iniciantes

```plaintext
1. Ler: 01-QUICK-START.md (5 min)
2. Ler: exemplo.sh (estrutura básica)
3. Testar: Formatar em VS Code
```

### Para Intermediários

```plaintext
1. Ler: 02-USER-GUIDE.md (completo)
2. Estudar: example.bash
3. Estudar: example.azcli
4. Configurar: EditorConfig
```

### Para Avançados

```plaintext
1. Ler: 04-TECHNICAL-SUMMARY.md (técnico)
2. Ler: 03-FEATURE-INDEX.md (features)
3. Estudar: example.ksh
4. Estudar: example.bats
5. Customizar: settings.example.json
```

---

## 🎯 Casos de Uso por Arquivo

### example.sh

```plaintext
✓ Referência rápida
✓ Testes básicos
✓ Aprendizado inicial
✓ Portabilidade POSIX
```

### example.bash

```plaintext
✓ Automation moderno
✓ CI/CD pipelines
✓ Arrays e manipulação
✓ Features GNU Bash
```

### example.sh.posix

```plaintext
✓ Máxima compatibilidade
✓ Sistemas legados
✓ Containers (Alpine)
✓ Cross-platform scripts
```

### example.ksh

```plaintext
✓ Sistemas AIX/Solaris
✓ UNIX comercial
✓ Performance crítica
✓ Advanced scripting
```

### example.tcsh

```plaintext
✓ Sistemas BSD antigos
✓ Interactive shells
✓ Legacy maintenance
✓ C-shell users
```

### example.bats

```plaintext
✓ Testing CI/CD
✓ QA automation
✓ Script validation
✓ Test fixtures
```

### example.azcli

```plaintext
✓ Cloud deployment
✓ Infrastructure as Code
✓ Azure automation
✓ Resource management
```

---

## 🔧 Configurações Incluídas

### .editorconfig

```plaintext
Aplica para: *.sh, *.bash, *.ksh, *.tcsh, *.azcli, *.bats

Configurações:
  • indent_style = space
  • indent_size = 2
  • end_of_line = lf
  • insert_final_newline = true
  • trim_trailing_whitespace = true
```

### settings.example.json

```plaintext
Inclui:
  • 6 linguagens habilitadas
  • EditorConfig automático
  • Document context range formatting
  • Todas as opções de formatting
  • Configuração por linguagem
```

---

## ✨ Features por Arquivo

### example.sh (POSIX)

- ✅ if/then/else/fi
- ✅ case/esac (;;, ;&, ;;&)
- ✅ for/while loops
- ✅ Funções
- ✅ Heredoc

### example.bash (Bash)

- ✅ Associative arrays
- ✅ String manipulation
- ✅ Process substitution
- ✅ Printf formatting
- ✅ Conditional expansion

### example.ksh (Korn)

- ✅ Typed variables
- ✅ Integer arithmetic
- ✅ Arrays indexed
- ✅ Coprocess
- ✅ Pattern matching

### example.bats (Testing)

- ✅ @test assertions
- ✅ setup/teardown
- ✅ Output capture
- ✅ Status codes
- ✅ Conditional skip

### example.tcsh (C-Shell)

- ✅ set variables
- ✅ Lists
- ✅ @ arithmetic
- ✅ switch/case
- ✅ Aliases

### example.azcli (Azure)

- ✅ Login/subscription
- ✅ Resource groups
- ✅ Storage accounts
- ✅ App Service
- ✅ Function Apps

---

## 🚀 Como Usar Este Manifest

### Para Exploração

```plaintext
1. Ler este arquivo (você está aqui!)
2. Escolher área de interesse
3. Ir para 02-USER-GUIDE.md ou 01-QUICK-START.md
```

### Para Referência

```plaintext
1. Procurar no "📊 Estatísticas"
2. Verificar "🎯 Casos de Uso"
3. Consultar "✨ Features"
```

### Para Aprendizado

```plaintext
1. Seguir "📚 Guias de Documentação"
2. Abrir arquivo sugerido
3. Formatar em VS Code
```

---

## 🔗 Relações Entre Arquivos

```plaintext
06-MANIFEST.md (você está aqui)
    │
    ├─→ 01-QUICK-START.md (comece aqui em 5 min)
    │    └─→ 02-USER-GUIDE.md (guia completo)
    │
    ├─→ 03-FEATURE-INDEX.md (mapa de referência)
    │    └─→ exemplo.* (escolha por caso de uso)
    │
    ├─→ 04-TECHNICAL-SUMMARY.md (visão técnica)
    │    └─→ exemplo.* (com análise detalhada)
    │
    ├─→ settings.example.json (copie para VS Code)
    │    └─→ .editorconfig (copie para projeto)
    │
    └─→ exemplo.* (abra no VS Code)
         └─→ Shift + Alt + F (formate!)
```
