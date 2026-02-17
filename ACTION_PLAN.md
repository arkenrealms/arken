# arken/ACTION_PLAN.md

## Objective
Systematically harden protocol quality (especially tRPC websocket wrappers), expand test coverage, and improve repo documentation/hygiene across Arken repos in chunked passes.

## Scope
- Primary: protocol + tests (focus on `packages/node/trpc` and related usage paths).
- Secondary:
  - Ensure top-of-file path headers use `arken/...` format in touched files.
  - Ensure concise `README.md` and `ANALYSIS.md` coverage in folders touched.

## Active repos
- `arkenrealms/node` (active, write access confirmed)
- `arkenrealms/seer` (active, write access confirmed)
- `arkenrealms/forge` (active, write access confirmed)
- `arkenrealms/evolution` (local work only currently; push blocked by repo permission)

## Rotation strategy (holistic architecture view)
Use a broad rotating cadence so context compounds across repos:
1. `node` chunk (protocol/tests/SDK reliability)
2. `seer` chunk (orchestration/protocol integration boundaries)
3. `forge` chunk (client/platform integration + UX-facing constraints)
4. `evolution` chunk (game-domain/data/runtime structure; local if push blocked)
5. Repeat cycle with next queued chunk per repo.

Per rotation, update cross-repo notes in parent `ANALYSIS.md` files when new architectural coupling is discovered.

## Working method (chunked, bottom-up)
1. Pick a small folder chunk.
2. **Load all `.md` files in that folder first** (README/NOTES/ANALYSIS/etc) before code edits.
3. **Read actual files in the folder** (not just names) to infer purpose, key flows, and how it fits Arken project context.
4. Start with **deepest leaf folders first**, then move upward to parent folders.
5. At each parent folder, **merge/summarize child context** so navigation from top-down remains clear.
6. Write/update `ANALYSIS.md` with checklists and sections for:
   - folder purpose in project context,
   - notable files and responsibilities,
   - protocol/test relevance,
   - risks/gaps and follow-ups.
7. Update `README.md` if missing/outdated so another agent can quickly orient.
8. Normalize top path headers in touched source files to `arken/...`.
9. Add/extend tests where applicable.
10. Commit + push.
11. Open/update PR (stack branches when needed).
12. Append progress log entry below with exact folders covered.
13. Update `DAILY_LOG.md` checklist with completed tasks + new improvement opportunities discovered.

## Progress log

### 2026-02-17 06:00–06:25 PST
- Created hourly autonomous maintenance workflow.
- Completed protocol/test pass in `@arken/node` tRPC socket wrappers.
- Added/updated docs + analysis files in node `test/` and `trpc/`.
- Normalized touched headers to `arken/...` format.
- Opened/updated PR: https://github.com/arkenrealms/node/pull/15
- Added initial analysis docs to:
  - `arkenrealms/seer` PR: https://github.com/arkenrealms/seer/pull/1
  - `arkenrealms/forge` PR: https://github.com/arkenrealms/forge/pull/1
- Added same initial analysis locally in `evolution`; push still blocked (403).

## Next chunks (queued)
1. `node`: deepest-first pass in `legacy/data/*` leaves, then bubble up to `legacy/data`, `legacy`, and `packages/node` summaries.
2. `node`: deepest-first pass in `data/zk/*` leaves, then parent summaries + protocol/test implications.
3. `node`: add protocol edge-case tests (id collisions, late responses, malformed payload permutations).
4. `seer` / `forge`: continue deepest-first analysis and README refresh in available checked-out scope, clearly documenting submodule boundaries.
5. `evolution`: continue deepest-first local analysis/docs; push once permission is granted.

### 2026-02-17 06:28–06:36 PST
- Refined methodology to require file-level analysis (not filename-only) with bottom-up (deepest-first) summarization.
- Added explicit omniverse-platform framing (Steam/Battle.net-grade reliability and operability).

