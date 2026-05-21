# 📦 Manifest de Exemplos — ark-format-powershell

**Ordem sugerida:** 6 de 7 (complementar)  
**Anterior:** [`05-STRUCTURE.md`](https://github.com/Tooark/vscode-ark-format/blob/main/packages/powershell/samples/05-STRUCTURE.md)  
**Próximo:** [`07-FINAL-REPORT.md`](https://github.com/Tooark/vscode-ark-format/blob/main/packages/powershell/samples/07-FINAL-REPORT.md)

---

## 📋 Inventário Completo

### 🧪 Exemplos de Código (4 arquivos)

| Arquivo               | Tipo            | Objetivo                                  |
| --------------------- | --------------- | ----------------------------------------- |
| `example.ps1`         | Script          | Exemplo geral de sintaxe e estrutura      |
| `example.psm1`        | Módulo          | Organização de funções e exportações      |
| `example.psd1`        | Manifesto       | Metadados e configuração de módulo        |
| `example.complex.ps1` | Script avançado | Cenários robustos para validar formatação |

### ⚙️ Configuração (2 arquivos)

| Arquivo                 | Tipo | Objetivo                                  |
| ----------------------- | ---- | ----------------------------------------- |
| `.editorconfig`         | INI  | Padronização de indentação e fim de linha |
| `settings.example.json` | JSON | Configuração sugerida para VS Code        |

### 📖 Documentação (8 arquivos)

| Arquivo                   | Tipo     | Conteúdo                |
| ------------------------- | -------- | ----------------------- |
| `00-START-HERE.md`        | Markdown | Ponto de entrada        |
| `01-QUICK-START.md`       | Markdown | Início rápido           |
| `02-USER-GUIDE.md`        | Markdown | Guia completo           |
| `03-FEATURE-INDEX.md`     | Markdown | Índice por feature      |
| `04-TECHNICAL-SUMMARY.md` | Markdown | Resumo técnico          |
| `05-STRUCTURE.md`         | Markdown | Estrutura e navegação   |
| `06-MANIFEST.md`          | Markdown | Inventário e referência |
| `07-FINAL-REPORT.md`      | Markdown | Consolidação final      |

---

## 📊 Estatísticas

```plaintext
Total de arquivos: 14
Exemplos de código: 4
Arquivos de configuração: 2
Documentos: 8
```

---

## 🦾 Formatos Suportados por Arquivo

| Formato                      | Arquivo               | Finalidade                           |
| ---------------------------- | --------------------- | ------------------------------------ |
| PowerShell Script            | `example.ps1`         | Fluxo de script e estruturas básicas |
| PowerShell Module            | `example.psm1`        | Padrão de módulo reutilizável        |
| PowerShell Manifest          | `example.psd1`        | Metadados e dependências do módulo   |
| PowerShell Script (complexo) | `example.complex.ps1` | Testes avançados de formatação       |

---

## 📚 Guias de Documentação

### Para iniciantes

```plaintext
1. Ler: 01-QUICK-START.md
2. Abrir: example.ps1
3. Formatar no VS Code
```

### Para intermediários

```plaintext
1. Ler: 02-USER-GUIDE.md
2. Estudar: example.psm1
3. Validar: example.psd1
4. Aplicar: settings.example.json
```

### Para avançados

```plaintext
1. Ler: 04-TECHNICAL-SUMMARY.md
2. Consultar: 03-FEATURE-INDEX.md
3. Estudar: example.complex.ps1
4. Refinar: settings.example.json
```

---

## 🎯 Casos de Uso por Arquivo

### example.ps1

```plaintext
✓ Referência rápida para scripts
✓ Estruturas de controle
✓ Funções e parâmetros
```

### example.psm1

```plaintext
✓ Organização de módulo
✓ Separação de funções públicas/privadas
✓ Export-ModuleMember
```

### example.psd1

```plaintext
✓ Definição de metadados
✓ Estrutura de manifesto
✓ Compatibilidade de módulo
```

### example.complex.ps1

```plaintext
✓ Param multilinha com atributos [Parameter]
✓ Try/catch/finally
✓ Pipeline e tratamento de resultados
✓ Here-string e comentários de documentação
```

---

## 🔧 Configurações Incluídas

### .editorconfig

```plaintext
Aplica para: *.ps1, *.psm1, *.psd1

Configurações principais:
  • indent_style = space
  • indent_size = 4
  • end_of_line = lf
  • insert_final_newline = true
  • trim_trailing_whitespace = true
```

### settings.example.json

```plaintext
Inclui:
  • formatter padrão para powershell
  • formatação ao salvar
  • uso opcional de EditorConfig
  • opções de indentação, whitespace e line ending
  • configuração de range formatting com contexto
```

---

## ✨ Features por Arquivo

### example.ps1 (script simples)

- ✅ if/elseif/else
- ✅ switch
- ✅ loops
- ✅ funções

### example.psm1 (módulo simples)

- ✅ organização de módulo
- ✅ exportação de funções
- ✅ separação de responsabilidades

### example.psd1 (manifesto simples)

- ✅ hashtable de manifesto
- ✅ campos de versão e metadados
- ✅ definição de funções exportadas

### example.complex.ps1 (script avançado)

- ✅ `CmdletBinding`
- ✅ bloco `param (...)` multilinha
- ✅ tratamento de erro
- ✅ `PSCustomObject` e pipelines

---

## 🚀 Como usar este manifest

### Para exploração

```plaintext
1. Ler este arquivo
2. Escolher objetivo (script, módulo, manifesto)
3. Ir para 02-USER-GUIDE.md ou 01-QUICK-START.md
```

### Para referência

```plaintext
1. Ver se o exemplo certo existe
2. Conferir qual feature está em qual arquivo
3. Abrir o arquivo alvo e testar formatação
```

### Para aprendizado

```plaintext
1. Seguir a trilha iniciante/intermediário/avançado
2. Aplicar settings.example.json
3. Repetir testes com arquivos reais do projeto
```

---

## 🔗 Relações Entre Arquivos

```plaintext
06-MANIFEST.md (você está aqui)
    │
    ├─→ 01-QUICK-START.md (começo rápido)
    │    └─→ 02-USER-GUIDE.md (aprofundamento)
    │
    ├─→ 03-FEATURE-INDEX.md (mapa de features)
    │    └─→ example.* (escolha por caso de uso)
    │
    ├─→ 04-TECHNICAL-SUMMARY.md (visão técnica)
    │    └─→ example.complex.ps1
    │
    ├─→ settings.example.json (aplicar no VS Code)
    │    └─→ .editorconfig (padronizar projeto)
    │
    └─→ exemplo.* (abra no VS Code)
```
