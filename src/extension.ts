import * as vscode from 'vscode';
import { ShellFormatter } from './formatters/shellFormatter';
import { ShellRangeFormatter } from './formatters/shellRangeFormatter';

/**
 * Função de ativação da extensão. Registra os provedores de formatação para documentos e intervalos.
 * @param context O contexto de extensão fornecido pelo VS Code, usado para registrar os provedores e gerenciar suas assinaturas.
 */
export function activate (context: vscode.ExtensionContext) {
  console.log(vscode.l10n.t('Ark Format: Shell is now active!'));

  const selector: vscode.DocumentSelector = [
    { scheme: 'file', language: 'shellscript' },
    { scheme: 'untitled', language: 'shellscript' }
  ];

  // Registra o provedor de formatação de documento para arquivos de script shell
  const docProvider = vscode.languages.registerDocumentFormattingEditProvider(selector, {
    provideDocumentFormattingEdits (document, options, token) {
      const config = vscode.workspace.getConfiguration('arkFormatShell');

      // Verifica se a formatação está habilitada
      if (config.get<boolean>('enabled') === false) {
        return [];
      }

      // Verifica se o token de cancelamento foi acionado antes de iniciar a formatação
      if (token.isCancellationRequested) {
        return [];
      }

      // Cria uma instância do ShellFormatter com as opções configuradas
      const formatter = new ShellFormatter({
        indentSize: config.get<number>('indentSize') ?? options.tabSize,
        trimTrailingWhitespace: config.get<boolean>('trimTrailingWhitespace') ?? true,
        maxConsecutiveBlankLines: config.get<number>('maxConsecutiveBlankLines') ?? 1,
        removeLeadingBlankLines: config.get<boolean>('removeLeadingBlankLines') ?? true,
        insertFinalNewline: config.get<boolean>('insertFinalNewline') ?? true,
        lineEnding: (config.get<string>('lineEnding') ?? 'LF') as any,
        collapseSpaces: config.get<boolean>('collapseSpaces') ?? true,
        spacing: {
          spaceBeforeThenDo: config.get<boolean>('spacing.spaceBeforeThenDo') ?? true,
          spaceAfterKeywords: config.get<boolean>('spacing.spaceAfterKeywords') ?? true,
          spaceBeforeFunctionBrace: config.get<boolean>('spacing.spaceBeforeFunctionBrace') ?? true
        }
      });

      return formatter.formatDocument(document);
    }
  });

  // Registra o provedor de formatação de intervalo para arquivos de script shell
  const rangeProvider = vscode.languages.registerDocumentRangeFormattingEditProvider(selector, {
    provideDocumentRangeFormattingEdits (document, range, options, token) {
      const config = vscode.workspace.getConfiguration('arkFormatShell');

      // Verifica se a formatação está habilitada
      if (config.get<boolean>('enabled') === false) {
        return [];
      }

      // Verifica se a formatação de intervalo está habilitada
      if (config.get<boolean>('rangeFormatting.enabled') === false) {
        return [];
      }

      // Verifica se o token de cancelamento foi acionado antes de iniciar a formatação de intervalo
      if (token.isCancellationRequested) {
        return [];
      }

      // Obtém a configuração de reindentação para formatação de intervalo
      const reindent = config.get<boolean>('rangeFormatting.reindent') ?? false;

      // Cria uma instância do ShellRangeFormatter com as opções configuradas
      const formatter = new ShellRangeFormatter({
        indentSize: config.get<number>('indentSize') ?? options.tabSize,
        trimTrailingWhitespace: config.get<boolean>('trimTrailingWhitespace') ?? true,
        maxConsecutiveBlankLines: config.get<number>('maxConsecutiveBlankLines') ?? 1,
        removeLeadingBlankLines: false,
        insertFinalNewline: false,
        lineEnding: 'Auto' as any,
        collapseSpaces: config.get<boolean>('collapseSpaces') ?? true,
        spacing: {
          spaceBeforeThenDo: config.get<boolean>('spacing.spaceBeforeThenDo') ?? true,
          spaceAfterKeywords: config.get<boolean>('spacing.spaceAfterKeywords') ?? true,
          spaceBeforeFunctionBrace: config.get<boolean>('spacing.spaceBeforeFunctionBrace') ?? true
        },
        reindent
      } as any);

      return formatter.formatRange(document, range);
    }
  });

  context.subscriptions.push(docProvider, rangeProvider);
}

/**
 * Função de desativação da extensão.
 */
export function deactivate () { }
