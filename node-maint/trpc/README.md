# arken/packages/node/trpc/README.md

Socket-based tRPC transport helpers for `@arken/node`.

## Files
- `socketLink.ts`: client link + proxy, callback correlation, request ID collision avoidance, same-tick response safety (register callback before emit), timeout/error handling (including proxy timeout `reqId` metadata), strict response-id parsing, own-property callback matching (prototype-key safety), pre-emit method-path validation (rejects backend-only paths like `seer` without a method segment), safe malformed-response/server-push decode handling, method-shape validation for server-push events, optional `onAny` response handling with graceful fallback/teardown guards.
- `socketServer.ts`: server-side request handler for `trpc` events and standardized `trpcResponse` envelopes, including explicit invalid-method guards (missing/non-string/blank method values), normalized response-id handling (trim valid IDs, drop non-string/blank IDs), trimmed-method dispatch for whitespace-tolerant valid calls, strict method-path validation (blocks `__proto__` / `prototype` / `constructor`, empty path segments like `core..ping`, and whitespace-padded segments like `core. ping`), and traversal-time rejection of inherited built-in prototype methods across common JS prototype families (including broader typed-array coverage like `core.bytes.map` and `core.floats.map`).
- `NOTES.md`: maintainer notes and protocol hardening backlog.

## Wire format
- Request: `trpc` event with `{ id, method, type, params }`.
- Response: `trpcResponse` with `{ id, result, error? }`.
- `result` payload convention: `{ status, data }` (serialized).
