import { describe, expect, it } from 'vitest';
import { isWindows } from './path';
import { execProcess, quoteCliArg, splitCommandLine } from './process';

describe('process helpers', () => {
  it('splitCommandLine handles spaces, quotes and escapes', () => {
    const input = 'cmd "arg one" \'arg two\' a\\ b';

    expect(splitCommandLine(input)).toEqual(['cmd', 'arg one', 'arg two', 'a b']);
  });

  it('quoteCliArg keeps simple args and escapes quoted args', () => {
    expect(quoteCliArg('abc')).toBe('abc');
    expect(quoteCliArg('')).toBe('""');

    if (isWindows) {
      expect(quoteCliArg('a "b" c')).toBe('"a \\"b\\" c"');
    } else {
      expect(quoteCliArg("a 'b' c")).toBe("'a '\\''b'\\'' c'");
    }
  });

  it('execProcess captures stdout, stderr and exit code', async () => {
    const result = await execProcess({
      command: process.execPath,
      args: ['-e', 'process.stdout.write("ok");process.stderr.write("err");process.exit(7);']
    });

    expect(result.command).toBe(process.execPath);
    expect(result.args).toEqual(['-e', 'process.stdout.write("ok");process.stderr.write("err");process.exit(7);']);
    expect(result.stdout).toBe('ok');
    expect(result.stderr).toBe('err');
    expect(result.exitCode).toBe(7);
    expect(result.timedOut).toBe(false);
    expect(result.error).toBeUndefined();
  });

  it('execProcess writes stdin when provided', async () => {
    const result = await execProcess({
      command: process.execPath,
      args: ['-e', 'process.stdin.on("data",d=>process.stdout.write(String(d)))'],
      stdin: 'hello-stdin'
    });

    expect(result.stdout).toBe('hello-stdin');
    expect(result.exitCode).toBe(0);
  });

  it('execProcess supports timeout', async () => {
    const result = await execProcess({
      command: process.execPath,
      args: ['-e', 'setTimeout(() => process.stdout.write("late"), 200)'],
      timeoutMs: 20
    });

    expect(result.timedOut).toBe(true);
    expect(result.exitCode).toBeNull();
  });

  it('execProcess reports spawn error for unknown command', async () => {
    const result = await execProcess({
      command: '__ark_nonexistent_command__'
    });

    expect(result.timedOut).toBe(false);
    expect(result.exitCode).toBeNull();
    expect(result.error).toBeInstanceOf(Error);
  });

  it('execProcess supports cwd and env options', async () => {
    const result = await execProcess({
      command: process.execPath,
      args: ['-e', 'process.stdout.write(process.cwd())'],
      cwd: process.cwd(),
      env: process.env
    });

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toBe(process.cwd());
  });
});
