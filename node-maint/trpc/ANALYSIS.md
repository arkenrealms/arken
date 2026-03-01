# arken/packages/node/trpc/ANALYSIS.md

## Folder
`arken/packages/node/trpc`

## Snapshot
- Files: 4
- Subfolders: 0

## Notable contents
- files: NOTES.md, README.md, socketLink.ts, socketServer.ts

## Protocol/Test focus
- Prioritize transport, serialization, timeout, and error-handling paths where applicable.
- Client wrappers now guard against repeated request-ID collisions before emitting.
- Proxy/client resolve paths now treat malformed response payloads as structured tRPC errors while preserving `reqId` metadata and callback cleanup.
- Callback registration now occurs before socket emit so immediate same-tick responses are not dropped under low-latency/in-process transport behavior.
- Response-id parsing now rejects non-string/blank IDs to avoid accidental callback correlation on malformed envelopes.
- Server handler now treats blank-string request methods as invalid at envelope validation time (same class as missing/non-string methods), reducing ambiguous downstream dispatch failures.
- Server handler now trims valid method strings before target resolution, making surrounding-whitespace envelopes tolerant while preserving invalid blank-method rejection.
- Response IDs are now normalized before emit (trim valid IDs; non-string/blank IDs become `undefined`) to avoid propagating malformed callback identifiers.
- Method target resolution now blocks `__proto__`/`prototype`/`constructor` path segments, empty path segments (e.g. `core..ping`), and whitespace-padded path segments (e.g. `core. ping`) to avoid unsafe or ambiguous traversal while preserving valid caller semantics.
- Method resolution rejects inherited built-in prototype methods across common prototype families and expanded typed-array prototypes, preventing callable traversal such as `core.toString`, `core.list.map`, `core.bytes.map`, and `core.floats.map`.
- Callback lookup now requires own-property matches in `ioCallbacks`, preventing inherited prototype keys (e.g. `toString`) from being treated as active callbacks.
- Proxy timeout rejections now attach `reqId` metadata for parity with other transport error paths and easier distributed tracing.
- Server-push payload decode is now fail-soft (warn + undefined params) so malformed params do not crash handler flow.
- Server-push dispatch now validates `method` shape (non-empty string) for both `trpc` and unmatched `trpcResponse` payloads to avoid forwarding malformed events.
- Ensure tests cover new/changed protocol behavior and edge cases.
- Request-ID normalization now also drops reserved prototype-path tokens (`__proto__`, `prototype`, `constructor`) so emitted envelopes do not mirror ambiguous meta-keys.
- Link-level method derivation now fails fast when a routed path omits the method segment (e.g., `seer`), avoiding malformed `trpc` emits with backend-name-only methods.
