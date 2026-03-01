// arken/packages/node/trpc/socketLink.ts
import { TRPCClientError, type TRPCLink, createTRPCProxyClient } from '@trpc/client';
import { observable } from '@trpc/server/observable';
import { serialize, deserialize } from '../rpc';
import { generateShortId } from '../db';
import { decodePayload } from '../binary';

export type BackendConfig = {
  name: string;
  url: string;
};

export type SocketClient = {
  ioCallbacks: Record<string, any>;
  socket: {
    emit: (...args: any[]) => void;
    on?: (event: string, cb: (payload: any) => void) => void;
    onAny?: (cb: (eventName: string, payload: any) => void) => void;
    off?: (event: string, cb: (payload: any) => void) => void;
    offAny?: (cb: (eventName: string, payload: any) => void) => void;
    [key: string]: any;
  };
};

export type WaitUntilFn = (predicate: () => boolean, timeoutMs: number, intervalMs?: number) => Promise<void>;
export type NotifyTRPCErrorFn = (err: any) => void;

export interface CreateSocketLinkOptions {
  backends: BackendConfig[];
  clients: Record<string, SocketClient>;
  notifyTRPCError: NotifyTRPCErrorFn;
  waitUntil: WaitUntilFn;
  requestTimeoutMs?: number;
}

export interface AttachTrpcResponseHandlerOptions {
  client: SocketClient;
  backendName: string;
  logging?: boolean;

  responseIdField?: 'id' | string;

  /**
   * If true, prefer socket.onAny(...) if available. (Useful where responses
   * come in via onAny and not a dedicated event handler.)
   */
  preferOnAny?: boolean;
  onServerPush?: (msg: { id: string; method: string; params: any }) => void;
}

export interface CreateSocketProxyClientOptions<TRouter = any> {
  client: SocketClient;
  logPrefix?: string;
  roles?: string[];
  requestTimeoutMs?: number;
}

function asTrpcClientError(error: unknown, fallbackMessage: string): TRPCClientError<any> {
  if (error instanceof TRPCClientError) return error;
  if (typeof error === 'string') return new TRPCClientError<any>(error);

  try {
    return new TRPCClientError<any>(JSON.stringify(error));
  } catch {
    return new TRPCClientError<any>(fallbackMessage);
  }
}

function hasOwnCallback(ioCallbacks: Record<string, any>, id: string): boolean {
  return Object.prototype.hasOwnProperty.call(ioCallbacks, id);
}

function allocateRequestId(ioCallbacks: Record<string, any>, maxAttempts = 8): string {
  for (let i = 0; i < maxAttempts; i += 1) {
    const id = generateShortId();
    if (!hasOwnCallback(ioCallbacks, id)) return id;
  }

  throw new TRPCClientError<any>('Unable to allocate unique socket request id');
}

export function createSocketLink(options: CreateSocketLinkOptions): TRPCLink<any> {
  const { backends, clients, notifyTRPCError, waitUntil, requestTimeoutMs = 15_000 } = options;

  const backendNames = new Set(backends.map((b) => b.name));

  return () =>
    ({ op }) =>
      observable((observer) => {
        const [routerName] = op.path.split('.');

        if (!routerName || !backendNames.has(routerName)) {
          const err = new TRPCClientError<any>(`Unknown router for ${op.path}`);
          notifyTRPCError(err);
          observer.error(err);
          observer.complete();
          return;
        }

        const client = clients[routerName];
        if (!client?.socket?.emit) {
          const err = new TRPCClientError<any>(`Socket client unavailable for router ${routerName}`);
          notifyTRPCError(err);
          observer.error(err);
          observer.complete();
          return;
        }

        let uuid = '';
        try {
          uuid = allocateRequestId(client.ioCallbacks);
        } catch (error) {
          const err = asTrpcClientError(error, 'Unable to allocate socket request id');
          notifyTRPCError(err);
          observer.error(err);
          observer.complete();
          return;
        }

        const method = op.path.startsWith(`${routerName}.`) ? op.path.slice(routerName.length + 1).trim() : '';
        if (!method) {
          const err = new TRPCClientError<any>(`Invalid method path for ${op.path}`);
          notifyTRPCError(err);
          observer.error(err);
          observer.complete();
          return;
        }

        let isSettled = false;

        const settleError = (error: unknown, reqId = uuid) => {
          if (isSettled) return;
          isSettled = true;

          const err = asTrpcClientError(error, 'Socket TRPC request failed');
          (err as any).data = {
            ...((err as any).data || {}),
            reqId,
          };

          delete client.ioCallbacks[uuid];
          notifyTRPCError(err);
          observer.error(err);
        };

        const run = async () => {
          try {
            await waitUntil(() => !!client?.socket?.emit, 60_000);
          } catch {
            settleError(new TRPCClientError<any>('Socket connection timeout'));
            observer.complete();
            return;
          }

          if (isSettled) return;

          const { input } = op;

          let timeout: ReturnType<typeof setTimeout> | undefined;

          client.ioCallbacks[uuid] = {
            timeout,
            resolve: (response: any) => {
              if (isSettled) return;
              if (timeout) clearTimeout(timeout);

              if (response?.error) {
                settleError(response.error, response?.id ?? uuid);
                return;
              }

              try {
                const result: any = deserialize(response?.result);
                isSettled = true;
                delete client.ioCallbacks[uuid];
                observer.next({ result } as any);
                observer.complete();
              } catch (deserializeError) {
                settleError(deserializeError, response?.id ?? uuid);
              }
            },
            reject: (error: any) => {
              if (timeout) clearTimeout(timeout);
              settleError(error, uuid);
            },
          };

          timeout = setTimeout(() => {
            settleError(new TRPCClientError<any>(`Request timeout: ${uuid} ${method} ${op.type}`));
          }, requestTimeoutMs);
          client.ioCallbacks[uuid].timeout = timeout;

          client.socket.emit('trpc', {
            id: uuid,
            method,
            type: op.type,
            params: serialize(input),
          });
        };

        void run();

        return () => {
          isSettled = true;
          if (client.ioCallbacks[uuid]) {
            clearTimeout(client.ioCallbacks[uuid].timeout);
            delete client.ioCallbacks[uuid];
          }
        };
      });
}

