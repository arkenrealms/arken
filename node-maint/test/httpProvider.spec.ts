// arken/packages/node/test/httpProvider.spec.ts

import Provider from '../web3/httpProvider';

describe('web3/httpProvider', () => {
  const originalFetch = (global as any).fetch;
  const originalCaches = (global as any).caches;
  const originalRequest = (global as any).Request;
  const originalResponse = (global as any).Response;

  beforeEach(() => {
    const cacheStore = new Map<string, any>();

    class MockRequest {
      url: string;
      constructor(url: string) {
        this.url = url;
      }
    }

    class MockResponse {
      body: string;
      ok: boolean;
      status: number;
      statusText: string;

      constructor(body: string, init: any = {}) {
        this.body = body;
        this.ok = init.ok ?? true;
        this.status = init.status ?? 200;
        this.statusText = init.statusText ?? 'OK';
      }

      async text() {
        return this.body;
      }
    }

    (global as any).Request = MockRequest;
    (global as any).Response = MockResponse;
    (global as any).caches = {
      open: jest.fn(async () => ({
        match: jest.fn(async (request: any) => cacheStore.get(request.url)),
        put: jest.fn(async (request: any, response: any) => {
          cacheStore.set(request.url, response);
        }),
      })),
    };

    (global as any).fetch = jest.fn(async (_url: string, init: any) =>
      new MockResponse(JSON.stringify({ result: init?.body ? JSON.parse(init.body).id : null }), {
        ok: true,
        status: 200,
        statusText: 'OK',
      })
    );
  });

  afterAll(() => {
    (global as any).fetch = originalFetch;
    (global as any).caches = originalCaches;
    (global as any).Request = originalRequest;
    (global as any).Response = originalResponse;
  });

  test('uses constructor url when provided', () => {
    const provider = new Provider('https://rpc.example.org/custom/path');

    expect(provider.host).toBe('rpc.example.org');
    expect(provider.path).toBe('/custom/path');
    expect(provider.url.toString()).toBe('https://rpc.example.org/custom/path');
  });

  test('rejects non-object JSON-RPC request payloads', async () => {
    const provider = new Provider('https://rpc.example.org');

    await expect(provider.request(null)).rejects.toMatchObject({
      code: -32600,
      message: 'Invalid JSON-RPC request payload',
    });

    await expect(provider.request('eth_chainId' as any)).rejects.toMatchObject({
      code: -32600,
      message: 'Invalid JSON-RPC request payload',
    });

    await expect(provider.request([] as any)).rejects.toMatchObject({
      code: -32600,
      message: 'Invalid JSON-RPC request payload',
    });
  });

  test('preserves explicit request id instead of overwriting it', async () => {
    const provider = new Provider('https://rpc.example.org');
    const result = await provider.request({ method: 'eth_chainId', params: [], id: 777 });

    expect(result).toBe(777);
  });

  test('uses fallback request id when id is missing', async () => {
    const provider = new Provider('https://rpc.example.org');
    const result = await provider.request({ method: 'eth_chainId', params: [] });

    expect(result).toBe(56);
  });

  test('does not mutate caller request object when filling defaults', async () => {
    const provider = new Provider('https://rpc.example.org');
    const request = { method: 'eth_chainId', params: [] as any[] };

    await provider.request(request);

    expect(request).toEqual({ method: 'eth_chainId', params: [] });
    expect(Object.prototype.hasOwnProperty.call(request, 'jsonrpc')).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(request, 'id')).toBe(false);
  });

  test('falls back to network-only flow when Cache API globals are unavailable', async () => {
    (global as any).caches = undefined;
    (global as any).Request = undefined;
    (global as any).Response = undefined;

    const provider = new Provider('https://rpc.example.org');
    const result = await provider.request({ method: 'eth_chainId', params: [], id: 901 });

    expect(result).toBe(901);
    expect((global as any).fetch).toHaveBeenCalledTimes(1);
  });

  test('ignores malformed cached responses and refetches from network', async () => {
    (global as any).caches = {
      open: jest.fn(async () => ({
        match: jest.fn(async () => ({ ok: true, status: 200 })),
        put: jest.fn(async () => undefined),
      })),
    };

    const provider = new Provider('https://rpc.example.org');
    const result = await provider.request({ method: 'eth_chainId', params: [], id: 9011 });

    expect(result).toBe(9011);
    expect((global as any).fetch).toHaveBeenCalledTimes(1);
  });

  test('rejects when fetch exceeds provider timeout window', async () => {
    jest.useFakeTimers();
    try {
      (global as any).fetch = jest.fn(() => new Promise(() => {}));

      const provider = new Provider('https://rpc.example.org');
      const pending = provider.request({ method: 'eth_chainId', params: [], id: 999 });
      const assertion = expect(pending).rejects.toMatchObject({
        code: -32000,
        message: 'Request timeout after 5000ms',
      });

      await jest.advanceTimersByTimeAsync(5001);
      await assertion;
    } finally {
      jest.useRealTimers();
    }
  }, 10000);

  test('aborts in-flight fetch request when timeout elapses', async () => {
    jest.useFakeTimers();
    try {
      let wasAborted = false;

      (global as any).fetch = jest.fn((_url: string, init: any) => {
        if (init?.signal && typeof init.signal.addEventListener === 'function') {
          init.signal.addEventListener('abort', () => {
            wasAborted = true;
          });
        }

        return new Promise(() => {});
      });

      const provider = new Provider('https://rpc.example.org');
      const pending = provider.request({ method: 'eth_chainId', params: [], id: 1001 });
      const assertion = expect(pending).rejects.toMatchObject({
        code: -32000,
        message: 'Request timeout after 5000ms',
      });

      await jest.advanceTimersByTimeAsync(5001);
      await assertion;
      expect(wasAborted).toBe(true);
    } finally {
      jest.useRealTimers();
    }
  }, 10000);

  test('does not recurse indefinitely on 403 when no alternate providers are configured', async () => {
    class ForbiddenResponse {
      ok = false;
      status = 403;
      statusText = 'Forbidden';

      async text() {
        return JSON.stringify({});
      }
    }

    (global as any).fetch = jest.fn(async () => new ForbiddenResponse());

    const provider = new Provider('https://bsc-dataseed1.ninicoin.io');

    await expect(provider.request({ method: 'eth_chainId', params: [], id: 1010 })).rejects.toMatchObject({
      code: -32000,
      message: '403: Forbidden',
    });
    expect((global as any).fetch).toHaveBeenCalledTimes(1);
  });
});
