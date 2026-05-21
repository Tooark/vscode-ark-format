# 🗺️ Exemplos da Extensão — Índice Completo

**Ordem sugerida:** 3 de 7 (essencial)  
**Anterior:** [`02-USER-GUIDE.md`](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/samples/02-USER-GUIDE.md)  
**Próximo:** [`04-TECHNICAL-SUMMARY.md`](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/samples/04-TECHNICAL-SUMMARY.md)

Índice completo de features e casos de uso demonstrados pelos exemplos.

## 🎯 Mapa Rápido

### Por Nível de Complexidade

#### **Básico (Iniciante)**

```plaintext
1. example.sh              ← Estruturas if/then, case/esac, funções
2. example.sh.posix        ← POSIX puro, máxima compatibilidade
```

#### **Intermediário**

```plaintext
3. example.bash            ← Arrays, string manipulation, process substitution
4. example.azcli           ← Azure CLI, comandos cloud
```

#### **Avançado**

```plaintext
5. example.ksh             ← Typed variables, coprocess, aritmética
6. example.tcsh            ← Aliases, lists, C-shell syntax
7. example.bats            ← Testing framework, fixtures
```

### Por Caso de Uso

| Caso                        | Arquivo            | Quando Usar                                |
| --------------------------- | ------------------ | ------------------------------------------ |
| **Cloud - Azure**           | `example.azcli`    | Gerenciamento de recursos, deployment      |
| **Automation Moderno**      | `example.bash`     | Scripts avançados, CI/CD, local testing    |
| **Testes Automatizados**    | `example.bats`     | Testing de scripts shell                   |
| **Legacy/Sistemas Antigos** | `example.tcsh`     | Sistemas BSD, máquinas antigas             |
| **Sistema Genérico**        | `example.sh`       | Sistema genérico Linux/Unix                |
| **Sistema Linux/Unix**      | `example.sh.posix` | Máxima compatibilidade com todos os shells |
| **Korn Shell**              | `example.ksh`      | AIX, Solaris, UNIX comercial               |

## ✨ Features Demonstradas

### Estruturas de Controle

```plaintext
✓ if/then/else/elif/fi
✓ case/esac com ;;, ;&, ;;&
✓ for/while/until loops
✓ Funções com parameters
✓ Trap e cleanup handlers
```

### Variáveis e Tipos

```plaintext
✓ Expansão de parâmetros (${var:-default})
✓ String manipulation (${var%pattern})
✓ Arrays (bash, ksh)
✓ Associative arrays (bash)
✓ Typed variables (ksh)
✓ Lists (tcsh)
```

### I/O e Redirecionamento

```plaintext
✓ Heredoc (<<EOF, <<'EOF')
✓ Here strings (<<<)
✓ Command substitution $(...) e `...`
✓ Process substitution <(...)
✓ Redireção stdin/stdout/stderr
```

### Features Avançadas

```plaintext
✓ Coprocess (ksh93+)
✓ Pattern matching (extended patterns, regex)
✓ Aritmética com (()), @, ((++))
✓ Aliases (tcsh)
✓ Testing fixtures (bats)
✓ Cloud API calls (azcli)
```

## 🚀 Como Começar

Para instruções passo a passo, consulte [`01-QUICK-START.md`](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/samples/01-QUICK-START.md).

## 🔗 Recursos Externos

Consulte [`02-USER-GUIDE.md`](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/samples/02-USER-GUIDE.md) para links de recursos e documentação externa.

## 📝 Notas de Compatibilidade

| Shell | Compatível | Notas                          |
| ----- | ---------- | ------------------------------ |
| bash  | ✅ Sim     | Recomendado, todas as features |
| sh    | ✅ Sim     | POSIX standard, portável       |
| dash  | ✅ Sim     | POSIX puro, mínimo             |
| zsh   | ✅ Sim     | Compatível com POSIX           |
| ksh   | ✅ Sim     | ksh88, ksh93, oksh             |
| tcsh  | ✅ Sim     | csh-compatible, enhancements   |
| bats  | ✅ Sim     | Testing framework específico   |
| azcli | ✅ Sim     | Azure CLI scripts              |

## ❓ Troubleshooting

| Problema                        | Solução                                                           |
| ------------------------------- | ----------------------------------------------------------------- |
| Arquivo `.azcli` não formata    | Adicione `"azcli"` em `arkFormatShell.effectLanguages`            |
| Range formatting indenta errado | Ative `rangeFormatting.useDocumentContext: true`                  |
| Quer usar `shfmt` externo       | Mude `engine` para `"shfmt"` e instale com `npm install -g shfmt` |
