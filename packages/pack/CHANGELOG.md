# Changelog

All notable changes to the `ark-format` package (extension pack) are documented here.

🌍 **Languages:** ![USA Flag](https://flagcdn.com/w20/us.png) **English (this file)** · [![Brazil Flag](https://flagcdn.com/w20/br.png) Português](https://github.com/Tooark/vscode-ark-format/blob/main/packages/pack/CHANGELOG.pt-BR.md)

## 1.1.2 - 2026-11-18

- Package version bumped from `1.1.1` to `1.1.2`.
- Changelog in English ([#24](https://github.com/Tooark/vscode-ark-format/discussions/24)): `CHANGELOG.md`, the file shown on the Marketplace, is now in English, and the Portuguese version moved to `CHANGELOG.pt-BR.md`, with a language switcher in both files, as in the README.
- Release notes in `notes/` are now bilingual (English and Portuguese), including those of previous versions.
- Extension pack aligned with the same documentation update in the extensions (`shell1.0.15`, `powershell1.2.5`, `makefile1.0.2`).
- No functional changes to the extension pack.
- Details: [notes/pack1.1.2.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/pack1.1.2.md)

## 1.1.1 - 2026-07-06

- Package version bumped from `1.1.0` to `1.1.1`.
- Added the `sponsor` field to the extension manifest, enabling the sponsor button (GitHub Sponsors) on the Marketplace page.
- Extension pack aligned with the extensions' update round (`shell1.0.12`, `powershell1.2.1`, `makefile1.0.1`): sponsor link in the manifests and regenerated demo GIFs.
- No functional changes to the extension pack.
- Details: [notes/pack1.1.1.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/pack1.1.1.md)

## 1.1.0 - 2026-07-05

- Package version bumped from `1.0.9` to `1.1.0`.
- Added the `tooark.ark-format-makefile` extension (initial version `1.0.0`) to the extension pack.
- The pack now installs the Shell, PowerShell and Makefile formatters together.
- Updated the READMEs (EN/PT-BR) and keywords to reflect Makefile support.
- Support section added to the READMEs (EN/PT-BR).
- Details: [notes/pack1.1.0.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/pack1.1.0.md)

## 1.0.9 - 2026-06-27

- Package version bumped from `1.0.8` to `1.0.9`.
- Extension pack aligned with the formatters' security maintenance round (`ark-format-shell` and `ark-format-powershell` with vulnerable dependencies from Dependabot alerts updated).
- No extension pack configuration changes beyond the release alignment.
- Details: [notes/pack1.0.9.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/pack1.0.9.md)

## 1.0.8 - 2026-05-31

- Package version bumped from `1.0.7` to `1.0.8`.
- Extension pack aligned with the formatters' maintenance release:
  - Shell with fixes for inline `fi` and nested `case`.
  - PowerShell with strengthened regression coverage for analogous scenarios.
- No additional functional changes to the extension pack beyond the release alignment.
- Details: [notes/pack1.0.8.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/pack1.0.8.md)

## 1.0.7 - 2026-05-31

- Package version bumped from `1.0.6` to `1.0.7`.
- Publishing pipeline adjusted to stop passing the token explicitly in the `vsce` and `ovsx` calls, reducing exposure of secrets on the command line.
- Details: [notes/pack1.0.7.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/pack1.0.7.md)

## 1.0.6 - 2026-05-27

- Bilingual documentation adjustment: README language links moved from `raw.githubusercontent.com` to `github.com/.../blob/...`.
- Package version bumped from `1.0.5` to `1.0.6`.
- Security hardening in the build/publish workspace: `tmp` overridden to `>=0.2.6` in the monorepo lockfile.
- Details: [notes/pack1.0.6.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/pack1.0.6.md)

## 1.0.5 - 2026-05-27

- Complete restructuring of the extension pack README to the new documentation standard.
- Added `README.pt-BR.md` with EN/PT-BR language navigation.
- Improved presentation of the install links (VS Marketplace and Open VSX).
- Package description aligned with the purpose of the extension pack (Shell + PowerShell).
- Package version bumped from `1.0.4` to `1.0.5`.
- Details: [notes/pack1.0.5.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/pack1.0.5.md)

## 1.0.4 - 2026-05-23

- Extension pack version aligned with the Shell and PowerShell releases.
- Workspace dependency update (`qs` to `6.15.2`).
- Package version bumped from `1.0.3` to `1.0.4`.
- Details: [notes/pack1.0.4.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/pack1.0.4.md)

## 1.0.3 - 2026-05-22

- README updated with install links for VS Marketplace and Open VSX.
- Added a compatibility note covering VS Code and VSCodium/compatible editors.
- Removed the Author section from the README.
- Package version bumped from `1.0.2` to `1.0.3`.
- Details: [notes/pack1.0.3.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/pack1.0.3.md)

## 1.0.2 - 2026-05-21

- Version aligned with the related packages (`ark-format-shell` and `ark-format-powershell`).
- Package version bumped from `1.0.1` to `1.0.2`.
- Details: [notes/pack1.0.2.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/pack1.0.2.md)

## 1.0.1 - 2026-05-21

- README image link updated to an absolute URL in the repository.
- Visual tweaks to the README author section (avatar and spacing).
- Package version bumped from `1.0.0` to `1.0.1`.
- Details: [notes/pack1.0.1.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/pack1.0.1.md)

## 1.0.0 - 2026-05-21

- First version of the Ark Format extension pack.
- Installs the Shell and PowerShell formatters together.
- Details: [notes/pack1.0.0.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/pack1.0.0.md)
