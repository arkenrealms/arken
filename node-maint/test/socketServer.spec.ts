// arken/packages/node/test/socketServer.spec.ts
import { initTRPC } from '@trpc/server';
import { createSocketTrpcHandler, attachSocketTrpcListener } from '../trpc/socketServer';
import { serialize, deserialize } from '../rpc';

describe('createSocketTrpcHandler (Socket.IO tRPC server helper)', () => {
  const t = initTRPC.context<{ userId?: string }>().create();

  const router = t.router({
    core: t.router({
      ping: t.procedure
        .input((val: unknown) => {
          if (typeof val === 'object' && val && 'message' in (val as any)) return val as { message: string };
          return { message: 'hi' };
        })
        .query(({ input, ctx }) => {
          return { pong: input.message, from: ctx.userId ?? 'anon' };
        }),
    }),
  });

  function makeFakeSocket() {
    return {
      emitted: [] as any[],
      handlers: {} as Record<string, any>,
      emit(event: string, payload: any) {
        this.emitted.push({ event, payload });
      },
      on(event: string, fn: any) {
        this.handlers[event] = fn;
      },
      off(event: string) {
        delete this.handlers[event];
      },
    };
  }

  it('invokes router method and emits trpcResponse with status 1 on success', async () => {
    const handler = createSocketTrpcHandler({ router, createCallerFactory: t.createCallerFactory, log: () => {} });
    const socket = makeFakeSocket();

    await handler(socket, { userId: 'user-123' }, { id: 'req-1', method: 'core.ping', params: serialize({ message: 'hello' }) });

    const { event, payload } = socket.emitted[0];
    expect(event).toBe('trpcResponse');
    expect(payload.id).toBe('req-1');

    const result: any = deserialize(payload.result);
    expect(result.status).toBe(1);
    expect(result.data).toEqual({ pong: 'hello', from: 'user-123' });
  });

  it('emits status 0 and error when procedure throws', async () => {
    const badRouter = t.router({
      core: t.router({
        explode: t.procedure.query(() => {
          throw new Error('boom');
        }),
      }),
    });

    const handler = createSocketTrpcHandler({ router: badRouter, createCallerFactory: t.createCallerFactory, log: () => {} });
    const socket = makeFakeSocket();

    await handler(socket, {}, { id: 'req-2', method: 'core.explode', params: undefined });

    const { payload } = socket.emitted[0];
    expect(payload.id).toBe('req-2');
    expect(deserialize(payload.result).status).toBe(0);
    expect(payload.error).toContain('boom');
  });

  it('emits a clear error for malformed payloads', async () => {
    const handler = createSocketTrpcHandler({ router, createCallerFactory: t.createCallerFactory, log: () => {} });
    const socket = makeFakeSocket();

    await handler(socket, {}, null as any);

    const { payload } = socket.emitted[0];
    expect(payload.error).toContain('Malformed socket tRPC payload');
    expect(deserialize(payload.result).status).toBe(0);
  });

  it('emits a clear error when binary payload decoding fails', async () => {
    const handler = createSocketTrpcHandler({ router, createCallerFactory: t.createCallerFactory, log: () => {} });
    const socket = makeFakeSocket();

    await handler(socket, {}, 'not-binary-json');

    const { payload } = socket.emitted[0];
    expect(payload.error).toContain('Malformed socket tRPC payload');
    expect(deserialize(payload.result).status).toBe(0);
  });

  it('emits a clear error when payload method is non-string', async () => {
    const handler = createSocketTrpcHandler({ router, createCallerFactory: t.createCallerFactory, log: () => {} });
    const socket = makeFakeSocket();

    await handler(socket, {}, { id: 'req-bad-method', method: 123 as any, params: serialize({}) });

    const { payload } = socket.emitted[0];
    expect(payload.id).toBe('req-bad-method');
    expect(payload.error).toContain('Missing or invalid tRPC method');
    expect(deserialize(payload.result).status).toBe(0);
  });

  it('emits a clear error for missing methods', async () => {
    const handler = createSocketTrpcHandler({ router, createCallerFactory: t.createCallerFactory, log: () => {} });
    const socket = makeFakeSocket();

    await handler(socket, {}, { id: 'req-3', params: serialize({}) });

    const { payload } = socket.emitted[0];
    expect(payload.id).toBe('req-3');
    expect(payload.error).toContain('Missing or invalid tRPC method');
    expect(deserialize(payload.result).status).toBe(0);
  });

  it('emits a clear error for blank-string methods', async () => {
    const handler = createSocketTrpcHandler({ router, createCallerFactory: t.createCallerFactory, log: () => {} });
    const socket = makeFakeSocket();

    await handler(socket, {}, { id: 'req-blank-method', method: '   ', params: serialize({}) });

    const { payload } = socket.emitted[0];
    expect(payload.id).toBe('req-blank-method');
    expect(payload.error).toContain('Missing or invalid tRPC method');
    expect(deserialize(payload.result).status).toBe(0);
  });

  it('accepts valid methods with surrounding whitespace', async () => {
    const handler = createSocketTrpcHandler({ router, createCallerFactory: t.createCallerFactory, log: () => {} });
    const socket = makeFakeSocket();

    await handler(socket, { userId: 'trim-user' }, { id: 'req-trim-method', method: '  core.ping  ', params: serialize({ message: 'trim' }) });

    const { payload } = socket.emitted[0];
    expect(payload.id).toBe('req-trim-method');
    const result: any = deserialize(payload.result);
    expect(result.status).toBe(1);
    expect(result.data).toEqual({ pong: 'trim', from: 'trim-user' });
  });

  it('normalizes whitespace-padded ids before success response emit', async () => {
    const handler = createSocketTrpcHandler({ router, createCallerFactory: t.createCallerFactory, log: () => {} });
    const socket = makeFakeSocket();

    await handler(socket, { userId: 'trim-user' }, { id: '  req-trim-id  ', method: 'core.ping', params: serialize({ message: 'trim-id' }) });

    const { payload } = socket.emitted[0];
    expect(payload.id).toBe('req-trim-id');
    const result: any = deserialize(payload.result);
    expect(result.status).toBe(1);
    expect(result.data).toEqual({ pong: 'trim-id', from: 'trim-user' });
  });

  it('drops non-string ids from malformed-method error responses', async () => {
    const handler = createSocketTrpcHandler({ router, createCallerFactory: t.createCallerFactory, log: () => {} });
    const socket = makeFakeSocket();

    await handler(socket, {}, { id: { bad: true }, method: 123 as any, params: serialize({}) });

    const { payload } = socket.emitted[0];
    expect(payload.id).toBeUndefined();
    expect(payload.error).toContain('Missing or invalid tRPC method');
    expect(deserialize(payload.result).status).toBe(0);
  });

  it('drops reserved prototype-path ids from error responses', async () => {
    const handler = createSocketTrpcHandler({ router, createCallerFactory: t.createCallerFactory, log: () => {} });
    const socket = makeFakeSocket();

    await handler(socket, {}, { id: '__proto__', method: 'core..ping', params: serialize({ message: 'x' }) });

    const { payload } = socket.emitted[0];
    expect(payload.id).toBeUndefined();
    expect(deserialize(payload.result).status).toBe(0);
    expect(payload.error).toContain('TRPC handler does not exist for method: core..ping');
  });

  it('drops blank-string ids from error responses', async () => {
    const handler = createSocketTrpcHandler({ router, createCallerFactory: t.createCallerFactory, log: () => {} });
    const socket = makeFakeSocket();

    await handler(socket, {}, { id: '   ', method: 'core..ping', params: serialize({ message: 'x' }) });

    const { payload } = socket.emitted[0];
    expect(payload.id).toBeUndefined();
    expect(deserialize(payload.result).status).toBe(0);
    expect(payload.error).toContain('TRPC handler does not exist for method: core..ping');
  });

  it('emits status 0 when params payload cannot be deserialized', async () => {
    const handler = createSocketTrpcHandler({ router, createCallerFactory: t.createCallerFactory, log: () => {} });
    const socket = makeFakeSocket();

    await handler(socket, {}, { id: 'req-bad-params', method: 'core.ping', params: '{not-json' });

    const { payload } = socket.emitted[0];
    expect(payload.id).toBe('req-bad-params');
    expect(deserialize(payload.result).status).toBe(0);
    expect(payload.error).toContain('Server error in socket TRPC handler');
  });

  it('rejects prototype-chain method traversal attempts', async () => {
    const handler = createSocketTrpcHandler({ router, createCallerFactory: t.createCallerFactory, log: () => {} });
    const socket = makeFakeSocket();

    await handler(socket, {}, { id: 'req-proto-method', method: '__proto__.toString', params: serialize({}) });

    const { payload } = socket.emitted[0];
    expect(payload.id).toBe('req-proto-method');
    expect(deserialize(payload.result).status).toBe(0);
    expect(payload.error).toContain('TRPC handler does not exist for method: __proto__.toString');
  });

  it('rejects prototype-chain traversal attempts even with surrounding whitespace', async () => {
    const handler = createSocketTrpcHandler({ router, createCallerFactory: t.createCallerFactory, log: () => {} });
    const socket = makeFakeSocket();

    await handler(socket, {}, { id: 'req-proto-trim-method', method: '  __proto__.toString  ', params: serialize({}) });

    const { payload } = socket.emitted[0];
    expect(payload.id).toBe('req-proto-trim-method');
    expect(deserialize(payload.result).status).toBe(0);
    expect(payload.error).toContain('TRPC handler does not exist for method: __proto__.toString');
  });

  it('rejects methods with empty path segments', async () => {
    const handler = createSocketTrpcHandler({ router, createCallerFactory: t.createCallerFactory, log: () => {} });
    const socket = makeFakeSocket();

    await handler(socket, {}, { id: 'req-empty-segment', method: 'core..ping', params: serialize({ message: 'x' }) });

    const { payload } = socket.emitted[0];
    expect(payload.id).toBe('req-empty-segment');
    expect(deserialize(payload.result).status).toBe(0);
    expect(payload.error).toContain('TRPC handler does not exist for method: core..ping');
  });

  it('rejects methods with whitespace-padded path segments', async () => {
    const handler = createSocketTrpcHandler({ router, createCallerFactory: t.createCallerFactory, log: () => {} });
    const socket = makeFakeSocket();

    await handler(socket, {}, { id: 'req-spaced-segment', method: 'core. ping', params: serialize({ message: 'x' }) });

    const { payload } = socket.emitted[0];
    expect(payload.id).toBe('req-spaced-segment');
    expect(deserialize(payload.result).status).toBe(0);
    expect(payload.error).toContain('TRPC handler does not exist for method: core. ping');
  });

  it('rejects constructor-path traversal attempts', async () => {
    const handler = createSocketTrpcHandler({ router, createCallerFactory: t.createCallerFactory, log: () => {} });
    const socket = makeFakeSocket();

    await handler(socket, {}, { id: 'req-constructor-method', method: 'core.constructor.name', params: serialize({}) });

    const { payload } = socket.emitted[0];
    expect(payload.id).toBe('req-constructor-method');
    expect(deserialize(payload.result).status).toBe(0);
    expect(payload.error).toContain('TRPC handler does not exist for method: core.constructor.name');
  });

  it('rejects prototype-chain traversal in nested method paths', async () => {
    const handler = createSocketTrpcHandler({ router, createCallerFactory: t.createCallerFactory, log: () => {} });
    const socket = makeFakeSocket();

    await handler(socket, {}, { id: 'req-nested-proto-method', method: 'core.__proto__.ping', params: serialize({}) });

    const { payload } = socket.emitted[0];
    expect(payload.id).toBe('req-nested-proto-method');
    expect(deserialize(payload.result).status).toBe(0);
    expect(payload.error).toContain('TRPC handler does not exist for method: core.__proto__.ping');
  });

  it('rejects prototype-segment traversal attempts', async () => {
    const handler = createSocketTrpcHandler({ router, createCallerFactory: t.createCallerFactory, log: () => {} });
    const socket = makeFakeSocket();

    await handler(socket, {}, { id: 'req-prototype-method', method: 'core.prototype.ping', params: serialize({}) });

    const { payload } = socket.emitted[0];
    expect(payload.id).toBe('req-prototype-method');
    expect(deserialize(payload.result).status).toBe(0);
    expect(payload.error).toContain('TRPC handler does not exist for method: core.prototype.ping');
  });

  it('rejects exact constructor method traversal attempts', async () => {
    const handler = createSocketTrpcHandler({ router, createCallerFactory: t.createCallerFactory, log: () => {} });
    const socket = makeFakeSocket();

    await handler(socket, {}, { id: 'req-constructor-root', method: 'constructor', params: serialize({}) });

    const { payload } = socket.emitted[0];
    expect(payload.id).toBe('req-constructor-root');
    expect(deserialize(payload.result).status).toBe(0);
    expect(payload.error).toContain('TRPC handler does not exist for method: constructor');
  });

  it('rejects inherited built-in prototype method paths', async () => {
    const handler = createSocketTrpcHandler({ router, createCallerFactory: t.createCallerFactory, log: () => {} });
    const socket = makeFakeSocket();

    await handler(socket, {}, { id: 'req-inherited-method', method: 'core.toString', params: serialize({}) });

    const { payload } = socket.emitted[0];
    expect(payload.id).toBe('req-inherited-method');
    expect(deserialize(payload.result).status).toBe(0);
    expect(payload.error).toContain('TRPC handler does not exist for method: core.toString');
  });

  it('rejects inherited array-prototype method paths', async () => {
    const inheritedRouter = {} as any;
    const handler = createSocketTrpcHandler({
      router: inheritedRouter,
      createCallerFactory: () => () => ({
        core: {
          list: [],
        },
      }),
      log: () => {},
    });
    const socket = makeFakeSocket();

    await handler(socket, {}, { id: 'req-inherited-array-method', method: 'core.list.map', params: serialize({}) });

    const { payload } = socket.emitted[0];
    expect(payload.id).toBe('req-inherited-array-method');
    expect(deserialize(payload.result).status).toBe(0);
    expect(payload.error).toContain('TRPC handler does not exist for method: core.list.map');
  });

  it('rejects inherited typed-array prototype method paths', async () => {
    const inheritedRouter = {} as any;
    const handler = createSocketTrpcHandler({
      router: inheritedRouter,
      createCallerFactory: () => () => ({
        core: {
          bytes: new Uint8Array([1, 2, 3]),
        },
      }),
      log: () => {},
    });
    const socket = makeFakeSocket();

    await handler(socket, {}, { id: 'req-inherited-typedarray-method', method: 'core.bytes.map', params: serialize({}) });

    const { payload } = socket.emitted[0];
    expect(payload.id).toBe('req-inherited-typedarray-method');
    expect(deserialize(payload.result).status).toBe(0);
    expect(payload.error).toContain('TRPC handler does not exist for method: core.bytes.map');
  });

  it('rejects inherited float32array prototype method paths', async () => {
    const inheritedRouter = {} as any;
    const handler = createSocketTrpcHandler({
      router: inheritedRouter,
      createCallerFactory: () => () => ({
        core: {
          floats: new Float32Array([1, 2, 3]),
        },
      }),
      log: () => {},
    });
    const socket = makeFakeSocket();

    await handler(socket, {}, { id: 'req-inherited-float32array-method', method: 'core.floats.map', params: serialize({}) });

    const { payload } = socket.emitted[0];
    expect(payload.id).toBe('req-inherited-float32array-method');
    expect(deserialize(payload.result).status).toBe(0);
    expect(payload.error).toContain('TRPC handler does not exist for method: core.floats.map');
  });

  it('attachSocketTrpcListener binds and unbinds listeners', async () => {
    const socket = makeFakeSocket();
    const fn = jest.fn(async () => undefined);

    const detach = attachSocketTrpcListener({ socket, ctx: {}, handleSocketTrpc: fn, eventName: 'trpc' });
    expect(typeof socket.handlers.trpc).toBe('function');

    await socket.handlers.trpc({ id: 'req-4' });
    expect(fn).toHaveBeenCalledTimes(1);

    detach();
    expect(socket.handlers.trpc).toBeUndefined();
  });

  it('attachSocketTrpcListener is safe with sockets missing on/off hooks', () => {
    const fn = jest.fn(async () => undefined);
    const socketWithoutListeners = {
      emit() {
        return undefined;
      },
    };

    const detach = attachSocketTrpcListener({ socket: socketWithoutListeners, ctx: {}, handleSocketTrpc: fn });
    expect(() => detach()).not.toThrow();
    expect(fn).toHaveBeenCalledTimes(0);
  });
});
