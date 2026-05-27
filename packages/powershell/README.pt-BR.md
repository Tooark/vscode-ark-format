# Ark Format: PowerShell

[![Open VSX Version](https://img.shields.io/open-vsx/v/tooark/ark-format-powershell)](https://open-vsx.org/extension/tooark/ark-format-powershell)
[![Open VSX Downloads](https://img.shields.io/open-vsx/dt/tooark/ark-format-powershell)](https://open-vsx.org/extension/tooark/ark-format-powershell)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Uma extensão poderosa de **formatação** para arquivos **PowerShell** no **Visual Studio Code** (`.ps1`, `.psm1`, `.psd1`).  
Automatize uma formatação consistente dos seus scripts com configurações flexíveis e suporte opcional a `.editorconfig`.

🌍 **Idiomas:** [**English**](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/packages/powershell/README.md) | **Português (PT-BR)** (este arquivo)

---

## ✨ Recursos

- 🎯 **Formatação inteligente** — formate documentos inteiros ou seleções com um único comando
- ✏️ **Formatação de seleção** — formate apenas o texto selecionado (range formatting)
- 📦 **Indentação do bloco `param (...)`** — indenta automaticamente blocos `param` multilinha
- 🎛️ **Altamente configurável** — ajuste indentação, espaçamentos, quebras de linha e mais
- 🌍 **Interface multilíngue** — Inglês (EN) e Português Brasileiro (PT-BR)
- 📋 **Integração com .editorconfig** — respeita preferências do projeto (opcional)
- ⚡ **Rápido e leve** — formatação instantânea com footprint mínimo

---

## 🚀 Primeiros passos

### Instalação

- **Open VSX:** https://open-vsx.org/extension/tooark/ark-format-powershell
- **VS Code Marketplace:** https://marketplace.visualstudio.com/items?itemName=tooark.ark-format-powershell

Ou pelo VS Code:

1. Abra **Extensões** (`Ctrl+Shift+X` / `Cmd+Shift+X`)
2. Pesquise por **Ark Format: PowerShell**
3. Clique em **Instalar**

---

## 🧩 Como Usar

### Demonstração

![Ark Format PowerShell - Configurações](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/packages/powershell/media/powershell-settings.gif)

![Ark Format PowerShell - Formatando Código](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/packages/powershell/media/powershell-using.gif)

### Formatar Documento Completo

- Pressione **Shift+Alt+F** (Windows/Linux) ou **Shift+Option+F** (Mac)
- Ou use o comando: `Editor: Format Document`

### Formatar Seleção

- Selecione o trecho que deseja formatar
- Pressione **Ctrl+K Ctrl+F** (Windows/Linux) ou **Cmd+K Cmd+F** (Mac)
- Ou execute: `Editor: Format Selection`

> Dica: você pode definir o Ark Format como formatador padrão do PowerShell e habilitar “format on save”.

---

## 📄 Tipos de Arquivo Suportados

- `.ps1` — PowerShell Script
- `.psm1` — PowerShell Module
- `.psd1` — PowerShell Module Manifest

## ⚙️ Configuração

Customize o comportamento no `settings.json`. Opções disponíveis:

```json
{
  "arkFormatPowerShell.enabled": true,
  "arkFormatPowerShell.indentSize": 2,
  "arkFormatPowerShell.indentStyle": "space",
  "arkFormatPowerShell.trimTrailingWhitespace": true,
  "arkFormatPowerShell.maxConsecutiveBlankLines": 1,
  "arkFormatPowerShell.removeLeadingBlankLines": true,
  "arkFormatPowerShell.insertFinalNewline": true,
  "arkFormatPowerShell.lineEnding": "CRLF",
  "arkFormatPowerShell.collapseSpaces": true,
  "arkFormatPowerShell.rangeFormatting.enabled": true,
  "arkFormatPowerShell.rangeFormatting.reindent": false,
  "arkFormatPowerShell.rangeFormatting.useDocumentContext": true
}
```

### Descrição das Configurações

| Opção                                | Padrão  | Descrição                                                 |
| ------------------------------------ | ------- | --------------------------------------------------------- |
| `enabled`                            | `true`  | Ativa ou desativa a extensão                              |
| `indentStyle`                        | `space` | Tipo de indentação (`space` ou `tab`)                     |
| `indentSize`                         | `2`     | Número de espaços por nível de indentação                 |
| `trimTrailingWhitespace`             | `true`  | Remove espaços em branco no final das linhas              |
| `maxConsecutiveBlankLines`           | `1`     | Máximo de linhas em branco consecutivas                   |
| `removeLeadingBlankLines`            | `true`  | Remove linhas em branco no início do arquivo              |
| `insertFinalNewline`                 | `true`  | Insere nova linha ao final do arquivo                     |
| `lineEnding`                         | `CRLF`  | Tipo de quebra de linha (`Auto`, `LF`, `CRLF`)            |
| `collapseSpaces`                     | `true`  | Converte múltiplos espaços em um                          |
| `rangeFormatting.enabled`            | `true`  | Habilita formatação de intervalo                          |
| `rangeFormatting.reindent`           | `false` | Reindenta o intervalo selecionado                         |
| `rangeFormatting.useDocumentContext` | `true`  | Usa contexto do documento na formatação                   |
| `useEditorConfig`                    | `false` | Usa contexto do arquivo `.editorconfig` para configuração |

## 💡 Dicas & Boas Práticas

- Use **Formatação de Seleção** para ajustar apenas partes específicas sem afetar o resto do arquivo
- Configure **.editorconfig** no seu projeto para manter consistência entre ferramentas
- Combine com outras extensões formatadoras para um workflow completo

## 📝 Licença

Este projeto está licenciado sob a [MIT License](LICENSE).
