# 🗂️ Estrutura de Exemplos — Visão Geral

**Ordem sugerida:** 5 de 7 (complementar)  
**Anterior:** [`04-TECHNICAL-SUMMARY.md`](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/samples/04-TECHNICAL-SUMMARY.md)  
**Próximo:** [`06-MANIFEST.md`](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/samples/06-MANIFEST.md)

## 📁 Árvore de Arquivos

```plaintext
samples/
│
├─── 📜 EXEMPLOS DE CÓDIGO (7 arquivos)
│    │
│    ├─ example.azcli           (103 linhas) ← Cloud operations (resource groups, storage, app service)
│    ├─ example.bash            (53 linhas)  ← Features avançadas (arrays, string manipulation)
│    ├─ example.bats            (59 linhas)  ← Testing framework, fixtures
│    ├─ example.ksh             (58 linhas)  ← Typed vars, coprocess, pattern matching
│    ├─ example.sh              (94 linhas)  ← POSIX básico
│    ├─ example.sh.posix        (59 linhas)  ← Máxima portabilidade
│    └─ example.tcsh            (78 linhas)  ← Legacy shell com enhancements
│
├─── ⚙️ CONFIGURAÇÃO (2 arquivos)
│    │
│    ├─ .editorconfig           (29 linhas)  ← EditorConfig
│    └─ settings.example.json   (89 linhas)  ← VS Code
│
├─── 📖 DOCUMENTAÇÃO (8 arquivos)
│    │
│    ├─ 00-START-HERE.md        (47 linhas)  ← 2 minutos
│    ├─ 01-QUICK-START.md       (169 linhas) ← 5 minutos
│    ├─ 02-USER-GUIDE.md        (121 linhas) ← Guia completo
│    ├─ 03-FEATURE-INDEX.md     (118 linhas) ← Índice
│    ├─ 04-TECHNICAL-SUMMARY.md (276 linhas) ← Técnico
│    ├─ 05-STRUCTURE.md         (Este arquivo)
│    ├─ 06-MANIFEST.md          (318 linhas) ← Inventário completo
│    └─ 07-CONTRIBUTING.md      (344 linhas) ← Guia de contribuição
│
└─── 📊 TOTAL: 17 arquivos, ~2.500 linhas
```

---

## 🎯 Fluxo de Navegação

### Para Iniciantes

```plaintext
START
  │
  ├─→ 01-QUICK-START.md  (5 min)
  │     │
  │     ├─→ example.sh (abrir no VS Code)
  │     │     │
  │     │     └─→ Shift+Alt+F (formatar!)
  │     │
  │     └─→ 02-USER-GUIDE.md (mais detalhes)
  │
  └─→ FIM: Arquivo formatado com sucesso! 🎉
```

### Para Intermediários

```plaintext
START
  │
  ├─→ 02-USER-GUIDE.md (guia completo)
  │     │
  │     ├─→ example.bash (estudar features)
  │     ├─→ example.azcli (casos Azure)
  │     │
  │     └─→ settings.example.json (configurar)
  │
  ├─→ .editorconfig (copiar para projeto)
  │
  └─→ FIM: Setup completo com múltiplas linguagens ✅
```

### Para Avançados

```plaintext
START
  │
  ├─→ 04-TECHNICAL-SUMMARY.md (técnico)
  │     │
  │     ├─→ example.ksh (Korn Shell avançado)
  │     ├─→ example.bats (Testing framework)
  │     │
  │     └─→ 03-FEATURE-INDEX.md (features e compatibilidade)
  │
  ├─→ settings.example.json (customizar)
  │
  └─→ FIM: Domínio completo da extensão 🚀
```

---

## 📊 Matriz de Exemplos

### Por Linguagem

| Linguagem  | Arquivo   | Linhas | Complexidade |
| ---------- | --------- | ------ | ------------ |
| Azure CLI  | .azcli    | 103    | ⭐⭐ Médio   |
| Bash       | .bash     | 53     | ⭐⭐ Médio   |
| BATS       | .bats     | 59     | ⭐⭐⭐ Adv.  |
| Korn Shell | .ksh      | 58     | ⭐⭐⭐ Adv.  |
| POSIX      | .sh       | 94     | ⭐ Básico    |
| POSIX Pure | .sh.posix | 59     | ⭐ Básico    |
| C Shell    | .tcsh     | 78     | ⭐⭐ Médio   |

### Por Documentação

| Documento               | Linhas | Público Alvo         |
| ----------------------- | ------ | -------------------- |
| 01-QUICK-START.md       | 169    | Iniciantes           |
| 02-USER-GUIDE.md        | 121    | Todos                |
| 03-FEATURE-INDEX.md     | 118    | Intermediários       |
| 04-TECHNICAL-SUMMARY.md | 276    | Avançados            |
| 05-STRUCTURE.md         | Este   | Navegação            |
| 06-MANIFEST.md          | 318    | Referência           |
| 07-CONTRIBUTING.md      | 344    | Guia de contribuição |

---

## 🚀 Caminhos de Uso

### Caminho 1: Rápido (5 min)

```plaintext
01-QUICK-START.md
     ↓
Abrir example.sh
     ↓
Formatar (Shift+Alt+F)
     ↓
✅ Pronto!
```

### Caminho 2: Completo (20 min)

```plaintext
02-USER-GUIDE.md
     ↓
Escolher exemplo por caso
     ↓
Estudar features
     ↓
Copiar settings.example.json
     ↓
✅ Setup completo!
```

### Caminho 3: Expert (1 hora)

```plaintext
04-TECHNICAL-SUMMARY.md
     ↓
Estudar example.ksh + example.bats
     ↓
03-FEATURE-INDEX.md para features avançadas
     ↓
Customizar settings.example.json
     ↓
✅ Domínio completo!
```

