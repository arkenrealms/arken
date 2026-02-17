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

### 2026-02-17 07:24–07:33 PST
- Rotation moved to `seer` chunk (per cadence after `node`).
- Initialized nested Seer submodules:
  - `packages/seer/packages/node` (`arkenrealms/seer-node`)
  - `packages/seer/packages/protocol` (`arkenrealms/seer-protocol`)
- Completed deepest-first leaf analysis for `packages/seer/packages/protocol/src/modules/oasis` and bubbled summaries upward.
- Added/updated concise docs + analysis in touched Seer protocol folders:
  - `packages/seer/packages/protocol/README.md`
  - `packages/seer/packages/protocol/ANALYSIS.md`
  - `packages/seer/packages/protocol/src/{README.md,ANALYSIS.md}`
  - `packages/seer/packages/protocol/src/modules/{README.md,ANALYSIS.md}`
  - `packages/seer/packages/protocol/src/modules/oasis/{README.md,ANALYSIS.md}`
  - `packages/seer/ANALYSIS.md`
  - `packages/seer/packages/ANALYSIS.md`
- Key findings:
  - Oasis routes still rely on permissive `z.any()` inputs and include stubbed mutation behavior (`interact`), raising contract-reliability risk.
  - Seer root router composes many Arken node routers plus Seer modules, increasing blast radius of weak module validation.
- Tests run:
  - none (docs/analysis-only chunk; no behavior changes).
- Commit/push:
  - `arkenrealms/seer-protocol` `sable/repo-analysis-notes-20260217`: `895767b` — Add deepest-first Oasis protocol analysis docs
  - `arkenrealms/seer` `sable/repo-analysis-notes-20260217`: `b6c0b90` — Initialize protocol submodule and document Oasis analysis
  - pushed both branches to origin.
- PR status:
  - Existing Seer PR remains: https://github.com/arkenrealms/seer/pull/1
  - New Seer-protocol PR link (branch pushed): https://github.com/arkenrealms/seer-protocol/pull/new/sable/repo-analysis-notes-20260217
  - CLI PR-open blocker: `gh` not installed in runtime (`command not found`), so PR creation was not executed from shell.
- Next chunk (rotation): move to `forge`; for Seer follow-up queue starts at `protocol/src/modules/isles` leaf-first.

### 2026-02-17 07:29–07:36 PST
- Rotation moved to `forge` chunk.
- Initialized nested Forge submodule:
  - `packages/forge/packages/web` (`arkenrealms/forge-web`)
- Completed deepest-first leaf analysis for `packages/forge/packages/web/src/modules/royale` and bubbled summaries upward to `src/modules` and `src`.
- Added/updated concise docs + analysis in touched Forge folders:
  - `packages/forge/packages/web/src/{README.md,ANALYSIS.md}`
  - `packages/forge/packages/web/src/modules/{README.md,ANALYSIS.md}`
  - `packages/forge/packages/web/src/modules/royale/{README.md,ANALYSIS.md}`
  - `packages/forge/ANALYSIS.md`
  - `packages/forge/packages/{README.md,ANALYSIS.md}`
- Key findings:
  - `src/modules/royale` currently contains empty placeholders (`royale.router.ts`, `royale.service.ts`).
  - Runtime Royale behavior is implemented via `views/royale/index.tsx`, `components/Royale.tsx`, and `/royale` route wiring in `hooks/useWindows.tsx`.
  - Live-event/socket handling is coupled to component code, increasing protocol-hardening test friction.
- Tests run:
  - none (docs/analysis-only chunk; no runtime behavior changes).
- Commit/push:
  - `arkenrealms/forge-web` `sable/repo-analysis-notes-20260217-2`: `6c9f3f2` — Add Royale module deep-dive docs and src rollup analysis
  - `arkenrealms/forge` `sable/repo-analysis-notes-20260217`: `3972d9f` — Initialize forge-web submodule and document Royale module architecture
  - pushed both branches to origin.
- PR status:
  - Existing Forge PR remains: https://github.com/arkenrealms/forge/pull/1
  - New Forge-web PR link (branch pushed): https://github.com/arkenrealms/forge-web/pull/new/sable/repo-analysis-notes-20260217-2
  - CLI PR-open blocker persists: `gh` not installed in runtime.
- Next chunk (rotation): move to `evolution` and continue deepest-first local analysis/docs while push remains permission-blocked.

### 2026-02-17 07:34–07:42 PST
- Rotation moved to `evolution` chunk.
- Loaded all local `.md` docs first (`README.md`, `ANALYSIS.md`, `NOTES.md`, `packages/{README.md,ANALYSIS.md}`) and validated current submodule topology.
- Attempted nested checkout initialization:
  - `git -C arken/packages/evolution submodule sync --recursive`
  - `git -C arken/packages/evolution submodule update --init --recursive`
- Blocker confirmed: `fatal: No url found for submodule path 'packages/client' in .gitmodules`.
- Additional finding: `packages/client` exists as a gitlink in HEAD but is not declared in `.gitmodules`; prevents recursive submodule initialization and blocks leaf-source analysis in evolution child repos.
- Tests run: none (infra/blocker discovery chunk only).
- Commit/push: none (analysis/logging chunk only).
- Next per rotation: proceed to `node` with next websocket callback-boundary edge-case tests while evolution access is blocked.

### 2026-02-17 07:42–07:48 PST
- Rotation moved to `node` chunk.
- Loaded `.md` docs first in touched folders:
  - `packages/node/trpc/{README.md,ANALYSIS.md}`
  - `packages/node/test/{README.md,ANALYSIS.md}`
- Added callback-boundary robustness test in `packages/node/test/socketLink.spec.ts`:
  - mixed `error`/`result` envelope where callback `resolve` throws,
  - verifies fallback `reject` fires once,
  - verifies late duplicate delivery for same id is no-op.
- Updated concise docs in touched folder:
  - `packages/node/test/{README.md,ANALYSIS.md}`
- Tests run:
  - `npm test -- test/socketLink.spec.ts test/socketServer.spec.ts --runInBand` (pass: 36/36)
