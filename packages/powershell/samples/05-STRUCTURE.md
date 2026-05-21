# Structure - Ark Format: PowerShell

## Project Structure Overview

```
packages/powershell/
├── .gitignore                           # Git ignore rules
├── .vscodeignore                        # VS Code package ignore rules
├── README.md                            # Package README
├── package.json                         # Package manifest
├── package.nls.json                     # English localization strings
├── package.nls.pt-br.json              # Portuguese-BR localization strings
├── tsconfig.json                        # TypeScript configuration
├── vitest.config.ts                     # Vitest configuration
├── esbuild.mjs                          # Build script
├── eslint.config.mjs                    # ESLint configuration
│
├── src/                                 # Source code
│   ├── extension.ts                     # VS Code extension entry point
│   │   ├── activate()                   # Extension activation
│   │   ├── deactivate()                 # Extension deactivation
│   │   └── Providers
│   │       ├── DocumentFormattingEditProvider
│   │       └── DocumentRangeFormattingEditProvider
│   │
│   └── formatters/                      # Formatting logic
│       ├── types.ts                     # TypeScript interfaces
│       │   ├── LineEnding
│       │   ├── FormatterEngine
│       │   ├── PowerShellFormatterOptions
│       │   └── FormattingResult
│       │
│       ├── textUtils.ts                 # Text transformation utilities
│       │   ├── normalizeToLf()
│       │   ├── applyLineEnding()
│       │   ├── trimTrailingWhitespace()
│       │   ├── removeLeadingBlankLines()
│       │   ├── normalizeConsecutiveBlankLines()
│       │   ├── ensureFinalNewline()
│       │   └── removeFinalNewline()
│       │
│       ├── powerShellFormatter.ts       # Main formatter class
│       │   ├── formatDocument()         # Format entire document
│       │   ├── normalizeIndentation()   # Apply indentation
│       │   ├── isOpeningKeyword()       # Detect opening blocks
│       │   └── isClosingKeyword()       # Detect closing blocks
│       │
│       ├── powerShellRangeFormatter.ts  # Range formatting
│       │   └── formatRange()            # Format selection
│       │
│       ├── textUtils.test.ts            # Text utilities tests
│       └── powerShellFormatter.test.ts  # Formatter tests
│
├── l10n/                                # Localization
│   ├── bundle.l10n.json                 # English (English-US)
│   └── bundle.l10n.pt-br.json          # Portuguese-Brazil
│
├── samples/                             # Documentation and examples
│   ├── 00-START-HERE.md                # Welcome guide
│   ├── 01-QUICK-START.md               # Quick start guide
│   ├── 02-USER-GUIDE.md                # Complete user guide
│   ├── 03-FEATURE-INDEX.md             # Feature documentation
│   ├── 04-TECHNICAL-SUMMARY.md         # Technical details
│   ├── 05-STRUCTURE.md                 # This file
│   ├── 06-MANIFEST.md                  # Manifest details
│   ├── 07-FINAL-REPORT.md              # Final report
│   │
│   ├── .editorconfig                    # EditorConfig example
│   ├── settings.example.json            # Settings example
│   │
│   ├── example.ps1                      # PowerShell script example
│   ├── example.psm1                     # PowerShell module example
│   └── example.psd1                     # PowerShell manifest example
│
├── test/                                # Test setup
│   └── setup.ts                         # Vitest setup file
│
└── assets/                              # Visual assets
    └── icon.png                         # Extension icon
```

## Key Files Description

### Configuration Files

| File | Purpose |\n|------|----------|
| `package.json` | Extension manifest and dependencies |
| `tsconfig.json` | TypeScript compiler configuration |
| `vitest.config.ts` | Unit test configuration |
| `esbuild.mjs` | Build bundler configuration |
| `eslint.config.mjs` | Linter configuration |

### Source Files

| File | Purpose |
|------|---------|
| `src/extension.ts` | VS Code extension main file - registers formatters |
| `src/formatters/types.ts` | TypeScript interfaces and types |
| `src/formatters/textUtils.ts` | Utility functions for text transformation |
| `src/formatters/powerShellFormatter.ts` | Main formatting logic |
| `src/formatters/powerShellRangeFormatter.ts` | Range/selection formatting |

### Test Files

| File | Purpose |
|------|---------|
| `src/formatters/*.test.ts` | Unit tests for formatters |
| `test/setup.ts` | Vitest setup and global configuration |

### Localization

| File | Purpose |
|------|---------|
| `l10n/bundle.l10n.json` | English strings for UI |
| `l10n/bundle.l10n.pt-br.json` | Portuguese-BR strings for UI |

### Documentation

| File | Purpose |
|------|---------|
| `samples/00-START-HERE.md` | Welcome and introduction |
| `samples/01-QUICK-START.md` | Installation and basic usage |
| `samples/02-USER-GUIDE.md` | Complete user guide |
| `samples/03-FEATURE-INDEX.md` | Features and configuration |
| `samples/04-TECHNICAL-SUMMARY.md` | Architecture and technical details |
| `samples/05-STRUCTURE.md` | Project structure (this file) |
| `samples/06-MANIFEST.md` | Package.json manifest explanation |
| `samples/07-FINAL-REPORT.md` | Project summary and statistics |

### Examples

| File | Purpose |
|------|---------|
| `samples/example.ps1` | Example PowerShell script |
| `samples/example.psm1` | Example PowerShell module |
| `samples/example.psd1` | Example PowerShell manifest |
| `samples/settings.example.json` | Example VS Code settings |

