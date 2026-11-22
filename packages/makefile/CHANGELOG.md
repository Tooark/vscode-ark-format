# Changelog

All notable changes to the `ark-format-makefile` package are documented here.

🌍 **Languages:** ![USA Flag](https://flagcdn.com/w20/us.png) **English (this file)** · [![Brazil Flag](https://flagcdn.com/w20/br.png) Português](https://github.com/Tooark/vscode-ark-format/blob/main/packages/makefile/CHANGELOG.pt-BR.md)

## 1.0.3 - 2026-11-22

- Package version bumped from `1.0.2` to `1.0.3`.
- Fix: text inside references (`$(...)`, `${...}`) is never changed. A `:` inside a function call or a substitution reference was read as a target separator (`$(MODULES:%=test_%):` became `$(MODULES: %=test_%):`, which breaks the rule, and `$(info see http://host)` became `http: //host`), and spaces inside `$(info a   b)` were collapsed.
- Fix: `#` inside a reference is not a comment (`$(shell grep -c '^#' file)`, `$(subst #,,$(X))`). A space was inserted after it, which changed the command or the argument.
- Fix: on an assignment, the spacing between the value and an inline comment is kept exactly, because make includes those spaces in the value. `DIR := /usr#note` became `DIR := /usr # note`, changing the value from `/usr` to `/usr` plus a trailing space.
- Fix: the arguments of `ifeq`/`ifneq` are kept as written; repeated spaces inside them were collapsed, which changes the comparison.
- Fix: `export define`, `private define` and combined prefixes are recognized, and nested `define` blocks are preserved up to the outer `endef`. Previously the body was reformatted.
- Fix: a line that is only a function call (`$(eval ...)`, `$(call ...)`, `$(foreach ...)`) written after a rule is no longer given a TAB, which turned it into a recipe line.
- Fix: `endif` and `else` followed by a comment with no space (`endif# done`) are recognized.
- Fix: a Windows drive letter is not a target separator (`C:/out/a.o: a.c` became `C: /out/a.o: a.c`).
- README: documents the guarantees for references, inline comments on assignments and nested `define`.
- Example `samples/example.complex.mk` with these cases.
- New regression tests for the document and selection formatters, the lexer, spacing and the selection context.
- Details: [notes/makefile1.0.3.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/makefile1.0.3.md)

## 1.0.2 - 2026-11-18

- Package version bumped from `1.0.1` to `1.0.2`.
- Changelog in English ([#24](https://github.com/Tooark/vscode-ark-format/discussions/24)): `CHANGELOG.md`, the file shown on the Marketplace, is now in English, and the Portuguese version moved to `CHANGELOG.pt-BR.md`, with a language switcher in both files, as in the README.
- Release notes in `notes/` are now bilingual (English and Portuguese), including those of previous versions.
- No functional changes to the formatting engine.
- Details: [notes/makefile1.0.2.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/makefile1.0.2.md)

## 1.0.1 - 2026-07-06

- Package version bumped from `1.0.0` to `1.0.1`.
- Added the `sponsor` field to the extension manifest, enabling the sponsor button (GitHub Sponsors) on the Marketplace page.
- Regenerated the README demo GIFs (`makefile-settings.gif` and `makefile-using.gif`) with updated, higher-quality captures.
- No functional changes to the formatting engine.
- Details: [notes/makefile1.0.1.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/makefile1.0.1.md)

## 1.0.0 - 2026-07-05

- Initial version of the Makefile formatter, following the structure of the Shell and PowerShell extensions.
- Full document and selection formatting (range formatting), with document context calculation.
- Safety invariants: recipe TAB prefix preserved, `define ... endef` blocks left untouched, line continuations (`\`) preserved, and the whole document preserved when `.RECIPEPREFIX` is redefined.
- Spacing rules: assignment operators (`=`, `:=`, `::=`, `?=`, `+=`, `!=`), target separator (`:`/`::`), conditional keywords (`ifeq (`) and comment marker (`#`/`##`).
- Alignment of assignment line continuations (`\`) with the start of the value on the first line.
- Optional vertical alignment of assignment operators in contiguous variable blocks (`alignAssignments`, off by default to avoid diff noise).
- Configurable indentation of conditional blocks (`ifeq`/`ifneq`/`ifdef`/`ifndef` ... `else` ... `endif`) using spaces.
- Optional recipe prefix normalization: recipes indented with spaces get the required TAB (only when the content is not Makefile syntax), and excessive leading whitespace (multiple TABs or mixtures) is reduced to exactly 1 TAB, preserving the inner indentation of continuations.
- Configurable cleanup: trailing spaces, consecutive blank lines, leading blank lines, final newline and line ending style (LF/CRLF/Auto).
- Optional `.editorconfig` support and EN/PT-BR localization.
- Unit tests for the formatter and the extension layer (activation, providers and conditional depth calculation, ignoring recipes and `define` blocks), integrated into the monorepo's consolidated coverage.
- Support section in the READMEs (EN/PT-BR).
- Details: [notes/makefile1.0.0.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/makefile1.0.0.md)
