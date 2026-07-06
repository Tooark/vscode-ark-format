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
    uri: { scheme: 'file', fsPath: 'C:/tmp/script.ps1' },
    fileName: 'script.ps1',
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

    expect(doc.provideDocumentFormattingEdits(makeDocument('Write-Host "hi"\n'), editorOptions, token)).toEqual([]);
  });

  it('retorna vazio quando a operação foi cancelada', () => {
    const { doc } = activateWith();

    expect(doc.provideDocumentFormattingEdits(makeDocument('Write-Host "hi"\n'), editorOptions, cancelledToken)).toEqual([]);
  });

  it('formata o documento com os padrões da extensão (CRLF por padrão)', () => {
    const { doc } = activateWith();
    const edits = doc.provideDocumentFormattingEdits(makeDocument('if ($true) {\nWrite-Host "hi"\n}\n'), editorOptions, token);

    expect(edits.length).toBe(1);
    expect(edits[0].newText).toBe('if ($true) {\r\n  Write-Host "hi"\r\n}\r\n');
  });
});

describe('provider de intervalo', () => {
  it('retorna vazio quando a formatação de intervalo está desabilitada', () => {
    const { range } = activateWith({ 'rangeFormatting.enabled': false });
    const document = makeDocument('Write-Host "hi"', 'Write-Host "hi"');
    const selection = { start: { line: 0, character: 0 }, end: { line: 0, character: 15 } };

    expect(range.provideDocumentRangeFormattingEdits(document, selection, editorOptions, token)).toEqual([]);
  });

  it('reindenta a seleção usando o contexto das linhas anteriores (computeBaseIndent)', () => {
    const { range } = activateWith({ 'rangeFormatting.reindent': true });
    const document = makeDocument('if ($true) {\nWrite-Host "hi"\n}', 'Write-Host "hi"');
    const selection = { start: { line: 1, character: 0 }, end: { line: 1, character: 15 } };

    const edits = range.provideDocumentRangeFormattingEdits(document, selection, editorOptions, token);

    expect(edits.length).toBe(1);
    expect(edits[0].newText).toBe('  Write-Host "hi"');
  });

  it('não conta conteúdo de here-strings no cálculo do contexto', () => {
    const { range } = activateWith({ 'rangeFormatting.reindent': true });
    const document = makeDocument('$x = @"\nif ($true) {\n"@\nWrite-Host "next"', 'Write-Host "next"');
    const selection = { start: { line: 3, character: 0 }, end: { line: 3, character: 17 } };

    const edits = range.provideDocumentRangeFormattingEdits(document, selection, editorOptions, token);

    // Sem edições: a seleção já está no nível correto (baseIndent 0)
    expect(edits).toEqual([]);
  });
});