- Commit/push:
  - `arkenrealms/node` `sable/maintenance-trpc-ws-cycle`: `e3e2583` — Add callback-boundary mixed-envelope websocket handler test (pushed; updates PR https://github.com/arkenrealms/node/pull/15)
  - `arkenrealms/evolution` `sable/repo-analysis-notes-20260217`: `74d4a6e` — Document evolution submodule-mapping blocker for client gitlink (local commit only; push blocked by 403 permission)
  - `arkenrealms/arken` `sable/arken-maintenance-trpc-ws-cycle`: `bb1a36e` — Log evolution blocker and roll submodule pointers (pushed)
- Next unblocked chunk:
  - continue `seer` rotation (`protocol/src/modules/isles` leaf-first) unless explicit priority override is set.

### 2026-02-17 07:39–07:50 PST
- Rotation moved to `seer` chunk (continuing cadence after `node`).
- Loaded `.md` docs first for active protocol folders (`src/modules`, `src`, `packages/protocol`, and Seer parent analysis docs).
- Completed deepest-first leaf analysis for `packages/seer/packages/protocol/src/modules/isles` by reading all module source files.
- Added/updated concise docs + analysis in touched Seer protocol folders:
  - `packages/seer/packages/protocol/src/modules/isles/{README.md,ANALYSIS.md}`
  - `packages/seer/packages/protocol/src/modules/ANALYSIS.md`
  - `packages/seer/packages/protocol/src/ANALYSIS.md`
  - `packages/seer/packages/protocol/ANALYSIS.md`
  - `packages/seer/ANALYSIS.md`
  - `packages/seer/packages/ANALYSIS.md`
- Key findings:
  - Isles routes are likely miswired to Evolution service handlers.
  - Isles contracts remain permissive (`z.any`) with ambiguous query/mutation semantics.
  - `isles.router.ts` includes a large commented legacy block (~3.6k lines), increasing maintenance risk.
- Tests run:
  - none (docs/analysis-only chunk; no runtime behavior changes).
- Commit/push/PR status:
  - `arkenrealms/seer-protocol` `sable/repo-analysis-notes-20260217`: `1332301` — Add Isles module deep-dive docs and protocol risk notes (pushed)
  - `arkenrealms/seer` `sable/repo-analysis-notes-20260217`: `3352b42` — Document Isles protocol analysis and roll up findings (pushed)
  - `arkenrealms/arken` `sable/arken-maintenance-trpc-ws-cycle`: `90fbbce` — Log Seer Isles analysis chunk and update rotation plan (pushed)
- PR status:
  - Existing Seer PR remains: https://github.com/arkenrealms/seer/pull/1
  - Seer-protocol branch PR link: https://github.com/arkenrealms/seer-protocol/pull/new/sable/repo-analysis-notes-20260217
  - CLI PR-open blocker persists: `gh` not installed in runtime.
- Next chunk (rotation): move to `forge` and continue deepest-first module analysis in checked-out scope.

### 2026-02-17 07:44–07:52 PST
- Rotation moved to `forge` chunk (continuing cadence after `seer`).
- Loaded target folder docs first (existing Forge analysis docs) then performed deepest-first source read in:
  - `packages/forge/packages/web/src/views/games/infinite/{index.tsx,tutorial.tsx,players.json}`
- Added concise README/ANALYSIS coverage for touched view hierarchy:
  - `packages/forge/packages/web/src/views/{README.md,ANALYSIS.md}`
  - `packages/forge/packages/web/src/views/games/{README.md,ANALYSIS.md}`
  - `packages/forge/packages/web/src/views/games/infinite/{README.md,ANALYSIS.md}`
- Updated upward rollups:
  - `packages/forge/packages/web/src/{README.md,ANALYSIS.md}`
  - `packages/forge/packages/ANALYSIS.md`
  - `packages/forge/ANALYSIS.md`
- Tests run:
  - none (docs/analysis-only chunk; no behavior changes).
- Commit/push/PR status:
  - `arkenrealms/forge-web` `sable/repo-analysis-notes-20260217-2`: `bee7f46` — Add Forge views/games/infinite analysis docs and rollups (pushed)
  - `arkenrealms/forge` `sable/repo-analysis-notes-20260217`: `34a07bf` — Document Forge infinite views leaf analysis and rollups (pushed; updates https://github.com/arkenrealms/forge/pull/1)
  - forge-web branch PR link: https://github.com/arkenrealms/forge-web/pull/new/sable/repo-analysis-notes-20260217-2
- Next chunk (rotation): move to `evolution` and continue local blocker-aware analysis unless `.gitmodules` mapping is repaired.

### 2026-02-17 07:49–07:56 PST
- Rotation moved to `evolution` chunk.
- Loaded all `.md` files first in target scope:
  - `packages/evolution/{README.md,ANALYSIS.md,NOTES.md}`
  - `packages/evolution/packages/{README.md,ANALYSIS.md}`
- Read concrete source metadata files and tree state:
  - `packages/evolution/.gitmodules`
  - `git ls-tree HEAD packages/` (verified gitlinks/SHAs).
- Updated blocker documentation with concrete gitlink SHAs and renewed verification:
  - `packages/evolution/NOTES.md`
  - `packages/evolution/ANALYSIS.md`
  - `packages/evolution/packages/ANALYSIS.md`
- Commit/push status:
  - `arkenrealms/evolution` `sable/repo-analysis-notes-20260217`: `5ce2a6c` — Document evolution client gitlink metadata mismatch with SHA (local commit)
  - push remains blocked: `403 Permission denied` on `arkenrealms/evolution`.
- Per policy after blocker, rotation advanced to next repo (`node`).

### 2026-02-17 07:56–08:01 PST
- Rotation moved to `node` chunk.
- Loaded `.md` docs first in touched folders:
  - `packages/node/test/{README.md,ANALYSIS.md}`
  - `packages/node/trpc/{README.md,ANALYSIS.md}`
- Added websocket callback-boundary resilience test:
  - `packages/node/test/socketLink.spec.ts`
  - new assertion covers `attachTrpcResponseHandler` `trpcResponse`-fallback server-push path where `params` deserialize fails (`params` safely becomes `undefined` and no throw).
- Updated concise docs in touched folder:
  - `packages/node/test/{README.md,ANALYSIS.md}`
- Tests run:
  - `npm test -- test/socketLink.spec.ts test/socketServer.spec.ts --runInBand` (pass: 37/37)
- Commit/push:
  - `arkenrealms/node` `sable/maintenance-trpc-ws-cycle`: `65ebab5` — Add trpcResponse fallback malformed-params websocket test (pushed; updates PR https://github.com/arkenrealms/node/pull/15)
- Next chunk (rotation): `seer` (`protocol/src/modules/infinite` leaf-first) unless priority override is provided.

### 2026-02-17 08:01–08:08 PST
- Rotation moved to `seer` chunk.
- Loaded `.md` docs first in active parent folders:
  - `packages/seer/packages/protocol/src/modules/ANALYSIS.md`
  - `packages/seer/packages/protocol/src/ANALYSIS.md`
  - `packages/seer/packages/protocol/ANALYSIS.md`
  - `packages/seer/ANALYSIS.md`
  - `packages/seer/packages/ANALYSIS.md`
- Completed deepest-first source read for `packages/seer/packages/protocol/src/modules/infinite`:
  - `index.ts`, `infinite.models.ts`, `infinite.schema.ts`, `infinite.types.ts`, `infinite.router.ts`, `infinite.service.ts`
- Added concise leaf docs:
  - `packages/seer/packages/protocol/src/modules/infinite/{README.md,ANALYSIS.md}`
- Updated upward rollups:
  - `packages/seer/packages/protocol/src/modules/ANALYSIS.md`
  - `packages/seer/packages/protocol/src/ANALYSIS.md`
  - `packages/seer/packages/protocol/ANALYSIS.md`
  - `packages/seer/ANALYSIS.md`
  - `packages/seer/packages/ANALYSIS.md`
- Key findings:
  - Infinite router procedures currently route through Evolution service path (`ctx.app.service.Evolution.saveRound`).
  - Service methods are placeholder/logging-heavy with weak explicit output guarantees.
  - Input contracts remain permissive (`z.any`), and router contains large commented legacy block.
- Tests run:
  - none (docs/analysis-only chunk; no runtime behavior changes).
- Commit/push/PR status:
  - pending commit/push in `seer-protocol`, `seer`, and parent `arken` rollup.
- Next chunk (rotation): move to `forge` (next leaf-first pass in `forge-web` checked-out scope).

### 2026-02-17 08:08–08:17 PST
- Rotation moved to `forge` chunk.
- Loaded existing `.md` docs first in parent folders:
  - `packages/forge/packages/web/src/views/{README.md,ANALYSIS.md}`
  - `packages/forge/packages/web/src/views/games/{README.md,ANALYSIS.md}`
  - `packages/forge/packages/web/src/{README.md,ANALYSIS.md}`
  - `packages/forge/packages/ANALYSIS.md`
  - `packages/forge/ANALYSIS.md`
- Completed deepest-first source read in `packages/forge/packages/web/src/views/games/evolution` leaves:
  - `leaderboard/index.tsx`
  - `tournament/index.tsx`
  - plus parent files `index.tsx`, `items.tsx`, `runeforms.tsx`, `tutorial.tsx`.
- Added concise leaf docs:
  - `packages/forge/packages/web/src/views/games/evolution/{README.md,ANALYSIS.md}`
  - `packages/forge/packages/web/src/views/games/evolution/leaderboard/{README.md,ANALYSIS.md}`
  - `packages/forge/packages/web/src/views/games/evolution/tournament/{README.md,ANALYSIS.md}`
- Updated upward rollups:
  - `packages/forge/packages/web/src/views/games/{README.md,ANALYSIS.md}`
  - `packages/forge/packages/web/src/views/{README.md,ANALYSIS.md}`
  - `packages/forge/packages/web/src/{README.md,ANALYSIS.md}`
  - `packages/forge/packages/ANALYSIS.md`
  - `packages/forge/ANALYSIS.md`
- Key findings:
  - `evolution/leaderboard/index.tsx` is a monolithic view that directly polls Envoy JSON endpoints and owns large query/tab state orchestration.
  - `evolution/tournament/index.tsx` is a thin adapter over shared component surfaces.
  - Evolution views mix thin wrappers and heavy inline logic, creating fragmented protocol ownership/test strategy.
- Tests run:
  - none (docs/analysis-only chunk; no behavior changes).
- Commit/push/PR status:
  - `arkenrealms/forge-web` `sable/repo-analysis-notes-20260217-2`: `6426073` — Document evolution game view leafs and roll up analysis (pushed)
  - `arkenrealms/forge` `sable/repo-analysis-notes-20260217`: `88819c8` — Roll forge-web evolution view analysis updates (pushed; updates https://github.com/arkenrealms/forge/pull/1)
  - `arkenrealms/arken` `sable/arken-maintenance-trpc-ws-cycle`: `740b9e9` — Log forge evolution views maintenance chunk (pushed)
  - forge-web branch PR link (manual open/update): https://github.com/arkenrealms/forge-web/pull/new/sable/repo-analysis-notes-20260217-2
- Next chunk (rotation): move to `evolution` and continue blocker-aware local analysis unless submodule mapping is repaired.

### 2026-02-17 08:04–08:20 PST
- Rotation continued from `forge` to `evolution` per cadence.
- Loaded all evolution target `.md` files first and re-checked repo state:
  - `packages/evolution/{README.md,ANALYSIS.md,NOTES.md}`
  - `packages/evolution/packages/{README.md,ANALYSIS.md}`
- Blocker remains unchanged in `evolution`:
  - submodule init still blocked by missing `.gitmodules` mapping for `packages/client` gitlink,
  - push permission to `arkenrealms/evolution` still unavailable for current token.
- Per policy, advanced to next repo in rotation (`node`) and completed deepest-first leaf analysis in `data/zk/*`.
- Loaded source files (no pre-existing `.md` in leaf folders) and added concise docs/analysis:
  - `packages/node/data/zk/{README.md,ANALYSIS.md}`
  - `packages/node/data/zk/circuits/{README.md,ANALYSIS.md}`
  - `packages/node/data/zk/updateLeaf_js/{README.md,ANALYSIS.md}`
- Updated parent rollup:
  - `packages/node/data/ANALYSIS.md`
- Tests run:
  - none (docs/analysis-only chunk; no runtime behavior changes)
- Commit/push/PR status:
  - pending local commit in `arkenrealms/node` (`sable/maintenance-trpc-ws-cycle`), then parent `arken` submodule rollup push.
- Next chunk (rotation): move to `seer` (next leaf-first module pass, likely `protocol/src/modules/evolution`) unless priority override is set.

### 2026-02-17 08:09–08:18 PST
- Rotation moved to `seer` chunk (continuing cadence after `node` docs pass).
- Loaded required `.md` docs first in active parent folders:
  - `packages/seer/packages/protocol/src/modules/{README.md,ANALYSIS.md}`
  - `packages/seer/packages/protocol/src/ANALYSIS.md`
  - `packages/seer/packages/protocol/ANALYSIS.md`
  - `packages/seer/{ANALYSIS.md,packages/ANALYSIS.md}`
- Completed deepest-first source read for `packages/seer/packages/protocol/src/modules/evolution`:
  - `index.ts`, `evolution.models.ts`, `evolution.schema.ts`, `evolution.types.ts`, `evolution.router.ts`, `evolution.service.ts`.
- Added concise leaf docs:
  - `packages/seer/packages/protocol/src/modules/evolution/{README.md,ANALYSIS.md}`
- Updated upward rollups:
  - `packages/seer/packages/protocol/src/modules/ANALYSIS.md`
  - `packages/seer/packages/protocol/src/ANALYSIS.md`
  - `packages/seer/packages/protocol/ANALYSIS.md`
  - `packages/seer/ANALYSIS.md`
  - `packages/seer/packages/ANALYSIS.md`
- Key findings:
  - Evolution module concentrates high-risk reward/payment/round logic in a monolithic service surface.
  - Router contract strictness is uneven (`z.any` across critical procedures), with mixed auth semantics between middleware and service checks.
  - Party/payment paths expose likely invariant risks (`leaveParty` guard inversion; payment session lifecycle fragility).
- Tests run:
  - none (docs/analysis-only chunk; no behavior changes).
- Commit/push/PR status:
  - `arkenrealms/seer-protocol` `sable/repo-analysis-notes-20260217`: `7659c5a` — Add Evolution module leaf analysis docs and protocol risk rollups (pushed)
  - `arkenrealms/seer` `sable/repo-analysis-notes-20260217`: `467184c` — Document Seer Evolution protocol leaf analysis and rollups (pushed; updates https://github.com/arkenrealms/seer/pull/1)
- Next chunk (rotation): move to `forge` (next deepest-first pass in checked-out `forge-web` scope) unless priority override is provided.

### 2026-02-17 08:14–08:22 PST
- Rotation moved to `forge` chunk.
- Loaded `.md` docs first in active parent folders:
  - `packages/forge/packages/web/src/views/games/{README.md,ANALYSIS.md}`
  - `packages/forge/packages/web/src/views/ANALYSIS.md`
  - `packages/forge/packages/web/src/ANALYSIS.md`
  - `packages/forge/packages/ANALYSIS.md`
  - `packages/forge/ANALYSIS.md`
- Completed deepest-first source read for `packages/forge/packages/web/src/views/games/isles/index.tsx`.
- Added concise leaf docs:
  - `packages/forge/packages/web/src/views/games/isles/{README.md,ANALYSIS.md}`
- Updated upward rollups:
  - `packages/forge/packages/web/src/views/games/{README.md,ANALYSIS.md}`
  - `packages/forge/packages/web/src/views/ANALYSIS.md`
  - `packages/forge/packages/web/src/ANALYSIS.md`
  - `packages/forge/packages/ANALYSIS.md`
  - `packages/forge/ANALYSIS.md`
- Key findings:
  - Isles game route is a minimal wrapper with all runtime behavior delegated to `~/components/MemeIsles`.
  - Protocol/data authority for Isles cannot be validated from route layer alone; requires follow-up in component/hooks surfaces.
- Tests run:
  - none (docs/analysis-only chunk; no behavior changes).
- Commit/push/PR status:
  - `arkenrealms/forge-web` `sable/repo-analysis-notes-20260217-2`: `e6fd6c0` — Add Isles game view leaf analysis docs and rollups (pushed)
  - `arkenrealms/forge` `sable/repo-analysis-notes-20260217`: `7d0b6f8` — Roll forge-web Isles view analysis updates (pushed; updates https://github.com/arkenrealms/forge/pull/1)
  - forge-web branch PR link (manual open/update): https://github.com/arkenrealms/forge-web/pull/new/sable/repo-analysis-notes-20260217-2
- Next chunk (rotation): move to `evolution`; if blocked, record blocker and continue to `node`.

### 2026-02-17 08:19–08:27 PST
- Rotation moved to `evolution` chunk after prior `forge` pass.
- Loaded required evolution docs first and re-ran recursive submodule init check in `packages/evolution`.
- Blocker persists exactly:
  - `fatal: no submodule mapping found in .gitmodules for path 'packages/client'`
  - `fatal: No url found for submodule path 'packages/client' in .gitmodules`
- Per execution policy, advanced to next repo in rotation (`node`) and executed a small protocol-hardening chunk in websocket wrappers/tests.
- Loaded `.md` docs first in touched folders:
  - `packages/node/trpc/{README.md,ANALYSIS.md}`
  - `packages/node/test/{README.md,ANALYSIS.md}`
- Updated runtime behavior in `packages/node/trpc/socketLink.ts`:
  - callback matching for `trpcResponse` now requires own-property checks on `ioCallbacks`, avoiding inherited prototype-key collisions (e.g. `toString`),
  - request-id allocation now also uses own-property checks for consistency.
- Expanded `packages/node/test/socketLink.spec.ts` coverage for:
  - inherited prototype-key safety in `attachTrpcResponseHandler` (`id: 'toString'` must not be treated as an active callback and should still route valid server-push payloads).
- Updated concise docs/analysis in touched folders:
  - `packages/node/trpc/{README.md,ANALYSIS.md}`
  - `packages/node/test/{README.md,ANALYSIS.md}`
- Tests run:
  - `npm test -- test/socketLink.spec.ts test/socketServer.spec.ts --runInBand` (pass: 38/38)
- Commit/push:
  - `arkenrealms/node` `sable/maintenance-trpc-ws-cycle`: `64c0c04` — Harden ioCallback own-key matching in socket response handler (pushed; updates PR https://github.com/arkenrealms/node/pull/15)
- Next chunk (rotation): move to `seer` for the next deepest-first module pass in checked-out protocol scope.

### 2026-02-17 08:24–08:31 PST
- Rotation moved to `seer` chunk (continuing cadence after `node`).
- Loaded required `.md` docs first in active parent folders:
  - `packages/seer/ANALYSIS.md`
  - `packages/seer/packages/ANALYSIS.md`
  - `packages/seer/packages/node/README.md`
- Completed deepest-first source read for `packages/seer/packages/node/src`:
  - `index.ts`, `web3.ts`, `tests.ts`
- Added concise leaf + package docs:
  - `packages/seer/packages/node/src/{README.md,ANALYSIS.md}`
  - `packages/seer/packages/node/ANALYSIS.md`
- Updated upward rollups:
  - `packages/seer/packages/ANALYSIS.md`
  - `packages/seer/ANALYSIS.md`
- Key findings:
  - `src/index.ts` is a monolithic bootstrap combining env/db/server/socket/router concerns.
  - Socket callback handling in Seer runtime lacks parity with hardened callback lifecycle safeguards added in `@arken/node` wrappers.
  - `src/tests.ts` contains ad-hoc helpers outside structured test harnesses.
- Tests run:
  - none (docs/analysis-only chunk; no runtime behavior changes).
- Commit/push/PR status:
  - `arkenrealms/seer-node` `sable/repo-analysis-notes-20260217-node-src`: `b4855a6` — Add seer-node src analysis docs and package overview (pushed)
  - `arkenrealms/seer` `sable/repo-analysis-notes-20260217`: `1c21a26` — Document seer-node src leaf analysis and rollups (pushed; updates https://github.com/arkenrealms/seer/pull/1)
  - seer-node branch PR link: https://github.com/arkenrealms/seer-node/pull/new/sable/repo-analysis-notes-20260217-node-src
- Next chunk (rotation): move to `forge` for next deepest-first pass in checked-out `forge-web` scope.

### 2026-02-17 08:31–08:38 PST
- Rotation moved to `forge` chunk.
- Loaded required `.md` docs first in active parent folders:
  - `packages/forge/packages/web/src/ANALYSIS.md`
  - `packages/forge/packages/web/src/views/games/isles/ANALYSIS.md`
  - `packages/forge/packages/ANALYSIS.md`
  - `packages/forge/ANALYSIS.md`
- Completed deepest-first source read for `packages/forge/packages/web/src/components/MemeIsles.tsx`.
- Added concise folder docs:
  - `packages/forge/packages/web/src/components/{README.md,ANALYSIS.md}`
- Updated upward rollups:
  - `packages/forge/packages/web/src/ANALYSIS.md`
  - `packages/forge/packages/web/src/views/games/isles/ANALYSIS.md`
  - `packages/forge/packages/ANALYSIS.md`
  - `packages/forge/ANALYSIS.md`
- Key findings:
  - `MemeIsles.tsx` is a monolithic runtime bridge mixing socket transport, Unity bridge globals, wallet signature flow, and UI state.
  - Module-level mutable singletons (`socket`, `unityInstance`, `realm2`, etc.) increase race/leakage risk across React lifecycle transitions.
  - Event decoding/parsing uses positional string payload assumptions and lacks typed schema guards.
- Tests run:
  - none (docs/analysis-only chunk; no runtime behavior changes).
- Commit/push/PR status:
  - `arkenrealms/forge-web` `sable/repo-analysis-notes-20260217-2`: `0b3c046` — Document MemeIsles component runtime ownership and risks (pushed)
  - `arkenrealms/forge` `sable/repo-analysis-notes-20260217`: `faaebef` — Roll MemeIsles component analysis into forge summaries (pushed; updates https://github.com/arkenrealms/forge/pull/1)
  - `arkenrealms/arken` `sable/arken-maintenance-trpc-ws-cycle`: `4677d11` — Log forge MemeIsles maintenance chunk and roll pointers (pushed)
- Next chunk (rotation): move to `evolution`; if blocked, record blocker and continue to `node`.

### 2026-02-17 08:38–08:40 PST
- Rotation moved to `evolution` chunk.
- Loaded all required local `.md` docs first:
  - `packages/evolution/{README.md,ANALYSIS.md,NOTES.md}`
  - `packages/evolution/packages/{README.md,ANALYSIS.md}`
- Re-ran recursive submodule initialization check:
  - `git -C packages/evolution submodule sync --recursive`
  - `git -C packages/evolution submodule update --init --recursive`
- Blocker persists unchanged:
  - `fatal: No url found for submodule path 'packages/client' in .gitmodules`
- Tests run:
  - none (blocker verification chunk).
- Commit/push/PR status:
  - no new evolution commit in this micro-chunk (blocker unchanged).
- Next chunk (rotation): advance to `node` for next small protocol/test/docs pass.

### 2026-02-17 08:40–08:46 PST
- Rotation advanced to `node` chunk after evolution blocker.
- Loaded required `.md` docs first in touched folders:
  - `packages/node/trpc/{README.md,ANALYSIS.md}`
  - `packages/node/test/{README.md,ANALYSIS.md}`
- Implemented small protocol-hardening update in `packages/node/trpc/socketLink.ts`:
  - proxy timeout errors now attach `reqId` metadata (parity with other transport error paths).
- Added targeted regression coverage in `packages/node/test/socketLink.spec.ts`:
  - proxy timeout rejection now asserts `data.reqId` matches emitted request id.
- Updated concise docs/analysis in touched folders:
  - `packages/node/trpc/{README.md,ANALYSIS.md}`
  - `packages/node/test/{README.md,ANALYSIS.md}`
- Tests run:
  - `npm test -- test/socketLink.spec.ts test/socketServer.spec.ts --runInBand` (pass: 38/38)
- Commit/push:
  - `arkenrealms/node` `sable/maintenance-trpc-ws-cycle`: `2b02bf8` — Attach reqId metadata to proxy timeout errors (pushed; updates PR https://github.com/arkenrealms/node/pull/15)
- Next chunk (rotation): move to `seer` for next deepest-first pass in checked-out scope.

### 2026-02-17 08:46–08:53 PST
- Rotation moved to `seer` chunk.
- Loaded required parent `.md` docs first:
  - `packages/seer/packages/node/src/{README.md,ANALYSIS.md}`
  - `packages/seer/packages/node/ANALYSIS.md`
  - `packages/seer/packages/ANALYSIS.md`
  - `packages/seer/ANALYSIS.md`
- Completed deepest-first source read in `packages/seer/packages/node/src/data`:
  - `oldPaymentRequests.json`
- Added concise leaf docs:
  - `packages/seer/packages/node/src/data/{README.md,ANALYSIS.md}`
- Updated upward rollups:
  - `packages/seer/packages/node/src/{README.md,ANALYSIS.md}`
  - `packages/seer/packages/node/ANALYSIS.md`
  - `packages/seer/packages/ANALYSIS.md`
  - `packages/seer/ANALYSIS.md`
- Key findings:
  - `oldPaymentRequests.json` contains legacy completed payment-request records with wallet addresses and raw signed payload blobs.
  - This artifact is sensitive and currently lacks explicit schema/test guardrails in-folder.
- Tests run:
  - none (docs/analysis-only chunk; no runtime behavior changes).
- Commit/push/PR status:
  - `arkenrealms/seer-node` `sable/repo-analysis-notes-20260217-node-src`: `fc1de20` — Add seer-node src/data legacy payment artifact analysis docs (pushed)
  - `arkenrealms/seer` `sable/repo-analysis-notes-20260217`: `257e441` — Document seer-node src/data leaf analysis and rollups (pushed; updates https://github.com/arkenrealms/seer/pull/1)
  - seer-node branch PR link (manual open/update): https://github.com/arkenrealms/seer-node/pull/new/sable/repo-analysis-notes-20260217-node-src
- Next chunk (rotation): move to `forge` for next deepest-first pass in checked-out `forge-web` scope.

## Blockers
- `arkenrealms/evolution` push permission denied for current token.
- `arken/packages/evolution`: submodule graph inconsistency (`packages/client` gitlink missing `.gitmodules` URL mapping) blocks `submodule update --init --recursive` and therefore deeper source-level evolution analysis.

### 2026-02-17 12:09–12:16 PST
- Rotation moved to `forge` chunk (continuing cadence after latest `seer` pass).
- Loaded required `.md` docs first in active folders:
  - `packages/forge/packages/web/src/components/{README.md,ANALYSIS.md}`
  - `packages/forge/packages/web/src/components/Menu/components/{README.md,ANALYSIS.md}`
  - `packages/forge/packages/web/src/components/Menu/icons/{README.md,ANALYSIS.md}`
  - `packages/forge/packages/web/src/{README.md,ANALYSIS.md}`
  - `packages/forge/{ANALYSIS.md,packages/ANALYSIS.md}`
- Completed source read for Menu root primitives:
  - `packages/forge/packages/web/src/components/Menu/Menu.tsx`
  - `packages/forge/packages/web/src/components/Menu/config.ts`
  - `packages/forge/packages/web/src/components/Menu/theme.ts`
  - `packages/forge/packages/web/src/components/Menu/types.ts`
- Added concise leaf docs:
  - `packages/forge/packages/web/src/components/Menu/{README.md,ANALYSIS.md}`
- Updated upward rollups:
  - `packages/forge/packages/web/src/components/{README.md,ANALYSIS.md}`
  - `packages/forge/packages/web/src/{README.md,ANALYSIS.md}`
  - `packages/forge/packages/ANALYSIS.md`
  - `packages/forge/ANALYSIS.md`
- Key findings:
  - `Menu.tsx` currently returns an empty fragment (dormant/bypassed top-level menu container).
  - `config.ts` contains duplicated social locale entries and large commented legacy blocks.
  - `types.ts` still uses loose `any` surfaces for `children/content` contracts.
- Tests run:
  - none (docs/analysis-only chunk; no behavior changes).
- Commit/push/PR status:
  - `arkenrealms/forge-web` `sable/repo-analysis-notes-20260217-2`: `9e31d20` — Add Menu root analysis docs and rollup notes (pushed)
  - `arkenrealms/forge` `sable/repo-analysis-notes-20260217`: `4fa2d7f` — Document Forge Menu root architecture chunk (pushed; updates https://github.com/arkenrealms/forge/pull/1)
  - forge-web branch PR link (manual open/update): https://github.com/arkenrealms/forge-web/pull/new/sable/repo-analysis-notes-20260217-2
- Next chunk (rotation): move to `evolution`; if blocker persists, record blocker and advance to `node`.

### 2026-02-17 12:16–12:26 PST
- Rotation moved to `evolution` after forge chunk.
- Loaded required `.md` docs first:
  - `packages/evolution/{README.md,ANALYSIS.md,NOTES.md}`
  - `packages/evolution/packages/{README.md,ANALYSIS.md}`
- Re-ran blocker verification commands:
  - `git -C arken/packages/evolution submodule sync --recursive`
  - `git -C arken/packages/evolution submodule update --init --recursive`
- Blocker remains unchanged:
  - `fatal: No url found for submodule path 'packages/client' in .gitmodules`
- Per policy after blocker, rotation advanced to `node`.
- Loaded `.md` docs first in touched node folders:
  - `packages/node/.rush/ANALYSIS.md`
  - `packages/node/ANALYSIS.md`
- Completed source-level pass for:
  - `packages/node/.rush/temp/shrinkwrap-deps.json`
- Added concise folder docs:
  - `packages/node/.rush/README.md`
- Updated rollups:
  - `packages/node/.rush/ANALYSIS.md`
  - `packages/node/ANALYSIS.md`
- Key findings:
  - `.rush/temp/shrinkwrap-deps.json` is a high-volume integrity map that should remain generated-only.
  - Manual edits to Rush shrinkwrap metadata can desynchronize dependency determinism and mask drift.
- Tests run:
  - none (docs/analysis-only chunk; no runtime behavior changes).
- Commit/push status:
  - `arkenrealms/node` `sable/maintenance-trpc-ws-cycle`: `0bf6780` — Document Rush cache metadata ownership (pushed; updates https://github.com/arkenrealms/node/pull/15)
- Next chunk (rotation): move to `seer` for next deepest-first pass.

### 2026-02-17 08:53–09:01 PST
- Rotation moved to `forge` chunk (continuing cadence after `seer`).
- Loaded parent `.md` docs first before source analysis:
  - `packages/forge/packages/web/src/views/games/{README.md,ANALYSIS.md}`
  - `packages/forge/packages/web/src/views/ANALYSIS.md`
  - `packages/forge/packages/web/src/ANALYSIS.md`
  - `packages/forge/packages/ANALYSIS.md`
  - `packages/forge/ANALYSIS.md`
- Completed deepest-first source read for `packages/forge/packages/web/src/views/games/oasis`:
  - `index.tsx`, all entity/list route wrappers, `lore.tsx`, and `tutorial.tsx`.
- Added concise leaf docs:
  - `packages/forge/packages/web/src/views/games/oasis/{README.md,ANALYSIS.md}`
- Updated upward rollups:
  - `packages/forge/packages/web/src/views/games/{README.md,ANALYSIS.md}`
  - `packages/forge/packages/web/src/views/ANALYSIS.md`
  - `packages/forge/packages/web/src/ANALYSIS.md`
  - `packages/forge/packages/ANALYSIS.md`
  - `packages/forge/ANALYSIS.md`
- Key findings:
  - Oasis routes are mostly thin wrappers around `~/components/Sanctuary/*`.
  - `tutorial.tsx` is a monolithic outlier with mixed UI/data-hook responsibilities and `@arken/node/legacy/data/items` coupling.
  - Multiple wrappers retain unused imports and untyped route params, indicating low lint/type pressure.
- Tests run:
  - none (docs/analysis-only chunk; no behavior changes).
- Commit/push/PR status:
  - `arkenrealms/forge-web` `sable/repo-analysis-notes-20260217-2`: `0b656cc` — Add Oasis game route analysis docs and rollups (pushed)
  - `arkenrealms/forge` `sable/repo-analysis-notes-20260217`: `df934ed` — Document Oasis route-wrapper analysis in Forge rollups (pushed; updates https://github.com/arkenrealms/forge/pull/1)
- Next chunk (rotation): move to `evolution`; if blocked, record blocker and continue to `node`.

### 2026-02-17 09:01–09:10 PST
- Rotation moved to `evolution` chunk after `forge`.
- Loaded required evolution docs first:
  - `packages/evolution/{README.md,ANALYSIS.md,NOTES.md}`
  - `packages/evolution/packages/{README.md,ANALYSIS.md}`
- Re-ran blocker verification commands:
  - `git -C packages/evolution submodule sync --recursive`
  - `git -C packages/evolution submodule update --init --recursive`
- Blocker remains unchanged:
  - `fatal: No url found for submodule path 'packages/client' in .gitmodules`
- Per policy, advanced to next repo in rotation (`node`) and executed a small docs/analysis chunk in `packages/node/data/db`.
- Loaded `.md` docs first in parent folder:
  - `packages/node/data/ANALYSIS.md`
- Read current folder state/source metadata:
  - `packages/node/data/db/.gitkeep`
- Added concise leaf docs:
  - `packages/node/data/db/{README.md,ANALYSIS.md}`
- Updated upward rollup:
  - `packages/node/data/ANALYSIS.md`
- Key findings:
  - `data/db` is currently an empty placeholder (`.gitkeep` only) with no documented fixture/seeding contract.
  - Absence of an explicit policy risks ad-hoc artifact commits and inconsistent environment bootstrapping.
- Tests run:
  - none (docs/analysis-only chunk; no behavior changes).
- Commit/push/PR status:
  - `arkenrealms/node` `sable/maintenance-trpc-ws-cycle`: `9c6afeb` — Document node data/db placeholder ownership and gaps (pushed; updates PR https://github.com/arkenrealms/node/pull/15)
- Next chunk (rotation): move to `seer` for next deepest-first pass.

### 2026-02-17 09:10–09:18 PST
- Rotation moved to `seer` chunk after `node`.
- Loaded target folder docs first in `packages/seer/packages/protocol/src`:
  - `README.md`, `ANALYSIS.md`, `modules/README.md`, `modules/ANALYSIS.md`
- Completed source-level read for protocol-root files:
  - `packages/seer/packages/protocol/src/index.ts`
  - `packages/seer/packages/protocol/src/router.ts`
  - `packages/seer/packages/protocol/src/types.ts`
- Updated concise docs/analysis with upward merge of leaf findings:
  - `packages/seer/packages/protocol/src/ANALYSIS.md`
  - `packages/seer/packages/protocol/ANALYSIS.md`
  - `packages/seer/packages/ANALYSIS.md`
  - `packages/seer/ANALYSIS.md`
- Key findings:
  - Root `router.ts` contains permissive/stubbed top-level procedures (`auth`, `banProfile`, `info`) with weak schema/authorization guarantees.
  - `types.ts` keeps broad `any` surfaces across app/runtime fields, increasing integration drift risk.
  - `index.ts` performs import-time `dotenv.config()` side effects, which can couple test/runtime behavior to load order.
- Tests run:
  - none (docs/analysis-only chunk; no runtime behavior changes).
- Commit/push/PR status:
  - pending local commit/push in `seer-protocol`, `seer`, and parent `arken` rollup.
- Next chunk (rotation): move to `forge` after this seer commit/push cycle.

### 2026-02-17 09:18–09:27 PST
- Rotation moved to `forge` chunk (continuing cadence after `seer`).
- Loaded required `.md` docs first in active folders:
  - `packages/forge/packages/web/src/components/{README.md,ANALYSIS.md}`
  - `packages/forge/packages/web/src/views/games/oasis/ANALYSIS.md`
  - `packages/forge/packages/web/src/views/games/ANALYSIS.md`
  - `packages/forge/packages/web/src/ANALYSIS.md`
  - `packages/forge/packages/ANALYSIS.md`
  - `packages/forge/ANALYSIS.md`
- Completed deepest-first source read for `packages/forge/packages/web/src/components/Sanctuary/*.tsx`.
- Added concise leaf docs:
  - `packages/forge/packages/web/src/components/Sanctuary/{README.md,ANALYSIS.md}`
- Updated upward rollups:
  - `packages/forge/packages/web/src/components/{README.md,ANALYSIS.md}`
  - `packages/forge/packages/web/src/views/games/oasis/ANALYSIS.md`
  - `packages/forge/packages/web/src/views/games/ANALYSIS.md`
  - `packages/forge/packages/web/src/ANALYSIS.md`
  - `packages/forge/packages/ANALYSIS.md`
  - `packages/forge/ANALYSIS.md`
- Key findings:
  - Oasis runtime ownership primarily lives in `components/Sanctuary/*` rather than route wrappers.
  - Sanctuary components currently mix generated node data, direct Envoy fetches, and seer tRPC hooks within one folder.
  - Multiple placeholder/stub files remain (`Boss*`, `Monster*`, `Item`, `Mechanics`, `Skills`), increasing ownership ambiguity.
- Tests run:
  - none (docs/analysis-only chunk; no behavior changes).
- Commit/push/PR status:
  - `arkenrealms/forge-web` `sable/repo-analysis-notes-20260217-2`: `77063f3` — Document Sanctuary component ownership and Oasis data authority (pushed)
  - `arkenrealms/forge` `sable/repo-analysis-notes-20260217`: `e60ddd5` — Roll Sanctuary component analysis into Forge summaries (pushed; updates https://github.com/arkenrealms/forge/pull/1)
  - forge-web branch PR link (manual open/update): https://github.com/arkenrealms/forge-web/pull/new/sable/repo-analysis-notes-20260217-2
- Next chunk (rotation): move to `evolution`; if blocked, record blocker and continue to `node`.

### 2026-02-17 11:10–11:17 PST
- Rotation moved to `evolution` chunk.
- Loaded required `.md` docs first:
  - `packages/evolution/{README.md,ANALYSIS.md,NOTES.md}`
  - `packages/evolution/packages/{README.md,ANALYSIS.md}`
- Re-ran recursive submodule initialization check:
  - `git -C packages/evolution submodule sync --recursive`
  - `git -C packages/evolution submodule update --init --recursive`
- Blocker persists unchanged:
  - `fatal: No url found for submodule path 'packages/client' in .gitmodules`
- Per policy, advanced to `node`.
- Loaded target docs first in `node` scope:
  - `packages/node/legacy/ANALYSIS.md`
- Completed deepest-first artifact-surface analysis for `packages/node/legacy/contracts` by reading representative contract artifact files and schema families.
- Added concise leaf docs:
  - `packages/node/legacy/contracts/{README.md,ANALYSIS.md}`
- Updated parent rollup:
  - `packages/node/legacy/ANALYSIS.md`
- Key findings:
  - folder contains 113 large legacy contract artifact JSONs,
  - artifacts span mixed schema families (Truffle-like, Hardhat-style, ABI-only),
  - no local artifact-shape guardrails currently enforce compatibility assumptions.
- Tests run:
  - none (docs/analysis-only chunk; no runtime behavior changes).
- Commit/push:
  - `arkenrealms/node` `sable/maintenance-trpc-ws-cycle`: `50a0294` — Document legacy contract artifact surface and schema risks (pushed; updates https://github.com/arkenrealms/node/pull/15)
- Next chunk (rotation): move to `seer`.

### 2026-02-17 11:17–11:24 PST
- Rotation moved to `seer` chunk.
- Loaded all required `.md` docs first in active protocol folders:
  - `packages/seer/packages/protocol/src/modules/{README.md,ANALYSIS.md}`
  - `packages/seer/packages/protocol/src/ANALYSIS.md`
  - `packages/seer/packages/protocol/ANALYSIS.md`
  - `packages/seer/packages/ANALYSIS.md`
  - `packages/seer/ANALYSIS.md`
- Completed source pass in module leaf entrypoints:
  - `packages/seer/packages/protocol/src/modules/{oasis,isles,infinite,evolution}/index.ts`
- Normalized top path headers in touched source files to `arken/...` format.
- Tests run:
  - none (comment-only source normalization; no runtime logic changes).
- Commit/push status:
  - pending local commit/push in `seer-protocol` and parent `seer` rollup update.
- Next chunk (rotation): move to `forge` after seer push completes.

### 2026-02-17 11:24–11:33 PST
- Rotation moved to `forge` chunk.
- Loaded required `.md` docs first in active parent folders:
  - `packages/forge/packages/web/src/components/{README.md,ANALYSIS.md}`
  - `packages/forge/packages/web/src/ANALYSIS.md`
  - `packages/forge/packages/ANALYSIS.md`
  - `packages/forge/ANALYSIS.md`
- Completed deepest-first source read for `packages/forge/packages/web/src/components/guilds`:
  - `NoProfileCard.tsx`, `ProfileAvatar.tsx`, `TeamCard.tsx`, `TeamHeader.tsx`, `TeamListCard.tsx`
- Added concise leaf docs:
  - `packages/forge/packages/web/src/components/guilds/{README.md,ANALYSIS.md}`
- Updated upward rollups:
  - `packages/forge/packages/web/src/components/{README.md,ANALYSIS.md}`
  - `packages/forge/packages/web/src/ANALYSIS.md`
  - `packages/forge/packages/ANALYSIS.md`
  - `packages/forge/ANALYSIS.md`
- Key findings:
  - `TeamCard.tsx` directly couples Forge UI to Seer profile query shape (`trpc.seer.profile.getProfiles`) while using loose typing (`team: any`).
  - `ProfileAvatar.tsx` contains likely status/icon semantics drift (`Active` branch displays inactive icon).
  - Guild component folder retains unused imports/commented blocks, indicating maintenance debt and unclear cleanup ownership.
- Tests run:
  - none (docs/analysis-only chunk; no runtime behavior changes).
- Commit/push:
  - `arkenrealms/forge-web` `sable/repo-analysis-notes-20260217-2`: `a55812c` — Add guilds component analysis docs and rollups (pushed)
  - `arkenrealms/forge` `sable/repo-analysis-notes-20260217`: `5b9af54` — Document guilds component boundary in forge analysis (pushed; updates https://github.com/arkenrealms/forge/pull/1)
- Next chunk (rotation): move to `evolution`; if blocked, record blocker and continue to `node`.

### 2026-02-17 11:33–11:41 PST
- Rotation moved to `evolution` chunk.
- Loaded required `.md` docs first:
  - `packages/evolution/{README.md,ANALYSIS.md,NOTES.md}`
  - `packages/evolution/packages/{README.md,ANALYSIS.md}`
- Re-ran recursive submodule initialization check:
  - `git -C arken/packages/evolution submodule sync --recursive`
  - `git -C arken/packages/evolution submodule update --init --recursive`
- Blocker persists unchanged:
  - `fatal: No url found for submodule path 'packages/client' in .gitmodules`
- Per policy, advanced to `node`.
- Loaded target docs first in node scope:
  - `packages/node/web3/ANALYSIS.md`
  - `packages/node/ANALYSIS.md`
- Completed deepest-first source read for:
  - `packages/node/web3/httpProvider.ts`
- Added/updated concise docs:
  - `packages/node/web3/README.md` (new)
  - `packages/node/web3/ANALYSIS.md` (refreshed)
  - `packages/node/ANALYSIS.md` (parent rollup update)
- Key findings:
  - `httpProvider.ts` ignores constructor URL and selects from hardcoded provider list.
  - JSON-RPC request id is forced to a constant (`56`), reducing request-correlation fidelity.
  - Browser Cache API globals are assumed in runtime without explicit compatibility guardrails.
- Tests run:
  - none (docs/analysis-only chunk; no runtime behavior changes).
- Commit/push:
  - `arkenrealms/node` `sable/maintenance-trpc-ws-cycle`: `9c9ad01` — Document web3 provider runtime assumptions and risks (pushed; updates https://github.com/arkenrealms/node/pull/15)
- Next chunk (rotation): move to `seer`.

### 2026-02-17 11:41–11:47 PST
- Rotation moved to `seer` chunk.
- Loaded required `.md` docs first in target folder:
  - `packages/seer/packages/protocol/src/{README.md,ANALYSIS.md}`
- Completed source pass for protocol root files:
  - `packages/seer/packages/protocol/src/index.ts`
  - `packages/seer/packages/protocol/src/router.ts`
  - `packages/seer/packages/protocol/src/types.ts`
- Normalized top path headers in touched source files to `arken/...` format.
- Tests run:
  - none (comment-only source normalization; no runtime logic changes).
- Commit/push:
  - `arkenrealms/seer-protocol` `sable/repo-analysis-notes-20260217`: `97df19c` — Normalize protocol src file path headers (pushed)
  - `arkenrealms/seer` `sable/repo-analysis-notes-20260217`: `024b655` — Roll seer-protocol src header normalization (pushed; updates https://github.com/arkenrealms/seer/pull/1)
- Next chunk (rotation): move to `forge`.

### 2026-02-17 11:47–11:56 PST
- Rotation moved to `forge` chunk.
- Loaded required `.md` docs first in active parent folders:
  - `packages/forge/packages/web/src/views/{README.md,ANALYSIS.md}`
  - `packages/forge/packages/web/src/{README.md,ANALYSIS.md}`
  - `packages/forge/packages/ANALYSIS.md`
  - `packages/forge/ANALYSIS.md`
- Completed deepest-first source read for:
  - `packages/forge/packages/web/src/views/royale/index.tsx`
- Normalized top path header in touched source file to `arken/...` format.
- Added concise leaf docs:
  - `packages/forge/packages/web/src/views/royale/{README.md,ANALYSIS.md}`
- Updated upward rollups:
  - `packages/forge/packages/web/src/views/{README.md,ANALYSIS.md}`
  - `packages/forge/packages/web/src/ANALYSIS.md`
  - `packages/forge/packages/ANALYSIS.md`
  - `packages/forge/ANALYSIS.md`
- Key findings:
  - `views/royale` is a thin route wrapper that gates on `active` and delegates runtime behavior to `~/components/Royale`.
  - Route-level ownership remains lightweight while transport/event logic stays in component/hook layers.
- Tests run:
  - none (docs/header-normalization chunk; no runtime behavior changes).
- Commit/push:
  - `arkenrealms/forge-web` `sable/repo-analysis-notes-20260217-2`: `7066f08` — Document royale route wrapper ownership and add leaf docs (pushed)
  - `arkenrealms/forge` `sable/repo-analysis-notes-20260217`: `bf63f19` — Roll royale view analysis and web submodule updates (pushed; updates https://github.com/arkenrealms/forge/pull/1)
- Next chunk (rotation): move to `evolution`; if blocked, record blocker and continue to `node`.

### 2026-02-17 11:24–11:25 PST
- Rotation moved to `evolution` chunk after prior `forge` pass.
- Loaded required `.md` docs first:
  - `packages/evolution/{README.md,ANALYSIS.md,NOTES.md}`
  - `packages/evolution/packages/{README.md,ANALYSIS.md}`
- Re-ran recursive submodule initialization check:
  - `git -C arken/packages/evolution submodule sync --recursive`
  - `git -C arken/packages/evolution submodule update --init --recursive`
- Blocker persists unchanged:
  - `fatal: No url found for submodule path 'packages/client' in .gitmodules`
- Per policy, advanced to `node`.
- Loaded target docs first in node scope:
  - `packages/node/scripts/ANALYSIS.md`
  - `packages/node/ANALYSIS.md`
- Completed source read for:
  - `packages/node/scripts/zk-regen-updateLeaf.ts`
- Added/updated concise docs:
  - `packages/node/scripts/README.md` (new)
  - `packages/node/scripts/ANALYSIS.md` (refreshed)
  - `packages/node/ANALYSIS.md` (parent rollup update)
- Key findings:
  - ZK regeneration script depends on host-global CLIs (`circom`, `snarkjs`, `wget`) and shell execution.
  - Regeneration outputs in `data/zk/build/*` can drift without explicit deterministic/versioning checks.
- Tests run:
  - none (docs/analysis-only chunk; no runtime behavior changes).
- Commit/push:
  - `arkenrealms/node` `sable/maintenance-trpc-ws-cycle`: `a800227` — Add scripts folder orientation and ZK regen risk analysis (pushed; updates PR https://github.com/arkenrealms/node/pull/15)
- Next chunk (rotation): move to `seer`.

### 2026-02-17 11:56–12:02 PST
- Rotation moved to `seer` chunk (continuing cadence after `node`).
- Loaded required `.md` docs first in target scope:
  - `packages/seer/packages/node/src/{README.md,ANALYSIS.md}`
  - `packages/seer/packages/node/ANALYSIS.md`
- Completed source pass for `packages/seer/packages/node/src` files:
  - `web3.ts`
  - `tests.ts`
- Normalized top path headers in touched source files to `arken/...` format.
- Updated concise docs/analysis in touched folders:
  - `packages/seer/packages/node/src/{README.md,ANALYSIS.md}`
  - `packages/seer/packages/node/ANALYSIS.md`
- Tests run:
  - none (comment/docs normalization chunk; no runtime behavior changes).
- Commit/push:
  - `arkenrealms/seer-node` `sable/repo-analysis-notes-20260217-node-src`: `bb32a9f` — Normalize seer-node src headers and refresh docs (pushed)
  - `arkenrealms/seer` `sable/repo-analysis-notes-20260217`: `3a86192` — Roll seer-node src header normalization updates (pushed; updates https://github.com/arkenrealms/seer/pull/1)
- Next chunk (rotation): move to `forge`.

### 2026-02-17 12:02–12:16 PST
- Rotation moved to `forge` chunk.
- Loaded required parent `.md` docs first:
  - `packages/forge/packages/web/src/components/{README.md,ANALYSIS.md}`
  - `packages/forge/packages/web/src/ANALYSIS.md`
  - `packages/forge/packages/ANALYSIS.md`
  - `packages/forge/ANALYSIS.md`
- Completed deepest-first source read for `packages/forge/packages/web/src/components/Menu/icons/*` and `index.ts`.
- Added concise leaf docs:
  - `packages/forge/packages/web/src/components/Menu/icons/{README.md,ANALYSIS.md}`
- Updated upward rollups:
  - `packages/forge/packages/web/src/components/ANALYSIS.md`
  - `packages/forge/packages/web/src/ANALYSIS.md`
  - `packages/forge/packages/ANALYSIS.md`
  - `packages/forge/ANALYSIS.md`
- Key findings:
  - Menu icons are mostly static SVG wrappers with low protocol risk.
  - `Logo.tsx` is the runtime outlier (browser load listener, styling/timing behavior, broad `any` props) and is the main testability/typing drift surface in this leaf.
- Tests run:
  - none (docs/analysis-only chunk; no runtime behavior changes).
- Commit/push:
  - `arkenrealms/forge-web` `sable/repo-analysis-notes-20260217-2`: `626435e` — Add Menu/icons leaf docs and logo-outlier analysis (pushed)
  - `arkenrealms/forge` `sable/repo-analysis-notes-20260217`: `eda42ec` — Document Menu/icons ownership and roll forge-web pointer (pushed; updates https://github.com/arkenrealms/forge/pull/1)
- Rotation moved to `evolution` chunk.
- Loaded required `.md` docs first and re-ran recursive submodule initialization:
  - `git -C arken/packages/evolution submodule sync --recursive`
  - `git -C arken/packages/evolution submodule update --init --recursive`
- Blocker persists unchanged:
  - `fatal: No url found for submodule path 'packages/client' in .gitmodules`
- Per policy, advanced to `node`.
- Loaded required `.md` docs first in target scope:
  - `packages/node/types/ANALYSIS.md`
  - `packages/node/ANALYSIS.md`
- Completed source pass for:
  - `packages/node/types/mongo.d.ts`
- Added/updated concise docs:
  - `packages/node/types/README.md` (new)
  - `packages/node/types/ANALYSIS.md` (refreshed)
  - `packages/node/ANALYSIS.md` (parent rollup update)
- Key findings:
  - `types/mongo.d.ts` augments mongoose Query surfaces with `asJSON(): Promise<any>` for compatibility.
  - This is declaration-only but has type-drift risk across mongoose generic signature changes.
- Tests run:
  - none (docs/analysis-only chunk; no runtime behavior changes).
- Commit/push:
  - `arkenrealms/node` `sable/maintenance-trpc-ws-cycle`: `383a5f9` — Add types folder docs and mongoose augmentation risk notes (pushed; updates https://github.com/arkenrealms/node/pull/15)
- Next chunk (rotation): move to `seer`.

### 2026-02-17 11:39–11:40 PST
- Rotation moved to `seer` chunk (continuing cadence after latest `node` pass).
- Loaded required `.md` docs first in target scope:
  - `packages/seer/packages/node/src/{README.md,ANALYSIS.md}`
  - `packages/seer/packages/node/ANALYSIS.md`
- Completed source pass for:
  - `packages/seer/packages/node/src/index.ts`
- Normalized top path header in touched source file to `arken/...` format.
- Updated concise touched-folder analysis doc:
  - `packages/seer/packages/node/src/ANALYSIS.md`
- Tests run:
  - none (comment/docs normalization chunk; no runtime behavior changes).
- Commit/push:
  - `arkenrealms/seer-node` `sable/repo-analysis-notes-20260217-node-src`: `32e7f0c` — Normalize seer-node runtime entry header policy (pushed)
  - `arkenrealms/seer` `sable/repo-analysis-notes-20260217`: `5b08dc0` — Roll seer-node header-normalization update (pushed; updates https://github.com/arkenrealms/seer/pull/1)
- Next chunk (rotation): move to `forge`.

### 2026-02-17 12:16–12:27 PST
- Rotation moved to `forge` chunk.
- Loaded required parent `.md` docs first in active folders:
  - `packages/forge/packages/web/src/components/{README.md,ANALYSIS.md}`
  - `packages/forge/packages/web/src/ANALYSIS.md`
  - `packages/forge/ANALYSIS.md`
- Completed deepest-first source read for `packages/forge/packages/web/src/components/Menu/components/*.tsx`.
- Added concise leaf docs:
  - `packages/forge/packages/web/src/components/Menu/components/{README.md,ANALYSIS.md}`
- Updated upward rollups:
  - `packages/forge/packages/web/src/components/{README.md,ANALYSIS.md}`
  - `packages/forge/packages/web/src/ANALYSIS.md`
  - `packages/forge/ANALYSIS.md`
- Key findings:
  - Menu runtime composition is concentrated in `PanelBody`/`PanelFooter`/`UserBlock` with wallet and profile state bridging in render components.
  - `MenuLink` and `Logo` retain loose `any` typings; `SocialLinks` mixes declarative links with imperative redirects.
- Tests run:
  - none (docs/analysis-only chunk; no runtime behavior changes).
- Commit/push:
  - `arkenrealms/forge-web` `sable/repo-analysis-notes-20260217-2`: `290a9da` — Add Menu/components runtime ownership analysis docs (pushed)
  - `arkenrealms/forge` `sable/repo-analysis-notes-20260217`: `0b99bc9` — Roll Menu/components analysis and web submodule pointer (pushed; updates https://github.com/arkenrealms/forge/pull/1)
- Rotation moved to `evolution` chunk.
- Loaded required local `.md` docs first:
  - `packages/evolution/{README.md,ANALYSIS.md,NOTES.md}`
  - `packages/evolution/packages/{README.md,ANALYSIS.md}`
- Re-ran recursive submodule initialization checks:
  - `git -C packages/evolution submodule sync --recursive`
  - `git -C packages/evolution submodule update --init --recursive`
- Blocker persists unchanged:
  - `fatal: No url found for submodule path 'packages/client' in .gitmodules`
- Per policy, advanced to `node`.
- Loaded required `.md` docs first in target scope:
  - `packages/node/time/ANALYSIS.md`
  - `packages/node/ANALYSIS.md`
- Completed source pass for:
  - `packages/node/time/{index.ts,now.ts,date.ts,fancyTimeFormat.ts}`
- Added/updated concise docs:
  - `packages/node/time/README.md` (new)
  - `packages/node/time/ANALYSIS.md` (refreshed implementation notes)
- Key findings:
  - utility layer mixes UTC and local-time helpers in one surface,
  - queue helper defaults to delayed serial execution with console-only error reporting,
  - several helper APIs remain loosely typed.
- Tests run:
  - none (docs/analysis-only chunk; no runtime behavior changes).
- Commit/push:
  - `arkenrealms/node` `sable/maintenance-trpc-ws-cycle`: `b24229b` — Add time folder README and utility implementation notes (pushed; updates https://github.com/arkenrealms/node/pull/15)
- Next chunk (rotation): move to `seer` for next deepest-first pass.

### 2026-02-17 11:49–11:57 PST
- Rotation moved to `seer` chunk (next repo after latest `node` pass).
- Loaded all `.md` files first in target leaf folder:
  - `packages/seer/packages/protocol/src/modules/oasis/{README.md,ANALYSIS.md}`
- Completed full source pass in Oasis module leaf files:
  - `index.ts`
  - `oasis.models.ts`
  - `oasis.schema.ts`
  - `oasis.types.ts`
  - `oasis.service.ts`
  - `oasis.router.ts`
- Normalized top path headers to `arken/...` in touched source files:
  - `oasis.models.ts`
  - `oasis.schema.ts`
  - `oasis.types.ts`
  - `oasis.service.ts`
  - `oasis.router.ts`
- Updated concise leaf analysis doc:
  - `packages/seer/packages/protocol/src/modules/oasis/ANALYSIS.md`
- Tests run:
  - none (comment/docs normalization chunk; no runtime behavior changes).
- Commit/push:
  - `arkenrealms/seer-protocol` `sable/repo-analysis-notes-20260217`: `7c4443d` — Normalize Oasis module path headers and refresh analysis (pushed)
  - `arkenrealms/seer` `sable/repo-analysis-notes-20260217`: `2cbc9be` — Roll Oasis header-normalization updates from seer-protocol (pushed; updates https://github.com/arkenrealms/seer/pull/1)
- Next chunk (rotation): move to `forge`.

### 2026-02-17 11:54–12:03 PST
- Rotation moved to `forge` chunk.
- Loaded required parent `.md` docs first:
  - `packages/forge/packages/web/src/components/{README.md,ANALYSIS.md}`
  - `packages/forge/packages/web/src/ANALYSIS.md`
  - `packages/forge/packages/ANALYSIS.md`
  - `packages/forge/ANALYSIS.md`
- Completed deepest-first source read for:
  - `packages/forge/packages/web/src/components/Logo/index.tsx`
- Normalized top path header in touched source file to `arken/...` format.
- Added concise leaf docs:
  - `packages/forge/packages/web/src/components/Logo/{README.md,ANALYSIS.md}`
- Updated upward rollups:
  - `packages/forge/packages/web/src/components/{README.md,ANALYSIS.md}`
  - `packages/forge/packages/web/src/ANALYSIS.md`
  - `packages/forge/packages/ANALYSIS.md`
  - `packages/forge/ANALYSIS.md`
- Key findings:
  - `Logo/index.tsx` uses module-scoped `BAD_SRCS` to suppress failing image URLs across component instances.
  - Terminal fallback currently renders empty output, reducing diagnosability when all sources fail.
  - `LogoProps.style` remains loosely typed (`any`).
- Tests run:
  - none (docs/header-normalization chunk; no runtime behavior changes).
- Commit/push:
  - `arkenrealms/forge-web` `sable/repo-analysis-notes-20260217-2`: `e634dc1` — Document Logo fallback component behavior and risks (pushed)
  - `arkenrealms/forge` `sable/repo-analysis-notes-20260217`: `c3a2711` — Roll Logo component analysis into forge summaries (pushed; updates https://github.com/arkenrealms/forge/pull/1)
- Next chunk (rotation): move to `evolution`; if blocked, record blocker and continue to `node`.

### 2026-02-17 12:27–12:36 PST
- Rotation moved to `evolution` chunk (continuing cadence after `forge`).
- Loaded required `.md` docs first:
  - `packages/evolution/{README.md,ANALYSIS.md,NOTES.md}`
  - `packages/evolution/packages/{README.md,ANALYSIS.md}`
- Re-ran recursive submodule initialization check:
  - `git -C arken/packages/evolution submodule sync --recursive`
  - `git -C arken/packages/evolution submodule update --init --recursive`
- Blocker persists unchanged:
  - `fatal: No url found for submodule path 'packages/client' in .gitmodules`
- Per policy, advanced to `node`.
- Loaded all target folder `.md` docs first in node scope:
  - `packages/node/legacy/ANALYSIS.md`
  - `packages/node/legacy/data/ANALYSIS.md`
  - `packages/node/legacy/data/generated/ANALYSIS.md`
- Completed source read in `packages/node/legacy/data` for representative active files:
  - `index.ts`
  - `achievements.ts`
  - `items.type.ts`
  - `restrictList.ts`
  - `probabilityCache.ts`
- Added concise missing README coverage for touched folders:
  - `packages/node/legacy/README.md`
  - `packages/node/legacy/data/README.md`
  - `packages/node/legacy/data/generated/README.md`
- Tests run:
  - none (docs/orientation-only chunk; no runtime behavior changes).
- Commit/push/PR status:
  - pending commit/push in `arkenrealms/node` (`sable/maintenance-trpc-ws-cycle`) and parent `arken` rollup update.
- Next chunk (rotation): move to `seer` after node + parent rollup commit/push.

### 2026-02-17 12:36–12:43 PST
- Rotation moved to `seer` chunk (continuing cadence after latest `node` pass).
- Loaded all `.md` docs first in target leaf folder:
  - `packages/seer/packages/protocol/src/modules/isles/{README.md,ANALYSIS.md}`
- Completed source pass for Isles module files:
  - `index.ts`
  - `isles.models.ts`
  - `isles.schema.ts`
  - `isles.types.ts`
  - `isles.service.ts`
  - `isles.router.ts`
- Normalized top path headers to `arken/...` in touched source files:
  - `isles.models.ts`
  - `isles.schema.ts`
  - `isles.types.ts`
  - `isles.service.ts`
  - `isles.router.ts`
- Tests run:
  - none (comment-only source normalization; no runtime logic changes).
- Commit/push:
  - `arkenrealms/seer-protocol` `sable/repo-analysis-notes-20260217`: `fe8cb90` — Normalize Isles module path headers
  - `arkenrealms/seer` `sable/repo-analysis-notes-20260217`: `397cd0a` — Roll Isles header normalization from seer-protocol (updates https://github.com/arkenrealms/seer/pull/1)
- Next chunk (rotation): move to `forge`.

### 2026-02-17 12:26–12:34 PST
- Rotation moved to `seer` chunk (continuing cadence after latest `node` pass).
- Loaded target folder docs first:
  - `packages/seer/packages/protocol/src/modules/infinite/{README.md,ANALYSIS.md}`
- Completed source pass for Infinite module files:
  - `infinite.models.ts`
  - `infinite.router.ts`
  - `infinite.schema.ts`
  - `infinite.service.ts`
  - `infinite.types.ts`
- Normalized top path headers to `arken/...` format in all touched Infinite source files.
- Updated concise leaf analysis:
  - `packages/seer/packages/protocol/src/modules/infinite/ANALYSIS.md`
- Tests run:
  - none (header/docs normalization chunk; no behavior changes).
- Commit/push/PR status:
  - `arkenrealms/seer-protocol` `sable/repo-analysis-notes-20260217`: `ff66d08` — Normalize Infinite module path headers (pushed)
  - `arkenrealms/seer` `sable/repo-analysis-notes-20260217`: `c0d6129` — Roll seer-protocol Infinite header normalization (pushed; updates https://github.com/arkenrealms/seer/pull/1)
- Next chunk (rotation): move to `forge` for next deepest-first pass in checked-out scope.

### 2026-02-17 12:43–12:50 PST
- Rotation moved to `forge` chunk.
- Loaded all target-folder `.md` docs first in active scope:
  - `packages/forge/packages/web/src/components/Menu/components/{README.md,ANALYSIS.md}`
  - `packages/forge/packages/web/src/components/Menu/ANALYSIS.md`
  - `packages/forge/packages/web/src/components/ANALYSIS.md`
  - `packages/forge/packages/web/src/ANALYSIS.md`
  - `packages/forge/packages/ANALYSIS.md`
  - `packages/forge/ANALYSIS.md`
- Completed source read for hook-layer files in `packages/forge/packages/web/src/hooks`:
  - `index.ts`
  - `useWindows.tsx`
  - `useAuth.tsx`
  - `useWeb3.ts`
  - `useNotice.tsx`
  - `useLive.tsx`
- Added concise leaf docs:
  - `packages/forge/packages/web/src/hooks/{README.md,ANALYSIS.md}`
- Updated upward rollups:
  - `packages/forge/packages/web/src/ANALYSIS.md`
  - `packages/forge/packages/ANALYSIS.md`
  - `packages/forge/ANALYSIS.md`
- Key findings:
  - `useWindows.tsx` is a monolithic route/window registry with high change blast-radius.
  - `useAuth.tsx` mixes active auth provider flow with retained legacy connector path (`useAuthOld`).
  - Hook layer contains broad `any` typing and browser-global assumptions, reducing contract/test strictness.
- Tests run:
  - none (docs/analysis-only chunk; no behavior changes).
- Commit/push/PR status:
  - pending local commit/push in `forge-web` + `forge` and parent `arken` rollup update.
- Next chunk (rotation): move to `evolution`; if blocker persists, record and continue to `node`.

### 2026-02-17 12:50–12:58 PST
- Completed pending forge commit/push cycle for prior hooks chunk.
- Commit/push status:
  - `arkenrealms/forge-web` `sable/repo-analysis-notes-20260217-2`: `f3d4846` — Add hooks layer analysis docs and runtime risk notes (pushed)
  - `arkenrealms/forge` `sable/repo-analysis-notes-20260217`: `de77ab6` — Document forge hooks-layer architecture chunk (pushed; updates https://github.com/arkenrealms/forge/pull/1)
  - `arkenrealms/arken` `sable/arken-maintenance-trpc-ws-cycle`: `6453691` — Log forge hooks analysis chunk and roll submodule pointers (pushed)
- Rotation moved to `evolution` chunk.
- Loaded required `.md` docs first:
  - `packages/evolution/{README.md,ANALYSIS.md,NOTES.md}`
  - `packages/evolution/packages/{README.md,ANALYSIS.md}`
- Re-ran recursive submodule initialization checks:
  - `git -C arken/packages/evolution submodule sync --recursive`
  - `git -C arken/packages/evolution submodule update --init --recursive`
- Blocker persists unchanged:
  - `fatal: No url found for submodule path 'packages/client' in .gitmodules`
- Per policy, advanced to `node`.
- Loaded target `.md` docs first in node scope:
  - `packages/node/{README.md,ANALYSIS.md}`
- Completed source pass for:
  - `packages/node/websocket.ts`
- Updated parent analysis rollup:
  - `packages/node/ANALYSIS.md`
- Key findings:
  - websocket utility helper remains lightweight but untyped at emit boundaries and lacks reconnect/backoff policy surfaces.
- Tests run:
  - none (docs/analysis-only chunk; no runtime behavior changes).
- Commit/push:
  - `arkenrealms/node` `sable/maintenance-trpc-ws-cycle`: `9ba66e9` — Document websocket utility boundary risks (pushed; updates PR https://github.com/arkenrealms/node/pull/15)
- Next chunk (rotation): move to `seer` for next deepest-first pass.

### 2026-02-17 12:58–1:06 PM PST
- Rotation moved to `seer` chunk (continuing cadence after latest `node` pass).
- Loaded all target-folder `.md` docs first in active leaf:
  - `packages/seer/packages/protocol/src/modules/evolution/{README.md,ANALYSIS.md}`
- Completed source pass for Evolution module files:
  - `evolution.models.ts`
  - `evolution.schema.ts`
  - `evolution.types.ts`
  - `evolution.service.ts`
  - `evolution.router.ts`
  - `index.ts`
- Normalized top path headers to `arken/...` in touched source files:
  - `evolution.models.ts`
  - `evolution.schema.ts`
  - `evolution.types.ts`
  - `evolution.service.ts`
  - `evolution.router.ts`
- Updated concise leaf analysis:
  - `packages/seer/packages/protocol/src/modules/evolution/ANALYSIS.md`
- Tests run:
  - none (header/docs normalization chunk; no runtime behavior changes).
- Commit/push:
  - `arkenrealms/seer-protocol` `sable/repo-analysis-notes-20260217`: `f88aa75` — Normalize Evolution module path headers
  - `arkenrealms/seer` `sable/repo-analysis-notes-20260217`: `f6fce49` — Roll Evolution header normalization from seer-protocol (updates https://github.com/arkenrealms/seer/pull/1)
- Next chunk (rotation): move to `forge`.

### 2026-02-17 12:29–12:58 PST
- Rotation moved to `forge` chunk.
- Loaded required `.md` docs first in active parent folders:
  - `packages/forge/packages/web/src/{README.md,ANALYSIS.md}`
  - `packages/forge/packages/web/src/contexts/{README.md,ANALYSIS.md}` (created in this chunk)
  - `packages/forge/packages/ANALYSIS.md`
  - `packages/forge/ANALYSIS.md`
- Completed deepest-first source read for `packages/forge/packages/web/src/contexts/Localisation`:
  - `languageContext.tsx`
  - `translationsContext.ts`
- Normalized top path headers to `arken/...` in touched source files:
  - `contexts/Localisation/languageContext.tsx`
  - `contexts/Localisation/translationsContext.ts`
- Added concise docs/analysis in touched Forge folders:
  - `packages/forge/packages/web/src/contexts/{README.md,ANALYSIS.md}`
  - `packages/forge/packages/web/src/contexts/Localisation/{README.md,ANALYSIS.md}`
  - refreshed `packages/forge/packages/web/src/{README.md,ANALYSIS.md}`
  - refreshed `packages/forge/packages/ANALYSIS.md`
  - refreshed `packages/forge/ANALYSIS.md`
- Tests run:
  - none (docs/header normalization chunk; no runtime behavior changes).
- Commit/push:
  - `arkenrealms/forge-web` `sable/repo-analysis-notes-20260217-2`: `d2fca52` — Document localisation contexts and normalize source headers (pushed)
  - `arkenrealms/forge` `sable/repo-analysis-notes-20260217`: `fe5a57a` — Roll localisation context analysis from forge-web (pushed; updates https://github.com/arkenrealms/forge/pull/1)
- Rotation moved to `evolution` chunk.
- Loaded required `.md` docs first:
  - `packages/evolution/{README.md,ANALYSIS.md,NOTES.md}`
  - `packages/evolution/packages/{README.md,ANALYSIS.md}`
- Re-ran recursive submodule initialization checks:
  - `git -C arken/packages/evolution submodule sync --recursive`
  - `git -C arken/packages/evolution submodule update --init --recursive`
- Blocker persists unchanged:
  - `fatal: No url found for submodule path 'packages/client' in .gitmodules`
- Per policy, advanced to `node`.
- Loaded target `.md` docs first in node scope:
  - `packages/node/README.md`
  - `packages/node/ANALYSIS.md`
  - `packages/node/.erb/ANALYSIS.md`
- Completed source/asset pass for `.erb` leaf:
  - `packages/node/.erb/img/logo.png` (1830x734 metadata check)
- Added concise docs:
  - `packages/node/.erb/README.md`
  - `packages/node/.erb/img/{README.md,ANALYSIS.md}`
  - refreshed `packages/node/.erb/ANALYSIS.md`
  - refreshed `packages/node/ANALYSIS.md`
- Tests run:
  - none (docs/analysis-only chunk; no runtime behavior changes).
- Commit/push:
  - `arkenrealms/node` `sable/maintenance-trpc-ws-cycle`: `8e26155` — Add .erb asset-folder docs and rollup notes (pushed; updates PR https://github.com/arkenrealms/node/pull/15)
- Next chunk (rotation): move to `seer`.

### 2026-02-17 12:34–1:18 PM PST
- Rotation moved to `forge` chunk.
- Loaded required `.md` docs first in active folders:
  - `packages/forge/packages/web/src/components/{README.md,ANALYSIS.md}`
  - `packages/forge/packages/web/src/ANALYSIS.md`
  - `packages/forge/packages/ANALYSIS.md`
  - `packages/forge/ANALYSIS.md`
- Completed deepest-first source read for account achievements leaf:
  - `packages/forge/packages/web/src/components/account/AchievementRow/index.tsx`
  - `packages/forge/packages/web/src/components/account/AchievementRow/PointsLabel.tsx`
- Added concise docs/analysis in touched Forge folders:
  - `packages/forge/packages/web/src/components/account/{README.md,ANALYSIS.md}`
  - `packages/forge/packages/web/src/components/account/AchievementRow/{README.md,ANALYSIS.md}`
  - refreshed `packages/forge/packages/web/src/components/{README.md,ANALYSIS.md}`
  - refreshed `packages/forge/packages/web/src/ANALYSIS.md`
  - refreshed `packages/forge/packages/ANALYSIS.md`
  - refreshed `packages/forge/ANALYSIS.md`
- Tests run:
  - none (docs/analysis-only chunk; no runtime behavior changes).
- Commit/push:
  - `arkenrealms/forge-web` `sable/repo-analysis-notes-20260217-2`: `57fc060` — Add account achievement-row analysis docs and rollups (pushed)
  - `arkenrealms/forge` `sable/repo-analysis-notes-20260217`: `15b0755` — Roll account achievement-row analysis into forge summaries (pushed; updates https://github.com/arkenrealms/forge/pull/1)
- Rotation moved to `evolution` chunk.
- Loaded required `.md` docs first:
  - `packages/evolution/{README.md,ANALYSIS.md,NOTES.md}`
  - `packages/evolution/packages/{README.md,ANALYSIS.md}`
- Re-ran recursive submodule initialization checks:
  - `git -C arken/packages/evolution submodule sync --recursive`
  - `git -C arken/packages/evolution submodule update --init --recursive`
- Blocker persists unchanged:
  - `fatal: No url found for submodule path 'packages/client' in .gitmodules`
- Per policy, advanced to `node`.
- Loaded target `.md` docs first in node scope:
  - `packages/node/{README.md,ANALYSIS.md}`
- Completed source pass for:
  - `packages/node/api.ts`
- Updated rollup analysis:
  - `packages/node/ANALYSIS.md`
- Key findings:
  - `getFilter` performs dynamic query-shape translation with broad `any` surfaces,
  - nested AND/OR mapping and regex path need focused tests to preserve behavior/invariants.
- Tests run:
  - none (docs/analysis-only chunk; no runtime behavior changes).
- Commit/push:
  - `arkenrealms/node` `sable/maintenance-trpc-ws-cycle`: `05997b2` — Document api filter-adapter contract and test risks (pushed; updates PR https://github.com/arkenrealms/node/pull/15)
- Next chunk (rotation): move to `seer`.

### 2026-02-17 1:06–1:27 PM PST
- Rotation moved to `seer` chunk.
- Loaded all `.md` docs first in target folder:
  - `packages/seer/packages/protocol/.rush/temp` (none present before this chunk).
- Read source metadata file:
  - `packages/seer/packages/protocol/.rush/temp/shrinkwrap-deps.json`
- Added concise leaf docs:
  - `packages/seer/packages/protocol/.rush/temp/{README.md,ANALYSIS.md}`
- Updated upward rollup:
  - `packages/seer/packages/protocol/ANALYSIS.md`
- Commit/push:
  - `arkenrealms/seer-protocol` `sable/repo-analysis-notes-20260217`: `b4af5df` — Add .rush/temp docs for protocol lock metadata
  - `arkenrealms/seer` `sable/repo-analysis-notes-20260217`: `9c60556` — Roll protocol .rush temp metadata docs (updates https://github.com/arkenrealms/seer/pull/1)
- Rotation moved to `forge` chunk.
- Loaded all `.md` docs first in target folder:
  - `packages/forge/packages/web/src/config/localisation` (none present before this chunk).
- Read source file:
  - `packages/forge/packages/web/src/config/localisation/languageCodes.ts`
- Normalized top path header to `arken/...` in touched source file.
- Added concise docs/analysis:
  - `packages/forge/packages/web/src/config/{README.md,ANALYSIS.md}`
  - `packages/forge/packages/web/src/config/localisation/{README.md,ANALYSIS.md}`
- Updated upward rollups:
  - `packages/forge/packages/web/src/ANALYSIS.md`
  - `packages/forge/packages/ANALYSIS.md`
  - `packages/forge/ANALYSIS.md`
- Commit/push:
  - `arkenrealms/forge-web` `sable/repo-analysis-notes-20260217-2`: `5619d66` — Document localisation config leaf and normalize header
  - `arkenrealms/forge` `sable/repo-analysis-notes-20260217`: `9fb7455` — Roll localisation config analysis updates (updates https://github.com/arkenrealms/forge/pull/1)
- Rotation moved to `evolution` chunk.
- Loaded required `.md` docs first:
  - `packages/evolution/{README.md,ANALYSIS.md,NOTES.md}`
  - `packages/evolution/packages/{README.md,ANALYSIS.md}`
- Re-ran recursive submodule initialization checks and blocker remains unchanged:
  - `fatal: No url found for submodule path 'packages/client' in .gitmodules`
- Per policy, advanced to `node`.
- Loaded all `.md` docs first in target folder:
  - `packages/node/.rush/temp` (none present before this chunk).
- Read source metadata file:
  - `packages/node/.rush/temp/shrinkwrap-deps.json`
- Added concise leaf docs:
  - `packages/node/.rush/temp/{README.md,ANALYSIS.md}`
- Updated rollups:
  - `packages/node/.rush/ANALYSIS.md`
  - `packages/node/ANALYSIS.md`
- Tests run:
  - none (docs/analysis-only chunk; no runtime behavior changes).
- Commit/push:
  - `arkenrealms/node` `sable/maintenance-trpc-ws-cycle`: `eb4c57a` — Add .rush/temp lock-metadata docs (updates PR https://github.com/arkenrealms/node/pull/15)
- Next chunk (rotation): move to `seer`.

### 2026-02-17 1:27–1:44 PM PST
- Rotation moved to `seer` chunk.
- Loaded all `.md` docs first in target scope:
  - `packages/seer/packages/node/.rush/temp` (none existed before this chunk)
  - parent rollups: `packages/seer/packages/node/ANALYSIS.md`, `packages/seer/packages/ANALYSIS.md`, `packages/seer/ANALYSIS.md`
- Read source metadata file:
  - `packages/seer/packages/node/.rush/temp/shrinkwrap-deps.json`
- Added concise docs/analysis:
  - `packages/seer/packages/node/.rush/{README.md,ANALYSIS.md}`
  - `packages/seer/packages/node/.rush/temp/{README.md,ANALYSIS.md}`
- Updated upward rollups:
  - `packages/seer/packages/node/ANALYSIS.md`
  - `packages/seer/packages/ANALYSIS.md`
  - `packages/seer/ANALYSIS.md`
- Commit/push:
  - `arkenrealms/seer-node` `sable/repo-analysis-notes-20260217-node-src`: `4be3c45` — Add seer-node .rush metadata docs and rollup notes
  - `arkenrealms/seer` `sable/repo-analysis-notes-20260217`: `1ccf33b` — Roll seer-node .rush analysis updates (updates https://github.com/arkenrealms/seer/pull/1)
- Rotation moved to `forge` chunk.
- Loaded `.md` docs first in target scope:
  - parent docs: `packages/forge/packages/web/src/{README.md,ANALYSIS.md}`, `packages/forge/packages/ANALYSIS.md`, `packages/forge/ANALYSIS.md`
  - `packages/forge/packages/web/src/connectors` had no `.md` before this chunk.
- Read source files:
  - `packages/forge/packages/web/src/connectors/NetworkConnector.ts`
  - `packages/forge/packages/web/src/connectors/index.ts`
- Added concise leaf docs:
  - `packages/forge/packages/web/src/connectors/{README.md,ANALYSIS.md}`
- Updated upward rollups:
  - `packages/forge/packages/web/src/{README.md,ANALYSIS.md}`
  - `packages/forge/packages/ANALYSIS.md`
  - `packages/forge/ANALYSIS.md`
- Commit/push:
  - `arkenrealms/forge-web` `sable/repo-analysis-notes-20260217-2`: `d9e4ba4` — Document connector-layer RPC batching ownership
  - `arkenrealms/forge` `sable/repo-analysis-notes-20260217`: `b4d036b` — Roll connector analysis updates from forge-web (updates https://github.com/arkenrealms/forge/pull/1)
- Rotation moved to `evolution` chunk.
- Loaded required `.md` docs first:
  - `packages/evolution/{README.md,ANALYSIS.md,NOTES.md}`
  - `packages/evolution/packages/{README.md,ANALYSIS.md}`
- Re-ran recursive submodule initialization checks; blocker unchanged:
  - `fatal: No url found for submodule path 'packages/client' in .gitmodules`
- Per policy, advanced to `node`.
- Loaded `.md` docs first in target folder:
  - `packages/node/test/{README.md,ANALYSIS.md}`
  - parent `packages/node/ANALYSIS.md`
- Added websocket server-listener safety test:
  - `packages/node/test/socketServer.spec.ts`
  - new case validates `attachSocketTrpcListener` detach no-op when socket lacks `on`/`off` hooks.
- Updated concise docs:
  - `packages/node/test/{README.md,ANALYSIS.md}`
  - `packages/node/ANALYSIS.md`
- Tests run:
  - `npm test -- test/socketServer.spec.ts test/socketLink.spec.ts --runInBand` (pass: 39/39)
- Commit/push:
  - `arkenrealms/node` `sable/maintenance-trpc-ws-cycle`: `7b0ea2f` — Add socket listener-hook safety regression test (updates PR https://github.com/arkenrealms/node/pull/15)
- Next chunk (rotation): move to `seer`.

### 2026-02-17 1:44–2:03 PM PST
- Rotation moved to `seer` chunk.
- Loaded `.md` docs first in target scope:
  - `packages/seer/packages/node/{README.md,ANALYSIS.md}`
  - `packages/seer/packages/ANALYSIS.md`
  - `packages/seer/ANALYSIS.md`
- Completed non-`src` seer-node operational/config source pass:
  - `packages/seer/packages/node/Dockerfile`
  - `packages/seer/packages/node/forever-config.json`
  - `packages/seer/packages/node/package.json`
  - `packages/seer/packages/node/tsconfig.json`
  - `packages/seer/packages/node/genesis.json`
- Updated concise docs/analysis:
  - `packages/seer/packages/node/{README.md,ANALYSIS.md}`
  - `packages/seer/packages/ANALYSIS.md`
  - `packages/seer/ANALYSIS.md`
- Commit/push:
  - `arkenrealms/seer-node` `sable/repo-analysis-notes-20260217-node-src`: `6bd5266` — Document seer-node runtime config surfaces and deployment risks (pushed)
  - `arkenrealms/seer` `sable/repo-analysis-notes-20260217`: `6f60be1` — Roll seer-node ops-config analysis updates (pushed; updates https://github.com/arkenrealms/seer/pull/1)
- Rotation moved to `forge` chunk.
- Loaded `.md` docs first in target scope:
  - `packages/forge/packages/web/src/config/{README.md,ANALYSIS.md}`
  - `packages/forge/packages/web/src/{README.md,ANALYSIS.md}`
  - `packages/forge/packages/ANALYSIS.md`
  - `packages/forge/ANALYSIS.md`
- Completed deepest-first source pass for `packages/forge/packages/web/src/config/constants`:
  - `campaigns.ts`, `farms.ts`, `ifo.ts`, `index.ts`, `nfts.ts`, `pools.ts`, `runes.ts`, `teams.ts`, `types.ts`
- Added/updated concise docs:
  - `packages/forge/packages/web/src/config/constants/{README.md,ANALYSIS.md}`
  - `packages/forge/packages/web/src/config/{README.md,ANALYSIS.md}`
  - `packages/forge/packages/web/src/ANALYSIS.md`
  - `packages/forge/packages/ANALYSIS.md`
  - `packages/forge/ANALYSIS.md`
- Commit/push:
  - `arkenrealms/forge-web` `sable/repo-analysis-notes-20260217-2`: `5f7f96c` — Add config constants catalog analysis docs (pushed)
  - `arkenrealms/forge` `sable/repo-analysis-notes-20260217`: `f7cb55a` — Roll forge-web constants config analysis updates (pushed; updates https://github.com/arkenrealms/forge/pull/1)
- Rotation moved to `evolution` chunk.
- Loaded required `.md` docs first:
  - `packages/evolution/{README.md,ANALYSIS.md,NOTES.md}`
  - `packages/evolution/packages/{README.md,ANALYSIS.md}`
- Re-ran recursive submodule checks; blocker unchanged:
  - `fatal: No url found for submodule path 'packages/client' in .gitmodules`
- Per policy, advanced to `node`.
- Loaded `.md` docs first in target scope:
  - `packages/node/{README.md,ANALYSIS.md}`
- Completed root config source pass:
  - `packages/node/package.json`
  - `packages/node/tsconfig.json`
  - `packages/node/tsconfig.build.json`
  - `packages/node/jest.unit.config.js`
- Updated rollup analysis:
  - `packages/node/ANALYSIS.md`
- Tests run:
  - none (docs/analysis-only chunk; no runtime behavior changes).
- Commit/push:
  - `arkenrealms/node` `sable/maintenance-trpc-ws-cycle`: `c9b29ba` — Document node root build and test config risks (pushed; updates PR https://github.com/arkenrealms/node/pull/15)
- Next chunk (rotation): move to `seer`.

### 2026-02-17 1:03–1:07 PM PST
- Rotation moved to `seer` chunk.
- Loaded target `.md` docs first in `packages/seer/packages/protocol` context:
  - `packages/seer/packages/protocol/ANALYSIS.md`
  - `.rush/temp/{README.md,ANALYSIS.md}`
- Completed source/metadata pass for `packages/seer/packages/protocol/.rush` boundary and added missing parent docs:
  - `packages/seer/packages/protocol/.rush/{README.md,ANALYSIS.md}`
- Updated upward rollup:
  - `packages/seer/packages/protocol/ANALYSIS.md`
- Commit/push:
  - `arkenrealms/seer-protocol` `sable/repo-analysis-notes-20260217`: `4940bba` — Add protocol .rush ownership docs (pushed)
  - `arkenrealms/seer` `sable/repo-analysis-notes-20260217`: `b7f85a1` — Roll seer-protocol .rush docs update (pushed; updates https://github.com/arkenrealms/seer/pull/1)
- Rotation moved to `forge` chunk.
- Loaded `.md` docs first in target scope:
  - `packages/forge/packages/web/src/config/{README.md,ANALYSIS.md}`
  - `packages/forge/packages/web/src/ANALYSIS.md`
- Completed deepest-first source read in `packages/forge/packages/web/src/config/abi/*` and added concise docs:
  - `packages/forge/packages/web/src/config/abi/{README.md,ANALYSIS.md}`
- Updated upward rollups:
  - `packages/forge/packages/web/src/config/ANALYSIS.md`
  - `packages/forge/packages/web/src/ANALYSIS.md`
- Commit/push:
  - `arkenrealms/forge-web` `sable/repo-analysis-notes-20260217-2`: `e0a9f64` — Add config ABI catalog docs and risk notes (pushed)
  - `arkenrealms/forge` `sable/repo-analysis-notes-20260217`: `43d413a` — Roll forge-web ABI docs update (pushed; updates https://github.com/arkenrealms/forge/pull/1)
- Rotation moved to `evolution` chunk.
- Loaded required `.md` docs first:
  - `packages/evolution/{README.md,ANALYSIS.md,NOTES.md}`
  - `packages/evolution/packages/{README.md,ANALYSIS.md}`
- Re-ran recursive submodule initialization check; blocker unchanged:
  - `fatal: No url found for submodule path 'packages/client' in .gitmodules`
- Per policy, advanced to `node`.
- Loaded `.md` docs first in touched node folders:
  - `packages/node/trpc/{README.md,ANALYSIS.md}`
  - `packages/node/test/{README.md,ANALYSIS.md}`
- Added websocket server-handler regression in `packages/node/test/socketServer.spec.ts`:
  - invalid/undecodable `params` payload now explicitly asserts status-0 envelope behavior.
- Updated concise docs/analysis in touched folder:
  - `packages/node/test/{README.md,ANALYSIS.md}`
- Tests run:
  - `npm test -- test/socketServer.spec.ts test/socketLink.spec.ts --runInBand` (pass: 40/40)
- Commit/push:
  - `arkenrealms/node` `sable/maintenance-trpc-ws-cycle`: `c19ba85` — Add socketServer bad-params deserialization regression test (pushed; updates PR https://github.com/arkenrealms/node/pull/15)
- Next chunk (rotation): move to `seer`.

### 2026-02-17 1:09–1:16 PM PST
- Rotation moved to `seer` chunk (continuing cadence after latest `node` pass).
- Loaded required `.md` docs first:
  - `packages/seer/packages/protocol/{README.md,ANALYSIS.md}`
  - `packages/seer/packages/ANALYSIS.md`
  - `packages/seer/ANALYSIS.md`
- Completed package-root source/config pass for `packages/seer/packages/protocol`:
  - `package.json`
  - `tsconfig.json`
  - `.eslintrc`
  - `.prettierrc`
  - `.editorconfig`
- Updated concise analysis rollups:
  - `packages/seer/packages/protocol/ANALYSIS.md`
  - `packages/seer/packages/ANALYSIS.md`
  - `packages/seer/ANALYSIS.md`
- Key findings:
  - protocol package strictness remains intentionally relaxed (`noImplicitAny: false`, `strictNullChecks: false`) with broad eslint rule disablement,
  - package has no local `scripts` guard commands, increasing dependence on workspace-level orchestration.
- Tests run:
  - none (docs/analysis-only chunk; no runtime behavior changes).
- Commit/push:
  - `arkenrealms/seer-protocol` `sable/repo-analysis-notes-20260217`: `4cbf3e3` — Document seer-protocol package config strictness and guard gaps (pushed)
  - `arkenrealms/seer` `sable/repo-analysis-notes-20260217`: `de9a8b0` — Roll protocol package config-risk analysis updates (pushed; updates https://github.com/arkenrealms/seer/pull/1)
- Next chunk (rotation): move to `forge`.

### 2026-02-17 1:16–1:23 PM PST
- Rotation moved to `forge` chunk.
- Loaded required `.md` docs first in parent folders:
  - `packages/forge/packages/web/src/ANALYSIS.md`
  - `packages/forge/packages/ANALYSIS.md`
  - `packages/forge/ANALYSIS.md`
- Completed deepest-first source read for:
  - `packages/forge/packages/web/src/constants/localisation/languageCodes.ts`
- Normalized top path header in touched source file to `arken/...` format.
- Added concise docs:
  - `packages/forge/packages/web/src/constants/{README.md,ANALYSIS.md}`
  - `packages/forge/packages/web/src/constants/localisation/{README.md,ANALYSIS.md}`
- Updated upward rollups:
  - `packages/forge/packages/web/src/ANALYSIS.md`
  - `packages/forge/packages/ANALYSIS.md`
  - `packages/forge/ANALYSIS.md`
- Key findings:
  - many locale constants are defined but only `EN` is active in `allLanguages` via comment toggles,
  - no automated parity checks currently enforce consistency between active locales and translation bundles.
- Tests run:
  - none (docs/header normalization chunk; no runtime behavior changes).
- Commit/push:
  - `arkenrealms/forge-web` `sable/repo-analysis-notes-20260217-2`: `cbfa7a0` — Add constants/localisation docs and locale activation risk notes (pushed)
  - `arkenrealms/forge` `sable/repo-analysis-notes-20260217`: `8cb16d9` — Roll constants-localisation analysis updates (pushed; updates https://github.com/arkenrealms/forge/pull/1)
- Next chunk (rotation): move to `evolution`; if blocked, proceed to `node`.

### 2026-02-17 1:23–1:27 PM PST
- Rotation moved to `evolution` chunk.
- Loaded required `.md` docs first:
  - `packages/evolution/{README.md,ANALYSIS.md,NOTES.md}`
  - `packages/evolution/packages/ANALYSIS.md`
- Re-ran recursive submodule checks:
  - `git -C packages/evolution submodule sync --recursive`
  - `git -C packages/evolution submodule update --init --recursive`
- Blocker persists unchanged:
  - `fatal: No url found for submodule path 'packages/client' in .gitmodules`
- Per policy, advanced to `node`.

### 2026-02-17 1:27–1:31 PM PST
- Rotation moved to `node` chunk after evolution blocker.
- Loaded required `.md` docs first:
  - `packages/node/{README.md,ANALYSIS.md}`
- Completed artifact-boundary source pass for:
  - `packages/node/coverage/lcov.info`
- Updated parent analysis rollup:
  - `packages/node/ANALYSIS.md`
- Key findings:
  - coverage artifacts are generated diagnostic output and should remain generated-only to avoid manual drift/noisy diffs.
- Tests run:
  - none (docs/analysis-only chunk; no runtime behavior changes).
- Commit/push:
  - `arkenrealms/node` `sable/maintenance-trpc-ws-cycle`: `34936bd` — Document coverage artifact ownership boundary (pushed; updates PR https://github.com/arkenrealms/node/pull/15)
- Next chunk (rotation): move to `seer`.
