import { describe, expect, expectTypeOf, it } from 'vitest';
import {
  POWERSHELL_LANGUAGE_IDS,
  SHELL_LANGUAGE_IDS,
  SUPPORTED_DOCUMENT_SCHEMES
} from './types';
import type {
  ExecOptions,
  ExecResult,
  ExplicitLineContinuationMarker,
  FormatResult,
  ImplicitLineContinuationOperator,
  LineEnding,
  SettingsBase,
  ToolError
} from './types';

describe('types contracts', () => {
  it('accepts valid LineEnding values', () => {
    const lineEnding: LineEnding = 'LF';
    expect(lineEnding).toBe('LF');
  });

  it('exposes supported language and scheme constants', () => {
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
    const error: ToolError = { message: 'failed', exitCode: 1 };
    const format: FormatResult = { success: false, error };
    const settings: SettingsBase = { enabled: true, any: 'value' };

    expect(options.command).toBe('echo');
    expect(result.exitCode).toBe(0);
    expect(format.error?.message).toBe('failed');
    expect(settings.enabled).toBe(true);

    expectTypeOf(options.args).toEqualTypeOf<string[] | undefined>();
    expectTypeOf(result.timedOut).toEqualTypeOf<boolean>();
    expectTypeOf(format.success).toEqualTypeOf<boolean>();
  });
});
