# 📚 Exemplos de Uso — Shell Formatter Extension

**Ordem sugerida:** 2 de 7 (essencial)  
**Anterior:** [`01-QUICK-START.md`](https://github.com/Tooark/vscode-ark-format/blob/main/packages/powershell/samples/01-QUICK-START.md)  
**Próximo:** [`03-FEATURE-INDEX.md`](https://github.com/Tooark/vscode-ark-format/blob/main/packages/powershell/samples/03-FEATURE-INDEX.md)

Este diretório contém exemplos de diferentes formatos de powershell suportados pela extensão **ark-format-powershell**. Para lista completa de formatos e arquivos, consulte [`03-FEATURE-INDEX.md`](https://github.com/Tooark/vscode-ark-format/blob/main/packages/powershell/samples/03-FEATURE-INDEX.md) ou [`04-TECHNICAL-SUMMARY.md`](https://github.com/Tooark/vscode-ark-format/blob/main/packages/powershell/samples/04-TECHNICAL-SUMMARY.md).

## 🚀 Como Usar

### 1. Habilitar Múltiplas Linguagens

Adicione ao `settings.json` (VS Code):

```json
{
  "arkFormatPowerShell.effectLanguages": ["powershell"]
}
```

### 2. Aplicar EditorConfig

Crie `.editorconfig` na raiz do projeto:

```ini
[*]
indent_style = space
indent_size = 2
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true

[*.ps1]
indent_size = 2

[*.psm1]
indent_size = 2

[*.psd1]
indent_size = 2
```

### 3. Formatar Arquivos

No VS Code:

- **Arquivo completo**: `Shift + Alt + F`
- **Seleção**: `Ctrl + K Ctrl + F` (Windows) ou `Cmd + K Cmd + F` (Mac)

## 🔧 Principais Funcionalidades

Para detalhamento completo de features por arquivo e caso de uso, consulte [`03-FEATURE-INDEX.md`](https://github.com/Tooark/vscode-ark-format/blob/main/packages/powershell/samples/03-FEATURE-INDEX.md).

## 📝 Dicas de Formatação

### Range Formatting com Contexto

Selecione um bloco de código e formate — a indentação será calculada automaticamente baseada no contexto do documento:

```powershell
if ($condition) {
    # Código aqui
    echo "Dentro do bloco"
    # Selecione só estas linhas...
    echo "Ainda dentro do bloco"
    # ...e formate (Ctrl+K Ctrl+F)
}
```

### EditorConfig Automático

Com `useEditorConfig: true`, a extensão lerá `.editorconfig` e aplicará:

- Tamanho de indentação
- Estilo de quebra de linha (LF/CRLF)
- Inserção de newline final
- Remoção de trailing whitespace

## ❓ Troubleshooting

| Problema                     | Solução                                            |
| ---------------------------- | -------------------------------------------------- |
| Arquivo não formata          | Verifique se a linguagem está em `effectLanguages` |
| Indentação errada            | Ative `rangeFormatting.useDocumentContext: true`   |
| EditorConfig não funciona    | Ative: `useEditorConfig: true`                     |
| Conflito com outro formatter | Defina como default formatter para shell scripts   |

## 📚 Recursos

- [PSScriptAnalyzer](https://github.com/PowerShell/PSScriptAnalyzer) — Analisador estático para PowerShell
- [PowerShell Documentation](https://learn.microsoft.com/powershell/) — Documentação oficial do PowerShell
- [PowerShell Gallery](https://www.powershellgallery.com/) — Repositório de módulos e scripts PowerShell
