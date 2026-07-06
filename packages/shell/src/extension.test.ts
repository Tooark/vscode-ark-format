import { beforeEach, describe, expect, it, vi } from 'vitest';

// Estado compartilhado com os mocks (hoisted para ficar disponível dentro de vi.mock)
const h = vi.hoisted(() => {
  const docProviders: any[] = [];
  const rangeProviders: any[] = [];
  const diagCollections: any[] = [];
  const state = { config: undefined as any };

  return { docProviders, rangeProviders, diagCollections, state, runShfmt: vi.fn() };
});

// Mock do módulo vscode: captura os providers registrados e expõe uma configuração controlável
vi.mock('vscode', () => ({
  languages: {
    registerDocumentFormattingEditProvider: (_selector: unknown, provider: unknown) => {
      h.docProviders.push(provider);

      return { dispose () { } };
    },
    registerDocumentRangeFormattingEditProvider: (_selector: unknown, provider: unknown) => {
      h.rangeProviders.push(provider);

      return { dispose () { } };
    },
    createDiagnosticCollection: () => {
      const collection = {
        entries: new Map<unknown, unknown>(),
        set (uri: unknown, diagnostics: unknown) { this.entries.set(uri, diagnostics); },
        delete (uri: unknown) { this.entries.delete(uri); },
        dispose () { }
      };
      h.diagCollections.push(collection);

      return collection;
    }
  },
  workspace: {
    getConfiguration: () => h.state.config,
    onDidCloseTextDocument: () => ({ dispose () { } })
  },
  l10n: { t: (message: string) => message },
  Range: class { constructor (public start: unknown, public end: unknown) { } },
  Position: class { constructor (public line: number, public character: number) { } },
  TextEdit: { replace: (range: unknown, newText: string) => ({ range, newText }) },
  Diagnostic: class {
    public source?: string;
    constructor (public range: any, public message: string, public severity: unknown) { }
  },
  DiagnosticSeverity: { Error: 0 }
}));

// Mock do runner do shfmt para não depender do binário externo
vi.mock('./formatters/shfmtRunner', () => ({
  runShfmt: (...args: unknown[]) => h.runShfmt(...args)
}));

import { activate } from './extension';

/** Cria uma configuração fake do VS Code com valores e resultados de inspect controláveis. */
function makeConfig (values: Record<string, unknown> = {}, inspections: Record<string, unknown> = {}) {
  return {
    get: (key: string) => values[key],
    inspect: (key: string) => inspections[key]
  };
}

/** Cria um documento fake; getText() retorna o texto completo e getText(range) retorna a seleção. */
function makeDocument (text: string, selection = '') {
  return {
    uri: { scheme: 'file', fsPath: 'C:/tmp/script.sh' },
    fileName: 'script.sh',
    getText: (range?: unknown) => (range ? selection : text),
    positionAt: (offset: number) => ({ line: 0, character: offset }),
    lineAt: (line: number) => ({ text: text.split('\n')[line] ?? '' })
  } as any;
}

const token = { isCancellationRequested: false } as any;
const cancelledToken = { isCancellationRequested: true } as any;
const editorOptions = { tabSize: 2, insertSpaces: true } as any;

/** Ativa a extensão com a configuração fornecida e retorna os providers registrados. */
function activateWith (values: Record<string, unknown> = {}, inspections: Record<string, unknown> = {}) {
  h.state.config = makeConfig(values, inspections);
  const context = { subscriptions: [] as unknown[] };
  activate(context as any);

  return {
    context,
    doc: h.docProviders[h.docProviders.length - 1],
    range: h.rangeProviders[h.rangeProviders.length - 1],
    diagnostics: h.diagCollections[h.diagCollections.length - 1]
  };
}

beforeEach(() => {
  h.docProviders.length = 0;
  h.rangeProviders.length = 0;
  h.diagCollections.length = 0;
  h.runShfmt.mockReset();
});

describe('activate', () => {
  it('registra os providers de documento e intervalo nas assinaturas do contexto', () => {
    const { context } = activateWith();

    expect(h.docProviders.length).toBe(1);
    expect(h.rangeProviders.length).toBe(1);
    // diagnósticos + listener de fechamento + dois providers
    expect(context.subscriptions.length).toBe(4);
  });
});

describe('provider de documento (engine interna)', () => {
  it('retorna vazio quando a formatação está desabilitada', () => {
    const { doc } = activateWith({ enabled: false });

    expect(doc.provideDocumentFormattingEdits(makeDocument('echo hi\n'), editorOptions, token)).toEqual([]);
  });

  it('retorna vazio quando a operação foi cancelada', () => {
    const { doc } = activateWith();

    expect(doc.provideDocumentFormattingEdits(makeDocument('echo hi\n'), editorOptions, cancelledToken)).toEqual([]);
  });

  it('formata o documento com os padrões da extensão', () => {
    const { doc } = activateWith();
    const edits = doc.provideDocumentFormattingEdits(makeDocument('if[ true ];then\necho hi\nfi\n'), editorOptions, token);

    expect(edits.length).toBe(1);
    expect(edits[0].newText).toBe('if [ true ]; then\n  echo hi\nfi\n');
  });
});

