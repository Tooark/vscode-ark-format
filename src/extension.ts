import * as vscode from 'vscode';
import { ShellFormatter } from './formatters/shellFormatter';
import { ShellRangeFormatter } from './formatters/shellRangeFormatter';
import { runShfmt } from './formatters/shfmtRunner';
import { parseEditorConfig, applyEditorConfigOverrides } from './formatters/editorConfigReader';
import { ShellFormatterOptions, FormatterEngine, LineEnding } from './formatters/types';
import { createInitialState, dedentBeforeLine, indentAfterLine } from './formatters/shellIndent';
import { detectHeredocInCode, isShebang, isFullLineComment } from './formatters/shellLex';

/** DiagnosticCollection compartilhada para erros de formatação */
let diagnosticCollection: vscode.DiagnosticCollection;

/**
 * Função de ativação da extensão. Registra os provedores de formatação para documentos e intervalos.
 * @param context O contexto de extensão fornecido pelo VS Code, usado para registrar os provedores e gerenciar suas assinaturas.
 */
export function activate (context: vscode.ExtensionContext) {
  console.log(vscode.l10n.t('ark.active'));

  diagnosticCollection = vscode.languages.createDiagnosticCollection('ark-format-shell');
  context.subscriptions.push(diagnosticCollection);

  // Escopo de linguagens configurável
  const config = vscode.workspace.getConfiguration('arkFormatShell');
  const effectLanguages = config.get<string[]>('effectLanguages') ?? ['shellscript'];
  const schemes = ['file', 'untitled'];

  // Cria um seletor de documentos combinando os idiomas e esquemas configurados
  const selector: vscode.DocumentSelector = effectLanguages.flatMap(lang =>
    schemes.map(scheme => ({ scheme, language: lang }))
  );

  // Registra o provedor de formatação de documento
  const docProvider = vscode.languages.registerDocumentFormattingEditProvider(selector, {
    provideDocumentFormattingEdits (document, options, token) {
      const cfg = vscode.workspace.getConfiguration('arkFormatShell');

      // Verifica se a formatação está habilitada globalmente
      if (cfg.get<boolean>('enabled') === false) {
        return [];
      }

      // Verifica se a operação de formatação foi cancelada
      if (token.isCancellationRequested) {
        return [];
      }

      // Verifica qual engine de formatação usar (interna ou shfmt)
      const engine = (cfg.get<string>('engine') ?? 'internal') as FormatterEngine;

      // Engine externa shfmt
      if (engine === 'shfmt') {
        return formatWithShfmt(document, cfg);
      }

      // Engine interna
      let opts = buildFormatterOptions(cfg, options);

      // Suporte EditorConfig
      if (cfg.get<boolean>('useEditorConfig') === true && document.uri.scheme === 'file') {
        const ecProps = parseEditorConfig(document.uri.fsPath);
        opts = applyEditorConfigOverrides(opts, ecProps);
      }

      // Cria o formatador interno com as opções construídas
      const formatter = new ShellFormatter(opts);

      // Limpa diagnósticos ao formatar com sucesso
      diagnosticCollection.delete(document.uri);

      // Formata o documento usando o formatador interno e retorna as edições necessárias
      return formatter.formatDocument(document);
    }
  });

  // Registra o provedor de formatação de intervalo
  const rangeProvider = vscode.languages.registerDocumentRangeFormattingEditProvider(selector, {
    provideDocumentRangeFormattingEdits (document, range, options, token) {
      const cfg = vscode.workspace.getConfiguration('arkFormatShell');

      // Verifica se a formatação está habilitada globalmente
      if (cfg.get<boolean>('enabled') === false) {
        return [];
      }

      // Verifica se a formatação de intervalo está habilitada  
      if (cfg.get<boolean>('rangeFormatting.enabled') === false) {
        return [];
      }

      // Verifica se a operação de formatação foi cancelada
      if (token.isCancellationRequested) {
        return [];
      }

      const reindent = cfg.get<boolean>('rangeFormatting.reindent') ?? false;

      let opts = buildFormatterOptions(cfg, options);

      // EditorConfig no range também
      if (cfg.get<boolean>('useEditorConfig') === true && document.uri.scheme === 'file') {
        const ecProps = parseEditorConfig(document.uri.fsPath);
        opts = applyEditorConfigOverrides(opts, ecProps);
      }

      // Calcula baseIndent a partir das linhas anteriores à seleção
      const baseIndent = reindent ? computeBaseIndent(document, range.start.line) : 0;

      // Cria o formatador de intervalo com as opções construídas, incluindo baseIndent
      const formatter = new ShellRangeFormatter({
        ...opts,
        removeLeadingBlankLines: false,
        insertFinalNewline: false,
        lineEnding: 'Auto' as LineEnding,
        reindent,
        baseIndent
      });

      return formatter.formatRange(document, range);
    }
  });

  // Limpa diagnósticos quando o documento é fechado
  context.subscriptions.push(
    vscode.workspace.onDidCloseTextDocument(doc => {
      diagnosticCollection.delete(doc.uri);
    })
  );

  // Adiciona os provedores de formatação às assinaturas do contexto para gerenciamento de ciclo de vida
  context.subscriptions.push(docProvider, rangeProvider);
}

/**
 * Função para construir as opções do formatador interno a partir da configuração do VS Code e do EditorConfig.
 * As opções do EditorConfig sobrescrevem as opções padrão apenas quando definidas.
 * @param cfg Configuração do VS Code para a extensão, usada para ler as opções de formatação.
 * @param editorOptions Opções de formatação fornecidas pelo editor (ex: tabSize), usadas como fallback para algumas configurações.
 * @returns As opções de formatação construídas a partir da configuração do VS Code e do EditorConfig.
 */
