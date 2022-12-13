export type RunnerHandler = () => void | Promise<void>;
export type RunnerErrorHandler = (error: Error) => void;

export interface Runner {
  run: (handler: RunnerHandler, milliseconds?: number) => void;
  cancel: () => void;
  onError: (handler: RunnerErrorHandler) => void;
  readonly isRunning: boolean;
  readonly runsCount: number;
}

export function createRunner(): Runner {
  let errorHandler: RunnerErrorHandler = (error: Error): void => { throw error };
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let runsCount = 0;

  function isRunning(): boolean {
    return Boolean(timeoutId);
  }

  function run(handler: RunnerHandler, milliseconds: number = 0): void {
    if (isRunning()) {
      errorHandler(new Error('timeout is still running: cancel it first'));
      return;
    }

    timeoutId = setTimeout(() => {
      timeoutId = null;

      try {
        handler();
        runsCount += 1;
      } catch (error) {
        errorHandler(error as Error);
      }
    }, milliseconds);
  }

  function cancel(): void {
    timeoutId && clearTimeout(timeoutId);
    timeoutId = null;
  }

  function onError(handler: RunnerErrorHandler): void {
    errorHandler = handler;
  }

  return Object.seal({
    run,
    cancel,
    onError,

    get isRunning(): boolean {
      return isRunning();
    },

    get runsCount(): number {
      return runsCount;
    }
  });
}

