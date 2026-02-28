# Interop Gap Map (CLI ↔ cerebro-link ↔ cerebro-hub ↔ seer-node)

Date: 2026-02-21 (America/Los_Angeles)

## Baseline checks run

- `arken/cli`: `rushx test -- cerebro-readme.test.ts` ✅
  - Includes websocket tRPC bridge command path via `cerebro.info`.
- `arken/cerebro/link`: `rushx test -- cliInterop.test.ts` ✅
  - Includes CLI↔link websocket tRPC interop smoke test.
- `arken/cerebro/hub`: `rushx test -- src/agents/shogo/index.test.ts --runInBand` ✅
  - Includes seer-backed agent persistence/query behavior.
- `arken/seer/node`: `rushx test` ✅
  - Confirms seer-node package is runnable in this workspace (24 suites, 115 tests passing).

## Current integration state

### 1) CLI ↔ cerebro-link
- **Working baseline exists** over tRPC websocket.
- Evidence: `cli/test/cerebro-readme.test.ts`, `cerebro/link/test/cliInterop.test.ts`.

### 2) cerebro-hub ↔ seer-node/cerebro-link
- **Partial confidence only** from focused behavior tests (seer-backed get/create/fallback behavior).
- Missing explicit full cross-service end-to-end test proving hub calls over the exact websocket style used by CLI/link.

### 3) seer-node availability
- **No longer blocked on package presence** in this workspace snapshot.
- `arken/seer/node` is present and test-runnable.
- Remaining gap is integration proof across all services in one scenario, not package availability.

## CI/CD path drift audit (workflow-verified)
- Enumerated active workflow files in this snapshot: `cli/.github/workflows/ci.yml` only.
- Audited workflow content for stale wrapper-era deploy/build path assumptions (`/arken/packages/...`, `packages/cli` target drift): **no active workflow breakage found**.
- Current CI workflow syncs into `arken/cli/` and runs `rushx` commands from the correct directories.

## Priority gaps to close next
1. Add one **true E2E test**: CLI command → websocket transport → link/hub → seer-node procedure and response.
2. Add CI smoke coverage that executes the cross-service websocket scenario to prevent regressions.
3. Audit active GitHub Actions workflow files only (not archival docs) for stale wrapper-era path assumptions and patch as needed.

## 2026-02-22 validation slice

- Re-ran workflow-aligned interop baselines using `rushx test` (no `npm test`):
  - `cerebro/link`: `rushx test -- cliInterop.test.ts` ✅ (includes websocket tRPC bridge path)
  - `cerebro/hub`: `rushx test -- src/agents/shogo/index.test.ts --runInBand` ✅
  - `cli`: `rushx test -- cerebro-readme.test.ts` ✅ (`README cerebro.info` command path over websocket tRPC bridge)
- CI drift spot-check (active workflow file only):
  - `rg -n "arken/packages|/packages/cli|packages/cli" cli/.github/workflows/ci.yml` → **NO_MATCHES** (exit 1 treated as informational)
- Result: current package-level interop guardrails are still green; the highest-value remaining gap is still a full cross-service E2E test that proves CLI→link/hub→seer in one scenario.
