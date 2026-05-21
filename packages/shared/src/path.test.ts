import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import { createTempDir, isWindows, resolveWorkspacePath, which } from './path';

const vscodeMock = (globalThis as any).__vscodeMockState as {
  workspaceFolders: Array<{ uri: { fsPath: string } }>;
};

describe('path helpers', () => {
  const cleanupDirs: string[] = [];

  afterEach(async () => {
    while (cleanupDirs.length > 0) {
      const dir = cleanupDirs.pop();
      if (dir) {
        await fs.promises.rm(dir, { recursive: true, force: true });
      }
    }

    vscodeMock.workspaceFolders = [];
  });

  it('which finds command path from PATH entries', async () => {
    const dir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'ark-which-'));
    cleanupDirs.push(dir);

    const executableName = isWindows ? 'arktool.CMD' : 'arktool';
    const executablePath = path.join(dir, executableName);
    await fs.promises.writeFile(executablePath, 'echo test');

    if (!isWindows) {
      await fs.promises.chmod(executablePath, 0o755);
    }

    const env: NodeJS.ProcessEnv = {
      PATH: dir,
      PATHEXT: '.CMD'
    };

    expect(which('arktool', env)).toBe(executablePath);
  });

  it('which returns undefined when command is not found', () => {
    expect(which('missing-tool', { PATH: '' })).toBeUndefined();
  });

  it('which skips empty PATH entries', () => {
    const env: NodeJS.ProcessEnv = {
      PATH: `;;${path.join(os.tmpdir(), 'nonexistent')}`,
      PATHEXT: '.CMD'
    };

    expect(which('something', env)).toBeUndefined();
  });

  it('resolveWorkspacePath uses provided folder before workspace default', () => {
    vscodeMock.workspaceFolders = [{ uri: { fsPath: '/workspace/default' } } as any];

    const explicit = resolveWorkspacePath('a/b', { uri: { fsPath: '/workspace/custom' } } as any);
    const fromDefault = resolveWorkspacePath('a/b');

    expect(explicit).toBe(path.join('/workspace/custom', 'a/b'));
    expect(fromDefault).toBe(path.join('/workspace/default', 'a/b'));
  });

  it('resolveWorkspacePath returns undefined without workspace folder', () => {
    vscodeMock.workspaceFolders = [];

    expect(resolveWorkspacePath('a/b')).toBeUndefined();
  });

  it('createTempDir creates a directory with prefix', async () => {
    const dir = await createTempDir('ark-shared-test-');
    cleanupDirs.push(dir);

    const stat = await fs.promises.stat(dir);
    expect(stat.isDirectory()).toBe(true);
    expect(path.basename(dir).startsWith('ark-shared-test-')).toBe(true);
  });
});
