# Changelog

All notable changes to the `ark-format-shell` package are documented here.

🌍 **Languages:** ![USA Flag](https://flagcdn.com/w20/us.png) **English (this file)** · [![Brazil Flag](https://flagcdn.com/w20/br.png) Português](https://github.com/Tooark/vscode-ark-format/blob/main/packages/shell/CHANGELOG.pt-BR.md)

## 1.0.15 - 2026-11-18

- Package version bumped from `1.0.14` to `1.0.15`.
- Changelog in English ([#24](https://github.com/Tooark/vscode-ark-format/discussions/24)): `CHANGELOG.md`, the file shown on the Marketplace, is now in English, and the Portuguese version moved to `CHANGELOG.pt-BR.md`, with a language switcher in both files, as in the README.
- Release notes in `notes/` are now bilingual (English and Portuguese), including those of previous versions.
- No functional changes to the formatting engine.
- Details: [notes/shell1.0.15.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/shell1.0.15.md)

## 1.0.14 - 2026-11-16

- Package version bumped from `1.0.13` to `1.0.14`.
- Fix ([#34](https://github.com/Tooark/vscode-ark-format/issues/34)): the formatter deleted the lines following a double-quoted command substitution containing nested quotes, such as `x="$(echo '"Hello"' | tr -d '"')"`. The lexer now treats `$(...)` inside double quotes as a new quoting context, as Bash does, including balanced parentheses, `$((...))`, escapes, comments, heredocs and here-strings inside the substitution, and multi-line substitutions.
- Fix: escaped quotes outside strings (`it\'s`, `\"texto\"`, `(*\'*)`) no longer open a string by mistake.
- Fix: the body and delimiter of a heredoc declared inside a multi-line `"$(...)"` in an indented block were reindented, breaking the script. They are now preserved as in the original.
- Fix: heredoc detection in regular code. The delimiter is now the whole word, as in Bash (`<<END-MSG`, `<<'END MSG'`, `<<\EOF`, `<<E"O"F`), and the here-string `<<<`, the `<<` shift in arithmetic expressions and `<<` in comments are no longer treated as heredocs. Previously, these cases left the rest of the file unformatted or formatted the heredoc body as code.
- Data-loss protection: if a string stays open until the end of the file, the pending lines are now preserved unchanged instead of discarded.
- Example `samples/example.bash` with the issue cases and a heredoc inside `"$(...)"`; fixed the example's process substitution (`done < <(...)`).
- New regression tests for the issue cases, nested quotes, heredocs, escaped quotes and a string left open until the end of the file.
- Details: [notes/shell1.0.14.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/shell1.0.14.md)

## 1.0.13 - 2026-09-13

- Package version bumped from `1.0.12` to `1.0.13`.
- Fix: spacing rules were also applied to comment text (`#`). `collapseSpaces` removed column-alignment spaces (e.g. `Usage:`/`Env:` blocks in script headers) and the keyword rules changed code quoted in comments (`for(` → `for (`, `if[` → `if [`, `;then` → `; then`).
- Comment text is now preserved verbatim; the rules still apply to the code before it, the space between the code and the `#` of an inline comment is still collapsed, and the space after the marker (`#texto` → `# texto`) is still normalized.
- New regression tests: alignment in full-line and inline comments, code quoted in a comment, and a script header as a fixed point of the formatter.
- Details: [notes/shell1.0.13.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/shell1.0.13.md)

## 1.0.12 - 2026-07-06

- Package version bumped from `1.0.11` to `1.0.12`.
- Added the `sponsor` field to the extension manifest, enabling the sponsor button (GitHub Sponsors) on the Marketplace page.
- README demo GIFs regenerated (`shell-settings.gif` and `shell-using.gif`) with updated, higher-quality captures.
- No functional changes to the formatting engine.
- Details: [notes/shell1.0.12.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/shell1.0.12.md)

## 1.0.11 - 2026-07-05

- Fix in selection formatting (range formatting): multi-line strings are now tracked as in the document formatter — literal content is preserved without reprocessing, and keywords inside strings (e.g. `do`, `then`) no longer change the indentation of the following lines.
- Fix in selection formatting: heredoc content is also preserved in no-reindent mode (previously its spaces were collapsed).
- Fix in the base context level calculation (`rangeFormatting.useDocumentContext`): lines before the selection are now analyzed only by their code parts, ignoring string content.
- Internal refactoring with no behavior change: edit and spacing helpers promoted to the shared package (`@tooark/ark-format-shared/edits` and `/spacing`) and unused code removed.
- New tests: selection formatting regressions and extension-layer tests (activation, providers, `shfmt` engine and protection of `shfmt.path`/`shfmt.flags` against workspace scopes).
- Support section added to the READMEs (EN/PT-BR).
- Package version bumped from `1.0.10` to `1.0.11`.
- Details: [notes/shell1.0.11.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/shell1.0.11.md)

## 1.0.10 - 2026-07-05

- Package version bumped from `1.0.9` to `1.0.10`.
- Extension description updated to reflect support for Shell scripts (`.sh`, `.bash`, `.bats`, `.zsh`).
- Description adjusted to state support for the `internal` and `shfmt` engines explicitly.
- No functional changes to the formatting engine.
- Details: [notes/shell1.0.10.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/shell1.0.10.md)

## 1.0.9 - 2026-06-27

- Package version bumped from `1.0.8` to `1.0.9`.
- Dependency security maintenance round (Dependabot alerts) applied via `overrides` in the workspace.
- No functional changes to the formatting engine.
- Details: [notes/shell1.0.9.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/shell1.0.9.md)

## 1.0.8 - 2026-05-31

- Package version bumped from `1.0.7` to `1.0.8`.
- Indentation fix for an inline `if` closed with `fi`/`endif` on the same line (e.g. `return; fi`), preventing drift in the next sibling block.
- Context fix for nested `case`, correctly preserving labels and `;;` terminators in the outer `case` after an inner `esac`.
- Regression tests added for inline `fi` and nested `case` scenarios.
- Complex sample updated with a dedicated nested `case` scenario for manual validation.
- Details: [notes/shell1.0.8.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/shell1.0.8.md)

## 1.0.7 - 2026-05-31

- Package version bumped from `1.0.6` to `1.0.7`.
- Security hardening in the `shfmt` integration: the `arkFormatShell.shfmt.path` and `arkFormatShell.shfmt.flags` settings now ignore the `workspace` and `workspaceFolder` scopes, honoring only user-level values.
- Activation log removed from `activate`, reducing noise in the extension host.
- Publishing pipeline adjusted to stop passing the token explicitly in the `vsce` and `ovsx` calls.
- Details: [notes/shell1.0.7.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/shell1.0.7.md)

## 1.0.6 - 2026-05-27

- Bilingual documentation adjustment: README language links moved from `raw.githubusercontent.com` to `github.com/.../blob/...`.
- Package version bumped from `1.0.5` to `1.0.6`.
- Security hardening in the build/publish workspace: `tmp` overridden to `>=0.2.6` in the monorepo lockfile.
- Details: [notes/shell1.0.6.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/shell1.0.6.md)

## 1.0.5 - 2026-05-27

- Complete README restructuring to the new documentation standard.
- Added `README.pt-BR.md` with EN/PT-BR language navigation.
- Documentation consistency fixes (`lineEnding` and the Shell usage tip).
- Package version bumped from `1.0.4` to `1.0.5`.
- Details: [notes/shell1.0.5.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/shell1.0.5.md)

## 1.0.4 - 2026-05-23

- Indentation engine fixes for `if/elif/else` blocks and inline `case` branches (`;;`, `;&`, `;;&`).
- Regression tests added for the fixed scenarios.
- Cleanup of unused commands in the manifest and localization files.
- Workspace dependency update (`qs` to `6.15.2`).
- Package version bumped from `1.0.3` to `1.0.4`.
- Details: [notes/shell1.0.4.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/shell1.0.4.md)

## 1.0.3 - 2026-05-22

- Documentation reviewed to reflect the extension's actual defaults.
- Author section removed from the README.
- Package version bumped from `1.0.2` to `1.0.3`.
- Details: [notes/shell1.0.3.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/shell1.0.3.md)

## 1.0.2 - 2026-05-21

- New formatting rule for multi-line commands with `\` inside `"$(...)"`.
- VS Code integration fix removing `contributes.languages` (avoids affecting syntax highlighting).
- Package version bumped from `1.0.1` to `1.0.2`.
- Details: [notes/shell1.0.2.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/shell1.0.2.md)

## 1.0.1 - 2026-05-21

- Added missing command translations to `package.nls.json`.
- Visual tweaks to the README author section (avatar and spacing).
- Package version bumped from `1.0.0` to `1.0.1`.
- Details: [notes/shell1.0.1.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/shell1.0.1.md)

## 1.0.0 - 2026-05-21

- First stable release of the Shell formatter.
- Support for the internal engine and optional `shfmt` integration.
- Support for full document and selection formatting, indentation rules and `.editorconfig`.
- Details: [notes/shell1.0.0.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/shell1.0.0.md)
