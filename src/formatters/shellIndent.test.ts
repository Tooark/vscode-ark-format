import { describe, it, expect } from 'vitest';
import { createInitialState, dedentBeforeLine, indentAfterLine, isLineContinuation } from './shellIndent';

describe('isLineContinuation', () => {
  it('detects trailing backslash', () => {
    expect(isLineContinuation('echo hello \\')).toBe(true);
  });
  it('ignores escaped backslash', () => {
    expect(isLineContinuation('echo hello \\\\')).toBe(false);
  });
  it('rejects no backslash', () => {
    expect(isLineContinuation('echo hello')).toBe(false);
  });
});

describe('dedentBeforeLine', () => {
  it('dedents on fi with word boundary', () => {
    const st = createInitialState();
    st.indent = 1;
    dedentBeforeLine('fi', st);
    expect(st.indent).toBe(0);
  });

  it('does NOT dedent on words starting with fi', () => {
    const st = createInitialState();
    st.indent = 1;
    dedentBeforeLine('final_var=1', st);
    expect(st.indent).toBe(1);
  });

  it('dedents on done with word boundary', () => {
    const st = createInitialState();
    st.indent = 1;
    dedentBeforeLine('done', st);
    expect(st.indent).toBe(0);
  });

  it('does NOT dedent on words starting with done', () => {
    const st = createInitialState();
    st.indent = 1;
    dedentBeforeLine('donext=1', st);
    expect(st.indent).toBe(1);
  });

  it('dedents on esac', () => {
    const st = createInitialState();
    st.indent = 2;
    st.inCase = true;
    st.inCasePatternBody = true;
    dedentBeforeLine('esac', st);
    expect(st.indent).toBe(0);
    expect(st.inCase).toBe(false);
  });

  it('dedents on else and elif', () => {
    const st = createInitialState();
    st.indent = 1;
    dedentBeforeLine('else', st);
    expect(st.indent).toBe(0);
  });

  it('dedents on closing brace', () => {
    const st = createInitialState();
    st.indent = 1;
    dedentBeforeLine('}', st);
    expect(st.indent).toBe(0);
  });

  it('handles case terminator ;;&', () => {
    const st = createInitialState();
    st.indent = 2;
    st.inCase = true;
    st.inCasePatternBody = true;
    dedentBeforeLine(';;&', st);
    expect(st.indent).toBe(1);
    expect(st.inCasePatternBody).toBe(false);
  });

  it('handles case terminator ;&', () => {
    const st = createInitialState();
    st.indent = 2;
    st.inCase = true;
    st.inCasePatternBody = true;
    dedentBeforeLine(';&', st);
    expect(st.indent).toBe(1);
    expect(st.inCasePatternBody).toBe(false);
  });

  it('does NOT remove continuation indent before line (happens in indentAfterLine)', () => {
    const st = createInitialState();
    st.indent = 2;
    st.continuation = true;
    dedentBeforeLine('echo continued', st);
    // continuation is preserved until indentAfterLine
    expect(st.indent).toBe(2);
    expect(st.continuation).toBe(true);
  });
});

describe('indentAfterLine', () => {
  it('indents after case...in', () => {
    const st = createInitialState();
    indentAfterLine('case "$1" in', st);
    expect(st.indent).toBe(1);
    expect(st.inCase).toBe(true);
  });

  it('indents after then', () => {
    const st = createInitialState();
    indentAfterLine('if [ true ]; then', st);
    expect(st.indent).toBe(1);
  });

  it('indents after do', () => {
    const st = createInitialState();
    indentAfterLine('for i in 1 2 3; do', st);
    expect(st.indent).toBe(1);
  });

  it('indents after opening brace', () => {
    const st = createInitialState();
    indentAfterLine('myfunc() {', st);
    expect(st.indent).toBe(1);
  });

  it('indents case pattern', () => {
    const st = createInitialState();
    st.inCase = true;
    indentAfterLine('start)', st);
    expect(st.indent).toBe(1);
    expect(st.inCasePatternBody).toBe(true);
  });

  it('sets continuation on line ending with backslash', () => {
    const st = createInitialState();
    indentAfterLine('echo hello \\', st);
    expect(st.indent).toBe(1);
    expect(st.continuation).toBe(true);
  });

  it('does not double-indent on continuation', () => {
    const st = createInitialState();
    st.indent = 1;
    st.continuation = true;
    indentAfterLine('--option \\', st);
    expect(st.indent).toBe(1);
    expect(st.continuation).toBe(true);
  });

  it('removes continuation indent after non-continuation line', () => {
    const st = createInitialState();
    st.indent = 1;
    st.continuation = true;
    indentAfterLine('world', st);
    expect(st.indent).toBe(0);
    expect(st.continuation).toBe(false);
  });

  it('does NOT treat line ending with ) inside case body as new pattern', () => {
    const st = createInitialState();
    st.inCase = true;
    st.inCasePatternBody = true;
    st.indent = 3;
    indentAfterLine('trivy_extras=("$@")', st);
    expect(st.indent).toBe(3);
    expect(st.inCasePatternBody).toBe(true);
  });

  it('does treat line ending with ) as new pattern when not in body', () => {
    const st = createInitialState();
    st.inCase = true;
    st.inCasePatternBody = false;
    st.indent = 1;
    indentAfterLine('--)', st);
    expect(st.indent).toBe(2);
    expect(st.inCasePatternBody).toBe(true);
  });
});
