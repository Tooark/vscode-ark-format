import { describe, expect, it } from 'vitest';
import { isFullLineComment, isShebang } from './lex';

describe('lex helpers', () => {
  describe('isShebang', () => {
    it('returns true for shebang lines', () => {
      expect(isShebang('#!/bin/bash')).toBe(true);
      expect(isShebang('#!/usr/bin/env node')).toBe(true);
    });

    it('returns false for non-shebang lines', () => {
      expect(isShebang('# comment')).toBe(false);
      expect(isShebang('echo hello')).toBe(false);
      expect(isShebang('')).toBe(false);
    });
  });

  describe('isFullLineComment', () => {
    it('returns true for comment lines starting with #', () => {
      expect(isFullLineComment('# this is a comment')).toBe(true);
      expect(isFullLineComment('#comment')).toBe(true);
      expect(isFullLineComment('#!/bin/bash')).toBe(true);
    });

    it('returns false for non-comment lines', () => {
      expect(isFullLineComment('echo hello')).toBe(false);
      expect(isFullLineComment('')).toBe(false);
      expect(isFullLineComment('  # not trimmed')).toBe(false);
    });
  });
});
