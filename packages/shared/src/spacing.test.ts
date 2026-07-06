import { describe, expect, it } from 'vitest';
import { collapseDoubleSpaces, normalizeCommentSpacing } from './spacing';

describe('collapseDoubleSpaces', () => {
  it('collapses internal double spaces', () => {
    expect(collapseDoubleSpaces('echo  a   b')).toBe('echo a b');
  });

  it('preserves leading indentation and trailing space', () => {
    expect(collapseDoubleSpaces('  echo a ')).toBe('  echo a ');
  });
});

describe('normalizeCommentSpacing', () => {
  const findStart = (code: string): number => code.indexOf('#');

  it('inserts a space after the comment marker', () => {
    expect(normalizeCommentSpacing('#comment', findStart)).toBe('# comment');
  });

  it('keeps multiple markers together and spaces after them', () => {
    expect(normalizeCommentSpacing('##comment', findStart)).toBe('## comment');
  });

  it('preserves shebang lines', () => {
    expect(normalizeCommentSpacing('#!/bin/bash', findStart)).toBe('#!/bin/bash');
  });

  it('does not change markers already followed by space or end of line', () => {
    expect(normalizeCommentSpacing('# ok', findStart)).toBe('# ok');
    expect(normalizeCommentSpacing('#', findStart)).toBe('#');
  });

  it('preserves markers followed by protected characters', () => {
    expect(normalizeCommentSpacing('#>', findStart, ['>'])).toBe('#>');
  });

  it('returns the code unchanged when there is no comment', () => {
    expect(normalizeCommentSpacing('echo hi', () => -1)).toBe('echo hi');
  });
});
