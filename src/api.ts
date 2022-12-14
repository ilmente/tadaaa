import type { EventHandler, EventHandlerContext, EventHandlerReturnType, EventOnLeadingEdgeType, SuperEventHandler } from './lib/event';
import { throttle, ThrottleOptions } from './lib/throttle';
import { debounce, DebounceOptions } from './lib/debounce';

export type {
  EventHandler,
  EventHandlerContext,
  EventHandlerReturnType,
  EventOnLeadingEdgeType,
  SuperEventHandler,
  ThrottleOptions,
  DebounceOptions
}

export {
  debounce,
  throttle,
}
