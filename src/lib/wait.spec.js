import { wait } from './wait';

const tolerance = 10;
const delay = 30;

describe('wait()', () => {
  test('excute the following code in a new browser event-loop when no/0 ms are passed', async () => {
    const before = Date.now();
    await wait();
    const after = Date.now();
    expect(after - before).toBeLessThanOrEqual(tolerance);
  });

  test('defer of N ms the execution of the following code', async () => {
    const before = Date.now();
    await wait(delay);
    const after = Date.now();
    expect(after - before).toBeGreaterThanOrEqual(delay);
  });

  test('defer of N ms the execution of the resolved callback', async () => {
    const before = Date.now();
    return wait(delay).then(() => {
      const after = Date.now();
      expect(after - before).toBeGreaterThanOrEqual(delay);
    });
  });
});


