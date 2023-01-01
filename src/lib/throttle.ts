import type { EventHandler, EventHandlerContext, EventHandlerReturnType, EventOnLeadingEdgeType, SuperEventHandler } from './event';
import { createRunner, RunnerErrorHandler } from './runner';

export interface ThrottleOptions<E extends EventOnLeadingEdgeType> {
  delay?: number;
  leading?: E;
  onError?: RunnerErrorHandler;
}

export function throttle<H extends EventHandler = any, E extends EventOnLeadingEdgeType = false>(
  handler: H,
  options?: ThrottleOptions<E>
): SuperEventHandler<H, E> {
  const isOnLeadingEdge = Boolean(options?.leading);
  const delay = createRunner();
  let invokeHandler: () => void;
  let returnValue: EventHandlerReturnType<H, E>;

  function invokeHandlerAndCacheReturnValue<C extends EventHandlerContext>(context: C, args: Parameters<H>): EventHandlerReturnType<H, E> {
    return returnValue = handler.apply(context, args);
  }

  delay.onError((error) => {
    delay.cancel();

    if (!options?.onError) {
      throw error;
    }

    options.onError(error);
  });

  function superHandler<C extends EventHandlerContext = any>(this: C, ...args: Parameters<H>): EventHandlerReturnType<H, E> {
    invokeHandler = () => {
      isOnLeadingEdge || invokeHandlerAndCacheReturnValue<C>(this, args);
    }

    if (delay.isRunning) {
      return returnValue;
    }

    if (isOnLeadingEdge) {
      invokeHandlerAndCacheReturnValue<C>(this, args);
    }

    delay.run(() => invokeHandler(), options?.delay);

    return returnValue;
  }

  superHandler.invoke = function<C extends EventHandlerContext = any>(this: C, ...args: Parameters<H>): EventHandlerReturnType<H, E> {
    return invokeHandlerAndCacheReturnValue<C>(this, args);
  }

  superHandler.cancel = (): void => {
    delay.cancel();
  }

  return superHandler;
}
