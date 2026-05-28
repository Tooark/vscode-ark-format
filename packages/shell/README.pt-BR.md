# Ark Format: Shell

[![Open VSX Version](https://img.shields.io/open-vsx/v/tooark/ark-format-shell)](https://open-vsx.org/extension/tooark/ark-format-shell)
[![Open VSX Downloads](https://img.shields.io/open-vsx/dt/tooark/ark-format-shell)](https://open-vsx.org/extension/tooark/ark-format-shell)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Uma extensão robusta de formatação para **scripts Shell** (sh, bash, zsh e outros) no **Visual Studio Code**.  
Mantenha seus scripts formatados de forma consistente com configuração flexível e integração opcional com o **shfmt**.

🌍 **Idiomas:** [**English**](https://github.com/Tooark/vscode-ark-format/blob/main/packages/shell/README.md) | **Português (PT-BR)** (este arquivo)

---

## ✨ Recursos

- 🎯 **Formatação de documentos completos** - Formate arquivos inteiros com um único comando
- ✏️ **Formatação de seleções** - Formate apenas o texto selecionado
- 🎛️ **Configurações personalizáveis** - Controle cada aspecto da formatação
- 🌍 **Interface multilíngue** — Inglês (EN) e Português Brasileiro (PT-BR)
- 📋 **Suporte a .editorconfig** — respeita a configuração do projeto (opcional)
- 🔌 **Integração com shfmt** — use o shfmt como mecanismo de formatação (opcional)
- 🚀 **Performance otimizada** - Usa bundling moderno para máxima performance

---

## 🚀 Primeiros passos

### Instalação

- **Open VSX:** https://open-vsx.org/extension/tooark/ark-format-shell
- **VS Code Marketplace:** https://marketplace.visualstudio.com/items?itemName=tooark.ark-format-shell

Ou dentro do VS Code:

1. Abra **Extensões** (`Ctrl+Shift+X` / `Cmd+Shift+X`)
2. Procure por **Ark Format: Shell**
3. Clique em **Instalar**

---

## 🧩 Como usar

### Demonstração

![Ark Format Shell - Configurações](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/packages/shell/media/shell-settings.gif)

![Ark Format Shell - Formatando Código](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/packages/shell/media/shell-using.gif)

### Formatar Documento Completo

- Pressione **Shift+Alt+F** (Windows/Linux) ou **Shift+Option+F** (Mac)
- Ou use o comando: `Editor: Format Document`

### Formatar Seleção

- Selecione o texto que deseja formatar
- Pressione **Ctrl+K Ctrl+F** (Windows/Linux) ou **Cmd+K Cmd+F** (Mac)
- Ou use o comando: `Editor: Format Selection`

> Dica: você pode definir o Ark Format como formatador padrão para arquivos Shell e habilitar “format on save”.

---

## 📄 Tipos de arquivo suportados

- `.sh` — POSIX Shell
- `.bash` — Bash
- `.zsh` — Zsh
- `.ksh` — KornShell
- `.tcsh` — TCSH
- `.azcli` — Azure CLI
- `.bats` — BATS tests

---

## 🔧 Integração com shfmt

Você pode configurar o Ark Format para usar o **[shfmt](https://github.com/mvdan/sh)** como mecanismo de formatação.

Use isso se:

- Você já usa o shfmt em CI/CD
- Você deseja formatação padronizada entre as ferramentas
- Você prefere as regras de formatação do shfmt

Exemplo:

```json
{
  "arkFormatShell.engine": "shfmt"
}
```

## ⚙️ Configuração

Customize o comportamento no `settings.json`. Opções disponíveis:

```json
{
  "arkFormatShell.enabled": true,
  "arkFormatShell.indentSize": 2,
  "arkFormatShell.indentStyle": "space",
  "arkFormatShell.trimTrailingWhitespace": true,
  "arkFormatShell.maxConsecutiveBlankLines": 1,
  "arkFormatShell.removeLeadingBlankLines": true,
  "arkFormatShell.insertFinalNewline": true,
  "arkFormatShell.lineEnding": "LF",
  "arkFormatShell.collapseSpaces": true,
  "arkFormatShell.rangeFormatting.enabled": true,
  "arkFormatShell.rangeFormatting.reindent": false,
  "arkFormatShell.rangeFormatting.useDocumentContext": true
}
```

### Descrição das Configurações

| Opção                                | Padrão     | Descrição                                                 |
| ------------------------------------ | ---------- | --------------------------------------------------------- |
| `enabled`                            | `true`     | Ativa ou desativa a extensão                              |
| `indentSize`                         | `2`        | Número de espaços por nível de indentação                 |
| `indentStyle`                        | `space`    | Tipo de indentação (`space` ou `tab`)                     |
| `trimTrailingWhitespace`             | `true`     | Remove espaços em branco no final das linhas              |
| `maxConsecutiveBlankLines`           | `1`        | Máximo de linhas em branco consecutivas                   |
| `removeLeadingBlankLines`            | `true`     | Remove linhas em branco no início do arquivo              |
| `insertFinalNewline`                 | `true`     | Insere nova linha ao final do arquivo                     |
| `lineEnding`                         | `LF`       | Tipo de quebra de linha (`Auto`, `LF`, `CRLF`)            |
| `collapseSpaces`                     | `true`     | Converte múltiplos espaços em um                          |
| `spacing.spaceBeforeThenDo`          | `true`     | Adiciona espaço antes de `then` e `do`                    |
| `spacing.spaceAfterKeywords`         | `true`     | Adiciona espaço após palavras-chave                       |
| `spacing.spaceBeforeFunctionBrace`   | `true`     | Adiciona espaço antes da chave de função                  |
| `rangeFormatting.enabled`            | `true`     | Habilita formatação de intervalo                          |
| `rangeFormatting.reindent`           | `false`    | Reindenta o intervalo selecionado                         |
| `rangeFormatting.useDocumentContext` | `true`     | Usa contexto do documento na formatação                   |
| `engine`                             | `internal` | Define o engine de formatação (`internal` ou `shfmt`)     |
| `useEditorConfig`                    | `false`    | Usa contexto do arquivo `.editorconfig` para configuração |

## 💡 Dicas & Boas Práticas

- Use **Formatação de Seleção** para ajustar apenas partes específicas sem afetar o resto do arquivo
- Configure **.editorconfig** no seu projeto para manter consistência entre ferramentas
- Combine com outras extensões formatadoras para um workflow completo

## 📝 Licença

Este projeto está licenciado sob a [MIT License](LICENSE).
