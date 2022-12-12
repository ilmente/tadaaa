export type EventHandler = (...args: any[]) => any;
export type EventHandlerReturnType<F extends EventHandler, E extends EventOnLeadingEdgeType> =
  ReturnType<F> extends void ? void :
  E extends true ? ReturnType<F> :
  ReturnType<F> | undefined;
export type EventOnLeadingEdgeType = true | false | undefined;