## Code Architecture

### Extension Initialization Flow

```
┌─ activate(context)
│  ├─ Create diagnostic collection
│  ├─ Load configuration
│  ├─ Create document selector (languages + schemes)
│  ├─ Register DocumentFormattingEditProvider
│  │  └─ provideDocumentFormattingEdits()
│  │     ├─ Load config
│  │     ├─ Call PowerShellFormatter.formatDocument()
│  │     └─ Return TextEdit[] or []
│  │
│  ├─ Register DocumentRangeFormattingEditProvider
│  │  └─ provideDocumentRangeFormattingEdits()
│  │     ├─ Load config
│  │     ├─ Call PowerShellRangeFormatter.formatRange()
│  │     └─ Return TextEdit[] or []
│  │
│  └─ Push subscriptions to context
│
└─ deactivate()
   └─ Cleanup (if needed)
```

### Formatting Pipeline

```
Input Text
    ↓
[extension.ts]
    │
    ├─ Load configuration
    └─ Call appropriate formatter
         ↓
    [powerShellFormatter.ts or powerShellRangeFormatter.ts]
         │
         ├─ Call textUtils functions
         │  ├─ normalizeToLf()
         │  ├─ removeLeadingBlankLines()
         │  ├─ normalizeConsecutiveBlankLines()
         │  ├─ trimTrailingWhitespace()
         │  ├─ normalizeIndentation()
         │  ├─ ensureFinalNewline()
         │  └─ applyLineEnding()
         │
         └─ Return FormattingResult
              ↓
    [extension.ts]
         │
         └─ Create TextEdit[] and return
              ↓
    VS Code Editor
         │
         └─ Apply changes
```

### Module Dependencies

```
extension.ts
├── vscode (external - VS Code API)
├── @tooark/ark-format-shared (workspace - shared utils)
├── powerShellFormatter.ts
│   └── textUtils.ts
│       └── types.ts
├── powerShellRangeFormatter.ts
│   └── powerShellFormatter.ts
└── types.ts
```

## Development Workflow

### Adding a New Feature

1. **Create test file** or add test to existing `.test.ts`
   - Define expected behavior
   - Write failing tests

2. **Implement feature**
   - Add to appropriate formatter file
   - Or create new utility in `textUtils.ts`

3. **Update types** if needed
   - Modify `types.ts` for new interfaces

4. **Update configuration**
   - Add to `package.json` contributes if user-facing
   - Add to `l10n` files for localization strings

5. **Update documentation**
   - Update relevant `.md` files in samples/

6. **Test and lint**
   ```bash
   pnpm test
   pnpm lint
   ```

### File Naming Conventions

- **Formatters**: `<feature>Formatter.ts`
- **Tests**: `<file>.test.ts`
- **Utilities**: `<category>Utils.ts`
- **Types**: `types.ts` (combined in single file)

### Import Organization

```typescript
// 1. Node.js built-ins
import * as path from 'path';

// 2. External packages
import * as vscode from 'vscode';

// 3. Internal modules (absolute imports from @tooark)
import { getConfig } from '@tooark/ark-format-shared';

// 4. Local modules (relative imports)
import { PowerShellFormatter } from './formatters/powerShellFormatter';
import { PowerShellFormatterOptions } from './formatters/types';
```

## Build System

### esbuild Configuration

```
Entry: src/extension.ts
Output: dist/extension.js
Format: CommonJS
Target: Node
Bundling: Enabled
Externals: ['vscode'] (provided by VS Code)
Sourcemaps: Enabled (development), Disabled (production)
Minification: Disabled (development), Enabled (production)
```

### Output Structure

```
dist/
└── extension.js          # Bundled extension (with sourcemap in dev)
```

## Package Contents

When packaged as VSIX:

```
ark-format-powershell-1.0.0.vsix
├── extension/
│   ├── dist/
│   │   └── extension.js
│   ├── l10n/
│   │   ├── bundle.l10n.json
│   │   └── bundle.l10n.pt-br.json
│   ├── assets/
│   │   └── icon.png
│   ├── package.json
│   ├── package.nls.json
│   └── package.nls.pt-br.json
└── [metadata files]
```

## Performance Considerations

### File Size

- Source code: ~10KB (formatters + utilities)
- Bundled: ~8KB (after minification)
- Package: ~50KB (with dependencies)

### Time Complexity

- Document formatting: O(n) where n = number of characters
- Range formatting: O(n + m) where n = selection size, m = remaining text

### Optimization Techniques

- Single-pass line processing
- Minimal string allocations
- Efficient regex patterns
- Early returns for non-formatters

## Testing Strategy

### Unit Tests

- **textUtils.test.ts**: Test individual utility functions
- **powerShellFormatter.test.ts**: Test formatting logic

### Test Coverage

- All utility functions
- Common formatting scenarios
- Edge cases (empty files, large files)
- Error handling

### Running Tests

```bash
pnpm test              # Run all tests
pnpm test --watch      # Watch mode
pnpm test --coverage   # Coverage report
```

## CI/CD Integration

The project is designed to work with:

- **GitHub Actions**: Automated builds and tests
- **VS Code Marketplace**: Automated publishing
- **VSCE**: Package creation and publishing

---

**See Also:**
- [06-MANIFEST.md](./06-MANIFEST.md) - Package.json details
- [04-TECHNICAL-SUMMARY.md](./04-TECHNICAL-SUMMARY.md) - Architecture details
