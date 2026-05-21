import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as child_process from 'child_process';
import { EventEmitter, Readable, Writable } from 'stream';

// Mock do vscode
vi.mock('vscode', () => ({
  l10n: {
    t: (msg: string, ...args: any[]) => {
      let result = msg;
      args.forEach((a, i) => { result = result.replace(`{${i}}`, String(a)); });
      return result;
    }
  }
}));

// Mock do child_process
vi.mock('child_process', () => ({
  spawn: vi.fn()
}));

import { runShfmt } from './shfmtRunner';

function createMockProcess (exitCode: number, stdout: string, stderr: string) {
  const proc = new EventEmitter() as any;
  proc.stdout = new Readable({ read () { } });
  proc.stderr = new Readable({ read () { } });
  proc.stdin = new Writable({ write (_c: any, _e: any, cb: any) { cb(); }, final (cb: any) { cb(); } });

  // Emite dados e fecha no próximo tick
  setTimeout(() => {
    if (stdout) {
      proc.stdout.push(Buffer.from(stdout));
    }
    proc.stdout.push(null);

    if (stderr) {
      proc.stderr.push(Buffer.from(stderr));
    }
    proc.stderr.push(null);

    proc.emit('close', exitCode);
  }, 10);

  return proc;
}

describe('runShfmt', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns formatted text on success', async () => {
    const mock = createMockProcess(0, '#!/bin/bash\necho "hi"\n', '');
    vi.mocked(child_process.spawn).mockReturnValue(mock as any);

    const result = await runShfmt('#!/bin/bash\necho   "hi"\n', 'shfmt', '', 'test.sh');
    expect(result.success).toBe(true);
    expect(result.formatted).toBe('#!/bin/bash\necho "hi"\n');
  });

  it('returns error with line/column on failure', async () => {
    const mock = createMockProcess(1, '', '<standard input>:3:10: unexpected token\n');
    vi.mocked(child_process.spawn).mockReturnValue(mock as any);

    const result = await runShfmt('bad content', 'shfmt', '', 'test.sh');
    expect(result.success).toBe(false);
    expect(result.errorLine).toBe(3);
    expect(result.errorColumn).toBe(10);
    expect(result.errorMessage).toBe('unexpected token');
  });

  it('rejects -w flag', async () => {
    const result = await runShfmt('echo hi', 'shfmt', '-w', 'test.sh');
    expect(result.success).toBe(false);
    expect(result.errorMessage).toContain('-w');
  });

  it('adds --ln=bats for .bats files', async () => {
    const mock = createMockProcess(0, 'formatted', '');
    vi.mocked(child_process.spawn).mockReturnValue(mock as any);

    await runShfmt('content', 'shfmt', '-i 2', 'test.bats');

    expect(child_process.spawn).toHaveBeenCalledWith('shfmt', ['--ln=bats', '-i', '2']);
  });

  it('handles spawn error', async () => {
    const proc = new EventEmitter() as any;
    proc.stdout = new Readable({ read () { } });
    proc.stderr = new Readable({ read () { } });
    proc.stdin = new Writable({ write (_c: any, _e: any, cb: any) { cb(); }, final (cb: any) { cb(); } });
    vi.mocked(child_process.spawn).mockReturnValue(proc as any);

    setTimeout(() => proc.emit('error', new Error('ENOENT')), 10);

    const result = await runShfmt('echo hi', '/nonexistent/shfmt', '', 'test.sh');
    expect(result.success).toBe(false);
    expect(result.errorMessage).toContain('ENOENT');
  });

  it('rejects --write flag', async () => {
    const result = await runShfmt('echo hi', 'shfmt', '--write', 'test.sh');
    expect(result.success).toBe(false);
    expect(result.errorMessage).toContain('-w/--write');
  });

  it('handles non-zero exit code without error location', async () => {
    const mock = createMockProcess(2, '', 'some generic error\n');
    vi.mocked(child_process.spawn).mockReturnValue(mock as any);

    const result = await runShfmt('bad', 'shfmt', '', 'test.sh');
    expect(result.success).toBe(false);
    expect(result.errorLine).toBeUndefined();
    expect(result.errorColumn).toBeUndefined();
    expect(result.errorMessage).toBe('some generic error');
  });

  it('handles non-zero exit code with empty stderr (uses mapExitCode)', async () => {
    const mock = createMockProcess(1, '', '');
    vi.mocked(child_process.spawn).mockReturnValue(mock as any);

    const result = await runShfmt('bad', 'shfmt', '', 'test.sh');
    expect(result.success).toBe(false);
    expect(result.errorMessage).toBeDefined();
  });

  it('handles exception thrown by execProcess', async () => {
    vi.mocked(child_process.spawn).mockImplementation(() => {
      throw new Error('spawn ENOMEM');
    });

    const result = await runShfmt('echo hi', 'shfmt', '', 'test.sh');
    expect(result.success).toBe(false);
    expect(result.errorMessage).toContain('ENOMEM');
  });

  it('passes empty flags without error', async () => {
    const mock = createMockProcess(0, 'ok\n', '');
    vi.mocked(child_process.spawn).mockReturnValue(mock as any);

    const result = await runShfmt('content', 'shfmt', '', 'test.sh');
    expect(result.success).toBe(true);
    expect(child_process.spawn).toHaveBeenCalledWith('shfmt', []);
  });
});