export function attachTrpcResponseHandler(opts: AttachTrpcResponseHandlerOptions) {
  const { client, backendName, logging = true, onServerPush, responseIdField = 'id', preferOnAny = false } = opts;

  if (!client.ioCallbacks) client.ioCallbacks = {};

  const logInfo = (...args: any[]) => (logging ? console.info(...args) : undefined);
  const logWarn = (...args: any[]) => (logging ? console.warn(...args) : undefined);
  const parseResponseId = (payload: any): string | undefined => {
    const rawId = payload?.[responseIdField];
    if (typeof rawId !== 'string') return undefined;
    const id = rawId.trim();
    return id.length > 0 ? id : undefined;
  };

  const safeDeserialize = (value: any, context: string) => {
    if (!value) return undefined;
    try {
      return deserialize(value);
    } catch {
      logWarn(`[${backendName} Socket] Failed to deserialize ${context}`);
      return undefined;
    }
  };

  const handlePayload = (eventName: string, rawPayload: any) => {
    try {
      const payload = typeof rawPayload === 'string' ? decodePayload(rawPayload) : rawPayload;
      if (!payload || typeof payload !== 'object') {
        logWarn(`[${backendName} Socket] Ignoring malformed payload for ${eventName}`);
        return;
      }

      if (eventName === 'trpcResponse') {
        const id = parseResponseId(payload);
        const cb = id && hasOwnCallback(client.ioCallbacks, id) ? client.ioCallbacks[id] : undefined;

        if (cb) {
          clearTimeout(cb.timeout);
          try {
            cb.resolve(payload);
          } catch (e) {
            cb.reject(e);
          } finally {
            delete client.ioCallbacks[id];
          }
          return;
        }

        const method = typeof payload?.method === 'string' ? payload.method.trim() : '';
        if (onServerPush && method) {
          const { params } = payload;
          onServerPush({
            id: parseResponseId(payload) ?? '',
            method,
            params: safeDeserialize(params, `server push params for ${method}`),
          });
          return;
        }

        logWarn(`[${backendName} Socket] No callback found for response id: ${String(id)}`);
        return;
      }

      if (onServerPush) {
        const method = typeof payload?.method === 'string' ? payload.method.trim() : '';
        if (!method) return;

        const { params } = payload ?? {};
        onServerPush({
          id: parseResponseId(payload) ?? '',
          method,
          params: safeDeserialize(params, `server push params for ${method}`),
        });
      }
    } catch (e) {
      if (logging) {
        logInfo(`[${backendName} Socket] Error in handler`, e);
      }
    }
  };

  if (preferOnAny && typeof client.socket.onAny === 'function') {
    const anyHandler = (eventName: string, payload: any) => {
      if (eventName !== 'trpcResponse') return;
      handlePayload(eventName, payload);
    };

    client.socket.onAny(anyHandler);
    return () => {
      if (typeof client.socket.offAny === 'function') client.socket.offAny(anyHandler);
    };
  }

  const onTrpcHandler = (res: any) => handlePayload('trpc', res);
  const onTrpcResponseHandler = (res: any) => handlePayload('trpcResponse', res);

  if (typeof client.socket.on === 'function') {
    client.socket.on('trpc', onTrpcHandler);
    client.socket.on('trpcResponse', onTrpcResponseHandler);
  }

  return () => {
    if (typeof client.socket.off === 'function') {
      client.socket.off('trpc', onTrpcHandler);
      client.socket.off('trpcResponse', onTrpcResponseHandler);
    }
  };
}