describe('provider de documento (engine shfmt)', () => {
  it('executa o shfmt e retorna a edição com o texto formatado', async () => {
    const { doc } = activateWith({ engine: 'shfmt' });
    h.runShfmt.mockResolvedValue({ success: true, formatted: 'echo formatted\n' });

    const edits = await doc.provideDocumentFormattingEdits(makeDocument('echo hi\n'), editorOptions, token);

    expect(h.runShfmt).toHaveBeenCalledWith('echo hi\n', 'shfmt', '', 'script.sh');
    expect(edits.length).toBe(1);
    expect(edits[0].newText).toBe('echo formatted\n');
  });

  it('retorna vazio quando o shfmt não altera o texto', async () => {
    const { doc } = activateWith({ engine: 'shfmt' });
    h.runShfmt.mockResolvedValue({ success: true, formatted: 'echo hi\n' });

    const edits = await doc.provideDocumentFormattingEdits(makeDocument('echo hi\n'), editorOptions, token);

    expect(edits).toEqual([]);
  });

  it('ignora shfmt.path definido no escopo do workspace e usa o valor de usuário (segurança)', async () => {
    const { doc } = activateWith({ engine: 'shfmt' }, {
      'shfmt.path': { workspaceValue: 'C:/repo/evil-shfmt.exe', globalValue: 'C:/tools/shfmt.exe' }
    });
    h.runShfmt.mockResolvedValue({ success: true, formatted: 'x\n' });

    await doc.provideDocumentFormattingEdits(makeDocument('echo hi\n'), editorOptions, token);

    expect(h.runShfmt.mock.calls[0][1]).toBe('C:/tools/shfmt.exe');
  });

  it('cai no fallback quando o único valor definido vem do workspaceFolder (segurança)', async () => {
    const { doc } = activateWith({ engine: 'shfmt' }, {
      'shfmt.path': { workspaceFolderValue: 'C:/repo/evil-shfmt.exe' }
    });
    h.runShfmt.mockResolvedValue({ success: true, formatted: 'x\n' });

    await doc.provideDocumentFormattingEdits(makeDocument('echo hi\n'), editorOptions, token);

    expect(h.runShfmt.mock.calls[0][1]).toBe('shfmt');
  });

  it('converte erro de sintaxe do shfmt em diagnóstico no documento', async () => {
    const { doc, diagnostics } = activateWith({ engine: 'shfmt' });
    h.runShfmt.mockResolvedValue({ success: false, errorLine: 3, errorColumn: 5, errorMessage: 'syntax error near token' });

    const edits = await doc.provideDocumentFormattingEdits(makeDocument('echo hi\n'), editorOptions, token);

    expect(edits).toEqual([]);
    expect(diagnostics.entries.size).toBe(1);

    const [diags] = [...diagnostics.entries.values()] as any[];
    expect(diags[0].message).toBe('syntax error near token');
    expect(diags[0].range.start.line).toBe(2);
    expect(diags[0].range.start.character).toBe(4);
  });
});

describe('provider de intervalo', () => {
  it('retorna vazio quando a formatação de intervalo está desabilitada', () => {
    const { range } = activateWith({ 'rangeFormatting.enabled': false });
    const document = makeDocument('echo hi', 'echo hi');
    const selection = { start: { line: 0, character: 0 }, end: { line: 0, character: 7 } };

    expect(range.provideDocumentRangeFormattingEdits(document, selection, editorOptions, token)).toEqual([]);
  });

  it('reindenta a seleção usando o contexto das linhas anteriores (computeBaseIndent)', () => {
    const { range } = activateWith({ 'rangeFormatting.reindent': true });
    const document = makeDocument('if [ true ]; then\necho one\nfi', 'echo one');
    const selection = { start: { line: 1, character: 0 }, end: { line: 1, character: 8 } };

    const edits = range.provideDocumentRangeFormattingEdits(document, selection, editorOptions, token);

    expect(edits.length).toBe(1);
    expect(edits[0].newText).toBe('  echo one');
  });

  it('não conta palavras-chave dentro de strings multilinha no cálculo do contexto', () => {
    const { range } = activateWith({ 'rangeFormatting.reindent': true });
    const document = makeDocument('msg="line one\nif [ x ]; then\n"\necho next', 'echo next');
    const selection = { start: { line: 3, character: 0 }, end: { line: 3, character: 9 } };

    const edits = range.provideDocumentRangeFormattingEdits(document, selection, editorOptions, token);

    // Sem edições: a seleção já está no nível correto (baseIndent 0)
    expect(edits).toEqual([]);
  });
});
