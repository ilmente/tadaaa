# Tadaaa!

*T*hrottle *a*nd *d*ebounce, *a*gain *a*nd *a*gain...

## Reason

Not a big one, really. It mostly started as an experiment, a way to challenge myself in understanding and developing some solid TS code.
I picked up `thorttle` and `debounce` because I actually need them in several projects, and I thought: "Well, I might just develop them myself, according to my needs. It's gonna be both edifying and somewhat useful.".

I know there are plenty of libraries doing `thorttle` and `debounce`, but I had a very clear design in mind and  I wanted them to be TS native. And here is the result!

## Setup

Add the dependency to your package manager of chice:

```bash
npm install tadaaa
# or
yarn add tadaaa
```

Import the function you need:

```ts
import { throttle } from 'tadaa';
```

That's it.

## API

The library exposes 2 functions:
- `throttle`
- `debounce`

### Throttle

```ts
import { throttle } from 'tadaa';

const throttlingFunction = throttle(() => {
    // your code here
}, {
    delay: 300,
    leading: true,
    onError: (error) => {
        // custom error handling logic
    },
});
```

Let's break it down. The `throttle` function takes 2 parameters:
- `handler`: any function (any parameter or return value) that you want to moderate;
- `options`:
    - `delay`: how many milliseconds between event calls; default is 0 - it behaves like a `setTimeout` and invoke the hanlder at the next browser event loop;
    - `leading`: whether or not the `throttle` is on the trailing edge of the delay (default) or is on the leading edge;
    - `onError`: custom error handler for errors that might happen in the handler (remember: the hanlder is executed in a `setTimeout` and a simple `try/catch` won't be able to catch that error).

```ts
interface ThrottleOptions<
    E extends EventOnLeadingEdgeType
> {
    delay?: number;
    leading?: E;
    onError?: RunnerErrorHandler,
}

export function throttle<
    H extends EventHandler = any,
    E extends EventOnLeadingEdgeType = undefined
> (
    handler: H,
    options?: ThrottleOptions<E>
) {}
```

#### Returned function

The returned function *has the same signature as the hanlder*, but, if trailing, the returned value of that function might be `undefined`. This is because the returned function will always return a value by design (should you specify any - if `void`, ignore this) by caching the last call returned value and by feeding that to the skipped events. When trailing, the first returned value is `undefined` as no hanlder has been invoked yet. When leading, on the other hand, the handler is immediately called, so the ruturn type of the returned function does not contemplate `undefined` values.

```ts
type EventHandlerReturnType<
    F extends EventHandler,
    E extends EventOnLeadingEdgeType
> = ReturnType<F> extends void ? void : E extends true ? ReturnType<F> : ReturnType<F> | undefined;
```

The returned function has 2 additional static methods:
- `invoke`: calls the handler immediately, skipping any delay;
- `cancel`: cancels the current delay and - if trailing, the execution of the last event.

### Debounce

```ts
import { debounce } from 'tadaa';

const debouncingFunction = debounce(() => {
    // your code here
}, {
    delay: 300,
    leading: true,
    timeout: 5000,
    onTimeout: (timeoutError) => {
        // custom timeout error handling logic
    },
    onError: (error) => {
        // custom error handling logic
    },
});
```

Let's break it down. The `debounce` function takes 2 parameters:
- `handler`: as in `throttle`;
- `options`:
    - `delay`: as in `throttle`;
    - `leading`: as in `throttle`;
    - `onError`: as in `throttle`;
    - `timeout`: how long before the `debounce` fails because too many events are happening  within the delay and no handler is actually invoked; default is no timeout;
    - `onTimeout`: should you specify a timeout, this is the custom error handler for timeout errors that might happen.

```ts
export interface DebounceOptions<
    E extends EventOnLeadingEdgeType
> {
    delay?: number;
    leading?: E;
    timeout?: number;
    onTimeout?: RunnerErrorHandler,
    onError?: RunnerErrorHandler,
}

export function debounce<
    H extends EventHandler = any,
    E extends EventOnLeadingEdgeType = undefined
> (
    handler: H,
    options?: DebounceOptions<E>
) {}
```

#### Returned function

The returned function is the same as for `throttle`.