---

## 🎓 Sequência de Aprendizado

```plaintext
Passo 1: Leia 01-QUICK-START.md       [5 min]
         └─ Entenda o básico

Passo 2: Abra example.sh no VS Code   [2 min]
         └─ Veja o exemplo

Passo 3: Pressione Shift+Alt+F        [1 min]
         └─ Formate o arquivo

Passo 4: Leia 02-USER-GUIDE.md        [10 min]
         └─ Entenda as opções

Passo 5: Copie settings.example.json  [2 min]
         └─ Configure para seu projeto

Passo 6: Estude example.bash          [10 min]
         └─ Aprenda features

Passo 7: Configure .editorconfig      [5 min]
         └─ Setup automático

Total: ~35 minutos para domínio prático
```

---

## 🔗 Relação Entre Documentos

```plaintext
06-MANIFEST.md ← VOCÊ ESTÁ AQUI
     │
     ├─ "Quer começar rápido?" ──→ 01-QUICK-START.md
     │                                    │
     │                                    └─ "Quer mais detalhes?" ──→ 02-USER-GUIDE.md
     │
     ├─ "Quer uma visão técnica?" ──→ 04-TECHNICAL-SUMMARY.md
     │                                    │
     │                                    └─ "Qual feature eu quero?" ──→ 03-FEATURE-INDEX.md
     │
     └─ "Como está organizado?" ──→ 05-STRUCTURE.md (este arquivo)
```

---

## 📋 Checklist de Exploração

### ✅ Documentação

```plaintext
□ Ler 01-QUICK-START.md (5 min)
□ Ler 02-USER-GUIDE.md (guia completo)
□ Ler 03-FEATURE-INDEX.md (features)
□ Ler 04-TECHNICAL-SUMMARY.md (técnico)
□ Consultar 06-MANIFEST.md (referência)
```

### ✅ Código

```plaintext
□ Abrir example.sh
□ Formatar (Shift+Alt+F)
□ Estudar example.bash
□ Estudar example.azcli
□ Tentar example.bats (bats)
```

### ✅ Configuração

```plaintext
□ Copiar settings.example.json
□ Copiar .editorconfig
□ Configurar effectLanguages
□ Testar com arquivo real
```

### ✅ Avançado

```plaintext
□ Estudar example.ksh
□ Configurar shfmt externo
□ Customizar spacing options
□ Testar range formatting
```

---

## 🎯 Sugestões Rápidas

### Quero começar em 2 minutos

```plaintext
→ Abra example.sh
→ Pressione Shift+Alt+F
→ Veja o resultado!
```

### Quero múltiplas linguagens

```plaintext
→ Copie settings.example.json
→ Edite effectLanguages
→ Teste com .bats, .azcli
```

### Quero EditorConfig

```plaintext
→ Copie .editorconfig
→ Configure useEditorConfig: true
→ Deixe funcionar automaticamente
```

### Quero usar shfmt externo

```plaintext
→ Instale: npm install -g shfmt
→ Altere: engine: "shfmt"
→ Pronto! Erros aparecem no Problems
```

---

## 🌍 Compatibilidade

| Sistema     | Suporte | Notas                  |
| ----------- | ------- | ---------------------- |
| **Windows** | ✅ Sim  | VS Code, WSL, Git Bash |
| **macOS**   | ✅ Sim  | Nativo, Homebrew       |
| **Linux**   | ✅ Sim  | Qualquer distro        |
| **Docker**  | ✅ Sim  | Alpine, Ubuntu, etc    |

---

## 📊 Estatísticas

Para estatísticas completas, detalhes de linhas e cobertura detalhada, consulte [`06-MANIFEST.md`](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/samples/06-MANIFEST.md).

---

## 🎓 Documentação por Nível

```plaintext
INICIANTE              INTERMEDIÁRIO              AVANÇADO
   │                        │                        │
   ├─ 01-QUICK-START.md     ├─ 02-USER-GUIDE.md      ├─ 04-TECHNICAL-SUMMARY.md
   │  (5 min)               │  (guia completo)       │  (técnico)
   │                        │                        │
   └─ example.sh            ├─ 03-FEATURE-INDEX.md   ├─ example.ksh
      (básico)              │  (features)            │  (advanced)
                            │                        │
                            ├─ example.bash          └─ example.bats
                            │  (intermediate)           (testing)
                            │
                            └─ example.azcli
                               (cloud)
```

---

## 🚀 Para Começar AGORA

### Opção 1: Terminal

```bash
cd samples/
code example.sh
# Depois: Shift + Alt + F
```

### Opção 2: VS Code

```plaintext
File → Open Folder → samples/
Abrir example.sh
Shift + Alt + F
```

### Opção 3: Documentação

```plaintext
Ler 01-QUICK-START.md (este diretório)
Seguir instruções
Executar no VS Code
```

---

## 📞 Dúvidas?

| Pergunta                     | Resposta               |
| ---------------------------- | ---------------------- |
| "Por onde começo?"           | 01-QUICK-START.md      |
| "Como funciona?"             | 02-USER-GUIDE.md       |
| "Qual é a feature X?"        | 03-FEATURE-INDEX.md    |
| "Como está tudo organizado?" | 05-STRUCTURE.md (este) |
| "Preciso de referência"      | 06-MANIFEST.md         |

---

## ✨ Pronto para Começar?

### 1️⃣ Agora

```bash
code samples/example.sh
# Shift + Alt + F
```

### 2️⃣ Próximo

```bash
cp samples/settings.example.json .vscode/settings.json
```

### 3️⃣ Depois

```bash
cp samples/.editorconfig ./
```
