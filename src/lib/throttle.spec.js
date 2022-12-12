import { throttle } from './throttle';
import { wait } from './wait';

const heavyLoadCallsCount = 100000;
let fn;

beforeEach(() => {
  fn = jest.fn((a) => a);
});

describe('throttle()', () => {
  test('throttle invoke last event only', async () => {
    const throttleFn = throttle(fn, { delay: 30 });

    throttleFn(1);
    throttleFn(2);
    throttleFn(3);
    throttleFn(4);
    expect(fn).toHaveBeenCalledTimes(0);
    await wait(35);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveReturnedWith(4);
    throttleFn(5);
    await wait(20);
    throttleFn(6);
    await wait(20);
    throttleFn(7);
    await wait(20);
    throttleFn(8);
    await wait(20);
    expect(fn).toHaveBeenCalledTimes(3);
    expect(fn).toHaveReturnedWith(8);
  });

  test('leading throttle invoke first event only', async () => {
    const throttleFn = throttle(fn, { delay: 30, leading: true });

    throttleFn(1);
    throttleFn(2);
    throttleFn(3);
    throttleFn(4);
    expect(fn).toHaveBeenCalledTimes(1);
    await wait(35);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveReturnedWith(1);
    throttleFn(5);
    await wait(20);
    throttleFn(6);
    await wait(20);
    throttleFn(7);
    await wait(20);
    throttleFn(8);
    await wait(20);
    expect(fn).toHaveBeenCalledTimes(3);
    expect(fn).toHaveReturnedWith(7);
  });

  test('throttle invoked once on 100k events', async () => {
    const throttleFn = throttle(fn, { delay: 50 });

    for (let i = 0; i < heavyLoadCallsCount; i++) {
      throttleFn(i);
    }

    expect(fn).toHaveBeenCalledTimes(0);
    await wait(55);

    for (let i = 0; i < heavyLoadCallsCount; i++) {
      throttleFn(i);
    }

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveReturnedWith(heavyLoadCallsCount - 1);
  });

  test('leading throttle invoked once on 100k events', async () => {
    const throttleFn = throttle(fn, { delay: 50, leading: true });

    for (let i = 0; i < heavyLoadCallsCount; i++) {
      throttleFn(i);
    }

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveReturnedWith(0);
  });

  test('call onError when handler fails', (done) => {
    const failingIndex = Math.random() * heavyLoadCallsCount;
    const throttleFn = throttle(
      (i) => {
        if (i >= failingIndex) {
          throw new Error()
        }
      },
      {
        delay: 50,
        onError: (error) => {
          expect(error).toBeInstanceOf(Error);
          done();
        }
      });

    for (let i = 0; i < heavyLoadCallsCount; i++) {
      throttleFn(i);
    }
  });
});


