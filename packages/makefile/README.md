# Ark Format: Makefile

[![Open VSX Version](https://img.shields.io/open-vsx/v/tooark/ark-format-makefile)](https://open-vsx.org/extension/tooark/ark-format-makefile)
[![Open VSX Downloads](https://img.shields.io/open-vsx/dt/tooark/ark-format-makefile)](https://open-vsx.org/extension/tooark/ark-format-makefile)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

A safe formatting extension for **Makefiles** (`Makefile`, `GNUmakefile`, `*.mk`) in **Visual Studio Code**.
Keep your Makefiles consistently formatted without ever breaking the strict whitespace rules of `make`.

🌍 **Languages:** ![USA Flag](https://flagcdn.com/w20/us.png) **English (this file)** · [![Brazil Flag](https://flagcdn.com/w20/br.png) Português](https://github.com/Tooark/vscode-ark-format/blob/main/packages/makefile/README.pt-BR.md)

---

## ✨ Features

- 🎯 **Full document formatting** — format entire files with a single command
- ✏️ **Selection formatting** — format only the selected text
- 🎛️ **Highly configurable** — control conditional indentation, spacing, and formatting behavior
- 🌍 **Multi-language UI** — English (EN) and Brazilian Portuguese (PT-BR)
- 📋 **.editorconfig support** — respects project configuration (optional)
- 🛡️ **Makefile-aware safety** — TAB recipe prefix and `define` blocks are never broken
- ⚡ **Optimized performance** — fast and lightweight processing

---

## 🛡️ Safety Invariants

Makefiles have strict whitespace semantics. The formatter is built around invariants that guarantee it never changes what `make` executes:

- **Recipe lines** (TAB-prefixed) keep their prefix and their body is never modified — recipe content belongs to the shell.
- **`define ... endef` blocks** are preserved verbatim.
- **Line continuations** (`\`) are preserved; only whitespace after the backslash is trimmed.
- **`.RECIPEPREFIX`**: if the file redefines the recipe prefix, the document is left untouched (TAB detection no longer applies).

---

## 🚀 Getting Started

### Install

- **Open VSX:** <https://open-vsx.org/extension/tooark/ark-format-makefile>
- **VS Code Marketplace:** <https://marketplace.visualstudio.com/items?itemName=tooark.ark-format-makefile>

Or inside VS Code:

1. Open **Extensions** (`Ctrl+Shift+X` / `Cmd+Shift+X`)
2. Search for **Ark Format: Makefile**
3. Click **Install**

---

## 🧩 How to Use

### Preview

![Ark Format Makefile - Settings](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/packages/makefile/media/makefile-settings.gif)

![Ark Format Makefile - Formatting](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/packages/makefile/media/makefile-using.gif)

### Format a Full Document

- Press **Shift+Alt+F** (Windows/Linux) or **Shift+Option+F** (Mac)
- Or use the command: `Editor: Format Document`

### Format a Selection

- Select the text you want to format
- Press **Ctrl+K Ctrl+F** (Windows/Linux) or **Cmd+K Cmd+F** (Mac)
- Or use the command: `Editor: Format Selection`

> Tip: You can set Ark Format as the default formatter for Makefile files to ensure consistent formatting on save.

---

## 📄 Supported File Types

- `Makefile` - standard Makefile
- `makefile` - lowercase Makefile
- `GNUmakefile` - GNU Makefile
- `*.mk` — Make include files

---

## ⚙️ Configuration

Customize the formatter in `settings.json`:

```json
{
  "arkFormatMakefile.enabled": true,
  "arkFormatMakefile.effectLanguages": ["makefile"],
  "arkFormatMakefile.useEditorConfig": false,
  "arkFormatMakefile.indentConditionals": true,
  "arkFormatMakefile.normalizeRecipePrefix": true,
  "arkFormatMakefile.alignAssignments": false,
  "arkFormatMakefile.indentSize": 2,
  "arkFormatMakefile.lineEnding": "LF",
  "arkFormatMakefile.trimTrailingWhitespace": true,
  "arkFormatMakefile.maxConsecutiveBlankLines": 1,
  "arkFormatMakefile.removeLeadingBlankLines": true,
  "arkFormatMakefile.insertFinalNewline": true,
  "arkFormatMakefile.collapseSpaces": true,
  "arkFormatMakefile.spacing.spaceAroundAssignment": true,
  "arkFormatMakefile.spacing.spaceAfterTargetColon": true,
  "arkFormatMakefile.spacing.spaceAfterCommentMarker": true,
  "arkFormatMakefile.rangeFormatting.enabled": true,
  "arkFormatMakefile.rangeFormatting.reindent": false,
  "arkFormatMakefile.rangeFormatting.useDocumentContext": true
}
```

### Description of Settings

| Option                               | Default        | Description                                                              |
| ------------------------------------ | -------------- | ------------------------------------------------------------------------ |
| `enabled`                            | `true`         | Enables or disables the extension                                        |
| `effectLanguages`                    | `["makefile"]` | Language IDs for which the formatter is active                           |
| `useEditorConfig`                    | `false`        | Uses `.editorconfig` file context for configuration                      |
| `indentConditionals`                 | `true`         | Indents conditional bodies (`ifeq`/`else`/`endif`) using spaces          |
| `normalizeRecipePrefix`              | `true`         | Converts space-indented recipe lines to the mandatory TAB prefix         |
| `alignAssignments`                   | `false`        | Aligns assignment operators in contiguous variable blocks                |
| `indentSize`                         | `2`            | Number of spaces per indentation level for conditional blocks            |
| `lineEnding`                         | `LF`           | Line break type (`Auto`, `LF`, `CRLF`)                                   |
| `trimTrailingWhitespace`             | `true`         | Removes trailing whitespace                                              |
| `maxConsecutiveBlankLines`           | `1`            | Maximum number of consecutive blank lines                                |
| `removeLeadingBlankLines`            | `true`         | Removes blank lines at the beginning of the file                         |
| `insertFinalNewline`                 | `true`         | Inserts a new line at the end of the file                                |
| `collapseSpaces`                     | `true`         | Collapses multiple spaces (never in recipes, comments, values, `define`) |
| `spacing.spaceAroundAssignment`      | `true`         | Adds a single space around assignment operators                          |
| `spacing.spaceAfterTargetColon`      | `true`         | Adds a single space after `:` in target declarations                     |
| `spacing.spaceAfterCommentMarker`    | `true`         | Adds a space between `#` and the comment text                            |
| `rangeFormatting.enabled`            | `true`         | Enables range formatting                                                 |
| `rangeFormatting.reindent`           | `false`        | Re-indents the selected range                                            |
| `rangeFormatting.useDocumentContext` | `true`         | Uses document context to compute base conditional depth for selection    |

---

## 💡 Tips & Best Practices

- Use **Selection Formatting** to adjust only specific parts without affecting the rest of the file
- Configure **.editorconfig** in your project to maintain consistency between tools
- Combine with other formatting extensions for a complete workflow

---

## 🤝 Contributing

- Open an issue: [Tooark/vscode-ark-format/issues](https://github.com/Tooark/vscode-ark-format/issues)
- Suggest improvements or report bugs with examples to help reproduction

---

## 💖 Support

If this extension helps your workflow, consider supporting its development:

- 💙 [GitHub Sponsors](https://github.com/sponsors/paulosfjunior)
- ☕ [Ko-fi](https://ko-fi.com/paulosfjunior)
- 💸 [PayPal](https://www.paypal.com/donate/?business=62KETU4PXBWZC&no_recurring=0&item_name=Ol%C3%A1%21+Sou+o+fundador+e+mantenedor+da+Tooark+%28tooark.com%29+%E2%80%94%0Aum+ecossistema+de+projetos+open+source.%0AObrigado+pelo+apoio%21+%F0%9F%92%9A&currency_code=BRL)

Every contribution helps keep the project maintained and improving. Thank you! 🙏

---

## 📝 License

This project is licensed under the [MIT License](LICENSE).
