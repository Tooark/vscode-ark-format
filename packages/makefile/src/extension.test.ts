import { beforeEach, describe, expect, it, vi } from 'vitest';

// Estado compartilhado com os mocks (hoisted para ficar disponível dentro de vi.mock)
const h = vi.hoisted(() => {
  const docProviders: any[] = [];
  const rangeProviders: any[] = [];
  const state = { config: undefined as any };

  return { docProviders, rangeProviders, state };
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
    }
  },
  workspace: {
    getConfiguration: () => h.state.config
  },
  Range: class { constructor (public start: unknown, public end: unknown) { } },
  Position: class { constructor (public line: number, public character: number) { } },
  TextEdit: { replace: (range: unknown, newText: string) => ({ range, newText }) }
}));

import { activate } from './extension';

/** Cria uma configuração fake do VS Code com valores controláveis. */
function makeConfig (values: Record<string, unknown> = {}) {
  return {
    get: (key: string) => values[key]
  };
}

/** Cria um documento fake; getText() retorna o texto completo e getText(range) retorna a seleção. */
function makeDocument (text: string, selection = '') {
  return {
    uri: { scheme: 'file', fsPath: 'C:/tmp/Makefile' },
    fileName: 'Makefile',
    getText: (range?: unknown) => (range ? selection : text),
    positionAt: (offset: number) => ({ line: 0, character: offset }),
    lineAt: (line: number) => ({ text: text.split('\n')[line] ?? '' })
  } as any;
}

const token = { isCancellationRequested: false } as any;
const cancelledToken = { isCancellationRequested: true } as any;
const editorOptions = { tabSize: 2, insertSpaces: true } as any;

/** Ativa a extensão com a configuração fornecida e retorna os providers registrados. */
function activateWith (values: Record<string, unknown> = {}) {
  h.state.config = makeConfig(values);
  const context = { subscriptions: [] as unknown[] };
  activate(context as any);

  return {
    context,
    doc: h.docProviders[h.docProviders.length - 1],
    range: h.rangeProviders[h.rangeProviders.length - 1]
  };
}

beforeEach(() => {
  h.docProviders.length = 0;
  h.rangeProviders.length = 0;
});

describe('activate', () => {
  it('registra os providers de documento e intervalo nas assinaturas do contexto', () => {
    const { context } = activateWith();

    expect(h.docProviders.length).toBe(1);
    expect(h.rangeProviders.length).toBe(1);
    expect(context.subscriptions.length).toBe(2);
  });
});

describe('provider de documento', () => {
  it('retorna vazio quando a formatação está desabilitada', () => {
    const { doc } = activateWith({ enabled: false });

    expect(doc.provideDocumentFormattingEdits(makeDocument('VAR=1\n'), editorOptions, token)).toEqual([]);
  });

  it('retorna vazio quando a operação foi cancelada', () => {
    const { doc } = activateWith();

    expect(doc.provideDocumentFormattingEdits(makeDocument('VAR=1\n'), editorOptions, cancelledToken)).toEqual([]);
  });

  it('formata o documento com os padrões da extensão', () => {
    const { doc } = activateWith();
    const edits = doc.provideDocumentFormattingEdits(makeDocument('VAR=1\n\n\n\nall:\n\techo hi\n'), editorOptions, token);

    expect(edits.length).toBe(1);
    expect(edits[0].newText).toBe('VAR = 1\n\nall:\n\techo hi\n');
  });
});

describe('provider de intervalo', () => {
  it('retorna vazio quando a formatação de intervalo está desabilitada', () => {
    const { range } = activateWith({ 'rangeFormatting.enabled': false });
    const document = makeDocument('VAR=1', 'VAR=1');
    const selection = { start: { line: 0, character: 0 }, end: { line: 0, character: 5 } };

    expect(range.provideDocumentRangeFormattingEdits(document, selection, editorOptions, token)).toEqual([]);
  });

  it('reindenta a seleção com a profundidade de condicionais do contexto (computeBaseIndent)', () => {
    const { range } = activateWith({ 'rangeFormatting.reindent': true });
    const document = makeDocument('ifeq ($(OS),Windows_NT)\nVAR=1\nendif', 'VAR=1');
    const selection = { start: { line: 1, character: 0 }, end: { line: 1, character: 5 } };

    const edits = range.provideDocumentRangeFormattingEdits(document, selection, editorOptions, token);

    expect(edits.length).toBe(1);
    expect(edits[0].newText).toBe('  VAR = 1');
  });

  it('ignora recipes e blocos define no cálculo do contexto', () => {
    const { range } = activateWith({ 'rangeFormatting.reindent': true });
    const fullText = 'define BLOCK\nifeq (a,a)\nendef\nall:\n\tifeq (b,b)\nifeq ($(OS),Windows_NT)\nVAR=1\nendif';
    const document = makeDocument(fullText, 'VAR=1');
    const selection = { start: { line: 6, character: 0 }, end: { line: 6, character: 5 } };

    const edits = range.provideDocumentRangeFormattingEdits(document, selection, editorOptions, token);

    // Apenas o ifeq da linha 5 conta: o de dentro do define e o da recipe (TAB) são ignorados
    expect(edits.length).toBe(1);
    expect(edits[0].newText).toBe('  VAR = 1');
  });
});
