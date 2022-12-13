import { throttle, ThrottleOptions, EventHandler, EventHandlerReturnType, EventOnLeadingEdgeType } from './lib/throttle';
import { debounce, DebounceOptions } from './lib/debounce';

export type {
  EventHandler,
  EventHandlerReturnType,
  EventOnLeadingEdgeType,
  ThrottleOptions,
  DebounceOptions
}

export {
  debounce,
  throttle,
}