function buildFormatterOptions (cfg: vscode.WorkspaceConfiguration, editorOptions: vscode.FormattingOptions): ShellFormatterOptions {
  return {
    indentSize: cfg.get<number>('indentSize') ?? editorOptions.tabSize,
    trimTrailingWhitespace: cfg.get<boolean>('trimTrailingWhitespace') ?? true,
    maxConsecutiveBlankLines: cfg.get<number>('maxConsecutiveBlankLines') ?? 1,
    removeLeadingBlankLines: cfg.get<boolean>('removeLeadingBlankLines') ?? true,
    insertFinalNewline: cfg.get<boolean>('insertFinalNewline') ?? true,
    lineEnding: (cfg.get<string>('lineEnding') ?? 'LF') as LineEnding,
    collapseSpaces: cfg.get<boolean>('collapseSpaces') ?? true,
    spacing: {
      spaceBeforeThenDo: cfg.get<boolean>('spacing.spaceBeforeThenDo') ?? true,
      spaceAfterKeywords: cfg.get<boolean>('spacing.spaceAfterKeywords') ?? true,
      spaceBeforeFunctionBrace: cfg.get<boolean>('spacing.spaceBeforeFunctionBrace') ?? true
    }
  };
}

/**
 * Função que formata o documento usando o binário externo shfmt.
 * Registra diagnósticos no painel de Problems em caso de erro.
 * @param document O documento a ser formatado.
 * @param cfg A configuração do VS Code para a extensão, usada para ler as opções de formatação.
 * @returns Um array de TextEdit contendo as edições necessárias para formatar o documento,
 * ou um array vazio se não houver alterações.
 * @remarks Esta função é assíncrona e executa o binário shfmt como um processo filho.
 * O resultado da formatação é processado para gerar as edições ou os diagnósticos de erro.
 * Os diagnósticos incluem a linha, coluna e mensagem de erro retornados pelo shfmt em caso
 * de sintaxe inválida. Se a formatação for bem-sucedida mas o texto formatado for idêntico ao original,
 * retorna um array vazio para evitar edições desnecessárias.
 */
async function formatWithShfmt (document: vscode.TextDocument, cfg: vscode.WorkspaceConfiguration): Promise<vscode.TextEdit[]> {
  // Carrega o caminho e as flags do shfmt a partir da configuração
  const shfmtPath = cfg.get<string>('shfmt.path') ?? 'shfmt';
  const shfmtFlags = cfg.get<string>('shfmt.flags') ?? '';

  // Carrega o conteúdo do documento e executa o shfmt para formatar o texto
  const original = document.getText();
  const result = await runShfmt(original, shfmtPath, shfmtFlags, document.fileName);

  // Verifica se a formatação foi bem-sucedida
  if (result.success && result.formatted !== undefined) {
    diagnosticCollection.delete(document.uri);

    // Verifica se o texto formatado é idêntico ao original para evitar edições desnecessárias
    if (result.formatted === original) {
      return [];
    }

    // Usa a extensão total do documento para a edição
    const fullRange = new vscode.Range(
      document.positionAt(0),
      document.positionAt(original.length)
    );

    return [vscode.TextEdit.replace(fullRange, result.formatted)];
  }

  // Registra o erro como diagnóstico
  if (result.errorMessage) {
    const line = Math.max(0, (result.errorLine ?? 1) - 1);
    const column = Math.max(0, (result.errorColumn ?? 1) - 1);
    const pos = new vscode.Position(line, column);

    const diagnostic = new vscode.Diagnostic(
      new vscode.Range(pos, pos),
      result.errorMessage,
      vscode.DiagnosticSeverity.Error
    );

    diagnostic.source = 'ark-format-shell (shfmt)';
    diagnosticCollection.set(document.uri, [diagnostic]);
  }

  return [];
}

/**
 * Função para calcular o nível de indentação base a partir do contexto do documento,
 * analisando as linhas anteriores à seleção.
 * @param document O documento a ser analisado.
 * @param startLine A linha inicial da seleção.
 * @returns O nível de indentação base.
 */
function computeBaseIndent (document: vscode.TextDocument, startLine: number): number {
  const st = createInitialState();

  // Itera sobre as linhas anteriores à seleção para calcular o estado de indentação
  for (let i = 0; i < startLine; i++) {
    const raw = document.lineAt(i).text;
    const trimmed = raw.trim();

    // Verifica se estamos dentro de um heredoc e atualiza o estado de acordo
    if (st.inHeredoc) {
      // Verifica se a linha atual é o terminador do heredoc
      if (trimmed === st.heredocEnd) {
        st.inHeredoc = false;
        st.heredocEnd = '';
      }

      continue;
    }

    const heredocEnd = detectHeredocInCode(trimmed);

    // Verifica se a linha é vazia, um shebang ou um comentário de linha inteira
    if (trimmed === '' || isShebang(trimmed) || isFullLineComment(trimmed)) {
      // Verifica se há um heredoc na linha atual
      if (heredocEnd) {
        st.inHeredoc = true;
        st.heredocEnd = heredocEnd;
      }

      continue;
    }

    // Aplica a dedentação antes de processar a linha
    dedentBeforeLine(trimmed, st);
    indentAfterLine(trimmed, st);

    // Verifica se há um heredoc na linha atual
    if (heredocEnd) {
      st.inHeredoc = true;
      st.heredocEnd = heredocEnd;
    }
  }

  // O nível de indentação base é o nível atual após processar as linhas anteriores
  return Math.max(0, st.indent);
}

/**
 * Função de desativação da extensão.
 */
export function deactivate () { }
