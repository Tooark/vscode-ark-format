import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createLogger } from './logger';

const vscodeMock = (globalThis as any).__vscodeMockState as {
  appendLine: ReturnType<typeof vi.fn>;
  dispose: ReturnType<typeof vi.fn>;
  createOutputChannel: ReturnType<typeof vi.fn>;
};

describe('createLogger', () => {
  beforeEach(() => {
    vscodeMock.appendLine.mockReset();
    vscodeMock.dispose.mockReset();
    vscodeMock.createOutputChannel.mockReset();
    vscodeMock.createOutputChannel.mockImplementation(() => ({
      appendLine: vscodeMock.appendLine,
      dispose: vscodeMock.dispose
    }));
  });

  it('creates a logger bound to a vscode output channel', () => {
    const logger = createLogger('Ark');

    expect(vscodeMock.createOutputChannel).toHaveBeenCalledWith('Ark');
    expect(logger.channel).toBeDefined();
  });

  it('formats info, warn and error messages', () => {
    const logger = createLogger('Ark');

    logger.info('ok');
    logger.warn('careful');
    logger.error('fail');

    expect(vscodeMock.appendLine).toHaveBeenNthCalledWith(1, '[info] ok');
    expect(vscodeMock.appendLine).toHaveBeenNthCalledWith(2, '[warn] careful');
    expect(vscodeMock.appendLine).toHaveBeenNthCalledWith(3, '[error] fail');
  });

  it('disposes channel through logger.dispose', () => {
    const logger = createLogger('Ark');

    logger.dispose();

    expect(vscodeMock.dispose).toHaveBeenCalledTimes(1);
  });
});
