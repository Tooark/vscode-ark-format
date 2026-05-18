import { describe, it, expect } from 'vitest';
import { parseEditorConfigContent, globMatch, applyEditorConfigOverrides } from './editorConfigReader';
import { ShellFormatterOptions } from './types';

describe('globMatch', () => {
  it('matches wildcard *', () => {
    expect(globMatch('*', 'test.sh')).toBe(true);
  });

  it('matches *.sh', () => {
    expect(globMatch('*.sh', 'test.sh')).toBe(true);
    expect(globMatch('*.sh', 'test.bash')).toBe(false);
  });

  it('matches {sh,bash}', () => {
    expect(globMatch('*.{sh,bash}', 'test.sh')).toBe(true);
    expect(globMatch('*.{sh,bash}', 'test.bash')).toBe(true);
    expect(globMatch('*.{sh,bash}', 'test.py')).toBe(false);
  });

  it('matches exact filename', () => {
    expect(globMatch('Makefile', 'Makefile')).toBe(true);
    expect(globMatch('Makefile', 'makefile')).toBe(false);
  });
});

describe('parseEditorConfigContent', () => {
  it('parses indent_style and indent_size from matching section', () => {
    const content = `
root = true

[*.sh]
indent_style = space
indent_size = 4
`;
    const result = parseEditorConfigContent(content, 'test.sh');
    expect(result.isRoot).toBe(true);
    expect(result.props.indent_style).toBe('space');
    expect(result.props.indent_size).toBe(4);
  });

  it('ignores non-matching sections', () => {
    const content = `
[*.py]
indent_size = 4

[*.sh]
indent_size = 2
`;
    const result = parseEditorConfigContent(content, 'test.sh');
    expect(result.props.indent_size).toBe(2);
  });

  it('parses end_of_line', () => {
    const content = `
[*]
  end_of_line = crlf
`;
    const result = parseEditorConfigContent(content, 'test.sh');
    expect(result.props.end_of_line).toBe('crlf');
  });

  it('parses insert_final_newline and trim_trailing_whitespace', () => {
    const content = `
[*]
insert_final_newline = true
trim_trailing_whitespace = false
`;
    const result = parseEditorConfigContent(content, 'test.sh');
    expect(result.props.insert_final_newline).toBe(true);
    expect(result.props.trim_trailing_whitespace).toBe(false);
  });

  it('ignores comments and blank lines', () => {
    const content = `
# This is a comment
; Another comment

[*]
indent_size = 3
`;
    const result = parseEditorConfigContent(content, 'test.sh');
    expect(result.props.indent_size).toBe(3);
  });

  it('returns empty props for no matching section', () => {
    const content = `
[*.py]
indent_size = 4
`;
    const result = parseEditorConfigContent(content, 'test.sh');
    expect(result.props.indent_size).toBeUndefined();
  });
});

describe('applyEditorConfigOverrides', () => {
  const baseOpts: ShellFormatterOptions = {
    indentSize: 2,
    trimTrailingWhitespace: true,
    maxConsecutiveBlankLines: 1,
    removeLeadingBlankLines: true,
    insertFinalNewline: true,
    lineEnding: 'LF',
    collapseSpaces: true,
    spacing: {
      spaceBeforeThenDo: true,
      spaceAfterKeywords: true,
      spaceBeforeFunctionBrace: true,
    },
  };

  it('overrides indentSize when indent_style is space', () => {
    const result = applyEditorConfigOverrides(baseOpts, { indent_style: 'space', indent_size: 4 });
    expect(result.indentSize).toBe(4);
  });

  it('does NOT override indentSize for tab indent_style', () => {
    const result = applyEditorConfigOverrides(baseOpts, { indent_style: 'tab', indent_size: 4 });
    expect(result.indentSize).toBe(2);
  });

  it('overrides lineEnding', () => {
    const result = applyEditorConfigOverrides(baseOpts, { end_of_line: 'crlf' });
    expect(result.lineEnding).toBe('CRLF');
  });

  it('overrides insertFinalNewline', () => {
    const result = applyEditorConfigOverrides(baseOpts, { insert_final_newline: false });
    expect(result.insertFinalNewline).toBe(false);
  });

  it('overrides trimTrailingWhitespace', () => {
    const result = applyEditorConfigOverrides(baseOpts, { trim_trailing_whitespace: false });
    expect(result.trimTrailingWhitespace).toBe(false);
  });

  it('does not mutate the base options object', () => {
    applyEditorConfigOverrides(baseOpts, { indent_style: 'space', indent_size: 8 });
    expect(baseOpts.indentSize).toBe(2);
  });
});
