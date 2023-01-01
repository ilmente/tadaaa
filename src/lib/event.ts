export type EventOnLeadingEdgeType = true | false | undefined;
export type EventHandlerContext = any;
export type EventHandler = (...args: any[]) => any;

export type EventHandlerReturnType<
  H extends EventHandler,
  E extends EventOnLeadingEdgeType
> = ReturnType<H> extends void ? void : E extends true ? ReturnType<H> : ReturnType<H> | undefined;

export type SuperEventHandler<
  H extends EventHandler,
  E extends EventOnLeadingEdgeType
> = {
  <C extends EventHandlerContext = any>(this: C, ...args: Parameters<H>): EventHandlerReturnType<H, E>;
  invoke: <C extends EventHandlerContext = any>(this: C, ...args: Parameters<H>) => EventHandlerReturnType<H, E>;
  cancel: () => void;
};
