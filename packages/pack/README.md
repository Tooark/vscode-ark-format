# Ark Format

**Ark Format** é um pacote de extensões que reúne todos os formatadores da família Ark Format em uma única instalação. Formate seus scripts **Shell** e **PowerShell** com consistência e flexibilidade diretamente no VS Code.

<img src="https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/packages/pack/assets/image.png" width=480>

## 📦 O que está incluído

| Extensão                                                                                                                                                | Descrição                                                                                                     |
| ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| **Ark Format: Shell**<br>[VS Marketplace](https://marketplace.visualstudio.com/items?itemName=tooark.ark-format-shell) \| [Open VSX](https://open-vsx.org/extension/tooark/ark-format-shell)           | Formatação para scripts Shell (.sh, .bash, .zsh, .ksh, .tcsh, .azcli, .bats) com integração opcional ao shfmt |
| **Ark Format: PowerShell**<br>[VS Marketplace](https://marketplace.visualstudio.com/items?itemName=tooark.ark-format-powershell) \| [Open VSX](https://open-vsx.org/extension/tooark/ark-format-powershell) | Formatação para scripts PowerShell (.ps1, .psm1, .psd1) com indentação inteligente de blocos param            |

> VS Code normalmente usa o VS Marketplace; VSCodium e editores compatíveis costumam usar Open VSX.

## 🤔 Qual instalar?

| Cenário                                       | Extensão recomendada         |
| --------------------------------------------- | ---------------------------- |
| Trabalha apenas com Shell                     | **Ark Format: Shell**        |
| Trabalha apenas com PowerShell                | **Ark Format: PowerShell**   |
| Trabalha com ambos ou quer cobertura completa | **Ark Format** (este pacote) |

## ✨ Recursos

Ao instalar este pacote você obtém automaticamente:

- 🎯 **Formatação inteligente** - Documentos completos ou seleções parciais
- 🎛️ **Configurações independentes** - Cada linguagem possui suas próprias opções
- 🌍 **Multilíngue** - Interface em Inglês (EN) e Português Brasileiro (PT-BR)
- 📋 **Integração .editorconfig** - Respeita as convenções do projeto
- 🔌 **Integração com shfmt** - Use shfmt como engine para Shell (opcional)
- 📦 **Indentação de bloco param** - Formatação inteligente de param() no PowerShell
- ⚡ **Leve e rápido** - Sem dependências externas obrigatórias

## 📺 Como Usar

1. Instale **Ark Format** pelo Marketplace
2. Abra qualquer arquivo `.sh`, `.bash`, `.ps1`, `.psm1` ou `.psd1`
3. Formate com **Shift+Alt+F** (Windows/Linux) ou **Shift+Option+F** (Mac)
4. Personalize em `File > Preferences > Settings` buscando por `arkFormat`

> Consulte a documentação individual de cada extensão para ver todas as opções de configuração disponíveis.

## 📝 Licença

Este projeto está licenciado sob a [MIT License](LICENSE).
