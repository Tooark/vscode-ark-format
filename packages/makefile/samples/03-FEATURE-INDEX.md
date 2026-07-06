# 🗺️ Exemplos da Extensão — Índice Completo

## 🎯 Mapa Rápido

### Por Nível de Complexidade

| Nível         | Arquivo              | Conteúdo                                                                               |
| ------------- | -------------------- | -------------------------------------------------------------------------------------- |
| Básico        | `example.mk`         | Atribuições, alvos, condicionais simples, define, recipes                              |
| Básico        | `Makefile`           | Mesmo conteúdo de `example.mk` com bom espaçamento, mas recipes sem TAB (convergência) |
| Intermediário | `GNUmakefile`        | Funções GNU (`wildcard`, `patsubst`, `shell`), recipes com continuação                 |
| Avançado      | `example.complex.mk` | Condicionais aninhados, variáveis por alvo, regras de padrão, include/export           |

### Por Caso de Uso

| Quero ver...                            | Abra                                                 |
| --------------------------------------- | ---------------------------------------------------- |
| Recuperação de recipes sem TAB          | `example.mk` e `Makefile` (formate ambos: convergem) |
| Condicionais aninhados indentados       | `example.complex.mk`                                 |
| Recipes preservadas com continuação `\` | `GNUmakefile`                                        |
| Bloco `define` preservado               | `example.mk` ou `example.complex.mk`                 |
| Configuração de projeto                 | `.editorconfig` e `settings.example.json`            |

## ✨ Features Demonstradas

### Espaçamento

- Operadores de atribuição: `=`, `:=`, `::=`, `?=`, `+=`, `!=` (em todos os exemplos)
- Separador de alvos `:` e `::` (em `example.mk` e `example.complex.mk`)
- Palavra-chave condicional + parêntese: `ifeq (` (em `example.complex.mk`)
- Marcador de comentário `#` e `##` (em `example.complex.mk`)

### Estrutura

- Indentação de condicionais aninhados (`example.complex.mk`)
- Condicionais dentro de contexto de recipe (`example.mk`, alvo `test`)
- Continuações de linha em variáveis e recipes (`example.mk`, `GNUmakefile`)
- Blocos `define ... endef` preservados (`example.mk`, `example.complex.mk`)

### Segurança

- Corpo de recipes intocado (todos os exemplos)
- Normalização de recipe com espaços → TAB (`example.mk` e `example.complex.mk`, alvo `test`)
- Valores de atribuição com espaços internos preservados (`example.complex.mk`, `HELP_TEXT`)

## 🚀 Como Começar

1. Abra `example.mk`
2. Pressione `Shift + Alt + F`
3. Formate também `Makefile` e observe que as duas saídas convergem

## 🔗 Recursos Externos

- [Manual do GNU make](https://www.gnu.org/software/make/manual/make.html)
- [Regras de recipes (TAB)](https://www.gnu.org/software/make/manual/html_node/Recipe-Syntax.html)
- [EditorConfig](https://editorconfig.org)

## 📝 Notas de Compatibilidade

- Alvo: GNU make (sintaxe `ifeq`/`ifdef`, `define`, funções `$(...)`).
- Makefiles POSIX simples também funcionam (subconjunto do GNU make).
- Arquivos com `.RECIPEPREFIX` redefinido são preservados integralmente.

## ❓ Troubleshooting

Consulte a seção de troubleshooting do [`02-USER-GUIDE.md`](https://github.com/Tooark/vscode-ark-format/blob/main/packages/makefile/samples/02-USER-GUIDE.md).
