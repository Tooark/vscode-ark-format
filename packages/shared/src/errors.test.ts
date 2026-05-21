import { describe, expect, it } from 'vitest';
import { mapExitCode, toUserMessage } from './errors';

describe('errors helpers', () => {
  it('toUserMessage reads Error instances', () => {
    expect(toUserMessage(new Error('boom'))).toBe('boom');
  });

  it('toUserMessage reads non-empty string errors', () => {
    expect(toUserMessage('bad input')).toBe('bad input');
  });

  it('toUserMessage falls back when value has no usable message', () => {
    expect(toUserMessage({ message: 'ignored' }, 'fallback')).toBe('fallback');
    expect(toUserMessage('   ', 'fallback')).toBe('fallback');
  });

  it('mapExitCode maps null and numeric codes', () => {
    expect(mapExitCode(null)).toBe('Process terminated unexpectedly.');
    expect(mapExitCode(2)).toBe('Process exited with code 2.');
  });
});
