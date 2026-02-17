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

## Blockers
- `arkenrealms/evolution` push permission denied for current token.
