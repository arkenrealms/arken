# arken/ACTION_PLAN.md

## Objective
Ship reliable, test-backed improvements across direct Arken repos in small autonomous chunks, with clean docs and predictable logging.

## Authoritative guardrails (read in this order each run)
1. `/Users/web/.openclaw/workspace-nel/MEMORY.md`
2. Latest explicit user instruction
3. This `ACTION_PLAN.md`

If markdown notes/logs conflict with MEMORY or explicit user direction, MEMORY + user direction wins.

## Rotation order (direct repos only)
1. `arken/packages/node`
2. `arken/packages/seer/packages/node`
3. `arken/packages/seer/packages/protocol`
4. `arken/packages/sigil-protocol`
5. `arken/packages/forge/packages/web`
6. `arken/packages/forge/packages/protocol`
7. `arken/packages/evolution` (exclude `packages/client` + evolution-unity integration)
8. `arken/packages/evolution/packages/realm`
9. `arken/packages/evolution/packages/shard`
10. `arken/packages/evolution/packages/protocol`
11. `arken/packages/cerebro/packages/hub`
12. `arken/packages/cli`

Then repeat.

Parent repos (`arken/packages/seer`, `arken/packages/forge`, `arken`) are rollup/posterity only.

## Path verification rule
Before starting a slot, verify target path in current checkout (`find` + `.gitmodules` where relevant).
- If missing: mark **unavailable-in-checkout** and continue.
- If present but empty/uninitialized: record it and continue.

## Mandatory working method per slot
1. Preload all local `.md` files in the target folder before code edits.
2. Analyze deepest leaf first, then summarize upward.
3. Prefer substantive code improvement + tests (not docs-only unless blocked).
4. Keep touched folder docs concise and current:
   - `README.md`
   - `ANALYSIS.md`
5. Keep path headers `arken/...` in touched source files.

## Test policy (hard gate)
- No source edits without runnable tests in the same run.
- If tests are missing, add/repair minimal harness first.
- If tests can’t run, do docs/analysis-only.
- Report exact test command and result in run output.

### Standardization direction
- Prefer Jest as common test foundation where feasible.
- Prefer TypeScript tests (`.ts`).
- Avoid new `.cjs`/`.mjs` tests unless temporary compatibility is unavoidable.
- Playwright is allowed for browser/E2E paths.

## Explicit exclusions / hotspot control
- Do **not** routinely target or retest `packages/node/trpc/socketServer.ts`.
- Only touch that file when:
  - explicitly requested by user, or
  - a clearly novel bug class requires it.

## Evolution temporary skip rule
- Ignore `packages/evolution/packages/client`.
- Ignore evolution-unity integration work.
- Do **not** run `git submodule sync/update --recursive` in `packages/evolution` while skip is active.

## Logging + reporting format
- Every run output must begin with:
  - `Status: start=<ISO8601 local> end=<ISO8601 local> duration=<XmYs>`
- Append-only updates only for:
  - `arken/ACTION_PLAN.md`
  - `arken/DAILY_LOG.md`
- Never use ambiguous exact-text replacement for log sections.
- Each run block should include:
  - target attempted,
  - files changed,
  - test command + result,
  - commits + PR links,
  - blockers,
  - next rotation target.

## Current known checkout blockers
- Missing in this checkout:
  - `arken/packages/sigil-protocol`
  - `arken/packages/forge/packages/protocol`
  - `arken/packages/cerebro/packages/hub`
  - `arken/packages/cli`
- Present but empty/uninitialized (latest observed):
  - `arken/packages/evolution/packages/realm`
  - `arken/packages/evolution/packages/shard`
  - `arken/packages/evolution/packages/protocol`

## Active PR references (direct execution repos)
- Node: https://github.com/arkenrealms/node/pull/15
- Seer-node: https://github.com/arkenrealms/seer-node/pull/3
- Seer-protocol: https://github.com/arkenrealms/seer-protocol/pull/1
- Forge-web: https://github.com/arkenrealms/forge-web/pull/9
- Evolution: https://github.com/arkenrealms/evolution/pull/10

## Rollup/posterity PR references (not primary execution targets)
- Seer: https://github.com/arkenrealms/seer/pull/1
- Forge: https://github.com/arkenrealms/forge/pull/1
- Arken: https://github.com/arkenrealms/arken/pull/2

## Next actionable target
Continue strict rotation from the current pointer after latest completed slot.

## Run ledger append — 2026-02-17T22:08:27-08:00 — seer-protocol Isles resolver hardening
- Target attempted: `arken/packages/seer/packages/protocol`.
- Path verification: target exists in checkout (`find` + `packages/seer/.gitmodules`); continued strict direct-repo order.
- Files changed:
  - `packages/seer/packages/protocol/src/modules/isles/isles.router.ts`
  - `packages/seer/packages/protocol/src/modules/isles/isles.methodResolver.ts` (new)
  - `packages/seer/packages/protocol/src/modules/isles/{README.md,ANALYSIS.md}`
  - `packages/seer/packages/protocol/test/isles.router.test.ts` (new)
  - `packages/seer/packages/protocol/test/{README.md,ANALYSIS.md}`
- Test command + result:
  - `npm test` (in `packages/seer/packages/protocol`) ✅ pass (12/12)
- Commits + PR links:
  - `seer-protocol` `b7c2f9c` (pushed) — <https://github.com/arkenrealms/seer-protocol/pull/new/sable/repo-analysis-notes-20260217>
  - `seer` `f81340b` (pushed submodule pointer) — <https://github.com/arkenrealms/seer/pull/1>
- Blockers:
  - none in this slot.
- Next rotation target:
  - `sigil-protocol` (`arken/packages/sigil-protocol`) then continue strict direct-repo order.

## Run ledger append — 2026-02-17T22:14:05-0800 — sigil availability check + node method-path guard
- Target attempted:
  - `arken/packages/sigil-protocol` (rotation slot 4)
  - advanced through unavailable slots to next actionable direct repo with testable code changes: `arken/packages/node`.
- Path verification:
  - `packages/sigil-protocol` missing in checkout (`find` + top-level `.gitmodules` has no mapping) → marked unavailable-in-checkout.
  - `packages/forge/packages/protocol` missing in checkout (`packages/forge/.gitmodules` only maps `packages/web`) → unavailable-in-checkout.
  - `packages/evolution/packages/{realm,shard,protocol}` exist but are empty/uninitialized dirs → recorded and skipped.
  - `packages/cerebro/packages/hub` and `packages/cli` missing in checkout.
- Files changed:
  - `packages/node/trpc/socketLink.ts`
  - `packages/node/test/socketLink.spec.ts`
  - `packages/node/trpc/{README.md,ANALYSIS.md}`
  - `packages/node/test/{README.md,ANALYSIS.md}`
- Test command + result:
  - `npm test -- test/socketLink.spec.ts test/socketServer.spec.ts --runInBand` (in `packages/node`) ✅ pass (62/62)
- Commits + PR links:
  - `node` `af5630e` (pushed) — updates <https://github.com/arkenrealms/node/pull/15>
- Blockers:
  - Direct rotation repos unavailable-in-checkout: `sigil-protocol`, `forge-protocol`, `cerebro-hub`, `cli`.
  - Evolution nested repos present but uninitialized/empty in current checkout: `realm`, `shard`, `protocol`.
- Next rotation target:
  - `arken/packages/seer/packages/node` (slot 2 on next cycle restart), then continue strict direct-repo order.
