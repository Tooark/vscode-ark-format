import { describe, it, expect } from 'vitest';
import { applyShellSpacing } from './shellSpacing';

const defaultCfg = {
  spaceBeforeThenDo: true,
  spaceAfterKeywords: true,
  spaceBeforeFunctionBrace: true,
  collapseSpaces: true,
};

describe('applyShellSpacing', () => {
  it('normalizes space before then', () => {
    expect(applyShellSpacing('if [ ok ];then', defaultCfg)).toBe('if [ ok ]; then');
  });

  it('normalizes space before do', () => {
    expect(applyShellSpacing('for i in 1 2 3;do', defaultCfg)).toBe('for i in 1 2 3; do');
  });

  it('adds space after if before [', () => {
    expect(applyShellSpacing('if[ -f x ]', defaultCfg)).toBe('if [ -f x ]');
  });

  it('adds space after while before [', () => {
    expect(applyShellSpacing('while[ true ]', defaultCfg)).toBe('while [ true ]');
  });

  it('normalizes function name() {', () => {
    expect(applyShellSpacing('myfunc(){', defaultCfg)).toBe('myfunc() {');
  });

  it('normalizes function keyword: function name() {', () => {
    expect(applyShellSpacing('function myfunc()  {', defaultCfg)).toBe('function myfunc() {');
  });

  it('normalizes function keyword: function name {', () => {
    expect(applyShellSpacing('function myfunc{', defaultCfg)).toBe('function myfunc {');
  });

  it('collapses multiple spaces between tokens', () => {
    expect(applyShellSpacing('echo   hello   world', defaultCfg)).toBe('echo hello world');
  });

  it('does not collapse spaces inside double quotes', () => {
    expect(applyShellSpacing('echo "hello   world"', defaultCfg)).toBe('echo "hello   world"');
  });

  it('does not collapse spaces inside single quotes', () => {
    expect(applyShellSpacing("echo 'hello   world'", defaultCfg)).toBe("echo 'hello   world'");
  });

  it('does not alter escaped quotes in double-quoted strings', () => {
    const input = 'echo "say \\"hello\\" ok"';
    const result = applyShellSpacing(input, defaultCfg);
    expect(result).toBe(input);
  });

  it('adds a space after full-line comment marker', () => {
    expect(applyShellSpacing('#comment', defaultCfg)).toBe('# comment');
  });

  it('adds a space after multiple comment markers', () => {
    expect(applyShellSpacing('##comment', defaultCfg)).toBe('## comment');
  });

  it('adds a space after inline comment marker', () => {
    expect(applyShellSpacing('echo ok #comment', defaultCfg)).toBe('echo ok # comment');
  });

  it('preserves shebang lines', () => {
    expect(applyShellSpacing('#!/usr/bin/env bash', defaultCfg)).toBe('#!/usr/bin/env bash');
  });

  it('preserves column alignment inside full-line comments', () => {
    const input = '#   scripts/check.sh --changed[=REF]      only the stacks touched since REF';
    expect(applyShellSpacing(input, defaultCfg)).toBe(input);
  });

  it('preserves column alignment inside inline comments', () => {
    expect(applyShellSpacing('echo ok    #   aligned   comment', defaultCfg)).toBe('echo ok #   aligned   comment');
  });

  it('does not apply keyword spacing rules to comment text', () => {
    const input = '# use for(i=0;;) or if[ x ];then or name(){';
    expect(applyShellSpacing(input, defaultCfg)).toBe(input);
  });

  it('still applies spacing rules to code before an inline comment', () => {
    expect(applyShellSpacing('if[ x ];then   #   keep  this', defaultCfg)).toBe('if [ x ]; then #   keep  this');
  });

  it('adds the marker space without touching the rest of the comment', () => {
    expect(applyShellSpacing('#foo   bar', defaultCfg)).toBe('# foo   bar');
  });

  it('does not treat ${#...} length expansion as comment', () => {
    const input = 'if [[ ${#lint_results[@]} -gt 0 ]]; then';
    expect(applyShellSpacing(input, defaultCfg)).toBe(input);
  });

  it('does not inject space in ${var##pattern} expansion', () => {
    const input = 'url="${url%"${url##*[![:space:]]}"}"';
    expect(applyShellSpacing(input, defaultCfg)).toBe(input);
  });

  it('respects disabled options', () => {
    const cfg = {
      spaceBeforeThenDo: false,
      spaceAfterKeywords: false,
      spaceBeforeFunctionBrace: false,
      collapseSpaces: false,
    };
    expect(applyShellSpacing('if[ ok ];then', cfg)).toBe('if[ ok ];then');
  });
});
