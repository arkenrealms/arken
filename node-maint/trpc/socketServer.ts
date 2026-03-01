// arken/packages/node/trpc/socketServer.ts

import type { AnyRouter } from '@trpc/server';
import { serialize, deserialize } from '../rpc';
import { decodePayload } from '../binary';

export type CreateCallerFactory<TRouter extends AnyRouter = AnyRouter> = (router: TRouter) => (ctx: any) => any;

export interface SocketTrpcHandlerOptions<TRouter extends AnyRouter = AnyRouter> {
  router: TRouter;
  createCallerFactory: CreateCallerFactory<TRouter>;
  log?: (...args: any[]) => void;
}

function isBlockedMethodPathSegment(segment: string) {
  return segment === '__proto__' || segment === 'prototype' || segment === 'constructor';
}

const BLOCKED_BUILTIN_PROTOTYPES = [
  Object.prototype,
  Function.prototype,
  Array.prototype,
  String.prototype,
  Number.prototype,
  Boolean.prototype,
  Date.prototype,
  RegExp.prototype,
  Error.prototype,
  Map.prototype,
  Set.prototype,
  WeakMap.prototype,
  WeakSet.prototype,
  Promise.prototype,
  Uint8Array.prototype,
  Int8Array.prototype,
  Uint16Array.prototype,
  Int16Array.prototype,
  Uint32Array.prototype,
  Int32Array.prototype,
  Float32Array.prototype,
  Float64Array.prototype,
].filter(Boolean);

function isBlockedBuiltinPrototypeProperty(key: string) {
  return BLOCKED_BUILTIN_PROTOTYPES.some((proto) => key in proto);
}

function resolveTarget(caller: any, method: string) {
  const segments = method.split('.');

  if (
    segments.some((segment) => {
      const normalizedSegment = segment.trim();
      return !normalizedSegment || normalizedSegment !== segment || isBlockedMethodPathSegment(normalizedSegment);
    })
  ) {
    return undefined;
  }

  return segments.reduce<any>((acc, key) => {
    if (acc == null) return undefined;

    if (!Object.prototype.hasOwnProperty.call(acc, key) && isBlockedBuiltinPrototypeProperty(key)) {
      return undefined;
    }

    return acc[key];
  }, caller);
}

function normalizeRequestId(id: unknown): string | undefined {
  if (typeof id !== 'string') return undefined;

  const normalizedId = id.trim();
  if (!normalizedId) return undefined;

  if (isBlockedMethodPathSegment(normalizedId)) return undefined;

  return normalizedId;
}

export function createSocketTrpcHandler<TRouter extends AnyRouter = AnyRouter>({
  router,
  createCallerFactory,
  log = console.log,
}: SocketTrpcHandlerOptions<TRouter>) {
  const createCaller = createCallerFactory(router);

  return async function handleSocketTrpc(socket: any, ctx: any, rawMessage: any) {
    const message = typeof rawMessage === 'string' ? decodePayload(rawMessage) : rawMessage;

    if (!message || typeof message !== 'object') {
      socket.emit('trpcResponse', {
        id: undefined,
        result: serialize({ status: 0 }),
        error: 'Malformed socket tRPC payload',
      });
      return;
    }

    const { id, method, params } = message as { id?: unknown; method?: string; params?: any };
    const responseId = normalizeRequestId(id);

    if (!method || typeof method !== 'string' || !method.trim()) {
      socket.emit('trpcResponse', {
        id: responseId,
        result: serialize({ status: 0 }),
        error: 'Missing or invalid tRPC method',
        meta: { message },
      });
      return;
    }

    const normalizedMethod = method.trim();

    try {
      const caller = createCaller(ctx);

      log('Seer calling trpc route', method, params);

      // Support nested paths like "core.getRealms"
      // @ts-ignore
      const target = resolveTarget(caller, normalizedMethod);

      const result = params ? await target(deserialize(params)) : await target();

      log('Seer sending trpc response', method, params, JSON.stringify(result));

      socket.emit('trpcResponse', { id, result: serialize({ status: 1, data: result }) });
    } catch (error: any) {
      let errorMessage = error?.stack + '';

      if (errorMessage.includes("reading '_def'")) {
        errorMessage = `TRPC handler does not exist: ${method} (${errorMessage})`;
        log(errorMessage, method, error);
      } else {
        errorMessage = 'Server error in socket TRPC handler: ' + errorMessage;
        log(errorMessage, method, error);
      }

      const result = params != null ? await target(deserialize(params)) : await target();
      log('Socket tRPC response', normalizedMethod);

      socket.emit('trpcResponse', { id: responseId, result: serialize({ status: 1, data: result }) });
    } catch (error: any) {
      const stack = typeof error?.stack === 'string' ? error.stack : String(error);
      const errorMessage = stack.includes("reading '_def'")
        ? `TRPC handler does not exist: ${stack}`
        : `Server error in socket TRPC handler: ${stack}`;

      log(errorMessage, normalizedMethod, error);

      socket.emit('trpcResponse', {
        id: responseId,
        result: serialize({ status: 0 }),
        error: errorMessage || 'Unknown error occurred',
        meta: { message },
      });
    }
  };
}

export interface AttachSocketTrpcListenerOptions {
  socket: any;
  ctx: any;
  handleSocketTrpc: (socket: any, ctx: any, message: any) => Promise<void>;
  eventName?: string;
}

export function attachSocketTrpcListener(opts: AttachSocketTrpcListenerOptions) {
  const { socket, ctx, handleSocketTrpc, eventName = 'trpc' } = opts;

  const fn = async (message: any) => {
    await handleSocketTrpc(socket, ctx, message);
  };

  if (typeof socket?.on === 'function') socket.on(eventName, fn);

  return () => {
    if (typeof socket?.off === 'function') socket.off(eventName, fn);
  };
}
