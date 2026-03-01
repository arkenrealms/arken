# arken/packages/node/trpc/NOTES.md

## Protocol analysis notes (2026-02-17)

### Current strengths
- Clear request/response correlation via `id` and `ioCallbacks` map.
- Timeout + cleanup paths exist in both link and proxy helpers.
- Server helper supports nested method paths (`core.getRealms` style).

### Gaps / risks to address
1. **Noise debug logs**
   - `socketLink.ts` and `socketServer.ts` still contain `console.log('zzzz...')` / raw message logs.
   - Recommend replacing with structured, optional logger.

2. **Event handling asymmetry**
   - `attachTrpcResponseHandler` listens to both `trpc` and `trpcResponse`; non-response events are treated as push messages.
   - Clarify whether server push should be `trpcPush` (dedicated event) to avoid accidental processing.

3. **Error envelope consistency**
   - Errors are surfaced as strings in some branches and object-wrapped in others.
   - Recommend standard `{ code, message, meta }` error envelope before converting to `TRPCClientError`.

4. **Type safety gaps**
   - Heavy `any` usage in socket interfaces and callbacks.
   - Introduce shared request/response types in a central `trpc/types.ts`.

### Test expansion candidates
- malformed payload decode failures.
- callback collision / duplicate id handling.
- response received after timeout cleanup.
- `preferOnAny=true` attach + detach lifecycle behavior.
- server handler unknown method path / missing target function.
- server push event contract (id-less + deserialize semantics).
