# Ark Format: PowerShell

**Ark Format: PowerShell** é uma extensão de formatação potente para arquivos PowerShell (.ps1, .psm1, .psd1) no Visual Studio Code. Automatize a formatação consistente de seus scripts com configurações flexíveis.

## ✨ Recursos

- 🎯 **Formatação inteligente** - Formate documentos completos ou apenas seleções com um único comando
- ✏️ **Formatação de seleções** - Formate apenas o texto selecionado
- 📦 **Indentação de bloco param** - Indenta automaticamente blocos `param (...)` multilinha
- 🎛️ **Altamente configurável** - Personalize cada aspecto: indentação, espaçamento, quebras de linha
- 🌍 **Multilíngue** - Suporte completo em Inglês (EN) e Português Brasileiro (PT-BR)
- 📋 **Integração .editorconfig** - Respeita as configurações do projeto
- ⚡ **Rápido e leve** - Processamento instantâneo com footprint mínimo

## 📺 Como Usar

### Instalação Rápida

1. Abra o VS Code
2. Acesse **Extensões** (Ctrl+Shift+X / Cmd+Shift+X)
3. Procure por **"Ark Format: PowerShell"**
4. Clique em **Instalar**

### Usando a Extensão

**Veja como funciona:**

![Ark Format PowerShell - Configurações](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/packages/powershell/media/powershell-settings.gif)

![Ark Format PowerShell - Formatando Código](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/packages/powershell/media/powershell-using.gif)

#### Formatar Documento Completo

- Pressione **Shift+Alt+F** (Windows/Linux) ou **Shift+Option+F** (Mac)
- Ou use o comando: `Editor: Format Document`

#### Formatar Seleção

- Selecione o texto que deseja formatar
- Pressione **Ctrl+K Ctrl+F** (Windows/Linux) ou **Cmd+K Cmd+F** (Mac)
- Ou use o comando: `Editor: Format Selection`

#### Personalizando

Acesse `File > Preferences > Settings > Ark Format: PowerShell` para ajustar as configurações conforme necessário.

## 📄 Extensões Suportadas

- `.ps1` - PowerShell Script
- `.psm1` - PowerShell Module
- `.psd1` - PowerShell Module Manifest

## ⚙️ Configuração

Customize o comportamento no `settings.json`. Opções disponíveis:

```json
{
  "arkFormatPowerShell.enabled": true,
  "arkFormatPowerShell.indentSize": 4,
  "arkFormatPowerShell.indentStyle": "space",
  "arkFormatPowerShell.trimTrailingWhitespace": true,
  "arkFormatPowerShell.maxConsecutiveBlankLines": 1,
  "arkFormatPowerShell.removeLeadingBlankLines": true,
  "arkFormatPowerShell.insertFinalNewline": true,
  "arkFormatPowerShell.lineEnding": "Auto",
  "arkFormatPowerShell.collapseSpaces": true,
  "arkFormatPowerShell.rangeFormatting.enabled": true,
  "arkFormatPowerShell.rangeFormatting.reindent": false,
  "arkFormatPowerShell.rangeFormatting.useDocumentContext": true
}
```

### Descrição das Configurações

| Opção                                | Padrão  | Descrição                                      |
| ------------------------------------ | ------- | ---------------------------------------------- |
| `enabled`                            | `true`  | Ativa ou desativa a extensão                   |
| `indentSize`                         | `4`     | Número de espaços por nível de indentação      |
| `indentStyle`                        | `space` | Tipo de indentação (`space` ou `tab`)          |
| `trimTrailingWhitespace`             | `true`  | Remove espaços em branco no final das linhas   |
| `maxConsecutiveBlankLines`           | `1`     | Máximo de linhas em branco consecutivas        |
| `removeLeadingBlankLines`            | `true`  | Remove linhas em branco no início do arquivo   |
| `insertFinalNewline`                 | `true`  | Insere nova linha ao final do arquivo          |
| `lineEnding`                         | `Auto`  | Tipo de quebra de linha (`Auto`, `LF`, `CRLF`) |
| `collapseSpaces`                     | `true`  | Converte múltiplos espaços em um               |
| `rangeFormatting.enabled`            | `true`  | Habilita formatação de intervalo               |
| `rangeFormatting.reindent`           | `false` | Reindenta o intervalo selecionado              |
| `rangeFormatting.useDocumentContext` | `true`  | Usa contexto do documento na formatação        |

## 📝 Licença

Este projeto está licenciado sob a [MIT License](LICENSE).
