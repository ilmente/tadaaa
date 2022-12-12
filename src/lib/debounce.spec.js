import { debounce } from './debounce';
import { wait } from './wait';

const heavyLoadCallsCount = 100000;
let fn;

beforeEach(() => {
  fn = jest.fn((a) => a);
});

describe('debounce()', () => {
  test('debounce invoke last event only', async () => {
    const debounceFn = debounce(fn, { delay: 30 });

    debounceFn(1);
    debounceFn(2);
    debounceFn(3);
    await wait(25);
    debounceFn(4);
    expect(fn).toHaveBeenCalledTimes(0);
    await wait(35);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveReturnedWith(4);
  });

  test('leading debounce invoke first event only', async () => {
    const debounceFn = debounce(fn, { delay: 30, leading: true });

    debounceFn(1);
    debounceFn(2);
    debounceFn(3);
    await wait(25);
    debounceFn(4);
    expect(fn).toHaveBeenCalledTimes(1);
    await wait(10);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveReturnedWith(1);
  });

  test('debounce invoked once on 100k events', async () => {
    const debounceFn = debounce(fn, { delay: 30 });

    for (let i = 0; i < heavyLoadCallsCount; i++) {
      debounceFn(i);
    }

    expect(fn).toHaveBeenCalledTimes(0);
    await wait(35);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveReturnedWith(heavyLoadCallsCount - 1);
  });

  test('leading debounce invoked once on 100k events', async () => {
    const debounceFn = debounce(fn, { delay: 30, leading: true });

    for (let i = 0; i < heavyLoadCallsCount; i++) {
      debounceFn(i);
    }

    expect(fn).toHaveBeenCalledTimes(1);
    await wait(35);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveReturnedWith(0);
  });

  test('call onTimeout when timeout is set and no handler is invoked', (done) => {
    const debounceFn = debounce(fn, {
      delay: 30,
      timeout: 50,
      onTimeout: (error) => {
        expect(error).toBeInstanceOf(Error);
        done();
      }
    });

    for (let i = 0; i < heavyLoadCallsCount; i++) {
      debounceFn(i);
    }
  });

  test('call onError when handler fails', (done) => {
    const failingIndex = Math.random() * heavyLoadCallsCount;
    const debounceFn = debounce(
      (i) => {
        if (i >= failingIndex) {
          throw new Error()
        }
      },
      {
        delay: 30,
        onError: (error) => {
          expect(error).toBeInstanceOf(Error);
          done();
        }
      });

    for (let i = 0; i < heavyLoadCallsCount; i++) {
      debounceFn(i);
    }
  });
});
