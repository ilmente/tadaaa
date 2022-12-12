import type { EventHandler, EventHandlerReturnType, EventOnLeadingEdgeType } from './lib/handler';
import { createRunner, Runner, RunnerHandler, RunnerErrorHandler } from './lib/runner';
import { throttle, ThrottleOptions } from './lib/throttle';
import { debounce, DebounceOptions } from './lib/debounce';
import { wait } from './lib/wait';

export type {
  Runner,
  RunnerHandler,
  RunnerErrorHandler,
  EventHandler,
  EventHandlerReturnType,
  EventOnLeadingEdgeType,
  ThrottleOptions,
  DebounceOptions
}

export {
  createRunner,
  debounce,
  throttle,
  wait,
}
