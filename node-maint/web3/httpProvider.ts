// arken/packages/node/web3/httpProvider.ts

import { SHA256 } from 'crypto-js';
// or
// import { ethers } from 'ethers';
// const sha256 = ethers.utils.sha256;

const DEFAULT_PROVIDERS = ['https://bsc-dataseed1.ninicoin.io'];
const PROVIDERS = JSON.stringify(DEFAULT_PROVIDERS);

let EDGE_CACHE_TTL = 60;
let BROWSER_CACHE_TTL = 0;
let PROVIDER_TIMEOUT = 5000;

const TIMEOUT_ERROR_CODE = -32000;

class RequestError extends Error {
  code: number;
  data: any;

  constructor(message: string, code: number, data: any) {
    super(message);
    this.code = code;
    this.data = data;
    this.name = this.constructor.name;
  }
}

export default class Provider {
  url: URL;
  host: string;
  path: string;
  isMetaMask: boolean;
  send: (request: any, callback: (error: any, response: any) => void) => void;
  sendAsync: (request: any, callback: (error: any, response: any) => void) => void;

  constructor(url: string) {
    EDGE_CACHE_TTL = EDGE_CACHE_TTL || 60;
    BROWSER_CACHE_TTL = BROWSER_CACHE_TTL || 0;
    PROVIDER_TIMEOUT = PROVIDER_TIMEOUT || 5000;

    const providers = JSON.parse(PROVIDERS);

    const resolvedProviderUrl =
      typeof url === 'string' && url.trim().length > 0
        ? url
        : providers[Math.floor(Math.random() * providers.length)];

    const parsedUrl = new URL(resolvedProviderUrl);
    this.url = parsedUrl;
    this.host = parsedUrl.host;
    this.path = parsedUrl.pathname;

    this.isMetaMask = false;

    this.send = (request, callback) => {
      this.request(request)
        .then((result) =>
          callback(null, {
            jsonrpc: '2.0',
            id: request && typeof request === 'object' && !Array.isArray(request) ? (request.id ?? 56) : undefined,
            result,
          })
        )
        .catch((error) => callback(error, null));
    };

    this.sendAsync = (request, callback) => {
      this.request(request)
        .then((result) =>
          callback(null, {
            jsonrpc: '2.0',
            id: request && typeof request === 'object' && !Array.isArray(request) ? (request.id ?? 56) : undefined,
            result,
          })
        )
        .catch((error) => callback(error, null));
    };
  }

  private async fetchWithTimeout(url: string, init: any): Promise<any> {
    let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
    const canAbort = typeof AbortController !== 'undefined';
    const controller = canAbort ? new AbortController() : null;
    const requestInit =
      controller && !init?.signal
        ? {
            ...init,
            signal: controller.signal,
          }
        : init;

    try {
      const timeoutPromise = new Promise((_, reject) => {
        timeoutHandle = setTimeout(() => {
          if (controller) {
            controller.abort();
          }
          reject(new RequestError(`Request timeout after ${PROVIDER_TIMEOUT}ms`, TIMEOUT_ERROR_CODE, null));
        }, PROVIDER_TIMEOUT);
      });

      return await Promise.race([fetch(url, requestInit), timeoutPromise]);
    } finally {
      if (timeoutHandle) {
        clearTimeout(timeoutHandle);
      }
    }
  }

  async request(request: any): Promise<any> {
    return this.requestWithRetries(request, 0);
  }

  private async requestWithRetries(request: any, forbiddenRetries: number): Promise<any> {
    var _a, _b, _c;

    if (!request || typeof request !== 'object' || Array.isArray(request)) {
      throw new RequestError('Invalid JSON-RPC request payload', -32600, null);
    }

    const requestWithDefaults = {
      ...request,
      jsonrpc: '2.0',
      id: typeof request.id === 'undefined' || request.id === null ? 56 : request.id,
    };

    const headers = {
      'Content-Type': 'application/json',
    };

    const canUseRuntimeCache =
      typeof caches !== 'undefined' &&
      typeof (caches as any).open === 'function' &&
      typeof Request !== 'undefined' &&
      typeof Response !== 'undefined';

    const cache = canUseRuntimeCache ? await caches.open('my-cache-name') : null;
    const url = this.url.toString();
    const body = JSON.stringify(requestWithDefaults);
    const hash = SHA256(body).toString();
    const cacheUrl = new URL(url);
    cacheUrl.pathname = '/posts' + cacheUrl.pathname + hash;

    const cacheKey =
      cache && canUseRuntimeCache
        ? new Request(cacheUrl.toString(), {
            headers,
            method: 'GET',
          })
        : null;

    let response = cache && cacheKey ? await cache.match(cacheKey) : null;

    if (
      response &&
      (typeof response !== 'object' ||
        typeof (response as any).ok !== 'boolean' ||
        typeof (response as any).status !== 'number' ||
        typeof (response as any).statusText !== 'string' ||
        typeof (response as any).text !== 'function')
    ) {
      response = null;
    }

    if (!response) {
      response = await this.fetchWithTimeout(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestWithDefaults),
      });

      if (!response.ok) {
        if (response.status === 403) {
          if (cache && cacheKey && typeof Response !== 'undefined') {
            const fullBody = JSON.stringify({});
            const cacheHeaders = { 'Cache-Control': `public, max-age=${EDGE_CACHE_TTL}` };
            await cache.put(cacheKey, new Response(fullBody, { ...response, headers: cacheHeaders }));
          }

          const availableProviders: string[] = JSON.parse(PROVIDERS);
          const currentProvider = this.url.toString();
          const alternateProviders = availableProviders.filter((provider) => provider !== currentProvider);

          if (alternateProviders.length === 0 || forbiddenRetries >= availableProviders.length - 1) {
            throw new RequestError(`${response.status}: ${response.statusText}`, -32000, null);
          }

          const newUrl = new URL(alternateProviders[Math.floor(Math.random() * alternateProviders.length)]);
          this.url = newUrl;
          this.host = newUrl.host;
          this.path = newUrl.pathname;

          return await this.requestWithRetries(request, forbiddenRetries + 1);
        } else {
          throw new RequestError(`${response.status}: ${response.statusText}`, -32000, null);
        }
      }
    }

    let responseBody: any = await response.text();

    try {
      responseBody = JSON.parse(responseBody);
    } catch (e) {
      responseBody = {};
    }

    const fullBody = JSON.stringify(responseBody);

    if (cache && cacheKey && typeof Response !== 'undefined') {
      const cacheHeaders = { 'Cache-Control': `public, max-age=${EDGE_CACHE_TTL}` };
      await cache.put(cacheKey, new Response(fullBody, { ...response, headers: cacheHeaders }));
    }

    if ('error' in responseBody) {
      throw new RequestError(
        (_a = responseBody.error) === null || _a === void 0 ? void 0 : _a.message,
        (_b = responseBody.error) === null || _b === void 0 ? void 0 : _b.code,
        (_c = responseBody.error) === null || _c === void 0 ? void 0 : _c.data
      );
    } else {
      return responseBody.result;
    }
  }
}
