import { describe, it, expect } from 'vitest';
import { createInitialState, dedentBeforeLine, indentAfterLine, isLineContinuation } from './powerShellIndent';

describe('isLineContinuation', () => {
  it('detects trailing backtick', () => {
    expect(isLineContinuation('Write-Host "hi" `')).toBe(true);
  });

  it('ignores escaped backtick', () => {
    expect(isLineContinuation('Write-Host "hi" ``')).toBe(false);
  });

  it('rejects no backtick', () => {
    expect(isLineContinuation('Write-Host "hi"')).toBe(false);
  });
});

describe('dedentBeforeLine', () => {
  it('dedents on closing brace', () => {
    const st = createInitialState();
    st.indent = 1;
    dedentBeforeLine('}', st);
    expect(st.indent).toBe(0);
  });

  it('dedents on else', () => {
    const st = createInitialState();
    st.indent = 1;
    dedentBeforeLine('else {', st);
    expect(st.indent).toBe(0);
  });

  it('dedents on elseif/catch/finally (case-insensitive)', () => {
    const st = createInitialState();
    st.indent = 2;
    dedentBeforeLine('ElseIf ($x) {', st);
    expect(st.indent).toBe(1);

    dedentBeforeLine('CATCH {', st);
    expect(st.indent).toBe(0);
  });

  it('does not dedent on prefix words', () => {
    const st = createInitialState();
    st.indent = 1;
    dedentBeforeLine('elseifExtra = $true', st);
    expect(st.indent).toBe(1);
  });

  it('does not remove continuation indent before line (happens in indentAfterLine)', () => {
    const st = createInitialState();
    st.indent = 2;
    st.continuation = true;
    dedentBeforeLine('Write-Host "continued"', st);
    expect(st.indent).toBe(2);
    expect(st.continuation).toBe(true);
  });

  it('ignores empty lines', () => {
    const st = createInitialState();
    st.indent = 1;
    dedentBeforeLine('', st);
    expect(st.indent).toBe(1);
  });

  it('ignores shebang lines', () => {
    const st = createInitialState();
    st.indent = 1;
    dedentBeforeLine('#!/usr/bin/env pwsh', st);
    expect(st.indent).toBe(1);
  });

  it('ignores full line comments', () => {
    const st = createInitialState();
    st.indent = 1;
    dedentBeforeLine('# this is a comment', st);
    expect(st.indent).toBe(1);
  });

  it('does not go below zero indent', () => {
    const st = createInitialState();
    st.indent = 0;
    dedentBeforeLine('}', st);
    expect(st.indent).toBe(0);
  });
});

describe('indentAfterLine', () => {
  it('indents after opening brace', () => {
    const st = createInitialState();
    indentAfterLine('if ($true) {', st);
    expect(st.indent).toBe(1);
  });

  it('indents after opening brace with inline comment', () => {
    const st = createInitialState();
    indentAfterLine('if ($true) { # comment', st);
    expect(st.indent).toBe(1);
  });

  it('sets continuation on line ending with backtick', () => {
    const st = createInitialState();
    indentAfterLine('Write-Host `', st);
    expect(st.indent).toBe(1);
    expect(st.continuation).toBe(true);
  });

  it('does not double-indent on continuation', () => {
    const st = createInitialState();
    st.indent = 1;
    st.continuation = true;
    indentAfterLine('-ArgumentList `', st);
    expect(st.indent).toBe(1);
    expect(st.continuation).toBe(true);
  });

  it('removes continuation indent after non-continuation line', () => {
    const st = createInitialState();
    st.indent = 1;
    st.continuation = true;
    indentAfterLine('$value', st);
    expect(st.indent).toBe(0);
    expect(st.continuation).toBe(false);
  });

  it('keeps level on single-line block clause', () => {
    const st = createInitialState();
    st.indent = 1;
    dedentBeforeLine('} catch {', st);
    indentAfterLine('} catch {', st);
    expect(st.indent).toBe(1);
  });

  it('ignores empty lines', () => {
    const st = createInitialState();
    st.indent = 0;
    indentAfterLine('', st);
    expect(st.indent).toBe(0);
  });

  it('ignores shebang lines', () => {
    const st = createInitialState();
    st.indent = 0;
    indentAfterLine('#!/usr/bin/env pwsh', st);
    expect(st.indent).toBe(0);
  });

  it('ignores full line comments', () => {
    const st = createInitialState();
    st.indent = 0;
    indentAfterLine('# this is a comment', st);
    expect(st.indent).toBe(0);
  });

  it('does not go below zero on continuation end', () => {
    const st = createInitialState();
    st.indent = 0;
    st.continuation = true;
    indentAfterLine('$value', st);
    expect(st.indent).toBe(0);
    expect(st.continuation).toBe(false);
  });
});
