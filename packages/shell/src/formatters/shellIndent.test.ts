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

  it('dedents on endif with word boundary (tcsh)', () => {
    const st = createInitialState();
    st.indent = 1;
    dedentBeforeLine('endif', st);
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

  it('dedents on end with word boundary (tcsh)', () => {
    const st = createInitialState();
    st.indent = 1;
    dedentBeforeLine('end', st);
    expect(st.indent).toBe(0);
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

  it('does not dedent a non-terminator line that merely ends with ;; after other code', () => {
    const st = createInitialState();
    st.indent = 2;
    st.inCase = true;
    st.inCasePatternBody = true;
    dedentBeforeLine('CLI_BRANCH="${2}"; shift 2 ;;', st);
    expect(st.indent).toBe(2);
    expect(st.inCasePatternBody).toBe(true);
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

  it('dedents tcsh case label when inCasePatternBody', () => {
    const st = createInitialState();
    st.indent = 2;
    st.inCase = true;
    st.inCasePatternBody = true;
    dedentBeforeLine('case "stop":', st);
    expect(st.indent).toBe(1);
    expect(st.inCasePatternBody).toBe(false);
  });

  it('dedents tcsh default: label when inCasePatternBody', () => {
    const st = createInitialState();
    st.indent = 2;
    st.inCase = true;
    st.inCasePatternBody = true;
    dedentBeforeLine('default:', st);
    expect(st.indent).toBe(1);
    expect(st.inCasePatternBody).toBe(false);
  });

  it('does not dedent shebang', () => {
    const st = createInitialState();
    st.indent = 1;
    dedentBeforeLine('#!/bin/bash', st);
    expect(st.indent).toBe(1);
  });

  it('does not dedent empty line', () => {
    const st = createInitialState();
    st.indent = 1;
    dedentBeforeLine('', st);
    expect(st.indent).toBe(1);
  });

  it('does not dedent full line comment', () => {
    const st = createInitialState();
    st.indent = 1;
    dedentBeforeLine('# comment', st);
    expect(st.indent).toBe(1);
  });

  it('dedents endsw (tcsh)', () => {
    const st = createInitialState();
    st.indent = 2;
    st.inCase = true;
    st.inCasePatternBody = true;
    dedentBeforeLine('endsw', st);
    expect(st.indent).toBe(0);
    expect(st.inCase).toBe(false);
  });

  it('dedents esac without inCasePatternBody', () => {
    const st = createInitialState();
    st.indent = 1;
    st.inCase = true;
    st.inCasePatternBody = false;
    dedentBeforeLine('esac', st);
    expect(st.indent).toBe(0);
    expect(st.inCase).toBe(false);
  });
});

describe('indentAfterLine', () => {
  it('indents after case...in', () => {
    const st = createInitialState();
    indentAfterLine('case "$1" in', st);
    expect(st.indent).toBe(1);
    expect(st.inCase).toBe(true);
  });

  it('indents after case...in with inline comment', () => {
    const st = createInitialState();
    indentAfterLine('case "$1" in # options', st);
    expect(st.indent).toBe(1);
    expect(st.inCase).toBe(true);
  });

  it('indents after then', () => {
    const st = createInitialState();
    indentAfterLine('if [ true ]; then', st);
    expect(st.indent).toBe(1);
  });

  it('indents after then with inline comment', () => {
    const st = createInitialState();
    indentAfterLine('if [ true ]; then # explanation', st);
    expect(st.indent).toBe(1);
  });

  it('indents after if with inline then body when block continues', () => {
    const st = createInitialState();
    indentAfterLine('if [[ "$target_set" == "false" ]]; then target="$1"; shift', st);
    expect(st.indent).toBe(1);
  });

  it('does not indent after else when fi closes on the same line', () => {
    const st = createInitialState();
    st.indent = 2;
    st.inCase = true;
    st.inCasePatternBody = true;
    indentAfterLine('else break; fi ;;', st);
    expect(st.indent).toBe(1);
    expect(st.inCasePatternBody).toBe(false);
  });

  it('dedents after inline fi when line does not start with fi', () => {
    const st = createInitialState();
    st.indent = 1;
    indentAfterLine('return; fi', st);
    expect(st.indent).toBe(0);
  });

  it('does not dedent one-line if that opens and closes on the same line', () => {
    const st = createInitialState();
    st.indent = 1;
    indentAfterLine('if [ "$ok" = "true" ]; then echo "ok"; fi', st);
    expect(st.indent).toBe(1);
  });

  it('indents after do', () => {
    const st = createInitialState();
    indentAfterLine('for i in 1 2 3; do', st);
    expect(st.indent).toBe(1);
  });

  it('indents after do with inline comment', () => {
    const st = createInitialState();
    indentAfterLine('for i in 1 2 3; do # loop', st);
    expect(st.indent).toBe(1);
  });

  it('indents after tcsh foreach', () => {
    const st = createInitialState();
    indentAfterLine('foreach svc ($services)', st);
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

  it('indents case pattern with inline comment', () => {
    const st = createInitialState();
    st.inCase = true;
    indentAfterLine('start) # comment', st);
    expect(st.indent).toBe(1);
    expect(st.inCasePatternBody).toBe(true);
  });

  it('closes case pattern body when terminator is inline at end of line', () => {
    const st = createInitialState();
    st.indent = 2;
    st.inCase = true;
    st.inCasePatternBody = true;
    indentAfterLine('CLI_BRANCH="${2}"; shift 2 ;;', st);
    expect(st.indent).toBe(1);
    expect(st.inCasePatternBody).toBe(false);
  });

  it('closes case pattern body when inline terminator has trailing comment', () => {
    const st = createInitialState();
    st.indent = 2;
    st.inCase = true;
    st.inCasePatternBody = true;
    indentAfterLine('CLI_BRANCH="${2}"; shift 2 ;;& # fallthrough', st);
    expect(st.indent).toBe(1);
    expect(st.inCasePatternBody).toBe(false);
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

  it('does not indent after shebang', () => {
    const st = createInitialState();
    indentAfterLine('#!/bin/bash', st);
    expect(st.indent).toBe(0);
  });

  it('does not indent after empty line', () => {
    const st = createInitialState();
    indentAfterLine('', st);
    expect(st.indent).toBe(0);
  });

  it('does not indent after full line comment', () => {
    const st = createInitialState();
    indentAfterLine('# comment', st);
    expect(st.indent).toBe(0);
  });

  it('indents after else', () => {
    const st = createInitialState();
    indentAfterLine('else', st);
    expect(st.indent).toBe(1);
  });

  it('indents after elif...then', () => {
    const st = createInitialState();
    indentAfterLine('elif [ "$x" = "1" ]; then', st);
    expect(st.indent).toBe(1);
  });

  it('indents after tcsh while', () => {
    const st = createInitialState();
    indentAfterLine('while ($count < 10)', st);
    expect(st.indent).toBe(1);
  });

  it('indents after opening brace with inline comment', () => {
    const st = createInitialState();
    indentAfterLine('myfunc() { # start', st);
    expect(st.indent).toBe(1);
  });

  it('indents after switch (tcsh)', () => {
    const st = createInitialState();
    indentAfterLine('switch ($1)', st);
    expect(st.indent).toBe(1);
    expect(st.inCase).toBe(true);
  });

  it('indents tcsh case label', () => {
    const st = createInitialState();
    st.inCase = true;
    st.inCasePatternBody = false;
    indentAfterLine('case "start":', st);
    expect(st.indent).toBe(1);
    expect(st.inCasePatternBody).toBe(true);
  });

  it('indents tcsh default: label', () => {
    const st = createInitialState();
    st.inCase = true;
    st.inCasePatternBody = false;
    indentAfterLine('default:', st);
    expect(st.indent).toBe(1);
    expect(st.inCasePatternBody).toBe(true);
  });

  it('dedents after breaksw (tcsh)', () => {
    const st = createInitialState();
    st.inCase = true;
    st.inCasePatternBody = true;
    st.indent = 2;
    indentAfterLine('breaksw', st);
    expect(st.indent).toBe(1);
    expect(st.inCasePatternBody).toBe(false);
  });
});