export function createSocketProxyClient<TRouter = any>(opts: CreateSocketProxyClientOptions<TRouter>): any {
  const { client, logPrefix = 'SocketProxy', roles = [], requestTimeoutMs = 15_000 } = opts;

  const proxy = createTRPCProxyClient<any>({
    links: [
      () =>
        ({ op }) =>
          observable((observer) => {
            const { input } = op;
            (op as any).context = (op as any).context ?? {};
            (op as any).context.client = client;
            (op as any).context.client.roles = roles;

            if (!client?.socket?.emit) {
              observer.error(
                new TRPCClientError<any>(`${logPrefix}: Emit Direct failed, no client or bad socket`) as any
              );
              observer.complete();
              return;
            }

            let uuid = '';
            try {
              uuid = allocateRequestId(client.ioCallbacks);
            } catch (error) {
              observer.error(asTrpcClientError(error, `${logPrefix}: Unable to allocate request id`) as any);
              observer.complete();
              return;
            }

            const request = { id: uuid, method: op.path, type: op.type, params: serialize(input) };
            let timeout: ReturnType<typeof setTimeout> | undefined;
            let isSettled = false;

            client.ioCallbacks[uuid] = {
              request,
              timeout,
              resolve: (pack: any) => {
                if (isSettled) return;
                isSettled = true;
                if (timeout) clearTimeout(timeout);

                if (pack?.error) {
                  const baseErr = asTrpcClientError(pack.error, `${logPrefix}: Request failed`) as any;
                  baseErr.data = {
                    ...(baseErr.data || {}),
                    reqId: pack.id ?? uuid,
                  };

                  observer.error(baseErr);
                  delete client.ioCallbacks[uuid];
                  return;
                }

                try {
                  const result: any = deserialize(pack?.result);
                  if (result?.status !== 1) {
                    const statusErr = new TRPCClientError<any>(
                      `${logPrefix}: status error ${JSON.stringify(result)}`
                    ) as any;
                    statusErr.data = {
                      ...(statusErr.data || {}),
                      reqId: pack?.id ?? uuid,
                    };
                    observer.error(statusErr);
                  } else {
                    observer.next({
                      result: {
                        data: result?.data ?? result,
                      },
                    } as any);
                    observer.complete();
                  }
                } catch (error) {
                  const deserializeErr = asTrpcClientError(error, `${logPrefix}: invalid response payload`) as any;
                  deserializeErr.data = {
                    ...(deserializeErr.data || {}),
                    reqId: pack?.id ?? uuid,
                  };
                  observer.error(deserializeErr);
                } finally {
                  delete client.ioCallbacks[uuid];
                }
              },
              reject: (error: any) => {
                if (isSettled) return;
                isSettled = true;
                if (timeout) clearTimeout(timeout);

                const err: any = asTrpcClientError(error, `${logPrefix}: Request failed`);
                err.data = {
                  ...(err.data || {}),
                  reqId: uuid,
                };

                observer.error(err as any);
                delete client.ioCallbacks[uuid];
              },
            };

            timeout = setTimeout(() => {
              if (isSettled) return;
              isSettled = true;
              delete client.ioCallbacks[uuid];

              const timeoutErr = new TRPCClientError<any>(`${logPrefix}: Request timeout`) as any;
              timeoutErr.data = {
                ...(timeoutErr.data || {}),
                reqId: uuid,
              };
              observer.error(timeoutErr as any);
            }, requestTimeoutMs);
            client.ioCallbacks[uuid].timeout = timeout;
            client.socket.emit('trpc', request);

            return () => {
              if (client.ioCallbacks[uuid]) {
                if (timeout) clearTimeout(timeout);
                delete client.ioCallbacks[uuid];
              }
            };
          }),
    ],
  });

  return proxy;
}

export interface BindSocketClientEmitOptions<TRouter = any> {
  client: SocketClient;
  socket: any;
  backendName?: string;
  logPrefix?: string;
  roles?: string[];
  requestTimeoutMs?: number;
  logging?: boolean;
  responseIdField?: 'id' | 'oid' | string;
  preferOnAny?: boolean;
  onServerPush?: (msg: { method: string; params: any }) => void;
}

export function bindSocketClientEmit<TRouter = any>(opts: BindSocketClientEmitOptions<TRouter>) {
  const {
    client,
    socket,
    backendName = 'socket-client',
    logPrefix = 'SocketClient',
    roles = [],
    requestTimeoutMs = 15_000,
    logging = false,
    responseIdField = 'id',
    preferOnAny = false,
    onServerPush,
  } = opts;

  client.ioCallbacks = client.ioCallbacks || {};
  client.socket = socket;

  attachTrpcResponseHandler({
    client,
    backendName,
    logging,
    responseIdField,
    preferOnAny,
    onServerPush,
  });

  return createSocketProxyClient<TRouter>({
    client,
    logPrefix,
    roles,
    requestTimeoutMs,
  });
}
