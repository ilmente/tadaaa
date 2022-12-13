import { createRunner, RunnerErrorHandler } from './runner';
import type { EventHandler, EventHandlerReturnType, EventOnLeadingEdgeType } from './throttle';

export interface DebounceOptions<E extends EventOnLeadingEdgeType> {
  delay?: number;
  leading?: E;
  timeout?: number;
  onTimeout?: RunnerErrorHandler,
  onError?: RunnerErrorHandler,
}

export function debounce<H extends EventHandler = any, E extends EventOnLeadingEdgeType = undefined>(
  handler: H,
  options?: DebounceOptions<E>
) {
  const isOnLeadingEdge = Boolean(options?.leading);
  const delay = createRunner();
  const timeout = createRunner();
  let returnValue: EventHandlerReturnType<H, E>;

  function invokeHandlerAndCacheReturnValue(...args: Parameters<H>): EventHandlerReturnType<H, E> {
    return returnValue = handler(...args);
  }

  function throwTimeoutError() {
    throw new Error(`debounce timed out after ${options?.timeout} milliseconds`);
  }

  delay.onError((error) => {
    delay.cancel();
    timeout.cancel();

    if (!options?.onError) {
      throw error;
    }

    options.onError(error);
  });

  timeout.onError((error) => {
    delay.cancel();
    timeout.cancel();

    if (!options?.onTimeout) {
      throw error;
    }

    options.onTimeout(error);
  })

  function superHandler(...args: Parameters<H>): EventHandlerReturnType<H, E> {
    if (timeout.runsCount > 0) {
      timeout.run(throwTimeoutError);
      return returnValue;
    }

    if (options?.timeout && !timeout.isRunning) {
      timeout.run(throwTimeoutError, options.timeout);
    }

    if (isOnLeadingEdge && !delay.isRunning) {
      invokeHandlerAndCacheReturnValue(...args);
    }

    delay.cancel();
    delay.run(() => {
      timeout.cancel();
      isOnLeadingEdge || invokeHandlerAndCacheReturnValue(...args);
    }, options?.delay);

    return returnValue;
  }

  superHandler.invoke = (...args: Parameters<H>): EventHandlerReturnType<H, E> => {
    timeout.cancel();
    return invokeHandlerAndCacheReturnValue(...args);
  }

  superHandler.cancel = (): void => {
    delay.cancel();
  }

  return superHandler;
}