### 2026-02-17 06:36+ PST (active chunk)
- Completed bottom-up analysis in `packages/node/legacy/data/generated` -> `legacy/data` -> `legacy` -> `packages/node` summary update.
- Updated `packages/node/time/ANALYSIS.md` with operational reliability concerns (UTC policy, queue observability, cancellation/backpressure gaps).
- Captured concrete follow-ups: schema validation for generated catalogs, modularization of `legacy/data/items.ts`, and targeted tests for time/event gating.

### 2026-02-17 06:44–06:58 PST
- Executed priority protocol hardening chunk for `packages/node/trpc` + `packages/node/test`.
- Added request-id collision guard in `packages/node/trpc/socketLink.ts` for both `createSocketLink` and `createSocketProxyClient` (bounded retries, fail-fast error).
- Expanded edge-case coverage in `packages/node/test/socketLink.spec.ts` for:
  - repeated request-id collisions,
  - late/unmatched responses,
  - malformed payload permutations (`null`, non-object, invalid JSON string).
- Updated concise docs/analysis in touched folders:
  - `packages/node/test/{README.md,ANALYSIS.md}`
  - `packages/node/trpc/{README.md,ANALYSIS.md}`
- Tests run:
  - `npm test -- test/socketLink.spec.ts test/socketServer.spec.ts --runInBand` (pass: 19/19)
- Commit created in `arkenrealms/node` local branch `sable/maintenance-trpc-ws-cycle`:
  - `1c8ad89` — Harden socket tRPC ID allocation and edge-case tests
- Push/PR update blocker:
  - `git push origin sable/maintenance-trpc-ws-cycle` failed with auth error (`could not read Username for 'https://github.com': Device not configured`).
- Next unblocked chunk if auth remains blocked:
  - continue local deepest-first analysis pass for `packages/node/data/zk/*` and stage doc updates for later push.

### 2026-02-17 06:49–07:02 PST
- Executed next protocol-hardening chunk in `packages/node/trpc` + `packages/node/test` (websocket wrapper robustness).
- Updated runtime behavior in `packages/node/trpc/socketLink.ts`:
  - `createSocketProxyClient` now catches malformed `result` deserialize failures,
  - converts them to structured `TRPCClientError`s,
  - preserves `reqId` metadata,
  - guarantees callback cleanup in `finally`.
- Expanded `packages/node/test/socketLink.spec.ts` coverage for:
  - `createSocketLink` deserialize-failure propagation with wire-level `reqId`,
  - `createSocketProxyClient` malformed-response rejection + callback cleanup invariants.
- Updated concise docs/analysis in touched folders:
  - `packages/node/test/{README.md,ANALYSIS.md}`
  - `packages/node/trpc/{README.md,ANALYSIS.md}`
- Tests run:
  - `npm test -- test/socketLink.spec.ts test/socketServer.spec.ts --runInBand` (pass: 21/21)
- Commit created in `arken/packages/node`:
  - `b9231d1` — Harden proxy malformed-response handling and extend socket tests
- Push/PR update blocker:
  - `git push origin sable/maintenance-trpc-ws-cycle` failed with auth error (`could not read Username for 'https://github.com': Device not configured`).
- Next unblocked chunk if auth remains blocked:
  - continue queued deepest-first analysis in `packages/node/data/zk/*` and stage docs/tests for later push.

### 2026-02-17 06:52–06:56 PST
- Executed next highest-priority protocol robustness chunk in `packages/node/trpc` + `packages/node/test` (websocket wrapper/use-case race hardening).
- Updated `packages/node/trpc/socketLink.ts` to register `ioCallbacks[reqId]` before `socket.emit` in both:
  - `createSocketLink`
  - `createSocketProxyClient`
- Added settled-state guards around proxy timeout/reject/resolve paths to avoid duplicate terminal signaling in tight race windows.
- Added targeted same-tick response tests in `packages/node/test/socketLink.spec.ts`:
  - `createSocketLink` immediate synchronous response during emit,
  - `createSocketProxyClient` immediate synchronous response during emit.
- Updated concise docs/analysis in touched folders:
  - `packages/node/trpc/{README.md,ANALYSIS.md}`
  - `packages/node/test/{README.md,ANALYSIS.md}`
