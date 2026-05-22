# Ark Format: Shell

**Ark Format: Shell** é uma extensão de formatação robusta para scripts Shell (sh, bash, zsh, etc.) no Visual Studio Code. Mantenha seus scripts Shell consistentemente formatados com configurações flexíveis e poderosas.

## ✨ Recursos

- 🎯 **Formatação de documentos completos** - Formate arquivos inteiros com um único comando
- ✏️ **Formatação de seleções** - Formate apenas o texto selecionado
- 🎛️ **Configurações personalizáveis** - Controle cada aspecto da formatação
- 🌍 **Multilíngue** - Suporte completo em Inglês (EN) e Português Brasileiro (PT-BR)
- 📋 **Integração .editorconfig** - Respeita as configurações do projeto
- 🔌 **Integração com shfmt** - Use shfmt como engine de formatação (opcional)
- 🚀 **Performance otimizada** - Usa bundling moderno para máxima performance

## 📺 Como Usar

### Instalação Rápida

1. Abra o VS Code
2. Acesse **Extensões** (Ctrl+Shift+X / Cmd+Shift+X)
3. Procure por **"Ark Format: Shell"**
4. Clique em **Instalar**

### Usando a Extensão

**Veja como funciona:**

![Ark Format Shell - Configurações](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/packages/shell/media/shell-settings.gif)

![Ark Format Shell - Formatando Código](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/packages/shell/media/shell-using.gif)

#### Formatar Documento Completo

- Pressione **Shift+Alt+F** (Windows/Linux) ou **Shift+Option+F** (Mac)
- Ou use o comando: `Editor: Format Document`

#### Formatar Seleção

- Selecione o texto que deseja formatar
- Pressione **Ctrl+K Ctrl+F** (Windows/Linux) ou **Cmd+K Cmd+F** (Mac)
- Ou use o comando: `Editor: Format Selection`

#### Personalizando

Acesse `File > Preferences > Settings > Ark Format: Shell` para ajustar as configurações conforme necessário.

## 📄 Shells Suportados

- `.sh` - Shell Script (POSIX)
- `.bash` - Bash Script
- `.zsh` - Zsh Script
- `.ksh` - Korn Shell Script
- `.tcsh` - TCSH Script
- `.azcli` - Azure CLI Script
- `.bats` - BATS Test Script

## 🔧 Integração com shfmt

Ark Format: Shell pode ser configurado para usar **[shfmt](https://github.com/mvdan/sh)** como engine de formatação. Se você já utiliza shfmt em seus projetos ou prefere seus padrões de formatação, basta configurar a integração nas configurações e Ark Format utilizará shfmt como seu formatador de backend.

## ⚙️ Configuração

Customize o comportamento no `settings.json`. Opções disponíveis:

```json
{
  "arkFormatShell.enabled": true,
  "arkFormatShell.indentSize": 4,
  "arkFormatShell.indentStyle": "space",
  "arkFormatShell.trimTrailingWhitespace": true,
  "arkFormatShell.maxConsecutiveBlankLines": 1,
  "arkFormatShell.removeLeadingBlankLines": true,
  "arkFormatShell.insertFinalNewline": true,
  "arkFormatShell.lineEnding": "Auto",
  "arkFormatShell.collapseSpaces": true,
  "arkFormatShell.rangeFormatting.enabled": true,
  "arkFormatShell.rangeFormatting.reindent": false,
  "arkFormatShell.rangeFormatting.useDocumentContext": true
}
```

### Descrição das Configurações

| Opção                                | Padrão  | Descrição                                      |
| ------------------------------------ | ------- | ---------------------------------------------- |
| `enabled`                            | `true`  | Ativa ou desativa a extensão                   |
| `indentSize`                         | `4`     | Número de espaços por nível de indentação      |
| `indentStyle`                        | `space` | Tipo de indentação (`space` ou `tab`)          |
| `trimTrailingWhitespace`             | `true`  | Remove espaços em branco no final das linhas   |
| `maxConsecutiveBlankLines`           | `1`     | Máximo de linhas em branco consecutivas        |
| `removeLeadingBlankLines`            | `true`  | Remove linhas em branco no início do arquivo   |
| `insertFinalNewline`                 | `true`  | Insere nova linha ao final do arquivo          |
| `lineEnding`                         | `Auto`  | Tipo de quebra de linha (`Auto`, `LF`, `CRLF`) |
| `collapseSpaces`                     | `true`  | Converte múltiplos espaços em um               |
| `rangeFormatting.enabled`            | `true`  | Habilita formatação de intervalo               |
| `rangeFormatting.reindent`           | `false` | Reindenta o intervalo selecionado              |
| `rangeFormatting.useDocumentContext` | `true`  | Usa contexto do documento na formatação        |

## 💡 Dicas & Boas Práticas

- Use **Formatação de Seleção** para ajustar apenas partes específicas sem afetar o resto do arquivo
- Configure **.editorconfig** no seu projeto para manter consistência entre ferramentas
- Combine com outras extensões formatadoras para um workflow completo

## 📝 Licença

Este projeto está licenciado sob a [MIT License](LICENSE).
