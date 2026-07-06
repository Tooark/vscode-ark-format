# 🗂️ Estrutura de Exemplos — Visão Geral

## 📁 Árvore de Arquivos

```text
samples/
├── 📖 Documentação
│   ├── 00-START-HERE.md        ← você está aqui (ponto de partida)
│   ├── 01-QUICK-START.md       ← 5 minutos para o primeiro formato
│   ├── 02-USER-GUIDE.md        ← guia completo de configuração
│   ├── 03-FEATURE-INDEX.md     ← índice por feature/caso de uso
│   ├── 04-TECHNICAL-SUMMARY.md ← visão técnica dos exemplos
│   ├── 05-STRUCTURE.md         ← este arquivo
│   ├── 06-MANIFEST.md          ← inventário completo
│   └── 07-FINAL-REPORT.md      ← relatório conclusivo
├── 🛠️ Exemplos
│   ├── example.mk              ← entrada "bagunçada" (formate este!)
│   ├── Makefile                ← mesmo conteúdo, recipes sem TAB (formate!)
│   ├── GNUmakefile             ← funções GNU e continuações
│   └── example.complex.mk      ← cenário avançado
└── ⚙️ Configuração
    ├── .editorconfig           ← regras de projeto
    └── settings.example.json   ← settings da extensão
```

## 🎯 Fluxo de Navegação

### Para Iniciantes

1. `00-START-HERE.md` → 2. `01-QUICK-START.md` → 3. `example.mk` (+ `Shift+Alt+F`)

### Para Intermediários

1. `02-USER-GUIDE.md` → 2. `settings.example.json` → 3. `example.complex.mk`

### Para Avançados

1. `03-FEATURE-INDEX.md` → 2. `04-TECHNICAL-SUMMARY.md` → 3. todos os exemplos

## 📊 Matriz de Exemplos

| Arquivo              | Complexidade | Formatável           | Objetivo                    |
| -------------------- | ------------ | -------------------- | --------------------------- |
| `example.mk`         | Básica       | ✅ (mude e compare)  | Antes/depois                |
| `Makefile`           | Básica       | ✅ (recipes sem TAB) | Convergência com example.mk |
| `GNUmakefile`        | Média        | ✅                   | Funções GNU                 |
| `example.complex.mk` | Alta         | ✅                   | Estressar o formatador      |

## 🚀 Caminhos de Uso

### Caminho 1: Rápido (5 min)

```bash
code samples/example.mk
# Shift + Alt + F
# Formate também samples/Makefile e veja as saídas convergirem
```

### Caminho 2: Completo (20 min)

1. Leia `01-QUICK-START.md` e `02-USER-GUIDE.md`
2. Copie `settings.example.json` para seu `.vscode/settings.json`
3. Formate os 4 exemplos e observe as mudanças

### Caminho 3: Expert (1 hora)

1. Leia todos os documentos
2. Habilite `useEditorConfig` e brinque com o `.editorconfig`
3. Teste range formatting com `reindent` + `useDocumentContext`
4. Adicione `.RECIPEPREFIX = >` em um exemplo e confirme a preservação

## 📋 Checklist de Exploração

### ✅ Documentação

- [ ] Li o `00-START-HERE.md`
- [ ] Segui o `01-QUICK-START.md`

### ✅ Código

- [ ] Formatei `example.mk` e comparei com `Makefile`
- [ ] Formatei `example.complex.mk`

### ✅ Configuração

- [ ] Copiei `settings.example.json`
- [ ] Testei `useEditorConfig` com o `.editorconfig`

### ✅ Avançado

- [ ] Testei formatação de seleção com reindentação
- [ ] Verifiquei as invariantes de segurança (define, recipes, `.RECIPEPREFIX`)

## 🎯 Sugestões Rápidas

### Quero começar em 2 minutos

→ `01-QUICK-START.md`

### Quero configurar o projeto/time

→ `.editorconfig` + `02-USER-GUIDE.md`

### Quero ver o formatador no limite

→ `example.complex.mk`

## 🚀 Para Começar AGORA

```bash
code samples/example.mk
# Depois: Shift + Alt + F
```
