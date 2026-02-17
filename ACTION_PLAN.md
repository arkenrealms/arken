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

## Working method (chunked, bottom-up)
1. Pick a small folder chunk.
2. **Read actual files in the folder** (not just names) to infer purpose, key flows, and how it fits Arken project context.
3. Start with **deepest leaf folders first**, then move upward to parent folders.
4. At each parent folder, **merge/summarize child context** so navigation from top-down remains clear.
5. Write/update `ANALYSIS.md` with:
   - folder purpose in project context,
   - notable files and responsibilities,
   - protocol/test relevance,
   - risks/gaps and follow-ups.
6. Update `README.md` if missing/outdated so another agent can quickly orient.
7. Normalize top path headers in touched source files to `arken/...`.
8. Add/extend tests where applicable.
9. Commit + push.
10. Open/update PR (stack branches when needed).
11. Append progress log entry below with exact folders covered.

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

## Blockers
- `arkenrealms/evolution` push permission denied for current token.
- `arkenrealms/node` push auth currently unavailable in this runtime (`could not read Username for 'https://github.com': Device not configured`).
