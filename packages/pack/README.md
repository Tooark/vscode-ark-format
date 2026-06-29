# Ark Format

[![Open VSX Version](https://img.shields.io/open-vsx/v/tooark/ark-format)](https://open-vsx.org/extension/tooark/ark-format)
[![Open VSX Downloads](https://img.shields.io/open-vsx/dt/tooark/ark-format)](https://open-vsx.org/extension/tooark/ark-format)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

An extension pack that bundles the complete **Ark Format** family in a single install.
Format both **Shell** and **PowerShell** scripts consistently in Visual Studio Code.

🌍 **Languages:** ![USA Flag](https://flagcdn.com/w20/us.png) **English (this file)** · [![Brazil Flag](https://flagcdn.com/w20/br.png) Português](https://github.com/Tooark/vscode-ark-format/blob/main/packages/pack/README.pt-BR.md)

---

## ✨ Features

- 📦 **All-in-one install** — includes Shell and PowerShell formatters in one package
- 🎯 **Smart formatting** — full document and selection formatting support
- 🎛️ **Independent settings** — each formatter keeps its own configuration
- 🌍 **Multi-language UI** — English (EN) and Brazilian Portuguese (PT-BR)
- 📋 **.editorconfig support** — integrates with project-level conventions
- ⚡ **Fast setup** — install once and start formatting immediately

---

## 🚀 Getting Started

### Install

- **Open VSX:** https://open-vsx.org/extension/tooark/ark-format
- **VS Code Marketplace:** https://marketplace.visualstudio.com/items?itemName=tooark.ark-format

Or inside VS Code:

1. Open **Extensions** (`Ctrl+Shift+X` / `Cmd+Shift+X`)
2. Search for **Ark Format**
3. Click **Install**

---

## 📦 Included Extensions

| Extension                                                                                                                                                   | Description                                                                                                 |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| **Ark Format: Shell**<br>[VS Marketplace](https://marketplace.visualstudio.com/items?itemName=tooark.ark-format-shell) \| [Open VSX](https://open-vsx.org/extension/tooark/ark-format-shell)           | Formatter for Shell scripts (`.sh`, `.bash`, `.zsh`, `.ksh`, `.tcsh`, `.azcli`, `.bats`) with optional shfmt integration |
| **Ark Format: PowerShell**<br>[VS Marketplace](https://marketplace.visualstudio.com/items?itemName=tooark.ark-format-powershell) \| [Open VSX](https://open-vsx.org/extension/tooark/ark-format-powershell) | Formatter for PowerShell scripts (`.ps1`, `.psm1`, `.psd1`) with smart `param (...)` block indentation |

> Note: VS Code typically uses VS Marketplace, while VSCodium and compatible editors often use Open VSX.

---

## 🧩 How to Use

### Preview

<img src="https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/packages/pack/assets/image.png" width="480" alt="Ark Format extension pack preview" />

### Format a Full Document

- Press **Shift+Alt+F** (Windows/Linux) or **Shift+Option+F** (Mac)
- Or run: `Editor: Format Document`

### Format a Selection

- Select the text you want to format
- Press **Ctrl+K Ctrl+F** (Windows/Linux) or **Cmd+K Cmd+F** (Mac)
- Or run: `Editor: Format Selection`

> Tip: You can set language-specific default formatters for Shell and PowerShell for formatting on save.

---

## 🤔 Which One Should You Install?

| Scenario                                      | Recommended Extension      |
| --------------------------------------------- | -------------------------- |
| You work only with Shell                      | **Ark Format: Shell**      |
| You work only with PowerShell                 | **Ark Format: PowerShell** |
| You work with both or want full coverage      | **Ark Format** (this pack) |

---

## 💡 Tips & Best Practices

- Use this package when you want both formatters managed together
- Use individual extensions if your workspace only needs one language
- Check each formatter README for its complete configuration options

## 📝 License

This project is licensed under the [MIT License](LICENSE).
