import { beforeEach, describe, expect, it, vi } from 'vitest';

import { formatterConfigKeys, getBoolean, getConfig, getNumber, getString, mergeDefaults } from './config';

const vscodeMock = (globalThis as any).__vscodeMockState as {
  getConfiguration: ReturnType<typeof vi.fn>;
};

describe('config helpers', () => {
  beforeEach(() => {
    vscodeMock.getConfiguration.mockReset();
  });

  it('getConfig delegates to vscode workspace.getConfiguration', () => {
    const fakeConfig = { get: vi.fn() };
    vscodeMock.getConfiguration.mockReturnValueOnce(fakeConfig);

    const result = getConfig('ark', { uri: 'scope' } as any);

    expect(vscodeMock.getConfiguration).toHaveBeenCalledWith('ark', { uri: 'scope' });
    expect(result).toBe(fakeConfig);
  });

  it('getBoolean returns configured value or default', () => {
    const config = {
      get: vi.fn((key: string) => (key === 'enabled' ? true : undefined))
    } as any;

    expect(getBoolean(config, 'enabled')).toBe(true);
    expect(getBoolean(config, 'missing')).toBe(false);
    expect(getBoolean(config, 'missing', true)).toBe(true);
  });

  it('getString returns configured value or default', () => {
    const config = {
      get: vi.fn((key: string) => (key === 'name' ? 'ark' : undefined))
    } as any;

    expect(getString(config, 'name')).toBe('ark');
    expect(getString(config, 'missing')).toBe('');
    expect(getString(config, 'missing', 'fallback')).toBe('fallback');
  });

  it('getNumber returns configured value or default', () => {
    const config = {
      get: vi.fn((key: string) => (key === 'limit' ? 10 : undefined))
    } as any;

    expect(getNumber(config, 'limit')).toBe(10);
    expect(getNumber(config, 'missing')).toBe(0);
    expect(getNumber(config, 'missing', 42)).toBe(42);
  });

  it('mergeDefaults combines defaults and overrides with override precedence', () => {
    const defaults = { enabled: true, size: 2, style: 'space' };
    const overrides = { size: 4 };

    expect(mergeDefaults(defaults, overrides)).toEqual({
      enabled: true,
      size: 4,
      style: 'space'
    });

    expect(mergeDefaults(defaults)).toEqual(defaults);
  });

  it('exposes shared formatter config keys', () => {
    expect(formatterConfigKeys.effectLanguages).toBe('effectLanguages');
    expect(formatterConfigKeys.rangeFormattingUseDocumentContext).toBe('rangeFormatting.useDocumentContext');
  });
});
