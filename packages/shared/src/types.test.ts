import { describe, expect, expectTypeOf, it } from 'vitest';
import {
  MAKEFILE_LANGUAGE_IDS,
  POWERSHELL_LANGUAGE_IDS,
  SHELL_LANGUAGE_IDS,
  SUPPORTED_DOCUMENT_SCHEMES
} from './types';
import type {
  ExecOptions,
  ExecResult,
  ExplicitLineContinuationMarker,
  ImplicitLineContinuationOperator,
  LineEnding
} from './types';

describe('types contracts', () => {
  it('accepts valid LineEnding values', () => {
    const lineEnding: LineEnding = 'LF';
    expect(lineEnding).toBe('LF');
  });

  it('exposes supported language and scheme constants', () => {
    expect(MAKEFILE_LANGUAGE_IDS).toEqual(['makefile']);
    expect(POWERSHELL_LANGUAGE_IDS).toEqual(['powershell']);
    expect(SHELL_LANGUAGE_IDS).toContain('shellscript');
    expect(SUPPORTED_DOCUMENT_SCHEMES).toEqual(['file', 'untitled']);
  });

  it('accepts explicit and implicit continuation tokens separately', () => {
    const explicit: ExplicitLineContinuationMarker = '\\';
    const implicit: ImplicitLineContinuationOperator = '&&';

    expect(explicit).toBe('\\');
    expect(implicit).toBe('&&');
  });

  it('keeps expected structural types', () => {
    const options: ExecOptions = { command: 'echo', args: ['ok'] };
    const result: ExecResult = {
      command: 'echo',
      args: ['ok'],
      stdout: 'ok',
      stderr: '',
      exitCode: 0,
      timedOut: false
    };

    expect(options.command).toBe('echo');
    expect(result.exitCode).toBe(0);

    expectTypeOf(options.args).toEqualTypeOf<string[] | undefined>();
    expectTypeOf(result.timedOut).toEqualTypeOf<boolean>();
  });
});
