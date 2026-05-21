import { describe, expect, it } from 'vitest';
import * as shared from './index';

describe('index exports', () => {
  it('re-exports runtime APIs from all modules', () => {
    expect(typeof shared.getConfig).toBe('function');
    expect(typeof shared.normalizeToLf).toBe('function');
    expect(typeof shared.toUserMessage).toBe('function');
    expect(typeof shared.createLogger).toBe('function');
    expect(typeof shared.which).toBe('function');
    expect(typeof shared.splitCommandLine).toBe('function');
  });
});
