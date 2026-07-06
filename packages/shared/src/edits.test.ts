import { describe, expect, it } from 'vitest';
import type * as vscode from 'vscode';
import { buildFullDocumentEdits, buildRangeEdits } from './edits';

function fakeDocument (text: string): vscode.TextDocument {
  return {
    getText: () => text,
    positionAt: (offset: number) => ({ line: 0, character: offset })
  } as unknown as vscode.TextDocument;
}

describe('buildFullDocumentEdits', () => {
  it('returns a full-document replace edit when the text changes', () => {
    const document = fakeDocument('a  b');
    const edits = buildFullDocumentEdits(document, () => 'a b');

    expect(edits.length).toBe(1);
    expect((edits[0] as unknown as { newText: string }).newText).toBe('a b');
  });

  it('returns no edits when the formatted text equals the original', () => {
    const document = fakeDocument('a b');
    const edits = buildFullDocumentEdits(document, (original) => original);

    expect(edits).toEqual([]);
  });
});

describe('buildRangeEdits', () => {
  const range = { start: { line: 0, character: 0 }, end: { line: 0, character: 4 } } as unknown as vscode.Range;

  it('returns a range replace edit when the selection changes', () => {
    const document = { getText: () => 'a  b' } as unknown as vscode.TextDocument;
    const edits = buildRangeEdits(document, range, () => 'a b');

    expect(edits.length).toBe(1);
    expect((edits[0] as unknown as { newText: string }).newText).toBe('a b');
  });

  it('returns no edits when the formatted selection equals the original', () => {
    const document = { getText: () => 'a b' } as unknown as vscode.TextDocument;
    const edits = buildRangeEdits(document, range, (selected) => selected);

    expect(edits).toEqual([]);
  });
});
