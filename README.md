[![CI](https://github.com/ilmente/tadaaa/actions/workflows/main.yml/badge.svg)](https://github.com/ilmente/tadaaa/actions/workflows/main.yml)

# Tadaaa!

Throttle and debounce, again and again... but in full Typescript.

## Reason

Not a big one, really. It mostly started as an experiment, a way to challenge myself in understanding and developing some solid typescript code.
I picked up *throttle* and *debounce* because I actually need them in several projects, and I thought:
"Well, I might just develop them myself, according to my needs. It's gonna be both edifying and somewhat useful."

I know there are plenty of libraries doing *throttle* and *debounce*, but I had a very clear design in mind and I wanted them to be typescript native.
And here is the result!

## Design goals

- written in typescript
- fully covered by tests
- small footprint (~5kb, >1kb gzipped)
- no external dependencies
- highly performing
- *throttle* and *debounce* should return functions (*super handlers*) that:
  - have the same signature as the input handlers
  - always return a value when invoked
  - can be invoked on trailing or leading edges
  - can be invoked regardless of the delay
  - can be cancelled anytime
- *throttle* and *debounce* provide a way to handle errors
  - *debounce* can also trigger a timeout error if too many events happen within the delay

## Setup

Add the dependency using your package manager of choice:

```bash
npm install tadaaa
# or
yarn add tadaaa
```

Import the function(s) you need:

```ts
import { throttle, debounce } from 'tadaaa';
```

That's it.

## API

**Tadaaa honors semantic versioning.**
If you want to see the evolution of API, BC breaks and new features, check the [changelog](CHANGELOG.md) or the [release history in Github](https://github.com/ilmente/tadaaa/releases).

The library exposes 2 functions:
- [throttle](#throttle)
- [debounce](#debounce)

### Throttle

```ts
import { throttle } from 'tadaaa';

const throttlingFunction = throttle(
  (/* any signature */) => {/* input handler */},
  /* options */
  {
    delay: 300,
    leading: true,
    onError: (error) => {/* error hanlder */},
  }
);

// example
for (let i = 0; i < 1000000; i++) {
  throttlingFunction();
}
```

Let's break it down. The *throttle* function takes 2 parameters:
- **handler**: any function that you want to moderate
- **options**:
  - **delay**: interval (in milliseconds) between events being handled; default value is `0` and it behaves like a `setTimeout(handler, 0)` by invoking the hanlder at the next browser event loop
  - **leading**: whether or not the input handler should be invoked on the *leading* edge of the delay; default value is `false` and the handler is invoked on the *trailing* edge
  - **onError**: custom error handler for errors that might happen in the input handler

```ts
interface ThrottleOptions<
  E extends EventOnLeadingEdgeType
> {
  delay?: number;
  leading?: E;
  onError?: RunnerErrorHandler;
}

function throttle<
  H extends EventHandler = any,
  E extends EventOnLeadingEdgeType = false
> (
  handler: H,
  options?: ThrottleOptions<E>
): SuperEventHandler<H, E> {}
```

#### Returned function: **SuperEventHandler**

The returned function is called `SuperEventHandler` and *it has the same signature as the input handler*.
It exposes 2 additional methods:
- **invoke**: calls the input handler immediately, ignoring any delay; *it also has the same signature as the input handler*. Additionally, it caches the returned value of the super handler, feeding it to every subsequent skipped event
- **cancel**: cancels the current delay and - if trailing - it does not invoke of the last due handler

```ts
type SuperEventHandler<
  H extends EventHandler,
  E extends EventOnLeadingEdgeType
> = {
  <C extends EventHandlerContext = any>(this: C, ...args: Parameters<H>): EventHandlerReturnType<H, E>;
  invoke: <C extends EventHandlerContext = any>(this: C, ...args: Parameters<H>) => EventHandlerReturnType<H, E>;
  cancel: () => void;
};

// example
const inputHandler = (arg: number): number => arg * 2;
const superHandler = throttle(inputHandler);

superHandler(1);          // invoke the inputHandler throttling
superHandler.invoke(1);   // invoke the inputHandler immediately, with no delay
superHandler.cancel();    // cancel the delay
```

Heads up: *when trailing*, the returned value of a `SuperEventHandler` might be `undefined`.
This is because the `SuperEventHandler` will always return a value by design (should you specify any - if the input handler is `void`, ignore this) by *cacheing* the last returned value and by feeding it to every skipped event.
When trailing, the first returned value of the `SuperEventHandler` is `undefined` as no hanlder has been invoked yet.

*When leading*, on the other hand, the input handler is immediately invoked, thus the ruturn type of the `SuperEventHandler` does not contemplate `undefined` values.

```ts
type EventHandlerReturnType<
  H extends EventHandler,
  E extends EventOnLeadingEdgeType
> = ReturnType<H> extends void ? void : E extends true ? ReturnType<H> : ReturnType<H> | undefined;
```

---

### Debounce

```ts
import { debounce } from 'tadaaa';

const debouncingFunction = debounce(
  (/* any signature */) => {/* input handler */},
  /* options */
  {
    delay: 300,
    leading: true,
    onError: (error) => {/* error hanlder */},
    timeout: 5000,
    onTimeout: (timeoutError) => {/* timeout error hanlder */},
  }
);

// example
for (let i = 0; i < 1000000; i++) {
  debouncingFunction();
}
```

Let's break it down. The *debounce* function takes 2 parameters:
- **handler**: as in [throttle](#throttle)
- **options**:
  - **delay**: how long (in milliseconds) before allowing the next event being handled; default as in [throttle](#throttle)
  - **leading**: as in [throttle](#throttle)
  - **onError**: as in [throttle](#throttle)
  - **timeout**: how long (in milliseconds) before the *debounce* fails because too many events are happening within the delay and no handler is actually invoked; default is no timeout set
  - **onTimeout**: should you specify a timeout, this is the custom error handler for timeout errors that might happen

```ts
interface DebounceOptions<
  E extends EventOnLeadingEdgeType
> {
  delay?: number;
  leading?: E;
  timeout?: number;
  onTimeout?: RunnerErrorHandler;
  onError?: RunnerErrorHandler;
}

function debounce<
  H extends EventHandler = any,
  E extends EventOnLeadingEdgeType = false
> (
  handler: H,
  options?: DebounceOptions<E>
): SuperEventHandler<H, E> {}
```

#### Returned function: **SuperEventHandler**

The returned `SuperEventHandler` behaves in the same way as for [throttle](#returned-function-supereventhandler).


