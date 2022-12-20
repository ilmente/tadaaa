import type { EventHandler, EventHandlerReturnType, EventOnLeadingEdgeType, SuperEventHandler } from './event';
import { createRunner, RunnerErrorHandler } from './runner';

export interface ThrottleOptions<E extends EventOnLeadingEdgeType> {
  delay?: number;
  leading?: E;
  onError?: RunnerErrorHandler,
}

export function throttle<H extends EventHandler = any, E extends EventOnLeadingEdgeType = false>(
  handler: H,
  options?: ThrottleOptions<E>
): SuperEventHandler<H, E> {
  const isOnLeadingEdge = Boolean(options?.leading);
  const delay = createRunner();
  let invokeHandler: () => void;
  let returnValue: EventHandlerReturnType<H, E>;

  function invokeHandlerAndCacheReturnValue(...args: Parameters<H>): EventHandlerReturnType<H, E> {
    return returnValue = handler(...args);
  }

  delay.onError((error) => {
    delay.cancel();

    if (!options?.onError) {
      throw error;
    }

    options.onError(error);
  });

  function superHandler(...args: Parameters<H>): EventHandlerReturnType<H, E> {
    invokeHandler = () => {
      isOnLeadingEdge || invokeHandlerAndCacheReturnValue(...args);
    }

    if (delay.isRunning) {
      return returnValue;
    }

    if (isOnLeadingEdge) {
      invokeHandlerAndCacheReturnValue(...args);
    }

    delay.run(() => invokeHandler(), options?.delay);

    return returnValue;
  }

  superHandler.invoke = (...args: Parameters<H>): EventHandlerReturnType<H, E> => {
    return invokeHandlerAndCacheReturnValue(...args);
  }

  superHandler.cancel = (): void => {
    delay.cancel();
  }

  return superHandler;
}
