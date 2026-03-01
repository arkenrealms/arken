# @arken/node web3

Legacy-compatible Web3 transport helpers.

## Files
- `httpProvider.ts`: custom JSON-RPC provider wrapper with fetch + Cache API usage.
  - Constructor now honors explicit URL input before falling back to default provider pool.
  - Request IDs are preserved when callers provide one; fallback ID `56` is only used when missing.
  - Cache API usage is now runtime-guarded; provider falls back to network-only request flow when `caches`/`Request`/`Response` globals are unavailable.
  - Network POSTs are now wrapped with a deterministic timeout gate (`PROVIDER_TIMEOUT` default 5000ms) to avoid indefinite hangs.
  - Timeout now actively aborts in-flight fetch requests (when `AbortController` is available) to reduce dangling connection/resource usage.
  - 403 fallback retries now fail closed when no alternate provider exists, preventing unbounded recursive retry loops.
  - Malformed cache hits are now ignored and retried against live network fetch, preventing stale/invalid cache entries from causing hard request failure.
  - Invalid non-object JSON-RPC request payloads are rejected early with `-32600` (`Invalid JSON-RPC request payload`) instead of throwing ambiguous runtime type errors.
  - Provider request normalization no longer mutates caller-owned request objects while still applying deterministic JSON-RPC defaults (`jsonrpc`, fallback `id=56`).

## Notes
- This folder currently exposes one monolithic provider implementation.
- Behavior relies on browser/worker globals (`fetch`, `caches`, `Request`, `Response`), so runtime assumptions should be validated explicitly in tests before reuse in Node-only environments.
