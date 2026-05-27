# ARK Format

Monorepo oficial das extensões **Ark Format** para Visual Studio Code.
O projeto reúne formatadores para **Shell** e **PowerShell**, além de um pacote agregador e bibliotecas compartilhadas.

<img src="https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/packages/pack/assets/image.png" width="480" alt="Ark Format extension pack preview" />

---

## ✨ Visão Geral

- 🎯 **Formatação consistente** para Shell e PowerShell
- 📦 **Pacotes separados por responsabilidade** (formatadores, pack e código compartilhado)
- 🧩 **Monorepo com pnpm workspace** para build, teste e lint unificados
- ⚡ **Fluxo de desenvolvimento rápido** com tasks e debug no VS Code

---

## 📦 Pacotes

| Pacote                                               | Descrição                                                                                           |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| [packages/shell](packages/shell/README.md)           | Extensão de formatação para Shell (`.sh`, `.bash`, `.zsh`, `.ksh`, `.tcsh`, `.azcli`, `.bats`)      |
| [packages/powershell](packages/powershell/README.md) | Extensão de formatação para PowerShell (`.ps1`, `.psm1`, `.psd1`)                                   |
| [packages/pack](packages/pack/README.md)             | Extension Pack que instala Shell + PowerShell em conjunto                                           |
| [packages/shared](packages/shared)                   | Código compartilhado entre os pacotes (lexer, indentação, utilitários e processamento de documento) |

---

## 🚀 Primeiros Passos

Instale as dependências na raiz do repositório:

```bash
pnpm install
```

Build do monorepo:

```bash
pnpm run build
```

Watch mode para desenvolvimento:

```bash
pnpm run watch
```

Lint em todos os pacotes que possuem script:

```bash
pnpm run lint
```

---

## 🧪 Testes

Executar testes de todo o monorepo:

```bash
pnpm run test
```

Executar testes de um pacote específico (exemplo: PowerShell):

```bash
cd packages/powershell
pnpm test
```

Gerar cobertura de um pacote específico (exemplo: PowerShell):

```bash
cd packages/powershell
pnpm exec vitest run --coverage
```

---

## 🧩 Desenvolvimento no VS Code

O diretório `.vscode/` contém configurações de tasks e debug para facilitar o desenvolvimento local.

Fluxo recomendado:

1. Abra o workspace no VS Code
2. Execute a task `pnpm: watch shell` ou `pnpm: watch powershell`
3. Pressione `F5` para abrir o Extension Host e validar a extensão localmente

---

## 🤝 Contribuição

- Leia o README de cada pacote antes de abrir PR
- Siga as regras de lint compartilhadas em `configs/eslint.base.mjs`
- Rode build e testes localmente antes de enviar alterações

## 📝 Licença

Este projeto está licenciado sob a [MIT License](LICENSE).
