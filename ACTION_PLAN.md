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

## Working method (chunked)
1. Pick a small folder chunk.
2. Analyze protocol/test behavior + risks.
3. Write/update `ANALYSIS.md` in that folder.
4. Update `README.md` if missing/outdated.
5. Normalize top path headers in touched source files to `arken/...`.
6. Add/extend tests where applicable.
7. Commit + push.
8. Open/update PR (stack branches when needed).
9. Append progress log entry below.

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
1. `node`: deeper chunk in `legacy/data`, `time`, `web3`, then `data/zk` docs/tests.
2. `node`: add next protocol edge-case tests (id collisions, late responses, malformed payload permutations).
3. `seer` / `forge`: continue folder-by-folder analysis and README refresh in available checked-out scope.
4. `evolution`: continue local analysis/docs; push once permission is granted.

## Blockers
- `arkenrealms/evolution` push permission denied for current token.
