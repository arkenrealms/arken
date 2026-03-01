// arken/packages/node/test/createTaskQueue.spec.ts

import { createTaskQueue, sleep } from '../time';

describe('time/createTaskQueue', () => {
  test('executes queued tasks in order', async () => {
    const queue = createTaskQueue();
    const events: string[] = [];

    queue.enqueue(async () => {
      events.push('first');
    }, 0);

    queue.enqueue(async () => {
      events.push('second');
    }, 0);

    await sleep(25);

    expect(events).toEqual(['first', 'second']);
  });

  test('continues with next task after a task throws', async () => {
    const queue = createTaskQueue();
    const events: string[] = [];

    queue.enqueue(async () => {
      events.push('before-error');
      throw new Error('boom');
    }, 0);

    queue.enqueue(async () => {
      events.push('after-error');
    }, 0);

    await sleep(25);

    expect(events).toEqual(['before-error', 'after-error']);
  });

  test('processes task enqueued during processing tail handoff', async () => {
    const queue = createTaskQueue();
    const events: string[] = [];

    queue.enqueue(async () => {
      events.push('first-start');

      await sleep(5);
      queue.enqueue(async () => {
        events.push('second-from-tail');
      }, 0);

      events.push('first-end');
    }, 0);

    await sleep(60);

    expect(events).toEqual(['first-start', 'first-end', 'second-from-tail']);
  });
});
