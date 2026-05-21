# Technical Summary - Ark Format: PowerShell

## Architecture

### Components

1. **Extension Host** (`extension.ts`)
   - Registers document formatting and range formatting providers
   - Manages configuration loading
   - Handles VS Code integration

2. **Formatter Core** (`powerShellFormatter.ts`)
   - Main formatting logic
   - Indentation detection and application
   - Text transformation pipeline

3. **Range Formatter** (`powerShellRangeFormatter.ts`)
   - Handles selection-based formatting
   - Maintains document integrity for partial formatting

4. **Text Utilities** (`textUtils.ts`)
   - Line ending normalization
   - Whitespace management
   - Blank line normalization

5. **Type Definitions** (`types.ts`)
   - Configuration interfaces
   - Formatter options
   - Result types

## Formatting Pipeline

\`\`\`
Input Text
    ↓
Normalize Line Endings (CRLF/CR → LF)
    ↓
Remove Leading Blank Lines
    ↓
Normalize Consecutive Blank Lines
    ↓
Trim Trailing Whitespace
    ↓
Apply Indentation (PowerShell-aware)
    ↓
Insert Final Newline (if configured)
    ↓
Convert Line Endings (LF → CRLF/LF)
    ↓
Output Text
\`\`\`

## Indentation Algorithm

### Pattern Recognition

The formatter detects indentation changes based on PowerShell keywords:

**Opening Keywords** (increase indent):
- Block starters: `function`, `if`, `while`, `for`, `foreach`, `switch`, `try`
- Special blocks: `begin`, `process`, `end`, `dynamicparam`
- Type definitions: `class`, `enum`, `interface`, `struct`
- Brace syntax: lines ending with `{`

**Closing Keywords** (decrease indent):
- `catch`, `finally`, `else`, `elseif`, `end`
- Lines starting with `}`

### Algorithm Steps

1. Split text into lines
2. For each line:
   - Check if line starts with closing keyword → decrease indent level
   - Trim the line
   - Apply indentation based on current level
   - Check if line ends with opening keyword → increase indent level
3. Join lines back together

## Configuration System

Configuration is loaded from VS Code settings using the shared config system:

\`\`\`typescript
const config = getConfig('arkFormatPowerShell');
const indentSize = config.get<number>('indentSize') ?? 4;
\`\`\`

### Setting Keys

- `arkFormatPowerShell.enabled`
- `arkFormatPowerShell.indentSize`
- `arkFormatPowerShell.indentStyle`
- `arkFormatPowerShell.trimTrailingWhitespace`
- `arkFormatPowerShell.maxConsecutiveBlankLines`
- `arkFormatPowerShell.removeLeadingBlankLines`
- `arkFormatPowerShell.insertFinalNewline`
- `arkFormatPowerShell.lineEnding`
- `arkFormatPowerShell.effectLanguages`
- `arkFormatPowerShell.useEditorConfig`

## Testing

### Test Coverage

- **textUtils.test.ts**: Text transformation utility tests
  - Line ending normalization
  - Whitespace trimming
  - Blank line management

- **powerShellFormatter.test.ts**: Formatter tests
  - Document formatting
  - Indentation logic
  - Configuration handling
  - Error cases

### Running Tests

\`\`\`bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Run specific test file
pnpm test textUtils.test.ts
\`\`\`

## Build System

### Scripts

- `pnpm build` - Build the extension
- `pnpm watch` - Watch mode for development
- `pnpm lint` - Run ESLint
- `pnpm test` - Run tests
- `pnpm package` - Create .vsix package

### Build Process

1. **esbuild** bundles TypeScript
2. Outputs to `dist/extension.js`
3. Generates sourcemaps for debugging
4. Minifies for production builds

### Dependencies

**Runtime:**
- `vscode` - VS Code API

**Development:**
- `@types/vscode` - Type definitions
- `typescript` - TypeScript compiler
- `esbuild` - Bundler
- `vitest` - Test framework
- `eslint` - Linter
- `@tooark/ark-format-shared` - Shared utilities

## Performance Characteristics

### Time Complexity

- **Normalization**: O(n) where n = text length
- **Indentation**: O(n) single pass through lines
- **Range formatting**: O(n) for range + O(m) for rest (m = remaining text)

### Space Complexity

- O(n) for all operations (stores formatted text)

### Benchmarks (typical cases)

- 1KB file: < 1ms
- 10KB file: < 5ms
- 100KB file: < 50ms

## Extensibility

### Adding New Features

1. Add configuration to `package.json` contributes
2. Create utility functions in `textUtils.ts`
3. Update `PowerShellFormatter` with new transformation
4. Add tests in corresponding `.test.ts` files
5. Update documentation

### Custom Indentation Rules

Modify the keyword patterns in:
- `isOpeningKeyword()` method
- `isClosingKeyword()` method

## Localization

Messages and configuration descriptions are localized:
- `l10n/bundle.l10n.json` - English strings
- `l10n/bundle.l10n.pt-br.json` - Portuguese-BR strings

Use `vscode.l10n.t()` for translatable strings in code.

## Security Considerations

- No external command execution (safe)
- No file system access outside documents (safe)
- No network calls (safe)
- Input is only text transformation (safe)

## Known Limitations

1. Does not format comments
2. Does not handle custom DSLs
3. Simple regex-based keyword detection (not AST-based)
4. Does not merge lines or reflow paragraphs
5. Range formatting maintains original indentation context

## Future Improvements

- [ ] AST-based formatting for better accuracy
- [ ] Comment formatting
- [ ] Line wrapping for long lines
- [ ] Integration with external PowerShell formatters
- [ ] Semantic indentation based on context
- [ ] Custom rule support
