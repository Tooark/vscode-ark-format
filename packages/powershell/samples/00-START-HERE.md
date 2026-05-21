# 🚀 Ark Format: PowerShell

bem-vindo ao **Ark Format: PowerShell** - Um formatador moderno e configurável para scripts PowerShell no VS Code.

## 📋 O que é isto?

Este pacote é uma extensão VS Code que formata automaticamente seus arquivos PowerShell:

- 📄 **Extensões suportadas**: `.ps1`, `.psm1`, `.psd1`, `.ps1xml`
- ⚙️ **Completamente configurável**: Adapte a formatação ao seu estilo
- 🌍 **Multilíngue**: Suporte para English e Português-BR
- 🎯 **Precisão**: Formatação inteligente baseada em palavras-chave do PowerShell

## 🎯 Início Rápido

### 1. Instalar a Extensão

```bash
# Via VS Code Marketplace
# Busque por "Ark Format: PowerShell" by Tooark

# Ou localmente
pnpm -F ark-format-powershell package
code --install-extension dist/ark-format-powershell-*.vsix
```

### 2. Usar o Formatter

Abra um arquivo PowerShell e escolha uma opção:

- ⌨️ **Formatar documento**: `Shift+Alt+F`
- 📝 **Formatar seleção**: Selecione o código e pressione `Shift+Alt+F`
- 💾 **Formatar ao salvar**: Adicione ao `settings.json`:

```json
"[powershell]": {
  "editor.defaultFormatter": "tooark.ark-format-powershell",
  "editor.formatOnSave": true
}
```

### 3. Configurar (Opcional)

```json
{
  "arkFormatPowerShell.enabled": true,
  "arkFormatPowerShell.indentSize": 4,
  "arkFormatPowerShell.indentStyle": "space",
  "arkFormatPowerShell.trimTrailingWhitespace": true,
  "arkFormatPowerShell.insertFinalNewline": true
}
```

## 📚 Documentação

| Documento | Conteúdo |
|-----------|----------|
| [01-QUICK-START.md](./01-QUICK-START.md) | Guia de início rápido |
| [02-USER-GUIDE.md](./02-USER-GUIDE.md) | Guia completo do usuário |
| [03-FEATURE-INDEX.md](./03-FEATURE-INDEX.md) | Índice de funcionalidades |
| [04-TECHNICAL-SUMMARY.md](./04-TECHNICAL-SUMMARY.md) | Resumo técnico |

## ✨ Exemplo de Transformação

### Antes
```powershell
function Get-Data{
Write-Host "Dados"
if ($ok){
return $data
}
}
```

### Depois
```powershell
function Get-Data {
    Write-Host "Dados"
    if ($ok) {
        return $data
    }
}
```

## 🎨 Funcionalidades

✅ Indentação automática baseada em estruturas de controle
✅ Normalização de espaçamento
✅ Remoção de linhas em branco desnecessárias
✅ Conversão de quebras de linha (LF/CRLF)
✅ Suporte a EditorConfig
✅ Formatação de seleção
✅ Configuração por projeto
✅ Sem dependências externas

## 🔧 Estrutura do Projeto

```
packages/powershell/
├── src/                      # Código TypeScript
│   ├── extension.ts          # Integração VS Code
│   ├── formatters/
│   │   ├── types.ts          # Tipos
│   │   ├── textUtils.ts      # Utilitários de texto
│   │   ├── powerShellFormatter.ts    # Formatter principal
│   │   └── powerShellRangeFormatter.ts # Formatter de range
│   └── *.test.ts             # Testes
├── l10n/                     # Localização
├── samples/                  # Exemplos e docs
└── [config files]            # package.json, tsconfig.json, etc
```

## 🧪 Testes

```bash
# Executar testes
pnpm -F ark-format-powershell test

# Watch mode
pnpm -F ark-format-powershell test -- --watch

# Com coverage
pnpm -F ark-format-powershell test -- --coverage
```

## 🏗️ Desenvolvimento

```bash
# Instalar dependências
pnpm install

# Build
pnpm -F ark-format-powershell build

# Watch mode
pnpm -F ark-format-powershell watch

# Lint
pnpm -F ark-format-powershell lint

# Criar VSIX package
pnpm -F ark-format-powershell package
```

## 📝 Notas

- A formatação preserva comentários e strings exatamente como estão
- Suporta todas as estruturas de controle do PowerShell
- Totalmente seguro - não executa código externo
- Otimizado para performance mesmo em arquivos grandes

## 🤝 Contribuir

Para contribuir:

1. Fork o repositório
2. Crie uma branch para sua feature
3. Adicione testes
4. Faça um pull request

## 📄 Licença

MIT - Veja [LICENSE](../../LICENSE) para detalhes

## 👤 Autor

**Tooark** - Criando ferramentas de formatação de código modernas

---

## 📖 Próximos Passos

👉 [Leia o Quick Start](./01-QUICK-START.md)
👉 [Veja as Funcionalidades](./03-FEATURE-INDEX.md)
👉 [Configuração Avançada](./04-TECHNICAL-SUMMARY.md)

Divirta-se formatando! 🎉
