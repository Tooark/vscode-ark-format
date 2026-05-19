# 📚 Exemplos de Uso — Shell Formatter Extension

**Ordem sugerida:** 2 de 7 (essencial)  
**Anterior:** [`01-QUICK-START.md`](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/samples/01-QUICK-START.md)  
**Próximo:** [`03-FEATURE-INDEX.md`](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/samples/03-FEATURE-INDEX.md)

Este diretório contém exemplos de diferentes formatos de shell suportados pela extensão **ark-format-shell**. Para lista completa de formatos e arquivos, consulte [`03-FEATURE-INDEX.md`](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/samples/03-FEATURE-INDEX.md) ou [`04-TECHNICAL-SUMMARY.md`](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/samples/04-TECHNICAL-SUMMARY.md).

## 🚀 Como Usar

### 1. Habilitar Múltiplas Linguagens

Adicione ao `settings.json` (VS Code):

```json
{
  "arkFormatShell.effectLanguages": [
    "shellscript",
    "bash",
    "bats",
    "azcli",
    "tcsh",
    "ksh"
  ]
}
```

### 2. Usar External shfmt Engine

Se tiver `shfmt` instalado:

```json
{
  "arkFormatShell.engine": "shfmt",
  "arkFormatShell.shfmt.path": "shfmt",
  "arkFormatShell.shfmt.flags": "-i 2 -bn"
}
```

### 3. Aplicar EditorConfig

Crie `.editorconfig` na raiz do projeto:

```ini
[*]
indent_style = space
indent_size = 2
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true

[*.sh]
indent_size = 2

[*.bats]
indent_size = 2

[*.azcli]
indent_size = 2
```

### 4. Formatar Arquivos

No VS Code:

- **Arquivo completo**: `Shift + Alt + F`
- **Seleção**: `Ctrl + K Ctrl + F` (Windows) ou `Cmd + K Cmd + F` (Mac)

## 🔧 Principais Funcionalidades

Para detalhamento completo de features por arquivo e caso de uso, consulte [`03-FEATURE-INDEX.md`](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/samples/03-FEATURE-INDEX.md).

## 📝 Dicas de Formatação

### Range Formatting com Contexto

Selecione um bloco de código e formate — a indentação será calculada automaticamente baseada no contexto do documento:

```bash
if [ "$1" = "start" ]; then
  # Selecione só estas linhas...
  echo "Starting"
  # ...e formate (Ctrl+K Ctrl+F)
  prepare_environment
fi
```

### Diagnósticos do shfmt

Se usar o engine `shfmt`, erros aparecerão no painel Problems:

- Linha e coluna do erro
- Mensagem descritiva
- Quick fixes (quando disponível)

### EditorConfig Automático

Com `useEditorConfig: true`, a extensão lerá `.editorconfig` e aplicará:

- Tamanho de indentação
- Estilo de quebra de linha (LF/CRLF)
- Inserção de newline final
- Remoção de trailing whitespace

## ❓ Troubleshooting

| Problema                     | Solução                                                             |
| ---------------------------- | ------------------------------------------------------------------- |
| Arquivo não formata          | Verifique se a linguagem está em `effectLanguages`                  |
| Indentação errada            | Ative `rangeFormatting.useDocumentContext: true`                    |
| shfmt não encontrado         | Instale: `npm install -g shfmt` ou aponte o caminho em `shfmt.path` |
| EditorConfig não funciona    | Ative: `useEditorConfig: true`                                      |
| Conflito com outro formatter | Defina como default formatter para shell scripts                    |

## 📚 Recursos

- [ShellCheck](https://www.shellcheck.net/) — Análise estática
- [shfmt](https://github.com/mvdan/sh) — Formatador externo
- [BATS](https://github.com/bats-core/bats-core) — Testing framework
- [Azure CLI Docs](https://learn.microsoft.com/cli/azure/) — Documentação Azure
