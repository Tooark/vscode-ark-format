# Contributing to Ark Format

First off, thank you for considering contributing to **Ark Format**! 🎉

This monorepo hosts the VS Code formatter extensions for **Shell**,
**PowerShell**, and **Makefile**, plus an extension pack (`pack`) and a shared
library (`shared`). This document explains how to propose changes, report bugs,
and submit code.

## Table of contents

- [Ways to contribute](#ways-to-contribute)
- [Repository layout](#repository-layout)
- [Development workflow](#development-workflow)
- [Commit convention](#commit-convention)
- [Developer Certificate of Origin (DCO)](#developer-certificate-of-origin-dco)
- [Coding standards](#coding-standards)
- [Releasing](#releasing)
- [Pull Request checklist](#pull-request-checklist)
- [Community](#community)

---

## Ways to contribute

- 🐛 **Report bugs** — open an issue with the `bug` template.
- ✨ **Suggest features** — open an issue with the `feature` template.
- 📖 **Improve documentation** — the READMEs and `notes/` are first-class.
- 🌍 **Translate** — help localize the extensions (`l10n/`, starting with `en`
  and `pt-BR`).
- 💻 **Write code** — pick an issue labeled `good first issue` or `help wanted`.

---

## Repository layout

This is a **pnpm workspace** (`pnpm-workspace.yaml`). Packages live under
`packages/`:

| Package               | Workspace filter            | Purpose                            |
| --------------------- | --------------------------- | ---------------------------------- |
| `packages/shell`      | `ark-format-shell`          | Shell formatter extension          |
| `packages/powershell` | `ark-format-powershell`     | PowerShell formatter extension     |
| `packages/makefile`   | `ark-format-makefile`       | Makefile formatter extension       |
| `packages/pack`       | `ark-format`                | Extension pack                     |
| `packages/shared`     | `@tooark/ark-format-shared` | Shared code used by the formatters |

---

## Development workflow

**Prerequisites:** Node 22+ and pnpm (the repo pins `packageManager` in
`package.json`; run `corepack enable` to match it).

1. **Fork** the repository and clone your fork.
2. Install dependencies from the repo root:

   ```bash
   pnpm install --frozen-lockfile
   ```

3. Create a feature branch: `git checkout -b feat/short-description`.
4. Make your changes with clear, small commits.
5. Run the checks (from the repo root — they fan out to every package):

   ```bash
   pnpm lint
   pnpm build
   pnpm test
   ```

   To work on a single package, use pnpm filters, e.g.
   `pnpm --filter ark-format-powershell test`.

6. **Sign off** every commit (see DCO section below).
7. Push and open a Pull Request against `main`.

> Tip: `pnpm watch` runs the build in watch mode across packages, and
> `pnpm test:watch` re-runs tests as you edit.

---

## Commit convention

We use [**Conventional Commits**](https://www.conventionalcommits.org/). The PR
title is validated by CI.

Format:

```text
<type>(<scope>): <short summary>
```

Allowed types:

| Type       | Purpose                                                 |
| ---------- | ------------------------------------------------------- |
| `feat`     | New feature                                             |
| `fix`      | Bug fix                                                 |
| `docs`     | Documentation only                                      |
| `style`    | Formatting (no code change)                             |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `perf`     | Performance improvement                                 |
| `test`     | Adding or fixing tests                                  |
| `build`    | Build system or dependencies                            |
| `ci`       | CI configuration                                        |
| `chore`    | Other changes not affecting src or tests                |
| `revert`   | Reverts a previous commit                               |

Use the package as the scope when it applies:

```text
feat(powershell): support here-string indentation
fix(shell): keep trailing comment alignment
docs(readme): update the compatibility table
```

---

## Developer Certificate of Origin (DCO)

Ark Format uses the [Developer Certificate of Origin](https://developercertificate.org/)
to certify that contributors have the right to submit their contributions under
the project's license (MIT).

Every commit **must** be signed off:

```bash
git commit -s -m "feat(powershell): support here-string indentation"
```

This appends a `Signed-off-by: Your Name <you@example.com>` line to the commit
message, using your `git config user.name` and `user.email`. A DCO CI check
blocks PRs with any commit missing the sign-off. To fix the most recent commit:

```bash
git commit --amend -s --no-edit
```

---

## Coding standards

- **TypeScript strict mode.** Shared `tsconfig`/ESLint bases live in `configs/`.
- **ESLint + Prettier-style formatting** via the flat config
  (`configs/eslint.base.mjs`). Run `pnpm lint` before pushing.
- **esbuild** bundles each extension (`esbuild.mjs` per package).
- **Vitest** for unit tests. New or changed behavior needs tests; formatter
  changes should include a before → after input sample.
- **Localization:** user-facing strings go through `l10n/` (`%key%` in
  `package.json`, bundles in `l10n/`). Keep `en` and `pt-BR` in sync.

---

## Releasing

Releases are **per package** and automated by
[`.github/workflows/publish.yml`](.github/workflows/publish.yml):

1. Bump the `version` in the package's `package.json`.
2. Update that package's `CHANGELOG.md`.
3. Add release notes at `notes/<pkg><version>.md` (e.g. `notes/powershell1.2.2.md`).
4. Merge to `main`. The workflow tags `<pkg><version>`, builds, scans, and
   publishes the `.vsix` to the Marketplace.

Do **not** hand-edit tags — the workflow derives them from `package.json`.

---

## Pull Request checklist

Before opening a PR, confirm:

- [ ] Commits follow Conventional Commits
- [ ] Every commit is signed off (`git commit -s`)
- [ ] `pnpm lint`, `pnpm build`, and `pnpm test` pass locally
- [ ] Tests cover the change
- [ ] Documentation is updated (README, package `CHANGELOG.md`, `notes/`)
- [ ] PR title follows Conventional Commits
- [ ] Linked to at least one issue (`Closes #123`)

---

## Community

- 💬 [GitHub Discussions](https://github.com/Tooark/vscode-ark-format/discussions)
- 🐛 [Issues](https://github.com/Tooark/vscode-ark-format/issues)
- 🌐 [Tooark](https://tooark.com)

Thank you for making Ark Format better! 💙
