# arken/packages/node/test/ANALYSIS.md

## Folder
`arken/packages/node/test`

## Snapshot
- Files: 4
- Subfolders: 0

## Notable contents
- files: NOTES.md, README.md, socketLink.spec.ts, socketServer.spec.ts, httpProvider.spec.ts, api.spec.ts

## Protocol/Test focus
- Prioritize transport, serialization, timeout, and error-handling paths where applicable.
- Expanded edge coverage for duplicate-response idempotency, explicit resolve/error permutation single-settlement invariants (link + proxy), unsubscribe/teardown-before-timeout late resolve/reject no-op behavior with callback-map invariants (link + proxy), callback-boundary resolve-throw fallback on mixed `error`/`result` envelopes (single reject + duplicate-delivery no-op), proxy timeout-vs-late-response races, proxy-timeout `reqId` metadata parity checks, ID-collision prevention, late responses, malformed payload permutations, strict response-id validation (non-string/blank IDs), own-property callback matching/prototype-key safety (including `toString` and `__proto__` ids), server-push malformed-param resilience across both direct `trpc` and `trpcResponse` fallback paths, malformed push-method filtering, deserialize-failure behavior with reqId metadata checks, immediate same-tick response races, and `preferOnAny` non-response filtering/fallback-teardown behavior.
- Ensure tests cover new/changed protocol behavior and edge cases.
- Added listener-API guard coverage in `socketServer.spec.ts` to verify attach/detach safety when socket objects do not implement `on`/`off`.
- Added server-handler regressions for undecodable payload paths: invalid binary-string message decode should emit the same status-0 malformed envelope, decoded payloads with non-string/blank-string `method` should emit the same explicit missing/invalid-method envelope, response-id normalization should trim valid IDs and drop non-string/blank IDs before response emit (including reserved prototype-path IDs like `__proto__`), whitespace-padded valid methods should dispatch successfully after trim normalization, prototype/constructor traversal attempts (including surrounding-whitespace, exact root `constructor`, `prototype`-segment, nested-segment variants, inherited built-in paths like `core.toString`, inherited array-prototype callable paths like `core.list.map`, and expanded inherited typed-array callable paths like `core.bytes.map` and `core.floats.map`) should be rejected as missing handlers, empty/whitespace-segment method traversal attempts (`core..ping`, `core. ping`) should be rejected as missing handlers, and undecodable `params` payloads should produce status-0 error propagation instead of unhandled throw behavior.
- Added link-side regression for backend-only op paths (`seer` without `method`) to ensure `createSocketLink` fails fast and avoids malformed socket emits.
- Added `httpProvider` regression coverage for cacheless runtimes to confirm request flow remains functional when Cache API globals are absent.
- Added deterministic timeout regression coverage for `httpProvider` to ensure hung fetch calls reject with explicit timeout error metadata instead of hanging indefinitely.
- Added timeout-abort regression coverage for `httpProvider` to ensure timeout paths actively signal abort to the in-flight fetch request when `AbortController` is available.
- Added malformed-cache regression coverage for `httpProvider` to ensure invalid cache hits are discarded and request flow refetches from network.
- Added 403 single-provider regression coverage for `httpProvider` to ensure failover logic does not recurse indefinitely when no alternate providers are available.
- Added malformed-envelope regression coverage for `httpProvider` to ensure non-object/array request payloads are rejected with deterministic JSON-RPC `-32600` invalid-request errors.
- Added caller-object immutability regression coverage for `httpProvider` to ensure JSON-RPC defaults are applied on a cloned request envelope (no caller-side `id`/`jsonrpc` mutation).
- Added `api/getFilter` regression coverage to ensure `id` criteria normalize to `_id` across `equals`/`in`/`contains` operators, scalar shorthand conditions (e.g., `{ id: 'abc' }`) are treated as equality checks in both root and nested logical nodes, plain-object values without operator keys are preserved as equality filters (instead of being dropped), empty `contains` clauses remain no-op within logical groups, and nested logical groups (e.g., `AND` containing `OR`) are preserved in generated Mongo filters.
