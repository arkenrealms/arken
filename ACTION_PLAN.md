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

## Blockers
- `arkenrealms/evolution` push permission denied for current token.
- `arken/packages/evolution`: submodule graph inconsistency (`packages/client` gitlink missing `.gitmodules` URL mapping) blocks `submodule update --init --recursive` and therefore deeper source-level evolution analysis.
