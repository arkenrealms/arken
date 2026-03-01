// arken/packages/node/test/socketLink.spec.ts
import {
  createSocketLink,
  attachTrpcResponseHandler,
  createSocketProxyClient,
  type BackendConfig,
  type SocketClient,
  type WaitUntilFn,
} from '../trpc/socketLink';
import { observable } from '@trpc/server/observable';
import { TRPCClientError } from '@trpc/client';
import * as db from '../db';

type AnyError = TRPCClientError<any>;

afterEach(() => {
  jest.restoreAllMocks();
});

describe('createSocketLink (Socket.IO tRPC link)', () => {
  let notifyTRPCErrorMock: jest.Mock;
  let waitUntilMock: WaitUntilFn;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.resetAllMocks();
    notifyTRPCErrorMock = jest.fn();
    waitUntilMock = jest.fn().mockImplementation(async (predicate: () => boolean) => {
      if (!predicate()) throw new Error('not ready');
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  function makeClient(): SocketClient & { emitMock: jest.Mock } {
    const emitMock = jest.fn();
    return {
      ioCallbacks: {},
      socket: { emit: emitMock },
      emitMock,
    } as any;
  }

  function makeObservable(link: ReturnType<typeof createSocketLink>, op: any) {
    const runtime: any = {};
    const opLink = link(runtime);
    return opLink({ op, next: () => observable(() => {}) });
  }

  it('emits Unknown router error when router prefix is not mapped', async () => {
    const backends: BackendConfig[] = [{ name: 'seer', url: 'ws://dummy' }];
    const clients: Record<string, SocketClient> = { seer: makeClient() };

    const link = createSocketLink({
      backends,
      clients,
      notifyTRPCError: notifyTRPCErrorMock,
      waitUntil: waitUntilMock,
    });

    const obs = makeObservable(link, {
      id: 1,
      context: {},
      path: 'unknownRouter.core.getRealms',
      type: 'query',
      input: {},
    });

    await new Promise<void>((resolve, reject) => {
      obs.subscribe({
        next: () => reject(new Error('next should not be called')),
        error: (err) => {
          expect(err).toBeInstanceOf(TRPCClientError);
          expect((err as AnyError).message).toContain('Unknown router for unknownRouter.core.getRealms');
          resolve();
        },
      });
    });
  });

  it('fails fast when backend client is missing', async () => {
    const link = createSocketLink({
      backends: [{ name: 'seer', url: 'ws://dummy' }],
      clients: {} as any,
      notifyTRPCError: notifyTRPCErrorMock,
      waitUntil: jest.fn().mockResolvedValue(undefined),
    });

    const obs = makeObservable(link, {
      id: 1,
      context: {},
      path: 'seer.core.getRealms',
      type: 'query',
      input: {},
    });

    await new Promise<void>((resolve) => {
      obs.subscribe({
        error: (err) => {
          expect((err as AnyError).message).toContain('Socket client unavailable for router seer');
          resolve();
        },
      });
    });
  });

  it('fails fast when backend path omits method segment', async () => {
    const seerClient = makeClient();
    const link = createSocketLink({
      backends: [{ name: 'seer', url: 'ws://dummy' }],
      clients: { seer: seerClient },
      notifyTRPCError: notifyTRPCErrorMock,
      waitUntil: jest.fn().mockResolvedValue(undefined),
    });

    const obs = makeObservable(link, {
      id: 1,
      context: {},
      path: 'seer',
      type: 'query',
      input: {},
    });

    await new Promise<void>((resolve) => {
      obs.subscribe({
        error: (err) => {
          expect((err as AnyError).message).toContain('Invalid method path for seer');
          resolve();
        },
      });
    });

    expect(seerClient.emitMock).not.toHaveBeenCalled();
  });

  it('routes query to correct backend and resolves successful response', async () => {
    const seerClient = makeClient();
    const link = createSocketLink({
      backends: [{ name: 'seer', url: 'ws://dummy' }],
      clients: { seer: seerClient },
      notifyTRPCError: notifyTRPCErrorMock,
      waitUntil: jest.fn().mockResolvedValue(undefined),
    });

    const obs = makeObservable(link, {
      id: 1,
      context: {},
      path: 'seer.core.getRealms',
      type: 'query',
      input: { foo: 'bar' },
    });

    const donePromise = new Promise<void>((resolve, reject) => {
      obs.subscribe({
        next: (val: any) => expect(val.result).toEqual({ status: 1, data: ['realm-1'] }),
        error: (err) => reject(err),
        complete: () => resolve(),
      });
    });

    await Promise.resolve();

    const [eventName, payload] = seerClient.emitMock.mock.calls[0];
    expect(eventName).toBe('trpc');
    expect(payload.method).toBe('core.getRealms');

    const reqId = payload.id;
    (seerClient as any).ioCallbacks[reqId].resolve({ result: JSON.stringify({ status: 1, data: ['realm-1'] }) });

    await donePromise;
  });

  it('propagates timeout error when server does not respond', async () => {
    const seerClient = makeClient();
    const link = createSocketLink({
      backends: [{ name: 'seer', url: 'ws://dummy' }],
      clients: { seer: seerClient },
      notifyTRPCError: notifyTRPCErrorMock,
      waitUntil: jest.fn().mockResolvedValue(undefined),
      requestTimeoutMs: 15_000,
    });

    const obs = makeObservable(link, {
      id: 1,
      context: {},
      path: 'seer.core.getRealms',
      type: 'query',
      input: {},
    });

    const donePromise = new Promise<void>((resolve, reject) => {
      obs.subscribe({
        next: () => reject(new Error('next should not be called on timeout')),
        error: (err) => {
          expect((err as AnyError).message).toContain('Request timeout');
          resolve();
        },
      });
    });

    await Promise.resolve();
    jest.runAllTimers();
    await donePromise;
    expect(notifyTRPCErrorMock).toHaveBeenCalled();
  });

  it('cleans callback on unsubscribe before response', async () => {
    const seerClient = makeClient();
    const link = createSocketLink({
      backends: [{ name: 'seer', url: 'ws://dummy' }],
      clients: { seer: seerClient },
      notifyTRPCError: notifyTRPCErrorMock,
      waitUntil: jest.fn().mockResolvedValue(undefined),
      requestTimeoutMs: 15_000,
    });

    const obs = makeObservable(link, {
      id: 1,
      context: {},
      path: 'seer.core.getRealms',
      type: 'query',
      input: {},
    });

    const sub = obs.subscribe({ error: () => undefined });
    await Promise.resolve();

    const [, payload] = seerClient.emitMock.mock.calls[0];
    expect(seerClient.ioCallbacks[payload.id]).toBeDefined();

    sub.unsubscribe();
    expect(seerClient.ioCallbacks[payload.id]).toBeUndefined();
  });

  it('treats unsubscribe-before-timeout late resolve/reject as no-op and keeps callback map clean', async () => {
    const seerClient = makeClient();
    const link = createSocketLink({
      backends: [{ name: 'seer', url: 'ws://dummy' }],
      clients: { seer: seerClient },
      notifyTRPCError: notifyTRPCErrorMock,
      waitUntil: jest.fn().mockResolvedValue(undefined),
      requestTimeoutMs: 15_000,
    });

    const obs = makeObservable(link, {
      id: 1,
      context: {},
      path: 'seer.core.getRealms',
      type: 'query',
      input: {},
    });

    const next = jest.fn();
    const error = jest.fn();
    const complete = jest.fn();

    const sub = obs.subscribe({ next, error, complete });
    await Promise.resolve();

    const [, payload] = seerClient.emitMock.mock.calls[0];
    const reqId = payload.id;
    const callbackRef = seerClient.ioCallbacks[reqId];

    sub.unsubscribe();
    expect(seerClient.ioCallbacks[reqId]).toBeUndefined();

    expect(() => callbackRef.resolve({ result: JSON.stringify({ status: 1, data: ['late'] }) })).not.toThrow();
    expect(() => callbackRef.reject(new Error('late-reject'))).not.toThrow();

    jest.runOnlyPendingTimers();
    expect(seerClient.ioCallbacks[reqId]).toBeUndefined();
    expect(next).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
    expect(complete).not.toHaveBeenCalled();
    expect(notifyTRPCErrorMock).not.toHaveBeenCalled();
  });

  it('fails fast when request id allocation repeatedly collides', async () => {
    const seerClient = makeClient();
    seerClient.ioCallbacks['collision-id'] = { timeout: null };

    jest.spyOn(db, 'generateShortId').mockReturnValue('collision-id');

    const link = createSocketLink({
      backends: [{ name: 'seer', url: 'ws://dummy' }],
      clients: { seer: seerClient },
      notifyTRPCError: notifyTRPCErrorMock,
      waitUntil: jest.fn().mockResolvedValue(undefined),
    });

    const obs = makeObservable(link, {
      id: 1,
      context: {},
      path: 'seer.core.getRealms',
      type: 'query',
      input: {},
    });

    await new Promise<void>((resolve) => {
      obs.subscribe({
        error: (err) => {
          expect((err as AnyError).message).toContain('Unable to allocate unique socket request id');
          resolve();
        },
      });
    });

    expect(seerClient.emitMock).not.toHaveBeenCalled();
  });

  it('propagates deserialize failures and includes reqId metadata', async () => {
    const seerClient = makeClient();
    const link = createSocketLink({
      backends: [{ name: 'seer', url: 'ws://dummy' }],
      clients: { seer: seerClient },
      notifyTRPCError: notifyTRPCErrorMock,
      waitUntil: jest.fn().mockResolvedValue(undefined),
    });

    const obs = makeObservable(link, {
      id: 1,
      context: {},
      path: 'seer.core.getRealms',
      type: 'query',
      input: {},
    });

    const donePromise = new Promise<void>((resolve) => {
      obs.subscribe({
        error: (err) => {
          expect((err as AnyError).message.length).toBeGreaterThan(0);
          expect((err as any).data?.reqId).toBe('wire-id-1');
          resolve();
        },
      });
    });

    await Promise.resolve();
    const [, payload] = seerClient.emitMock.mock.calls[0];
    const reqId = payload.id;
    (seerClient as any).ioCallbacks[reqId].resolve({ id: 'wire-id-1', result: '{not-json' });

    await donePromise;
    expect(seerClient.ioCallbacks[reqId]).toBeUndefined();
  });

  it('handles immediate synchronous responses emitted in the same tick', async () => {
    const seerClient = makeClient();
    seerClient.emitMock.mockImplementation((eventName: string, payload: any) => {
      if (eventName !== 'trpc') return;
      seerClient.ioCallbacks[payload.id]?.resolve({ result: JSON.stringify({ status: 1, data: ['realm-sync'] }) });
    });

    const link = createSocketLink({
      backends: [{ name: 'seer', url: 'ws://dummy' }],
      clients: { seer: seerClient },
      notifyTRPCError: notifyTRPCErrorMock,
      waitUntil: jest.fn().mockResolvedValue(undefined),
    });

    const obs = makeObservable(link, {
      id: 1,
      context: {},
      path: 'seer.core.getRealms',
      type: 'query',
      input: {},
    });

    await new Promise<void>((resolve, reject) => {
      obs.subscribe({
        next: (val: any) => expect(val.result).toEqual({ status: 1, data: ['realm-sync'] }),
        error: reject,
        complete: resolve,
      });
    });
  });

  it('settles observer only once for resolve-then-error callback permutations', async () => {
    const seerClient = makeClient();
    const link = createSocketLink({
      backends: [{ name: 'seer', url: 'ws://dummy' }],
      clients: { seer: seerClient },
      notifyTRPCError: notifyTRPCErrorMock,
      waitUntil: jest.fn().mockResolvedValue(undefined),
    });

    const obs = makeObservable(link, {
      id: 1,
      context: {},
      path: 'seer.core.getRealms',
      type: 'query',
      input: {},
    });

    const next = jest.fn();
    const error = jest.fn();
    const complete = jest.fn();

    const donePromise = new Promise<void>((resolve) => {
      obs.subscribe({
        next: (val) => next(val),
        error: (err) => {
          error(err);
          resolve();
        },
        complete: () => {
          complete();
          resolve();
        },
      });
    });

    await Promise.resolve();
    const [, payload] = seerClient.emitMock.mock.calls[0];
    const callbackRef = seerClient.ioCallbacks[payload.id];

    callbackRef.resolve({ result: JSON.stringify({ status: 1, data: ['first-win'] }) });
    expect(() => callbackRef.resolve({ error: { message: 'late-error' } })).not.toThrow();
    expect(() => callbackRef.reject(new Error('late-reject'))).not.toThrow();

    await donePromise;

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith({ result: { status: 1, data: ['first-win'] } });
    expect(complete).toHaveBeenCalledTimes(1);
    expect(error).not.toHaveBeenCalled();
  });
});

describe('attachTrpcResponseHandler', () => {
  function makeSocket() {
    const handlers: Record<string, (payload: any) => void> = {};
    return {
      handlers,
      on: jest.fn((event: string, cb: (payload: any) => void) => {
        handlers[event] = cb;
      }),
      off: jest.fn(),
      onAny: jest.fn(),
      offAny: jest.fn(),
    };
  }

  it('resolves matching ioCallback on trpcResponse with id', () => {
    const socket = makeSocket();
    const client: any = { socket, ioCallbacks: { 'req-1': { timeout: null, resolve: jest.fn(), reject: jest.fn() } } };

    attachTrpcResponseHandler({ client, backendName: 'seer', logging: false });
    socket.handlers['trpcResponse']({ id: 'req-1', result: '{"status":1,"data":["x"]}' });

    expect(client.ioCallbacks['req-1']).toBeUndefined();
  });

  it('supports alternate response id fields (oid)', () => {
    const socket = makeSocket();
    const resolve = jest.fn();
    const client: any = { socket, ioCallbacks: { 'req-oid': { timeout: null, resolve, reject: jest.fn() } } };

    attachTrpcResponseHandler({ client, backendName: 'seer', logging: false, responseIdField: 'oid' });
    socket.handlers['trpcResponse']({ oid: 'req-oid', result: '{"status":1}' });

    expect(resolve).toHaveBeenCalled();
    expect(client.ioCallbacks['req-oid']).toBeUndefined();
  });

  it('uses onAny listener when preferOnAny=true', () => {
    const socket = makeSocket();
    const resolve = jest.fn();
    const client: any = { socket, ioCallbacks: { abc: { timeout: null, resolve, reject: jest.fn() } } };

    const detach = attachTrpcResponseHandler({ client, backendName: 'seer', logging: false, preferOnAny: true });
    const anyHandler = socket.onAny.mock.calls[0][0];

    anyHandler('trpc', { id: 'abc', result: '{}' });
    expect(resolve).not.toHaveBeenCalled();

    anyHandler('trpcResponse', { id: 'abc', result: '{}' });
    expect(resolve).toHaveBeenCalled();

    detach?.();
    expect(socket.offAny).toHaveBeenCalledTimes(1);
  });

  it('falls back to on/off listeners when preferOnAny=true but onAny is unavailable', () => {
    const socket = makeSocket();
    delete (socket as any).onAny;
    const resolve = jest.fn();
    const client: any = { socket, ioCallbacks: { abc: { timeout: null, resolve, reject: jest.fn() } } };

    const detach = attachTrpcResponseHandler({ client, backendName: 'seer', logging: false, preferOnAny: true });
    expect(socket.on).toHaveBeenCalledWith('trpc', expect.any(Function));
    expect(socket.on).toHaveBeenCalledWith('trpcResponse', expect.any(Function));

    socket.handlers['trpcResponse']({ id: 'abc', result: '{}' });
    expect(resolve).toHaveBeenCalled();

    detach?.();
    expect(socket.off).toHaveBeenCalledWith('trpc', expect.any(Function));
    expect(socket.off).toHaveBeenCalledWith('trpcResponse', expect.any(Function));
  });

  it('detaches cleanly when preferOnAny=true and offAny is unavailable', () => {
    const socket = makeSocket();
    delete (socket as any).offAny;
    const resolve = jest.fn();
    const client: any = { socket, ioCallbacks: { abc: { timeout: null, resolve, reject: jest.fn() } } };

    const detach = attachTrpcResponseHandler({ client, backendName: 'seer', logging: false, preferOnAny: true });
    const anyHandler = socket.onAny.mock.calls[0][0];
    anyHandler('trpcResponse', { id: 'abc', result: '{}' });
    expect(resolve).toHaveBeenCalled();

    expect(() => detach?.()).not.toThrow();
  });

  it('ignores malformed payload permutations without mutating callbacks', () => {
    const socket = makeSocket();
    const resolve = jest.fn();
    const client: any = { socket, ioCallbacks: { abc: { timeout: null, resolve, reject: jest.fn() } } };

    attachTrpcResponseHandler({ client, backendName: 'seer', logging: false });

    socket.handlers['trpcResponse'](null);
    socket.handlers['trpcResponse'](42);
    socket.handlers['trpcResponse']('not-json');

    expect(resolve).not.toHaveBeenCalled();
    expect(client.ioCallbacks.abc).toBeDefined();
  });

  it('ignores non-string or empty response ids and keeps callbacks intact', () => {
    const socket = makeSocket();
    const resolve = jest.fn();
    const client: any = {
      socket,
      ioCallbacks: {
        abc: { timeout: null, resolve, reject: jest.fn() },
      },
    };

    attachTrpcResponseHandler({ client, backendName: 'seer', logging: false });

    socket.handlers['trpcResponse']({ id: 0, result: '{}' });
    socket.handlers['trpcResponse']({ id: '', result: '{}' });
    socket.handlers['trpcResponse']({ id: '   ', result: '{}' });

    expect(resolve).not.toHaveBeenCalled();
    expect(client.ioCallbacks.abc).toBeDefined();
  });

  it('does not treat inherited ioCallbacks prototype keys as active callbacks', () => {
    const socket = makeSocket();
    const onServerPush = jest.fn();
    const client: any = {
      socket,
      ioCallbacks: {},
    };

    attachTrpcResponseHandler({ client, backendName: 'seer', logging: false, onServerPush });

    expect(() => socket.handlers['trpcResponse']({ id: 'toString', method: 'events.tick', params: '{}' })).not.toThrow();
    expect(onServerPush).toHaveBeenCalledWith({
      id: 'toString',
      method: 'events.tick',
      params: {},
    });
  });

  it('does not treat __proto__ callback ids as active callbacks and still forwards server push', () => {
    const socket = makeSocket();
    const onServerPush = jest.fn();
    const client: any = {
      socket,
      ioCallbacks: {},
    };

    attachTrpcResponseHandler({ client, backendName: 'seer', logging: false, onServerPush });

    expect(() => socket.handlers['trpcResponse']({ id: '__proto__', method: 'events.tick', params: '{}' })).not.toThrow();
    expect(onServerPush).toHaveBeenCalledWith({
      id: '__proto__',
      method: 'events.tick',
      params: {},
    });
  });

  it('treats late responses as no-op once callback has been removed', () => {
    const socket = makeSocket();
    const client: any = { socket, ioCallbacks: {} };

    attachTrpcResponseHandler({ client, backendName: 'seer', logging: false });

    expect(() => socket.handlers['trpcResponse']({ id: 'late-1', result: '{}' })).not.toThrow();
    expect(client.ioCallbacks['late-1']).toBeUndefined();
  });

  it('handles duplicate trpcResponse delivery idempotently for same callback id', () => {
    const socket = makeSocket();
    const resolve = jest.fn();
    const reject = jest.fn();
    const client: any = { socket, ioCallbacks: { 'req-dup': { timeout: null, resolve, reject } } };

    attachTrpcResponseHandler({ client, backendName: 'seer', logging: false });

    socket.handlers['trpcResponse']({ id: 'req-dup', result: '{}' });
    socket.handlers['trpcResponse']({ id: 'req-dup', result: '{}' });

    expect(resolve).toHaveBeenCalledTimes(1);
    expect(reject).not.toHaveBeenCalled();
    expect(client.ioCallbacks['req-dup']).toBeUndefined();
  });

  it('rejects once when callback resolve throws on mixed error/result payloads and ignores late duplicate delivery', () => {
    const socket = makeSocket();
    const resolve = jest.fn(() => {
      throw new Error('resolve-failed');
    });
    const reject = jest.fn();
    const client: any = { socket, ioCallbacks: { 'req-mixed': { timeout: null, resolve, reject } } };

    attachTrpcResponseHandler({ client, backendName: 'seer', logging: false });

    socket.handlers['trpcResponse']({ id: 'req-mixed', error: { message: 'wire-error' }, result: '{}' });
    expect(reject).toHaveBeenCalledTimes(1);

    socket.handlers['trpcResponse']({ id: 'req-mixed', error: { message: 'late-duplicate' }, result: '{}' });
    expect(reject).toHaveBeenCalledTimes(1);
    expect(client.ioCallbacks['req-mixed']).toBeUndefined();
  });

  it('keeps server-push path resilient when params cannot be deserialized', () => {
    const socket = makeSocket();
    const onServerPush = jest.fn();
    const client: any = { socket, ioCallbacks: {} };

    attachTrpcResponseHandler({ client, backendName: 'seer', logging: false, onServerPush });

    expect(() => socket.handlers['trpc']({ method: 'events.tick', params: '{not-json' })).not.toThrow();
    expect(onServerPush).toHaveBeenCalledWith({
      id: '',
      method: 'events.tick',
      params: undefined,
    });
  });

  it('ignores malformed server-push method permutations', () => {
    const socket = makeSocket();
    const onServerPush = jest.fn();
    const client: any = { socket, ioCallbacks: {} };

    attachTrpcResponseHandler({ client, backendName: 'seer', logging: false, onServerPush });

    socket.handlers['trpc']({ method: 0, params: '{}' });
    socket.handlers['trpc']({ method: '', params: '{}' });
    socket.handlers['trpc']({ method: '   ', params: '{}' });

    expect(onServerPush).not.toHaveBeenCalled();
  });

  it('ignores malformed trpcResponse push-method permutations when no callback exists', () => {
    const socket = makeSocket();
    const onServerPush = jest.fn();
    const client: any = { socket, ioCallbacks: {} };

    attachTrpcResponseHandler({ client, backendName: 'seer', logging: false, onServerPush });

    socket.handlers['trpcResponse']({ id: 'missing-1', method: 7, params: '{}' });
    socket.handlers['trpcResponse']({ id: 'missing-2', method: '', params: '{}' });

    expect(onServerPush).not.toHaveBeenCalled();
  });

  it('keeps trpcResponse server-push fallback resilient when params cannot be deserialized', () => {
    const socket = makeSocket();
    const onServerPush = jest.fn();
    const client: any = { socket, ioCallbacks: {} };

    attachTrpcResponseHandler({ client, backendName: 'seer', logging: false, onServerPush });

    expect(() => socket.handlers['trpcResponse']({ id: 'missing-3', method: 'events.tick', params: '{not-json' })).not.toThrow();
    expect(onServerPush).toHaveBeenCalledWith({
      id: 'missing-3',
      method: 'events.tick',
      params: undefined,
    });
  });
});

describe('createSocketProxyClient', () => {
  function makeClient() {
    const emitMock = jest.fn();
    return { socket: { emit: emitMock }, emitMock, ioCallbacks: {} } as any;
  }

  it('emits trpc request and resolves proxy call on success', async () => {
    const client = makeClient();
    const proxy: any = createSocketProxyClient<any>({ client, logPrefix: 'TestProxy', roles: ['seer'] });

    const promise = proxy.core.ping.query({ message: 'hi' });
    await Promise.resolve();

    const [eventName, payload] = client.emitMock.mock.calls[0];
    expect(eventName).toBe('trpc');

    client.ioCallbacks[payload.id].resolve({ result: JSON.stringify({ status: 1, data: { pong: 'hi' } }) });
    await expect(promise).resolves.toEqual({ pong: 'hi' });
  });

  it('rejects on proxy timeout and preserves reqId metadata', async () => {
    jest.useFakeTimers();
    const client = makeClient();
    const proxy: any = createSocketProxyClient<any>({ client, logPrefix: 'TestProxy', requestTimeoutMs: 1000 });

    const promise = proxy.core.ping.query({ message: 'hi' });
    await Promise.resolve();

    const [, payload] = client.emitMock.mock.calls[0];

    jest.advanceTimersByTime(1001);

    await expect(promise).rejects.toMatchObject({
      message: expect.stringMatching(/Request timeout/),
      data: expect.objectContaining({ reqId: payload.id }),
    });
    jest.useRealTimers();
  });

  it('ignores late proxy response after timeout settles request', async () => {
    jest.useFakeTimers();
    const client = makeClient();
    const proxy: any = createSocketProxyClient<any>({ client, logPrefix: 'TestProxy', requestTimeoutMs: 1000 });

    const promise = proxy.core.ping.query({ message: 'hi' });
    await Promise.resolve();

    const [, payload] = client.emitMock.mock.calls[0];
    const reqId = payload.id;
    const callbackRef = client.ioCallbacks[reqId];

    jest.advanceTimersByTime(1001);
    await expect(promise).rejects.toThrow(/Request timeout/);
    expect(client.ioCallbacks[reqId]).toBeUndefined();

    expect(() => callbackRef.resolve({ result: JSON.stringify({ status: 1, data: { pong: 'late' } }) })).not.toThrow();
    jest.useRealTimers();
  });

  it('treats proxy teardown-before-timeout late resolve/reject as no-op and preserves callback-map invariants', async () => {
    jest.useFakeTimers();
    const client = makeClient();
    const proxy: any = createSocketProxyClient<any>({ client, logPrefix: 'TestProxy', requestTimeoutMs: 1000 });

    const promise = proxy.core.ping.query({ message: 'hi' });
    await Promise.resolve();

    const [, payload] = client.emitMock.mock.calls[0];
    const reqId = payload.id;
    const callbackRef = client.ioCallbacks[reqId];

    delete client.ioCallbacks[reqId];
    expect(client.ioCallbacks[reqId]).toBeUndefined();

    expect(() => callbackRef.resolve({ result: JSON.stringify({ status: 1, data: { pong: 'late' } }) })).not.toThrow();
    expect(() => callbackRef.reject(new Error('late-reject'))).not.toThrow();

    jest.advanceTimersByTime(1001);
    expect(client.ioCallbacks[reqId]).toBeUndefined();

    await expect(Promise.race([
      promise.then(() => 'settled').catch(() => 'settled'),
      Promise.resolve('pending'),
    ])).resolves.toBe('pending');

    jest.useRealTimers();
  });

  it('rejects proxy call when request id allocation repeatedly collides', async () => {
    const client = makeClient();
    client.ioCallbacks['collision-id'] = { timeout: null };
    jest.spyOn(db, 'generateShortId').mockReturnValue('collision-id');

    const proxy: any = createSocketProxyClient<any>({ client, logPrefix: 'TestProxy', requestTimeoutMs: 1000 });
    await expect(proxy.core.ping.query({ message: 'hi' })).rejects.toThrow(/Unable to allocate unique socket request id/);

    expect(client.emitMock).not.toHaveBeenCalled();
  });

  it('rejects malformed proxy result and cleans callback state', async () => {
    const client = makeClient();
    const proxy: any = createSocketProxyClient<any>({ client, logPrefix: 'TestProxy', requestTimeoutMs: 1000 });

    const promise = proxy.core.ping.query({ message: 'hi' });
    await Promise.resolve();

    const [, payload] = client.emitMock.mock.calls[0];
    const reqId = payload.id;
    expect(client.ioCallbacks[reqId]).toBeDefined();

    client.ioCallbacks[reqId].resolve({ id: 'wire-bad-1', result: '{not-json' });

    await expect(promise).rejects.toBeInstanceOf(TRPCClientError);
    expect(client.ioCallbacks[reqId]).toBeUndefined();
  });

  it('handles immediate synchronous proxy responses emitted in the same tick', async () => {
    const client = makeClient();
    client.emitMock.mockImplementation((eventName: string, payload: any) => {
      if (eventName !== 'trpc') return;
      client.ioCallbacks[payload.id]?.resolve({ result: JSON.stringify({ status: 1, data: { pong: 'sync' } }) });
    });

    const proxy: any = createSocketProxyClient<any>({ client, logPrefix: 'TestProxy', requestTimeoutMs: 1000 });
    await expect(proxy.core.ping.query({ message: 'hi' })).resolves.toEqual({ pong: 'sync' });
  });

  it('settles proxy request only once for error-then-resolve callback permutations', async () => {
    const client = makeClient();
    const proxy: any = createSocketProxyClient<any>({ client, logPrefix: 'TestProxy', requestTimeoutMs: 1000 });

    const promise = proxy.core.ping.query({ message: 'hi' });
    await Promise.resolve();

    const [, payload] = client.emitMock.mock.calls[0];
    const callbackRef = client.ioCallbacks[payload.id];

    callbackRef.resolve({ error: { message: 'first-error' } });
    expect(() => callbackRef.resolve({ result: JSON.stringify({ status: 1, data: { pong: 'late' } }) })).not.toThrow();
    expect(() => callbackRef.reject(new Error('late-reject'))).not.toThrow();

    await expect(promise).rejects.toBeInstanceOf(TRPCClientError);
  });
});
