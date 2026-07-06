import { beforeEach, describe, expect, it, vi } from 'vitest';

import { formatterConfigKeys, getConfig } from './config';

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

  it('exposes shared formatter config keys', () => {
    expect(formatterConfigKeys.effectLanguages).toBe('effectLanguages');
    expect(formatterConfigKeys.rangeFormattingUseDocumentContext).toBe('rangeFormatting.useDocumentContext');
  });
});
