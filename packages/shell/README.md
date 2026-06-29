# Ark Format: Shell

[![Open VSX Version](https://img.shields.io/open-vsx/v/tooark/ark-format-shell)](https://open-vsx.org/extension/tooark/ark-format-shell)
[![Open VSX Downloads](https://img.shields.io/open-vsx/dt/tooark/ark-format-shell)](https://open-vsx.org/extension/tooark/ark-format-shell)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

A robust formatting extension for **Shell scripts** (sh, bash, zsh, and more) in **Visual Studio Code**.  
Keep your scripts consistently formatted with flexible configuration and optional integration with **shfmt**.

🌍 **Languages:** ![USA Flag](https://flagcdn.com/w20/us.png) **English (this file)** · [![Brazil Flag](https://flagcdn.com/w20/br.png) Português](https://github.com/Tooark/vscode-ark-format/blob/main/packages/shell/README.pt-BR.md)

---

## ✨ Features

- 🎯 **Full document formatting** — format entire files with a single command
- ✏️ **Selection formatting** — format only the selected text
- 🎛️ **Highly configurable** — control indentation, spacing, and formatting behavior
- 🌍 **Multi-language UI** — English (EN) and Brazilian Portuguese (PT-BR)
- 📋 **.editorconfig support** — respects project configuration (optional)
- 🔌 **shfmt integration** — use shfmt as a formatting engine (optional)
- ⚡ **Optimized performance** — fast and lightweight processing

---

## 🚀 Getting Started

### Install

- **Open VSX:** https://open-vsx.org/extension/tooark/ark-format-shell
- **VS Code Marketplace:** https://marketplace.visualstudio.com/items?itemName=tooark.ark-format-shell

Or inside VS Code:

1. Open **Extensions** (`Ctrl+Shift+X` / `Cmd+Shift+X`)
2. Search for **Ark Format: Shell**
3. Click **Install**

---

## 🧩 How to Use

### Preview

![Ark Format Shell - Configurações](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/packages/shell/media/shell-settings.gif)

![Ark Format Shell - Formatando Código](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/packages/shell/media/shell-using.gif)

### Format a Full Document

- Press **Shift+Alt+F** (Windows/Linux) or **Shift+Option+F** (Mac)
- Or use the command: `Editor: Format Document`

### Format a Selection

- Select the text you want to format
- Press **Ctrl+K Ctrl+F** (Windows/Linux) or **Cmd+K Cmd+F** (Mac)
- Or use the command: `Editor: Format Selection`

> Tip: You can set Ark Format as the default formatter for Shell files to ensure consistent formatting on save.

---

## 📄 Supported File Types

- `.sh` — POSIX Shell
- `.bash` — Bash
- `.zsh` — Zsh
- `.ksh` — KornShell
- `.tcsh` — TCSH
- `.azcli` — Azure CLI
- `.bats` — BATS tests

---

## 🔧 shfmt Integration

You can configure Ark Format to use **[shfmt](https://github.com/mvdan/sh)** as the formatting engine.

Use this if:

- You already use shfmt in CI/CD
- You want standardized formatting across tools
- You prefer shfmt’s formatting rules

Example:

```json
{
  "arkFormatShell.engine": "shfmt"
}
```

## ⚙️ Configuration

Customize the behavior in `settings.json`. Available options:

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

### Description of Settings

| Option                               | Default    | Description                                                    |
| ------------------------------------ | ---------- | -------------------------------------------------------------- |
| `enabled`                            | `true`     | Enables or disables the extension                              |
| `indentSize`                         | `2`        | Number of spaces per indentation level                         |
| `indentStyle`                        | `space`    | Indentation type (`space` or `tab`)                            |
| `trimTrailingWhitespace`             | `true`     | Removes trailing whitespace                                    |
| `maxConsecutiveBlankLines`           | `1`        | Maximum number of consecutive blank lines                      |
| `removeLeadingBlankLines`            | `true`     | Removes leading blank lines                                    |
| `insertFinalNewline`                 | `true`     | Inserts a new line at the end of the file                      |
| `lineEnding`                         | `LF`       | Line break type (`Auto`, `LF`, `CRLF`)                         |
| `collapseSpaces`                     | `true`     | Converts multiple spaces into one                              |
| `spacing.spaceBeforeThenDo`          | `true`     | Adds space before `then` and `do`                              |
| `spacing.spaceAfterKeywords`         | `true`     | Adds space after keywords                                      |
| `spacing.spaceBeforeFunctionBrace`   | `true`     | Adds space before the function brace                           |
| `rangeFormatting.enabled`            | `true`     | Enables range formatting                                       |
| `rangeFormatting.reindent`           | `false`    | Reindents the selected range                                   |
| `rangeFormatting.useDocumentContext` | `true`     | Uses document context in formatting                            |
| `engine`                             | `internal` | Defines the formatting engine (`internal` or `shfmt`)          |
| `useEditorConfig`                    | `false`    | Uses the context of the `.editorconfig` file for configuration |

## 💡 Tips & Best Practices

- Use **Selection Formatting** to adjust only specific parts without affecting the rest of the file
- Configure **.editorconfig** in your project to maintain consistency between tools
- Combine with other formatting extensions for a complete workflow

## 📝 License

This project is licensed under the [MIT License](LICENSE).
