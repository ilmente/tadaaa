import { createRunner } from './runner';
import { wait } from './wait';

let fn, runner;

beforeEach(() => {
  fn = jest.fn((a) => a);
  runner = createRunner();
});

describe('createRunner()', () => {
  test('run the handler after the given delay', async () => {
    runner.run(() => fn(1), 30);
    expect(fn).toHaveBeenCalledTimes(0);
    await wait(35);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('cancel the handler execution if cancel() is invoked', async () => {
    runner.run(() => fn(1), 30);
    await wait(10);
    runner.cancel();
    await wait();
    expect(fn).toHaveBeenCalledTimes(0);
  });

  test('isRunning getter is true when runner is running', async () => {
    expect(runner.isRunning).toBe(false);
    runner.run(() => fn(1), 30);
    expect(runner.isRunning).toBe(true);
    await wait(35);
    expect(runner.isRunning).toBe(false);
  });

  test('runsCount getter counts the number of completed runs', async () => {
    expect(runner.runsCount).toBe(0);
    runner.run(() => fn(1), 30);
    expect(runner.runsCount).toBe(0);
    await wait(35);
    expect(runner.runsCount).toBe(1);
    runner.run(() => fn(1));
    await wait();
    expect(runner.runsCount).toBe(2);
  });

  test('runsCount getter does not count cancelled runs', async () => {
    expect(runner.runsCount).toBe(0);
    runner.run(() => fn(1), 30);
    await wait(35);
    expect(runner.runsCount).toBe(1);
    runner.run(() => fn(1));
    runner.cancel();
    expect(runner.runsCount).toBe(1);
  });
});


