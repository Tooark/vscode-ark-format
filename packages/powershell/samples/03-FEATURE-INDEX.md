# Features - Ark Format: PowerShell

## Formatting Features

### 1. Automatic Indentation

The formatter automatically indents code based on PowerShell control structures:

\`\`\`powershell
# Before
function Test {
Write-Host "Indented?"
}

# After (with indentation)
function Test {
    Write-Host "Indented!"
}
\`\`\`

Supported keywords for indentation:
- **Opening**: `function`, `process`, `begin`, `dynamicparam`, `end`, `if`, `elseif`, `while`, `for`, `foreach`, `switch`, `try`, `catch`, `finally`, `class`, `enum`, `interface`, `struct`
- **Closing**: `catch`, `finally`, `else`, `elseif`, `end`

### 2. Whitespace Management

- **Trim trailing whitespace**: Remove spaces at the end of lines
- **Normalize consecutive blank lines**: Reduce multiple blank lines to a maximum (default: 1)
- **Remove leading blank lines**: Clean up blank lines at the start of files
- **Insert final newline**: Ensure files end with a newline

### 3. Line Ending Conversion

Automatically convert between different line endings:
- **LF** (Unix/Linux/macOS): `\n`
- **CRLF** (Windows): `\r\n`
- **Auto**: Detect from the current file

### 4. Customizable Options

Configure the formatter to match your coding style:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `indentSize` | number | 4 | Number of spaces for indentation |
| `indentStyle` | string | space | Use `space` or `tab` for indentation |
| `trimTrailingWhitespace` | boolean | true | Remove trailing whitespace |
| `maxConsecutiveBlankLines` | number | 1 | Maximum consecutive blank lines |
| `removeLeadingBlankLines` | boolean | true | Remove blank lines at start |
| `insertFinalNewline` | boolean | true | Add newline at end of file |
| `lineEnding` | string | Auto | Line ending style |
| `useEditorConfig` | boolean | false | Use .editorconfig file |
| `enabled` | boolean | true | Enable/disable the formatter |

### 5. Format Selection

Format only a portion of your code:

1. Select the code you want to format
2. Press `Shift+Alt+F` or use Command Palette: "Format Selection"
3. The selected code will be formatted without affecting the rest

### 6. EditorConfig Support

Create a `.editorconfig` file in your project:

\`\`\`ini
[*.ps1]
indent_style = space
indent_size = 4
end_of_line = lf
insert_final_newline = true
\`\`\`

Enable it in settings:
\`\`\`json
{
  "arkFormatPowerShell.useEditorConfig": true
}
\`\`\`

## Example Transformations

### Example 1: Basic Function

**Input:**
\`\`\`powershell
function Get-Data{
Write-Host "Getting data"
return $data
}
\`\`\`

**Output:**
\`\`\`powershell
function Get-Data {
    Write-Host "Getting data"
    return $data
}
\`\`\`

### Example 2: If/Else Block

**Input:**
\`\`\`powershell
if ($condition){
Write-Host "True"
}
else{
Write-Host "False"
}
\`\`\`

**Output:**
\`\`\`powershell
if ($condition) {
    Write-Host "True"
}
else {
    Write-Host "False"
}
\`\`\`

### Example 3: Try/Catch Block

**Input:**
\`\`\`powershell
try{
Get-Item $path
}catch{
Write-Error $_
}finally{
Write-Host "Cleanup"
}
\`\`\`

**Output:**
\`\`\`powershell
try {
    Get-Item $path
}
catch {
    Write-Error $_
}
finally {
    Write-Host "Cleanup"
}
\`\`\`

## Performance Considerations

- The formatter processes files quickly, even large scripts
- Format-on-save is non-blocking
- Range formatting is optimized for selection

## Limitations

- Comments are preserved as-is (no comment formatting)
- String literals are not modified
- Regex patterns within strings are preserved
- Complex DSLs and custom syntax may not format perfectly

## Troubleshooting

### Formatter not running?

1. Ensure the extension is installed: `Ctrl+Shift+X` → Search "Ark Format PowerShell"
2. Check if formatting is enabled in settings
3. Verify the file extension is supported (.ps1, .psm1, .psd1, .ps1xml)
4. Check if another formatter is set as default

### Want different formatting?

1. Go to File → Preferences → Settings
2. Search for "arkFormatPowerShell"
3. Adjust options to your preference
4. Or use `.editorconfig` for project-specific settings
