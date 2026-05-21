import { describe, expect, it } from 'vitest';

import {
  hasContinuationLine,
  hasOddTrailingExplicitMarker,
  hasTrailingContinuationOperator
} from './indent';

describe('hasOddTrailingExplicitMarker', () => {
  it('returns true for odd trailing marker count', () => {
    expect(hasOddTrailingExplicitMarker('echo hello \\', '\\')).toBe(true);
  });

  it('returns false for even trailing marker count', () => {
    expect(hasOddTrailingExplicitMarker('echo hello \\\\', '\\')).toBe(false);
  });

  it('returns false when line does not end with marker', () => {
    expect(hasOddTrailingExplicitMarker('echo hello', '\\')).toBe(false);
  });

  it('supports PowerShell backtick marker', () => {
    expect(hasOddTrailingExplicitMarker('Write-Host test`', '`')).toBe(true);
    expect(hasOddTrailingExplicitMarker('Write-Host test``', '`')).toBe(false);
  });

  it('ignores trailing spaces after marker', () => {
    expect(hasOddTrailingExplicitMarker('echo hello \\   ', '\\')).toBe(true);
  });
});

describe('hasTrailingContinuationOperator', () => {
  it('detects trailing pipe and logical operators', () => {
    expect(hasTrailingContinuationOperator('echo foo |')).toBe(true);
    expect(hasTrailingContinuationOperator('echo foo &&')).toBe(true);
    expect(hasTrailingContinuationOperator('echo foo ||')).toBe(true);
  });

  it('does not match operator in middle of line', () => {
    expect(hasTrailingContinuationOperator('echo a | sed s/a/b/')).toBe(false);
  });

  it('supports custom operator list', () => {
    expect(hasTrailingContinuationOperator('echo foo ^', ['|', '&&'])).toBe(false);
  });
});

describe('hasOddTrailingExplicitMarker edge cases', () => {
  it('returns false for multi-character marker', () => {
    expect(hasOddTrailingExplicitMarker('echo test\\\\', '\\\\' as any)).toBe(false);
  });
});

describe('hasContinuationLine', () => {
  it('returns true for explicit continuation marker', () => {
    expect(hasContinuationLine('echo hello \\', '\\')).toBe(true);
  });

  it('returns true for implicit continuation operator', () => {
    expect(hasContinuationLine('echo hello &&', '\\')).toBe(true);
    expect(hasContinuationLine('echo hello ||', '\\')).toBe(true);
    expect(hasContinuationLine('echo hello |', '\\')).toBe(true);
  });

  it('returns false when no continuation is present', () => {
    expect(hasContinuationLine('echo hello', '\\')).toBe(false);
  });

  it('supports PowerShell backtick marker', () => {
    expect(hasContinuationLine('Write-Host test`', '`')).toBe(true);
  });

  it('supports custom operators', () => {
    expect(hasContinuationLine('echo foo |', '\\', ['|'])).toBe(true);
    expect(hasContinuationLine('echo foo &&', '\\', ['|'])).toBe(false);
  });
});