- Tests run:
  - `npm test -- test/socketLink.spec.ts test/socketServer.spec.ts --runInBand` (pass: 23/23)
- Commit status:
  - local commit created in `arken/packages/node` on `sable/maintenance-trpc-ws-cycle`:
    - `c7008a0` — Harden websocket wrapper same-tick response races
- Push/PR status:
  - `git -C packages/node push origin sable/maintenance-trpc-ws-cycle` failed with auth blocker (`could not read Username for 'https://github.com': Device not configured`); PR update deferred until auth is restored.
  - `git push origin sable/arken-maintenance-trpc-ws-cycle` (super-repo plan/log branch) failed with the same auth blocker.
- Next unblocked chunk:
  - extend malformed payload/ID-field permutations in `attachTrpcResponseHandler` tests (e.g., numeric/empty IDs, malformed server-push params) and/or continue deepest-first `packages/node/data/zk/*` analysis.

### 2026-02-17 06:58+ PST
- Added persistent daily checklist log: `arken/DAILY_LOG.md`.
- Added large-work workstream scaffolding:
  - `arken/workstreams/README.md`
  - `arken/workstreams/matchmaking-system/CHECKLIST.md`
- Updated method to require reading all folder `.md` files before edits.
- Updated method to require checklist-driven `ANALYSIS.md` updates and daily log maintenance.

### 2026-02-17 07:03–07:08 PST
- Executed next highest-priority protocol robustness test chunk for websocket wrappers/use-cases in `packages/node/trpc` + `packages/node/test`.
- Expanded `attachTrpcResponseHandler` edge-case coverage in `packages/node/test/socketLink.spec.ts`:
  - non-string/blank response-id handling (`0`, `''`, `'   '`),
  - server-push malformed-param resilience (`params` decode failure should not throw, push still delivered with `params: undefined`).
- Updated concise docs/analysis in touched folders:
  - `packages/node/test/{README.md,ANALYSIS.md}`
  - `packages/node/trpc/{README.md,ANALYSIS.md}`
- Tests run:
  - `npm test -- test/socketLink.spec.ts test/socketServer.spec.ts --runInBand` (pass: 25/25)
- Commit/PR status:
  - pending local commit in `arkenrealms/node` on `sable/maintenance-trpc-ws-cycle`; push + PR update not attempted in this chunk.
- Next unblocked chunk:
  - add `preferOnAny` negative-path assertions (`offAny` safety when unavailable, non-`trpcResponse` filtering invariants) and malformed `trpcResponse` method/push permutations.

### 2026-02-17 07:00+ PST
- Configured persistent git credentials and identity for scheduled push contexts.
- Flushed queued commits to remotes in `node`, `seer`, and `forge`.
- Continued tRPC transport hardening in `node`:
  - safer server-push id parsing,
  - defensive deserialize fallback for malformed push payloads.
- Re-ran protocol test suites successfully (`test/socketLink.spec.ts`, `test/socketServer.spec.ts`).

### 2026-02-17 07:03–07:06 PST
- Executed next highest-priority protocol robustness chunk for websocket wrappers/use-cases in `packages/node/trpc` + `packages/node/test`.
- Hardened `attachTrpcResponseHandler` in `packages/node/trpc/socketLink.ts`:
  - validate server-push `method` as non-empty string before forwarding,
  - apply same validation for unmatched `trpcResponse` payloads to avoid malformed push dispatch.
- Expanded `packages/node/test/socketLink.spec.ts` coverage for:
  - `preferOnAny` non-`trpcResponse` filtering invariants,
  - `preferOnAny` fallback to `on/off` when `onAny` is unavailable,
  - safe detach when `offAny` is unavailable,
  - malformed server-push `method` permutations on both `trpc` and `trpcResponse` paths.
- Updated concise docs/analysis in touched folders:
  - `packages/node/trpc/{README.md,ANALYSIS.md}`
  - `packages/node/test/{README.md,ANALYSIS.md}`
- Tests run:
  - `npm test -- test/socketLink.spec.ts test/socketServer.spec.ts --runInBand` (pass: 29/29)
