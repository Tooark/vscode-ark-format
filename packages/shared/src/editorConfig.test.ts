import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { applyEditorConfigOverrides, globMatch, parseEditorConfig, parseEditorConfigContent } from './editorConfig';
import { FormatterOptions } from './types';

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

  it('matches single character with ?', () => {
    expect(globMatch('?.sh', 'a.sh')).toBe(true);
    expect(globMatch('?.sh', 'ab.sh')).toBe(false);
  });

  it('escapes regex special characters in pattern', () => {
    expect(globMatch('test.sh', 'test.sh')).toBe(true);
    expect(globMatch('test.sh', 'testXsh')).toBe(false);
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

  it('ignores lines without key=value format', () => {
    const content = `
[*]
indent_size = 2
this-is-invalid-line
another-invalid
`;
    const result = parseEditorConfigContent(content, 'test.sh');
    expect(result.props.indent_size).toBe(2);
  });

  it('ignores invalid indent_style values', () => {
    const content = `
[*]
indent_style = invalid
indent_size = -1
end_of_line = unknown
`;
    const result = parseEditorConfigContent(content, 'test.sh');
    expect(result.props.indent_style).toBeUndefined();
    expect(result.props.indent_size).toBeUndefined();
    expect(result.props.end_of_line).toBeUndefined();
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
  const baseOpts: FormatterOptions = {
    indentSize: 2,
    indentStyle: 'space',
    trimTrailingWhitespace: true,
    maxConsecutiveBlankLines: 1,
    removeLeadingBlankLines: true,
    insertFinalNewline: true,
    lineEnding: 'LF',
    collapseSpaces: true,
  };

  it('overrides indentSize when indent_style is space', () => {
    const result = applyEditorConfigOverrides(baseOpts, { indent_style: 'space', indent_size: 4 });
    expect(result.indentStyle).toBe('space');
    expect(result.indentSize).toBe(4);
  });

  it('does not override indentSize for tab indent_style', () => {
    const result = applyEditorConfigOverrides(baseOpts, { indent_style: 'tab', indent_size: 4 });
    expect(result.indentStyle).toBe('tab');
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

  it('overrides maxConsecutiveBlankLines', () => {
    const result = applyEditorConfigOverrides(baseOpts, { max_consecutive_blank_lines: 3 });
    expect(result.maxConsecutiveBlankLines).toBe(3);
  });

  it('overrides removeLeadingBlankLines', () => {
    const result = applyEditorConfigOverrides(baseOpts, { remove_leading_blank_lines: false });
    expect(result.removeLeadingBlankLines).toBe(false);
  });

  it('overrides collapseSpaces', () => {
    const result = applyEditorConfigOverrides(baseOpts, { collapse_spaces: false });
    expect(result.collapseSpaces).toBe(false);
  });

  it('maps end_of_line cr to LF', () => {
    const result = applyEditorConfigOverrides(baseOpts, { end_of_line: 'cr' });
    expect(result.lineEnding).toBe('LF');
  });

  it('maps end_of_line lf to LF', () => {
    const result = applyEditorConfigOverrides(baseOpts, { end_of_line: 'lf' });
    expect(result.lineEnding).toBe('LF');
  });
});

describe('parseEditorConfig (filesystem)', () => {
  const cleanupDirs: string[] = [];

  afterEach(async () => {
    while (cleanupDirs.length > 0) {
      const dir = cleanupDirs.pop();
      if (dir) {
        await fs.promises.rm(dir, { recursive: true, force: true });
      }
    }
  });

  it('reads editorconfig from file directory', async () => {
    const dir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'ark-ec-'));
    cleanupDirs.push(dir);

    const ecContent = `root = true\n\n[*.sh]\nindent_style = space\nindent_size = 4\n`;
    await fs.promises.writeFile(path.join(dir, '.editorconfig'), ecContent);

    const filePath = path.join(dir, 'test.sh');
    const result = parseEditorConfig(filePath);

    expect(result.indent_style).toBe('space');
    expect(result.indent_size).toBe(4);
  });

  it('traverses parent directories until root', async () => {
    const parentDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'ark-ec-parent-'));
    cleanupDirs.push(parentDir);
    const childDir = path.join(parentDir, 'sub');
    await fs.promises.mkdir(childDir);

    const ecContent = `root = true\n\n[*]\nindent_size = 3\n`;
    await fs.promises.writeFile(path.join(parentDir, '.editorconfig'), ecContent);

    const filePath = path.join(childDir, 'file.sh');
    const result = parseEditorConfig(filePath);

    expect(result.indent_size).toBe(3);
  });

  it('returns empty props when no editorconfig exists', async () => {
    const dir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'ark-ec-none-'));
    cleanupDirs.push(dir);

    // Create a root editorconfig higher up to stop traversal
    const ecContent = `root = true\n`;
    await fs.promises.writeFile(path.join(dir, '.editorconfig'), ecContent);

    const subDir = path.join(dir, 'deep', 'nested');
    await fs.promises.mkdir(subDir, { recursive: true });

    const filePath = path.join(subDir, 'file.sh');
    const result = parseEditorConfig(filePath);

    expect(result.indent_style).toBeUndefined();
    expect(result.indent_size).toBeUndefined();
  });

  it('closer editorconfig takes priority over parent', async () => {
    const parentDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'ark-ec-prio-'));
    cleanupDirs.push(parentDir);
    const childDir = path.join(parentDir, 'sub');
    await fs.promises.mkdir(childDir);

    await fs.promises.writeFile(path.join(parentDir, '.editorconfig'), `root = true\n\n[*]\nindent_size = 8\nend_of_line = crlf\ninsert_final_newline = true\ntrim_trailing_whitespace = true\n`);
    await fs.promises.writeFile(path.join(childDir, '.editorconfig'), `[*]\nindent_size = 2\nend_of_line = lf\ninsert_final_newline = false\ntrim_trailing_whitespace = false\n`);

    const filePath = path.join(childDir, 'file.sh');
    const result = parseEditorConfig(filePath);

    expect(result.indent_size).toBe(2);
    expect(result.end_of_line).toBe('lf');
    expect(result.insert_final_newline).toBe(false);
    expect(result.trim_trailing_whitespace).toBe(false);
  });

  it('handles unreadable editorconfig gracefully', async () => {
    const dir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'ark-ec-err-'));
    cleanupDirs.push(dir);

    const ecPath = path.join(dir, '.editorconfig');
    await fs.promises.mkdir(ecPath);

    const filePath = path.join(dir, 'test.sh');
    const result = parseEditorConfig(filePath);

    expect(result.indent_style).toBeUndefined();
  });
});
