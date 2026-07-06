# Ark Format

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Official monorepo for the **Ark Format** extensions for Visual Studio Code.
It brings together formatters for **Shell**, **PowerShell**, and **Makefile**, plus an extension pack and shared libraries.

🌍 **Languages:** ![USA Flag](https://flagcdn.com/w20/us.png) **English (this file)** · [![Brazil Flag](https://flagcdn.com/w20/br.png) Português](https://github.com/Tooark/vscode-ark-format/blob/main/README.pt-BR.md)

---

<img src="https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/packages/pack/assets/image.png" width="480" alt="Ark Format extension pack preview" />

---

## ✨ Overview

- 🎯 **Consistent formatting** for Shell, PowerShell, and Makefile
- 📦 **Packages split by responsibility** (formatters, pack, and shared code)
- 🧩 **Monorepo with pnpm workspaces** for unified build, test, and lint
- ⚡ **Fast development workflow** with VS Code tasks and debugging

---

## 📦 Packages

| Package                                              | Description                                                                                 |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| [packages/shell](packages/shell/README.md)           | Formatting extension for Shell (`.sh`, `.bash`, `.zsh`, `.ksh`, `.tcsh`, `.azcli`, `.bats`) |
| [packages/powershell](packages/powershell/README.md) | Formatting extension for PowerShell (`.ps1`, `.psm1`, `.psd1`)                              |
| [packages/makefile](packages/makefile/README.md)     | Formatting extension for Makefile (`Makefile`, `GNUmakefile`, `*.mk`)                       |
| [packages/pack](packages/pack/README.md)             | Extension Pack that installs Shell + PowerShell together                                    |
| [packages/shared](packages/shared)                   | Shared code across packages (lexer, indentation, utilities, and document processing)        |

---

## 🚀 Getting Started

Install dependencies at the repository root:

```bash
pnpm install
```

Build the monorepo:

```bash
pnpm run build
```

Watch mode for development:

```bash
pnpm run watch
```

Lint every package that provides the script:

```bash
pnpm run lint
```

---

## 🧪 Tests

Run the tests across the whole monorepo:

```bash
pnpm run test
```

Run the tests for a specific package (example: PowerShell):

```bash
cd packages/powershell
pnpm test
```

Generate coverage for a specific package (example: PowerShell):

```bash
cd packages/powershell
pnpm exec vitest run --coverage
```

---

## 📦 Packaging

Build the `.vsix` for every package that provides the script:

```bash
pnpm run package
```

---

## 🧩 Developing in VS Code

The `.vscode/` directory contains task and debug configurations to ease local development.

Recommended workflow:

1. Open the workspace in VS Code
2. Run the task `pnpm: watch shell` or `pnpm: watch powershell`
3. Press `F5` to launch the Extension Host and validate the extension locally

---

## 🤝 Contributing

- Read each package's README before opening a PR
- Follow the shared lint rules in `configs/eslint.base.mjs`
- Run build and tests locally before submitting changes

---

## 💖 Support

If this project helps your workflow, consider supporting its development:

- 💙 [GitHub Sponsors](https://github.com/sponsors/paulosfjunior)
- ☕ [Ko-fi](https://ko-fi.com/paulosfjunior)
- 💸 [PayPal](https://www.paypal.com/donate/?business=62KETU4PXBWZC&no_recurring=0&item_name=Ol%C3%A1%21+Sou+o+fundador+e+mantenedor+da+Tooark+%28tooark.com%29+%E2%80%94%0Aum+ecossistema+de+projetos+open+source.%0AObrigado+pelo+apoio%21+%F0%9F%92%9A&currency_code=BRL)

Every contribution helps keep the project maintained and improving. Thank you! 🙏

---

## 📝 License

This project is licensed under the [MIT License](LICENSE).
