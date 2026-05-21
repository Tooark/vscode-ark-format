# Quick Start - Ark Format: PowerShell

## Installation

1. Install the extension from VS Code Marketplace (search for "Ark Format: PowerShell" by Tooark)
2. Or install manually:
   - Clone the repository
   - Run `pnpm install` in the root directory
   - Run `pnpm build` to build the extension
   - Run `code --install-extension dist/ark-format-powershell-*.vsix`

## Basic Usage

### Format on Save

Add this to your VS Code settings:

\`\`\`json
"[powershell]": {
  "editor.defaultFormatter": "tooark.ark-format-powershell",
  "editor.formatOnSave": true
}
\`\`\`

### Manual Formatting

1. Open a PowerShell file (.ps1, .psm1, .psd1, .ps1xml)
2. Press `Shift+Alt+F` to format the entire document
3. Or select code and press `Shift+Alt+F` to format the selection

### Configuration

Configure the formatter in your settings:

\`\`\`json
{
  "arkFormatPowerShell.enabled": true,
  "arkFormatPowerShell.indentSize": 4,
  "arkFormatPowerShell.indentStyle": "space",
  "arkFormatPowerShell.trimTrailingWhitespace": true,
  "arkFormatPowerShell.insertFinalNewline": true
}
\`\`\`

## Supported Extensions

- **`.ps1`** - PowerShell Scripts
- **`.psm1`** - PowerShell Modules
- **`.psd1`** - PowerShell Module Manifests
- **`.ps1xml`** - PowerShell XML Configuration Files

## Features

✨ Automatic indentation based on control structures (if, function, try, foreach, etc.)
✨ Trim trailing whitespace
✨ Normalize consecutive blank lines
✨ Remove leading blank lines
✨ Insert final newline
✨ Configurable line endings (LF, CRLF, Auto-detect)
✨ EditorConfig support
✨ Multi-language support (English, Portuguese-BR)

## See Also

- [Full Documentation](./02-USER-GUIDE.md)
- [Configuration Guide](./03-FEATURE-INDEX.md)
- [Technical Details](./04-TECHNICAL-SUMMARY.md)
