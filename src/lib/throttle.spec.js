import { throttle } from './throttle';
import { wait } from './wait';

const heavyLoadCallsCount = 100000;
let fn, obj;

function createFaultyObj(done) {
  return {
    fn: jest.fn((a) => a),

    wrongHandler: throttle((a) => this.fn(a), {
      delay: 30,
      onError: (error) => {
        expect(error).toBeInstanceOf(Error);
        done();
      },
    }),
  };
}

beforeEach(() => {
  fn = jest.fn((a) => a);

  obj = {
    fn: jest.fn((a) => a),

    scopedHandler: throttle(function (a) {
      return this.fn(a);
    }, { delay: 30 }),
  };
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

  test('throttle returns undefined until next execution', async () => {
    const throttleFn = throttle(fn, { delay: 30 });
    let result;

    result = throttleFn(1);
    result = throttleFn(2);
    result = throttleFn(3);
    result = throttleFn(4);

    expect(fn).toHaveBeenCalledTimes(0);
    expect(result).toBe(undefined);

    await wait(35);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(result).toBe(undefined);

    result = throttleFn(5);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(result).toBe(4);
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

  test('leading throttle returns the value from first execution', async () => {
    const throttleFn = throttle(fn, { delay: 30, leading: true });
    let result;

    result = throttleFn(1);
    result = throttleFn(2);
    result = throttleFn(3);
    result = throttleFn(4);

    expect(fn).toHaveBeenCalledTimes(1);
    expect(result).toBe(1);

    await wait(35);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(result).toBe(1);

    result = throttleFn(5);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(result).toBe(5);
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

  test('throttle preserves the scope', async () => {
    let result;

    result = obj.scopedHandler(1);
    result = obj.scopedHandler(2);
    result = obj.scopedHandler(3);
    result = obj.scopedHandler(4);

    expect(obj.fn).toHaveBeenCalledTimes(0);
    expect(result).toBe(undefined);

    await wait(35);
    expect(obj.fn).toHaveBeenCalledTimes(1);
    expect(result).toBe(undefined);

    result = obj.scopedHandler(5);
    expect(obj.fn).toHaveBeenCalledTimes(1);
    expect(result).toBe(4);
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

  test('call onError when handler scope fails', (done) => {
    let result, faultyObj = createFaultyObj(done);

    result = faultyObj.wrongHandler(1);
    result = faultyObj.wrongHandler(2);

    expect(faultyObj.fn).toHaveBeenCalledTimes(0);
    expect(result).toBe(undefined);
  });
});


