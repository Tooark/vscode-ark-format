# Ark Format

[![Open VSX Version](https://img.shields.io/open-vsx/v/tooark/ark-format)](https://open-vsx.org/extension/tooark/ark-format)
[![Open VSX Downloads](https://img.shields.io/open-vsx/dt/tooark/ark-format)](https://open-vsx.org/extension/tooark/ark-format)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Um pacote de extensões que reúne toda a família **Ark Format** em uma única instalação.
Formate scripts **Shell** e **PowerShell** com consistência no Visual Studio Code.

🌍 **Idiomas:** [**English**](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/packages/pack/README.md) | **Português (PT-BR)** (este arquivo)

---

## ✨ Recursos

- 📦 **Instalação tudo-em-um** — inclui formatadores de Shell e PowerShell no mesmo pacote
- 🎯 **Formatação inteligente** — suporta formatação de documento completo e de seleção
- 🎛️ **Configurações independentes** — cada formatador mantém suas próprias opções
- 🌍 **Interface multilíngue** — Inglês (EN) e Português Brasileiro (PT-BR)
- 📋 **Suporte a .editorconfig** — integra com convenções do projeto
- ⚡ **Configuração rápida** — instale uma vez e comece a formatar imediatamente

---

## 🚀 Primeiros passos

### Instalação

- **Open VSX:** https://open-vsx.org/extension/tooark/ark-format
- **VS Code Marketplace:** https://marketplace.visualstudio.com/items?itemName=tooark.ark-format

Ou dentro do VS Code:

1. Abra **Extensões** (`Ctrl+Shift+X` / `Cmd+Shift+X`)
2. Procure por **Ark Format**
3. Clique em **Instalar**

---

## 📦 Extensões Incluídas

| Extensão                                                                                                                                                   | Descrição                                                                                                   |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| **Ark Format: Shell**<br>[VS Marketplace](https://marketplace.visualstudio.com/items?itemName=tooark.ark-format-shell) \| [Open VSX](https://open-vsx.org/extension/tooark/ark-format-shell)           | Formatador para scripts Shell (`.sh`, `.bash`, `.zsh`, `.ksh`, `.tcsh`, `.azcli`, `.bats`) com integração opcional com shfmt |
| **Ark Format: PowerShell**<br>[VS Marketplace](https://marketplace.visualstudio.com/items?itemName=tooark.ark-format-powershell) \| [Open VSX](https://open-vsx.org/extension/tooark/ark-format-powershell) | Formatador para scripts PowerShell (`.ps1`, `.psm1`, `.psd1`) com indentação inteligente de blocos `param (...)` |

> Observação: o VS Code normalmente usa o VS Marketplace; o VSCodium e editores compatíveis costumam usar Open VSX.

---

## 🧩 Como usar

### Demonstração

<img src="https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/packages/pack/assets/image.png" width="480" alt="Prévia do pacote de extensões Ark Format" />

### Formatar Documento Completo

- Pressione **Shift+Alt+F** (Windows/Linux) ou **Shift+Option+F** (Mac)
- Ou execute: `Editor: Format Document`

### Formatar Seleção

- Selecione o texto que deseja formatar
- Pressione **Ctrl+K Ctrl+F** (Windows/Linux) ou **Cmd+K Cmd+F** (Mac)
- Ou execute: `Editor: Format Selection`

> Dica: você pode definir formatadores padrão por linguagem para Shell e PowerShell e manter consistência no format on save.

---

## 🤔 Qual instalar?

| Cenário                                      | Extensão recomendada      |
| -------------------------------------------- | ------------------------- |
| Você trabalha apenas com Shell               | **Ark Format: Shell**     |
| Você trabalha apenas com PowerShell          | **Ark Format: PowerShell** |
| Você trabalha com ambos ou quer cobertura total | **Ark Format** (este pacote) |

---

## 💡 Dicas & Boas Práticas

- Use este pacote quando quiser manter os dois formatadores juntos
- Use extensões individuais se seu projeto utiliza apenas uma linguagem
- Consulte os READMEs de cada formatador para ver todas as opções de configuração

## 📝 Licença

Este projeto está licenciado sob a [MIT License](LICENSE).
