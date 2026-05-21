# 🗂️ Estrutura de Exemplos — Visão Geral

**Ordem sugerida:** 5 de 7 (complementar)  
**Anterior:** [`04-TECHNICAL-SUMMARY.md`](https://github.com/Tooark/vscode-ark-format/blob/main/packages/powershell/samples/04-TECHNICAL-SUMMARY.md)  
**Próximo:** [`06-MANIFEST.md`](https://github.com/Tooark/vscode-ark-format/blob/main/packages/powershell/samples/06-MANIFEST.md)

## 📁 Árvore de Arquivos

```plaintext
samples/
│
├─── 📜 EXEMPLOS DE CÓDIGO (4 arquivos)
│    │
│    ├─ example.ps1             ← Script geral
│    ├─ example.psm1            ← Módulo PowerShell
│    ├─ example.psd1            ← Manifesto do módulo
│    └─ example.complex.ps1     ← Cenário robusto para teste
│
├─── ⚙️ CONFIGURAÇÃO (2 arquivos)
│    │
│    ├─ .editorconfig           ← Regras de formatação
│    └─ settings.example.json   ← Configuração recomendada do VS Code
│
├─── 📖 DOCUMENTAÇÃO (8 arquivos)
│    │
│    ├─ 00-START-HERE.md        ← 2 minutos
│    ├─ 01-QUICK-START.md       ← 5 minutos
│    ├─ 02-USER-GUIDE.md        ← Guia completo
│    ├─ 03-FEATURE-INDEX.md     ← Índice
│    ├─ 04-TECHNICAL-SUMMARY.md ← Técnico
│    ├─ 05-STRUCTURE.md         ← Estrutura e navegação (este arquivo)
│    ├─ 06-MANIFEST.md          ← Inventário completo
│    └─ 07-FINAL-REPORT.md      ← Guia de contribuição
│
└─── 📊 TOTAL: 14 arquivos
```

---

## 🎯 Fluxo de Navegação

### Para iniciantes

```plaintext
START
  │
  ├─→ 01-QUICK-START.md
  │     │
  │     ├─→ example.ps1
  │     │     │
  │     │     └─→ Shift+Alt+F (formatar)
  │     │
  │     └─→ 02-USER-GUIDE.md
  │
  └─→ FIM: Arquivo formatado com sucesso! 🎉
```

### Para intermediários

```plaintext
START
  │
  ├─→ 02-USER-GUIDE.md
  │     │
  │     ├─→ example.psm1 (módulo)
  │     ├─→ example.psd1 (manifesto)
  │     │
  │     └─→ settings.example.json
  │
  ├─→ .editorconfig
  │
  └─→ FIM: Setup completo com múltiplas linguagens ✅
```

### Para avançados

```plaintext
START
  │
  ├─→ 04-TECHNICAL-SUMMARY.md
  │     │
  │     ├─→ example.complex.ps1
  │     │
  │     └─→ 03-FEATURE-INDEX.md
  │
  ├─→ settings.example.json (customizar)
  │
  └─→ FIM: Domínio completo da extensão 🚀
```

---

## 📊 Matriz de Exemplos

### Por tipo de arquivo

| Tipo           | Arquivo        | Complexidade       |
| -------------- | -------------- | ------------------ |
| Script         | `.ps1`         | ⭐ Básico          |
| Módulo         | `.psm1`        | ⭐⭐ Intermediário |
| Manifesto      | `.psd1`        | ⭐⭐ Intermediário |
| Script robusto | `.complex.ps1` | ⭐⭐⭐ Avançado    |

### Por documentação

| Documento                 | Público alvo   |
| ------------------------- | -------------- |
| `01-QUICK-START.md`       | Iniciantes     |
| `02-USER-GUIDE.md`        | Todos          |
| `03-FEATURE-INDEX.md`     | Intermediários |
| `04-TECHNICAL-SUMMARY.md` | Avançados      |
| `05-STRUCTURE.md`         | Navegação      |
| `06-MANIFEST.md`          | Referência     |
| `07-FINAL-REPORT.md`      | Histórico      |

---

## 🚀 Caminhos de Uso

### Caminho 1: rápido

```plaintext
01-QUICK-START.md
     ↓
Abrir example.ps1
     ↓
Formatar (Shift+Alt+F)
     ↓
✅ Pronto
```

### Caminho 2: completo

```plaintext
02-USER-GUIDE.md
     ↓
Abrir example.psm1 e example.psd1
     ↓
Aplicar settings.example.json
     ↓
✅ Setup completo
```

### Caminho 3: avançado

```plaintext
04-TECHNICAL-SUMMARY.md
     ↓
Estudar example.complex.ps1
     ↓
Cruzar com 03-FEATURE-INDEX.md
     ↓
✅ Domínio técnico
```

---

## 🔗 Relação Entre Documentos

```plaintext
05-STRUCTURE.md ← VOCÊ ESTÁ AQUI
     │
     ├─ "Quero começar rápido" ─→ 01-QUICK-START.md
     │                                └→ 02-USER-GUIDE.md
     │
     ├─ "Quero ver funcionalidades" ─→ 03-FEATURE-INDEX.md
     │
     ├─ "Quero detalhes técnicos" ─→ 04-TECHNICAL-SUMMARY.md
     │
     └─ "Quero inventário completo" ─→ 06-MANIFEST.md
```

---

## 📋 Checklist de Exploração

### ✅ Documentação

```plaintext
□ Ler 01-QUICK-START.md
□ Ler 02-USER-GUIDE.md
□ Ler 03-FEATURE-INDEX.md
□ Ler 04-TECHNICAL-SUMMARY.md
□ Consultar 06-MANIFEST.md
```

### ✅ Código

```plaintext
□ Abrir example.ps1
□ Formatar e revisar saída
□ Abrir example.psm1
□ Validar manifesto example.psd1
□ Explorar example.complex.ps1
```

### ✅ Configuração

```plaintext
□ Copiar settings.example.json
□ Copiar .editorconfig
□ Definir formatter padrão para powershell
□ Testar com arquivo real
```

---

## 🌍 Compatibilidade

| Ambiente               | Suporte | Notas                            |
| ---------------------- | ------- | -------------------------------- |
| Windows PowerShell 5.1 | ✅ Sim  | Compatível com scripts clássicos |
| PowerShell 7+ (pwsh)   | ✅ Sim  | Recomendado para multiplataforma |
| VS Code                | ✅ Sim  | Formatter integrado              |

---

## 🚀 Para começar agora

### Opção 1: VS Code

```plaintext
Abrir samples/example.ps1
Shift + Alt + F
```

### Opção 2: módulo

```powershell
Import-Module ./samples/example.psm1 -Force
Test-ModuleManifest ./samples/example.psd1
```
