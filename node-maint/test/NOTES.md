# arken/packages/node/test/NOTES.md

## Test analysis notes (2026-02-17)

### Current coverage highlights
- Unknown router handling.
- Request timeout path.
- Success and failure callback resolution.
- Proxy status==0 rejection behavior.
- Server dispatch success + throw path.

### Missing coverage to add next
1. Link teardown before response (unsubscribe cleanup).
2. `attachTrpcResponseHandler` `preferOnAny` branch and `offAny` cleanup.
3. Decoder failure / invalid serialized payload handling.
4. Response id field override (`oid`) behavior.
5. Duplicate event delivery idempotency.
6. Server handler with absent method path and nested resolution edge-cases.
7. Explicit assertion that request context roles are attached in proxy branch.

### Immediate fixes applied in this cycle
- Correct test expectation for server push payload deserialization behavior.
- Correct import path in `socketServer.spec.ts` to `../rpc`.
