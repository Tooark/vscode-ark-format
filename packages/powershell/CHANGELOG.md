# Changelog

All notable changes to the `ark-format-powershell` package are documented here.

🌍 **Languages:** ![USA Flag](https://flagcdn.com/w20/us.png) **English (this file)** · [![Brazil Flag](https://flagcdn.com/w20/br.png) Português](https://github.com/Tooark/vscode-ark-format/blob/main/packages/powershell/CHANGELOG.pt-BR.md)

## 1.2.5 - 2026-11-18

- Package version bumped from `1.2.4` to `1.2.5`.
- Changelog in English ([#24](https://github.com/Tooark/vscode-ark-format/discussions/24)): `CHANGELOG.md`, the file shown on the Marketplace, is now in English, and the Portuguese version moved to `CHANGELOG.pt-BR.md`, with a language switcher in both files, as in the README.
- Release notes in `notes/` are now bilingual (English and Portuguese), including those of previous versions.
- No functional changes to the formatting engine.
- Details: [notes/powershell1.2.5.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/powershell1.2.5.md)

## 1.2.4 - 2026-11-16

- Package version bumped from `1.2.3` to `1.2.4`.
- Fix (PowerShell equivalent of [#34](https://github.com/Tooark/vscode-ark-format/issues/34)): the formatter deleted, or stopped formatting, the lines following a string with quotes inside a subexpression, such as `Write-Host "Nome: $($user.Name.Trim('"'))"`. The lexer now treats `$(...)` inside double quotes as a new quoting context, including balanced parentheses, backtick escapes, comments, nested here-strings (preserved without reindentation) and multi-line subexpressions.
- Fix: backtick-escaped quotes outside strings (`` `" `` and `` `' ``) no longer open a string by mistake.
- Data-loss protection: if a string stays open until the end of the file, the pending lines are now preserved unchanged instead of discarded.
- Example `samples/example.complex.ps1` with subexpressions containing nested quotes.
- New regression tests for nested quotes in subexpressions, nested here-strings, escaped quotes and a string left open until the end of the file.
- Details: [notes/powershell1.2.4.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/powershell1.2.4.md)

## 1.2.3 - 2026-09-13

- Package version bumped from `1.2.2` to `1.2.3`.
- Fix: spacing rules were also applied to the text of line comments (`#`). `collapseSpaces` removed column-alignment spaces (e.g. `Uso:`/`Env:` blocks in script headers), and the opening-brace rule changed code quoted in comments (`function Test{` → `function Test {`, `if ($x){` → `if ($x) {`).
- Comment text is now preserved literally; the rules still apply to the code that precedes it, the space between the code and the `#` of an inline comment is still collapsed, the space after the marker (`#texto` → `# texto`) is still normalized, and `#>` is still preserved. Block comments (`<# ... #>`) were already exempt from these rules and remain governed by `formatBlockComments`.
- New regression tests: alignment in full-line and inline comments, code quoted in a comment, backtick-escaped `#`, and a script header as a fixed point of the formatter.
- Details: [notes/powershell1.2.3.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/powershell1.2.3.md)

## 1.2.2 - 2026-07-20

- Package version bumped from `1.2.1` to `1.2.2`.
- Fix: indented here-strings (`@' ... '@` and `@" ... "@`, inside `if`, `function`, `try`, etc.) were no longer preserved — the block indentation was applied to the body and to the terminator (`'@`/`"@`), which must stay at column 0. The result broke the script and corrupted the literal content (e.g. C# in `Add-Type -TypeDefinition`).
- Here-strings are now handled by the heredoc mechanism and preserved verbatim: the body is kept byte for byte and the terminator stays at column 0, whatever the indentation of the opening line.
- Here-string detection rewritten on top of `getQuoteModeAfterLine`, correctly recognizing the `@'`/`@"` openers. PowerShell-specific fix; the Shell formatter is unchanged.
- New regression tests for indented here-strings (verbatim content, terminator at column 0 and idempotence).
- Details: [notes/powershell1.2.2.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/powershell1.2.2.md)

## 1.2.1 - 2026-07-06

- Package version bumped from `1.2.0` to `1.2.1`.
- Added the `sponsor` field to the extension manifest, enabling the sponsor button (GitHub Sponsors) on the Marketplace page.
- README demo GIFs regenerated (`powershell-settings.gif` and `powershell-using.gif`) with updated, higher-quality captures.
- No functional changes to the formatting engine.
- Details: [notes/powershell1.2.1.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/powershell1.2.1.md)

## 1.2.0 - 2026-07-05

- New `arkFormatPowerShell.alignAssignments` option (default `false`) for vertical alignment of assignment operators (`=`, `+=`, `-=`, `*=`, `/=`, `%=`, `??=`) in contiguous blocks of variable assignments (`$var = ...`) and hashtable entries (`Chave = valor`).
  - Alignment on the operator's final `=` character, computed per line (the widest line sets the block's column).
  - Blocks end at a blank line, a comment or another statement; different indentation levels are aligned separately.
  - The content of here-strings (`@' '@`, `@" "@`) and comment blocks (`<# #>`) is never changed; backtick/pipe continuations do not break the block.
  - Compatible with all line endings (`LF`, `CRLF` and `Auto`), preserving the configured line ending.
  - When disabled (the default), `collapseSpaces` normalizes existing alignment to 1 space.
- Indentation fix: `else`/`elseif`/`catch`/`finally` clauses on their own line (after a standalone `}`) are no longer dedented twice; they now align at the same level as the previous block, as in the `} catch {` style.
- Indentation fix: the content of multi-line parentheses (`@(...)`, `$(...)`, `(...)` of calls with wrapped arguments) now gets one indentation level, with the closing `)` aligned to the line that opened it; nesting (array in hashtable, hashtable in array) accumulates levels correctly. Single-line arrays and here-string content are left untouched.
- Localization cleanup: removed the unused `ark.incompatible.flag` key from the l10n bundles (EN and pt-BR); it is only consumed by the Shell formatter (shfmt).
- Alignment engine promoted to the shared package (`@tooark/ark-format-shared/align`), reused by the Makefile and PowerShell formatters.
- Internal refactoring with no behavior change: edit and spacing helpers promoted to the shared package (`@tooark/ark-format-shared/edits` and `/spacing`), removal of unused code (an inert diagnostics collection and orphaned re-exports), and range provider guards aligned with the pattern of the other extensions.
- New extension-layer tests: activation, document/range providers (`CRLF` default), selection reindentation with context, and here-strings ignored when computing the context.
- Support section added to the READMEs (EN/PT-BR).
- Package version bumped from `1.1.0` to `1.2.0`.
- Details: [notes/powershell1.2.0.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/powershell1.2.0.md)

## 1.1.0 - 2026-06-27

- New `arkFormatPowerShell.formatBlockComments` option (default `false`) to control formatting of block comments (`<# ... #>`).
  - Disabled: the block comment is preserved with its internal indentation unchanged.
  - Enabled: the content is reindented based on `indentSize` (delimiters at code level, comment-based help keywords one level in and the content below them two levels in).
- Block comments are now treated as an opaque block in the formatting engine, preventing their internal indentation from being flattened.
- Added regression tests for the enabled/disabled modes, nested indentation and single-line block comments.
- Package version bumped from `1.0.9` to `1.1.0`.
- Details: [notes/powershell1.1.0.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/powershell1.1.0.md)

## 1.0.9 - 2026-06-27

- Package version bumped from `1.0.8` to `1.0.9`.
- Round of security maintenance on dependencies (Dependabot alerts) applied via `overrides` in the workspace.
- Updated demo GIFs (`media/powershell-settings.gif` and `media/powershell-using.gif`).
- No functional changes to the formatting engine.
- Details: [notes/powershell1.0.9.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/powershell1.0.9.md)

## 1.0.8 - 2026-05-31

- Package version bumped from `1.0.7` to `1.0.8`.
- Audit of the scenarios equivalent to the regressions fixed in Shell (`inline blocks` and nested blocks), with no functional impact found in the PowerShell formatter.
- Added regression coverage for nested `switch` and one-line `if/else`, preventing indentation drift in future changes.
- Details: [notes/powershell1.0.8.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/powershell1.0.8.md)

## 1.0.7 - 2026-05-31

- Package version bumped from `1.0.6` to `1.0.7`.
- Removed the activation log in `activate`, reducing noise in the extension host.
- Publishing pipeline adjusted to stop passing the token explicitly in the `vsce` and `ovsx` calls.
- Details: [notes/powershell1.0.7.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/powershell1.0.7.md)

## 1.0.6 - 2026-05-27

- Bilingual documentation adjustment: README language links migrated from `raw.githubusercontent.com` to `github.com/.../blob/...`.
- Package version bumped from `1.0.5` to `1.0.6`.
- Security hardening in the build/publish workspace: `tmp` overridden to `>=0.2.6` in the monorepo lockfile.
- Details: [notes/powershell1.0.6.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/powershell1.0.6.md)

## 1.0.5 - 2026-05-27

- Complete restructuring of the README to the new documentation standard.
- Added `README.pt-BR.md` with EN/PT-BR language navigation.
- Documentation consistency fixes (`lineEnding` aligned with the actual default).
- Package version bumped from `1.0.4` to `1.0.5`.
- Details: [notes/powershell1.0.5.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/powershell1.0.5.md)

## 1.0.4 - 2026-05-23

- Cleanup of unused commands in the manifest and localization files.
- Workspace dependency update (`qs` to `6.15.2`).
- Package version bumped from `1.0.3` to `1.0.4`.
- Details: [notes/powershell1.0.4.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/powershell1.0.4.md)

## 1.0.3 - 2026-05-22

- Formatting fix to preserve the `#>` block comment closer.
- Added regression tests for the fixed scenario.
- Review of the defaults in the README and removal of the Author section.
- Package version bumped from `1.0.2` to `1.0.3`.
- Details: [notes/powershell1.0.3.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/powershell1.0.3.md)

## 1.0.2 - 2026-05-21

- VS Code integration fix removing `contributes.languages` (avoids impact on syntax highlighting).
- Package version bumped from `1.0.1` to `1.0.2`.
- Details: [notes/powershell1.0.2.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/powershell1.0.2.md)

## 1.0.1 - 2026-05-21

- Visual adjustments to the README author section (avatar and spacing).
- Package version bumped from `1.0.0` to `1.0.1`.
- Details: [notes/powershell1.0.1.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/powershell1.0.1.md)

## 1.0.0 - 2026-05-21

- First stable release of the PowerShell formatter.
- Support for full document and selection formatting, smart indentation and `.editorconfig`.
- Details: [notes/powershell1.0.0.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/powershell1.0.0.md)
