import type { EventHandler, EventHandlerContext, EventHandlerReturnType, EventOnLeadingEdgeType, SuperEventHandler } from './event';
import { createRunner, RunnerErrorHandler } from './runner';

export interface DebounceOptions<E extends EventOnLeadingEdgeType> {
  delay?: number;
  leading?: E;
  timeout?: number;
  onTimeout?: RunnerErrorHandler;
  onError?: RunnerErrorHandler;
}

export function debounce<H extends EventHandler = any, E extends EventOnLeadingEdgeType = false>(
  handler: H,
  options?: DebounceOptions<E>
): SuperEventHandler<H, E> {
  const isOnLeadingEdge = Boolean(options?.leading);
  const delay = createRunner();
  const timeout = createRunner();
  let returnValue: EventHandlerReturnType<H, E>;

  function invokeHandlerAndCacheReturnValue<C extends EventHandlerContext>(context: C, args: Parameters<H>): EventHandlerReturnType<H, E> {
    return returnValue = handler.apply(context, args);
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

  function superHandler<C extends EventHandlerContext = any>(this: C, ...args: Parameters<H>): EventHandlerReturnType<H, E> {
    if (timeout.runsCount > 0) {
      timeout.run(throwTimeoutError);
      return returnValue;
    }

    if (options?.timeout && !timeout.isRunning) {
      timeout.run(throwTimeoutError, options.timeout);
    }

    if (isOnLeadingEdge && !delay.isRunning) {
      invokeHandlerAndCacheReturnValue<C>(this, args);
    }

    delay.cancel();
    delay.run(() => {
      timeout.cancel();
      isOnLeadingEdge || invokeHandlerAndCacheReturnValue<C>(this, args);
    }, options?.delay);

    return returnValue;
  }

  superHandler.invoke = function <C extends EventHandlerContext = any>(this: C, ...args: Parameters<H>): EventHandlerReturnType<H, E> {
    timeout.cancel();
    return invokeHandlerAndCacheReturnValue<C>(this, args);
  }

  superHandler.cancel = (): void => {
    delay.cancel();
  }

  return superHandler;
}
