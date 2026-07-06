import { vi } from 'vitest';

type GetConfigurationFn = (...args: unknown[]) => unknown;
type AppendLineFn = (value: string) => void;
type DisposeFn = () => void;
type CreateOutputChannelFn = (...args: unknown[]) => {
  appendLine: AppendLineFn;
  dispose: DisposeFn;
};

type MockState = {
  workspaceFolders: Array<{ uri: { fsPath: string } }>;
  getConfiguration: ReturnType<typeof vi.fn<GetConfigurationFn>>;
  createOutputChannel: ReturnType<typeof vi.fn<CreateOutputChannelFn>>;
  appendLine: ReturnType<typeof vi.fn<AppendLineFn>>;
  dispose: ReturnType<typeof vi.fn<DisposeFn>>;
};

const state: MockState = {
  workspaceFolders: [],
  getConfiguration: vi.fn<GetConfigurationFn>(),
  createOutputChannel: vi.fn<CreateOutputChannelFn>(),
  appendLine: vi.fn<AppendLineFn>(),
  dispose: vi.fn<DisposeFn>()
};

state.createOutputChannel.mockImplementation(() => ({
  appendLine: state.appendLine,
  dispose: state.dispose
}));

vi.mock('vscode', () => ({
  Range: class {
    constructor (public start: unknown, public end: unknown) { }
  },
  TextEdit: {
    replace: (range: unknown, newText: string) => ({ range, newText })
  },
  Position: class {
    constructor (public line: number, public character: number) { }
  },
  workspace: {
    getConfiguration: (...args: unknown[]) => state.getConfiguration(...args),
    get workspaceFolders () {
      return state.workspaceFolders;
    },
    set workspaceFolders (value: Array<{ uri: { fsPath: string } }>) {
      state.workspaceFolders = value;
    }
  },
  window: {
    createOutputChannel: (...args: unknown[]) => state.createOutputChannel(...args)
  }
}));

(globalThis as any).__vscodeMockState = state;
