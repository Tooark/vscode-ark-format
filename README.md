# Ark Format

[![CI](https://github.com/Tooark/vscode-ark-format/actions/workflows/ci.yml/badge.svg)](https://github.com/Tooark/vscode-ark-format/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![GitHub Sponsors](https://img.shields.io/badge/GitHub%20Sponsors-sponsor-EA4AAA?logo=githubsponsors&logoColor=white)](https://github.com/sponsors/paulosfjunior)
[![Ko-fi](https://img.shields.io/badge/Ko--fi-support-FF5E5B?logo=kofi&logoColor=white)](https://ko-fi.com/paulosfjunior)

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

| Package | Version | Installs | Description |
| --- | --- | --- | --- |
| [packages/shell](packages/shell/README.md) | [![Version][shell-v]][shell-mp] | [![Installs][shell-i]][shell-mp] | Formatting extension for Shell (`.sh`, `.bash`, `.zsh`, `.ksh`, `.tcsh`, `.azcli`, `.bats`) |
| [packages/powershell](packages/powershell/README.md) | [![Version][powershell-v]][powershell-mp] | [![Installs][powershell-i]][powershell-mp] | Formatting extension for PowerShell (`.ps1`, `.psm1`, `.psd1`) |
| [packages/makefile](packages/makefile/README.md) | [![Version][makefile-v]][makefile-mp] | [![Installs][makefile-i]][makefile-mp] | Formatting extension for Makefile (`Makefile`, `GNUmakefile`, `*.mk`) |
| [packages/pack](packages/pack/README.md) | [![Version][pack-v]][pack-mp] | [![Installs][pack-i]][pack-mp] | Extension Pack that installs Shell + PowerShell together |
| [packages/shared](packages/shared) | ![Internal][internal-badge] | — | Shared code across packages (lexer, indentation, utilities, and document processing) |

[shell-v]: https://img.shields.io/visual-studio-marketplace/v/tooark.ark-format-shell?label=version
[shell-i]: https://img.shields.io/visual-studio-marketplace/i/tooark.ark-format-shell?label=installs
[shell-mp]: https://marketplace.visualstudio.com/items?itemName=tooark.ark-format-shell
[powershell-v]: https://img.shields.io/visual-studio-marketplace/v/tooark.ark-format-powershell?label=version
[powershell-i]: https://img.shields.io/visual-studio-marketplace/i/tooark.ark-format-powershell?label=installs
[powershell-mp]: https://marketplace.visualstudio.com/items?itemName=tooark.ark-format-powershell
[makefile-v]: https://img.shields.io/visual-studio-marketplace/v/tooark.ark-format-makefile?label=version
[makefile-i]: https://img.shields.io/visual-studio-marketplace/i/tooark.ark-format-makefile?label=installs
[makefile-mp]: https://marketplace.visualstudio.com/items?itemName=tooark.ark-format-makefile
[pack-v]: https://img.shields.io/visual-studio-marketplace/v/tooark.ark-format?label=version
[pack-i]: https://img.shields.io/visual-studio-marketplace/i/tooark.ark-format?label=installs
[pack-mp]: https://marketplace.visualstudio.com/items?itemName=tooark.ark-format
[internal-badge]: https://img.shields.io/badge/internal-not%20published-lightgrey

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
2. Run the task `pnpm: watch shell`, `pnpm: watch powershell` or `pnpm: watch makefile` to start the watch mode for the desired package
3. Press `F5` to launch the Extension Host and validate the extension locally

---

## 🤝 Contributing

Contributions are welcome! Start with [CONTRIBUTING.md](CONTRIBUTING.md) — it covers
the repository layout, the development workflow, the commit convention, the DCO
sign-off requirement, and the release process.

Quick notes:

- Read each package's README before opening a PR
- Follow the shared lint rules in `configs/eslint.base.mjs`
- Run build and tests locally before submitting changes
- Sign off every commit (`git commit -s`) — a CI check enforces it

By participating you agree to the [Code of Conduct](CODE_OF_CONDUCT.md).

---

## 🆘 Help & Security

- ❓ **Questions, bugs, feature ideas** — see [SUPPORT.md](SUPPORT.md) for the right channel
- 🔒 **Security vulnerabilities** — do **not** open a public issue; follow [SECURITY.md](SECURITY.md)

---

## 💖 Support

If this project helps your workflow, consider supporting its development:

- 💙 [GitHub Sponsors](https://github.com/sponsors/paulosfjunior)
- ☕ [Ko-fi](https://ko-fi.com/paulosfjunior)

Every contribution helps keep the project maintained and improving. Thank you! 🙏

---

## 📝 License

This project is licensed under the [MIT License](LICENSE).
