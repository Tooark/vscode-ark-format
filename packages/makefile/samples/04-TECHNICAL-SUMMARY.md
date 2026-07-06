# 🔧 Exemplos Gerados — Resumo Executivo

## 🎯 Arquivos dos `samples`

### 📋 Lista Completa

| Arquivo                                   | Tipo         | Propósito                                        |
| ----------------------------------------- | ------------ | ------------------------------------------------ |
| `Makefile`                                | Exemplo      | Resultado esperado da formatação de `example.mk` |
| `GNUmakefile`                             | Exemplo      | Funções GNU e recipes com continuação            |
| `example.mk`                              | Exemplo      | Entrada "bagunçada" para testar o formatador     |
| `example.complex.mk`                      | Exemplo      | Cenário avançado com condicionais aninhados      |
| `.editorconfig`                           | Configuração | Regras de projeto para `useEditorConfig`         |
| `settings.example.json`                   | Configuração | Settings recomendados da extensão                |
| `00-START-HERE.md` … `07-FINAL-REPORT.md` | Documentação | Guias de uso dos samples                         |

## 🦾 Formatos Suportados Documentados

### Nomes de arquivo

- `Makefile` / `makefile`
- `GNUmakefile`
- `*.mk`

Qualquer arquivo com o ID de linguagem `makefile` no VS Code.

## 📖 Conteúdo por Arquivo

### 1️⃣ example.mk

- Atribuições sem espaçamento (`SHELL:=/bin/bash`, `VERSION?=1.0.0`)
- Comentário sem espaço após `#`
- Condicional sem espaço antes do parêntese (`ifeq($(OS),...)`) e aninhado
- Bloco `define HELP_TEXT` com espaçamento interno intencional
- Alvos com espaçamento irregular (`all :build`, `test : build`)
- Recipe indentada com espaços (alvo `test`) para demonstrar a normalização para TAB
- Condicional `ifdef DEBUG` dentro do contexto de recipe

### 2️⃣ Makefile

- Mesmo conteúdo de `example.mk`, com espaçamento correto mas recipes propositalmente sem TAB — formate ambos e as saídas convergem.

### 3️⃣ GNUmakefile

- Funções GNU: `$(wildcard ...)`, `$(patsubst ...)`, `$(shell ...)`
- Regra de padrão com diretório (`build/%.o: src/%.c`)
- Recipe com continuação de linha (`\`) preservada

### 4️⃣ example.complex.mk

- Todos os operadores de atribuição (`=`, `:=`, `::=`, `?=`, `+=`, `!=`)
- `export` com atribuição
- Condicionais aninhados em três níveis
- Variável por alvo (`debug: CFLAGS += -g`)
- Regra de padrão (`%.o:%.c`)
- Diretivas `include` e `-include`
- `.PHONY` com espaçamento irregular

## 🔧 Configuração Incluída

### `.editorconfig`

```ini
[{Makefile,makefile,GNUmakefile,*.mk}]
indent_style = space
indent_size = 2
```

Aplica indentação de condicionais com 2 espaços, LF, newline final e trim de
espaços — quando `arkFormatMakefile.useEditorConfig` está habilitado.

### `settings.example.json`

Configuração completa comentada da extensão, incluindo formatador padrão por
linguagem e format on save.

## 📊 Features Demonstradas

| Feature                    | example.mk | Makefile | GNUmakefile | example.complex.mk |
| -------------------------- | :--------: | :------: | :---------: | :----------------: |
| Espaçamento de atribuição  |     ✅     |    ✅    |     ✅      |         ✅         |
| Espaçamento de alvo        |     ✅     |    ✅    |     ✅      |         ✅         |
| Indentação de condicionais |     ✅     |    ✅    |      —      |         ✅         |
| Condicional em recipe      |     ✅     |    ✅    |      —      |         ✅         |
| Bloco define               |     ✅     |    ✅    |      —      |         ✅         |
| Continuação de linha       |     ✅     |    ✅    |     ✅      |         ✅         |
| Normalização recipe→TAB    |     ✅     |    —     |      —      |         ✅         |
| Variável por alvo          |     —      |    —     |      —      |         ✅         |
| Regra de padrão            |     —      |    —     |     ✅      |         ✅         |

## 🚀 Como Usar Nos Exemplos

### Formatar Arquivo Inteiro

```text
# VS Code: Shift + Alt + F (Windows/Linux)
# VS Code: Shift + Option + F (Mac)
```

### Formatar Seleção

```text
# VS Code: Ctrl + K Ctrl + F (Windows/Linux)
# VS Code: Cmd + K Cmd + F (Mac)
```

### Usar EditorConfig

```bash
# Copiar para o projeto
cp samples/.editorconfig ./

# A formatação será aplicada automaticamente
# (se useEditorConfig: true)
```

### Validar com o make

```bash
# Os exemplos formatados continuam válidos para o make
make -f samples/Makefile --dry-run all
```

## 📁 Estrutura Final da Pasta `/samples`

```text
samples/
├── .editorconfig
├── 00-START-HERE.md
├── 01-QUICK-START.md
├── 02-USER-GUIDE.md
├── 03-FEATURE-INDEX.md
├── 04-TECHNICAL-SUMMARY.md
├── 05-STRUCTURE.md
├── 06-MANIFEST.md
├── 07-FINAL-REPORT.md
├── GNUmakefile
├── Makefile
├── example.complex.mk
├── example.mk
└── settings.example.json
```