- Commit/push:
  - `9d0d9c9` — Harden trpcResponse push filtering and onAny fallback coverage
  - pushed to `origin/sable/maintenance-trpc-ws-cycle` (updates existing `arkenrealms/node` PR #15)
- Next unblocked chunk:
  - add duplicate-delivery idempotency assertions for callback resolution/rejection (double `trpcResponse` for same id) and proxy timeout-vs-late-response race tests.

### 2026-02-17 07:09–07:13 PST
- Executed highest-priority pending chunk from prior run: websocket wrapper/use-case race/idempotency tests in `packages/node/test`.
- Expanded `packages/node/test/socketLink.spec.ts` coverage for:
  - duplicate `trpcResponse` delivery idempotency (same callback id should resolve once without reject side-effects),
  - proxy timeout-vs-late-response race (late resolve after timeout settlement is safely ignored/no throw).
- Updated concise docs/analysis in touched folder:
  - `packages/node/test/{README.md,ANALYSIS.md}`
- Tests run:
  - `npm test -- test/socketLink.spec.ts test/socketServer.spec.ts --runInBand` (pass: 31/31)
- Commit/push:
  - `ea8136b` — Add duplicate-delivery and timeout-late-race websocket tests
  - pushed to `origin/sable/maintenance-trpc-ws-cycle` (updates `arkenrealms/node` PR #15)
- Next unblocked chunk:
  - extend duplicate-delivery coverage to explicit resolve-then-error / error-then-resolve permutations at handler boundary and validate single terminal observer signaling in link/proxy paths.

### 2026-02-17 07:14–07:19 PST
- Executed highest-priority pending chunk: explicit settle-order permutations for websocket wrappers/use-cases in `packages/node/test`.
- Expanded `packages/node/test/socketLink.spec.ts` coverage for:
  - `createSocketLink` resolve-then-error callback permutations (single terminal observer signaling: one `next` + one `complete`, no late error path),
  - `createSocketProxyClient` error-then-resolve callback permutations (single terminal promise settlement with safe late-callback no-throw behavior).
- Updated concise docs/analysis in touched folder:
  - `packages/node/test/{README.md,ANALYSIS.md}`
- Tests run:
  - `npm test -- test/socketLink.spec.ts test/socketServer.spec.ts --runInBand` (pass: 33/33)
- Commit/push:
  - `a545830` — Add single-settlement websocket permutation tests
  - pushed to `origin/sable/maintenance-trpc-ws-cycle` (updates `arkenrealms/node` PR #15)
- Next unblocked chunk:
  - add unsubscribe-vs-response race assertions (unsubscribe before timeout, then late resolve/reject no-op) for both link/proxy wrappers and verify callback-map invariants.

### 2026-02-17 07:19–07:23 PST
- Executed highest-priority pending chunk: unsubscribe/teardown-vs-response race assertions for websocket wrappers/use-cases in `packages/node/test`.
- Expanded `packages/node/test/socketLink.spec.ts` coverage for:
  - `createSocketLink` unsubscribe-before-timeout with late resolve/reject no-op behavior,
  - callback-map invariants after unsubscribe (no callback re-entry, no timer side-effects, no observer terminal notifications),
  - proxy teardown-before-timeout late resolve/reject no-op behavior with callback-map invariants preserved.
- Updated concise docs/analysis in touched folder:
  - `packages/node/test/{README.md,ANALYSIS.md}`
- Tests run:
  - `npm test -- test/socketLink.spec.ts test/socketServer.spec.ts --runInBand` (pass: 35/35)
- Commit/push:
  - `0591552` — Add unsubscribe/teardown late-response websocket race tests
  - pushed to `origin/sable/maintenance-trpc-ws-cycle` (updates `arkenrealms/node` PR #15)
- Next unblocked chunk:
  - extend callback-map invariants to response-handler boundary: malformed `trpcResponse` payloads carrying callback ids with mixed `error`/`result` shapes and ensure deterministic single-terminal behavior remains intact.

## Blockers
- `arkenrealms/evolution` push permission denied for current token.
