# Ark Format: PowerShell

**Ark Format: PowerShell** é uma extensão de formatação para arquivos PowerShell (.ps1, .psm1, .psd1, .ps1xml) no Visual Studio Code.

## Recursos

- ✨ Formatação de documentos PowerShell completos
- 📝 Formatação de seleções de código
- ⚙️ Configurações personalizáveis
- 🌍 Suporte multilíngue (EN, PT-BR)
- 📦 Integração com .editorconfig

## Extensões Suportadas

- `.ps1` - PowerShell Script
- `.psm1` - PowerShell Module
- `.psd1` - PowerShell Module Manifest
- `.ps1xml` - PowerShell XML Configuration

## Configuração

Adicione as seguintes configurações no `settings.json`:

\`\`\`json
{
  "arkFormatPowerShell.enabled": true,
  "arkFormatPowerShell.indentSize": 4,
  "arkFormatPowerShell.indentStyle": "space",
  "arkFormatPowerShell.trimTrailingWhitespace": true,
  "arkFormatPowerShell.maxConsecutiveBlankLines": 1,
  "arkFormatPowerShell.removeLeadingBlankLines": true,
  "arkFormatPowerShell.insertFinalNewline": true,
  "arkFormatPowerShell.lineEnding": "Auto",
  "arkFormatPowerShell.collapseSpaces": true,
  "arkFormatPowerShell.rangeFormatting.enabled": true,
  "arkFormatPowerShell.rangeFormatting.reindent": false,
  "arkFormatPowerShell.rangeFormatting.useDocumentContext": true
}
\`\`\`

## Licença

MIT

## Autor

Tooark
