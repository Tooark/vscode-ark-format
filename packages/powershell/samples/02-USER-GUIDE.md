# User Guide - Ark Format: PowerShell

## Table of Contents

1. [Installation](#installation)
2. [Basic Usage](#basic-usage)
3. [Configuration](#configuration)
4. [Advanced Features](#advanced-features)
5. [Troubleshooting](#troubleshooting)
6. [FAQ](#faq)

## Installation

### From VS Code Marketplace

1. Open VS Code
2. Go to Extensions (`Ctrl+Shift+X` / `Cmd+Shift+X`)
3. Search for "Ark Format PowerShell"
4. Click Install
5. Reload VS Code

### Manual Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Tooark/ark-format-powershell.git
   cd ark-format-powershell
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Build the extension:
   ```bash
   pnpm build
   ```

4. Package the extension:
   ```bash
   pnpm package
   ```

5. Install:
   ```bash
   code --install-extension dist/ark-format-powershell-*.vsix
   ```

## Basic Usage

### Format Entire Document

**Method 1: Keyboard Shortcut**
- Windows/Linux: `Shift+Alt+F`
- macOS: `Shift+Option+F`

**Method 2: Command Palette**
1. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on macOS)
2. Type "Format Document"
3. Press Enter

**Method 3: Right-Click Menu**
1. Right-click in the editor
2. Select "Format Document"

### Format Selection

1. Select the code you want to format
2. Press `Shift+Alt+F` or use Command Palette: "Format Selection"
3. Only the selected code will be formatted

### Format on Save

Add to your VS Code settings (`settings.json`):

```json
"[powershell]": {
  "editor.defaultFormatter": "tooark.ark-format-powershell",
  "editor.formatOnSave": true
}
```

Now the formatter will automatically run when you save PowerShell files.

## Configuration

### Accessing Settings

1. **Settings UI**:
   - Go to File → Preferences → Settings
   - Search for "arkFormatPowerShell"

2. **settings.json**:
   - Press `Ctrl+Shift+P`
   - Type "Open Settings (JSON)"
   - Add configuration to the file

### Configuration Options

#### Enabled
```json
{
  "arkFormatPowerShell.enabled": true
}
```
- **Type**: Boolean
- **Default**: `true`
- **Description**: Enable or disable the formatter

#### Indent Size
```json
{
  "arkFormatPowerShell.indentSize": 4
}
```
- **Type**: Number (0-20)
- **Default**: `4`
- **Description**: Number of spaces per indentation level

#### Indent Style
```json
{
  "arkFormatPowerShell.indentStyle": "space"
}
```
- **Type**: String (`space` or `tab`)
- **Default**: `space`
- **Description**: Use spaces or tabs for indentation

#### Trim Trailing Whitespace
```json
{
  "arkFormatPowerShell.trimTrailingWhitespace": true
}
```
- **Type**: Boolean
- **Default**: `true`
- **Description**: Remove whitespace at the end of lines

#### Max Consecutive Blank Lines
```json
{
  "arkFormatPowerShell.maxConsecutiveBlankLines": 1
}
```
- **Type**: Number (0+)
- **Default**: `1`
- **Description**: Maximum number of consecutive blank lines allowed

#### Remove Leading Blank Lines
```json
{
  "arkFormatPowerShell.removeLeadingBlankLines": true
}
```
- **Type**: Boolean
- **Default**: `true`
- **Description**: Remove blank lines at the start of files

#### Insert Final Newline
```json
{
  "arkFormatPowerShell.insertFinalNewline": true
}
```
- **Type**: Boolean
- **Default**: `true`
- **Description**: Ensure files end with a newline

#### Line Ending
```json
{
  "arkFormatPowerShell.lineEnding": "Auto"
}
```
- **Type**: String (`LF`, `CRLF`, or `Auto`)
- **Default**: `Auto`
- **Description**: Line ending style to use

#### Effect Languages
```json
{
  "arkFormatPowerShell.effectLanguages": ["powershell"]
}
```
- **Type**: Array of strings
- **Default**: `["powershell"]`
- **Description**: Languages to apply formatting to

#### Use EditorConfig
```json
{
  "arkFormatPowerShell.useEditorConfig": false
}
```
- **Type**: Boolean
- **Default**: `false`
- **Description**: Use .editorconfig files for settings

### Example Configuration

```json
{
  "[powershell]": {
    "editor.defaultFormatter": "tooark.ark-format-powershell",
    "editor.formatOnSave": true,
    "editor.formatOnPaste": true,
    "editor.tabSize": 4
  },
  "arkFormatPowerShell.enabled": true,
  "arkFormatPowerShell.indentSize": 4,
  "arkFormatPowerShell.indentStyle": "space",
  "arkFormatPowerShell.trimTrailingWhitespace": true,
  "arkFormatPowerShell.maxConsecutiveBlankLines": 2,
  "arkFormatPowerShell.removeLeadingBlankLines": true,
  "arkFormatPowerShell.insertFinalNewline": true,
  "arkFormatPowerShell.lineEnding": "CRLF"
}
```

## Advanced Features

### EditorConfig Integration

Create a `.editorconfig` file in your project root:

```ini
root = true

[*]
indent_style = space
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

[*.ps1]
indent_size = 4

[*.psm1]
indent_size = 4

[*.json]
indent_size = 2
```

Enable in settings:
```json
{
  "arkFormatPowerShell.useEditorConfig": true
}
```

### Project-Specific Settings

Create `.vscode/settings.json` in your project:

```json
{
  "[powershell]": {
    "editor.defaultFormatter": "tooark.ark-format-powershell"
  },
  "arkFormatPowerShell.indentSize": 2,
  "arkFormatPowerShell.lineEnding": "CRLF"
}
```

These settings override user settings for the project.

### Workspace Settings

In multi-root workspaces, you can have different settings per folder:

1. Open Workspace Settings: `File → Preferences → Settings`
2. Click on the folder in the left sidebar
3. Configure for that folder specifically

### Format Ignore Patterns

Currently, the formatter applies to all PowerShell files. To exclude files:

1. Use `.editorconfig` with specific patterns
2. Or manually configure `effectLanguages` to exclude language variants

### Keyboard Shortcuts

Customize shortcuts in `keybindings.json`:

```json
{
  "key": "ctrl+alt+f",
  "command": "editor.action.formatDocument",
  "when": "editorLangId == 'powershell'"
}
```

## Troubleshooting

### Formatter Not Running

**Problem**: Format document doesn't do anything

**Solutions**:
1. Verify the extension is installed: `Ctrl+Shift+X` → "Ark Format"
2. Check if formatting is enabled:
   - Go to Settings
   - Search "arkFormatPowerShell.enabled"
   - Ensure it's `true`
3. Verify the file has a PowerShell extension (.ps1, .psm1, etc.)
4. Check if another formatter is set as default
5. Try using the Command Palette: `Ctrl+Shift+P` → "Format Document"

### Incorrect Formatting

**Problem**: Code is formatted differently than expected

**Solutions**:
1. Check your configuration in `settings.json`
2. Verify EditorConfig is disabled if using custom settings
3. Check if another extension is interfering
4. Try resetting to default settings and adjusting one at a time

### Performance Issues

**Problem**: Formatter is slow or freezes VS Code

**Solutions**:
1. This is rare but can happen with very large files (>1MB)
2. Try disabling format-on-save temporarily
3. Update VS Code to the latest version
4. Disable other extensions to see if there's a conflict

### Language Not Recognized

**Problem**: PowerShell files not recognized as PowerShell language

**Solutions**:
1. Ensure PowerShell language support is installed
2. Check file extension (.ps1, .psm1, etc.)
3. Manually set language: Click language indicator, select "PowerShell"
4. Check if a language pack is interfering

## FAQ

### Q: Does this formatter support all PowerShell versions?

**A**: Yes! The formatter works with PowerShell 3.0 through 7.x. It understands PowerShell syntax regardless of version.

### Q: Can I use this formatter with PSScriptAnalyzer?

**A**: Yes! PSScriptAnalyzer is a linter/analyzer, while Ark Format is a formatter. They work together:
- Use Ark Format to format code
- Use PSScriptAnalyzer to analyze code quality

### Q: Does it format comments?

**A**: No, comments are preserved as-is. Only code structure is formatted.

### Q: Can I use this with other PowerShell extensions?

**A**: Yes, but make sure only one formatter is set as default to avoid conflicts. You can use this as the primary formatter and other extensions for additional features.

### Q: Is my code safe?

**A**: Absolutely! The formatter:
- Only modifies whitespace and structure
- Doesn't execute code
- Doesn't access external services
- Preserves all functionality
- Always shows you the changes before applying

### Q: Can I undo formatting?

**A**: Yes! Use `Ctrl+Z` (or `Cmd+Z`) to undo any formatting changes.

### Q: How do I report a bug?

**A**: Visit the GitHub repository and create an issue with:
- Your VS Code version
- Extension version
- A minimal code example
- Steps to reproduce

### Q: Can I contribute?

**A**: Yes! Contributions are welcome. See the README for contribution guidelines.

### Q: Is there a CLI version?

**A**: Currently, this is VS Code-only. A CLI version might be added in the future.

### Q: How do I customize indentation rules?

**A**: You can't currently customize indentation rules beyond indent size and style. If you have specific requirements, consider opening an issue on GitHub.

### Q: Does this work with WSL or remote PowerShell?

**A**: Yes! VS Code can use this extension with remote PowerShell development.

---

**Need more help?** Check the [Quick Start](./01-QUICK-START.md) or [Feature Index](./03-FEATURE-INDEX.md).
