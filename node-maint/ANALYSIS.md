# arken/packages/node/ANALYSIS.md

## Folder purpose
Core Node SDK/runtime utility package for Arken protocol, data handling, and game-platform support services.

## Child context summary (current)
- `trpc/`: socket transport wrappers for tRPC request/response lifecycle (actively hardened).
- `test/`: protocol-focused tests for socket client/server wrappers (including listener-API safety checks for sockets missing `on`/`off`).
- `legacy/`: backward-compatibility layer for historical game/content/contract metadata.
- `time/`: shared scheduling/time utilities used across runtime paths.
- `data/`: bundled artifacts and ZK-related support assets.
- `web3/`: legacy JSON-RPC provider helper with browser-cache assumptions and hardcoded endpoint selection.
- `scripts/`: artifact-regeneration utilities (currently ZK `updateLeaf` Groth16 setup flow).
- `types/`: ambient declaration augmentations (`mongoose` query `asJSON`) with compile-time drift risk tied to upstream generic signatures.
- `.rush/`: Rush cache metadata (`temp/shrinkwrap-deps.json`) that affects dependency determinism and lock reconciliation; temp leaf now includes concise `README.md` + `ANALYSIS.md` guardrails.
- `.erb/`: documentation/scaffolding branding assets (currently `img/logo.png`) with low runtime risk but potential UX drift if assets are changed ad hoc.
- `coverage/`: generated LCOV/Clover/JSON coverage artifacts; useful diagnostics but should remain generated-only to avoid noisy/manual drift (now documented with local `coverage/{README.md,ANALYSIS.md}`).
- `websocket.ts`: lightweight socket helper exposing `emitAll`/`emitDirect` and `getClientSocket`; currently uses untyped emitter params and no explicit reconnect/backoff policy controls at this utility boundary.
- `api.ts`: query-to-Mongo filter adapter (`getFilter`) and HTTP POST helper (`fetch`) used for dynamic filtering and remote query dispatch; id-field normalization applies consistently across `equals`/`contains`/`in` operators, scalar shorthand field values map to equality filters (root + nested logical nodes), array shorthand values now map to `$in` filters, non-plain object values (e.g., `Date`, ObjectId-like values) are preserved as equality filters, plain-object values without operator keys are now preserved as direct equality filters (instead of being silently dropped), and logical nesting preserves child `OR` groups inside parent `AND` clauses.
- `util.ts`: currently re-exports from `'.'`, creating a circular/umbrella alias surface that can obscure intended subpath ownership.
- root build/test config (`package.json`, `tsconfig*.json`, `jest.unit.config.js`): defines compile/test pipeline, export surface, and strictness defaults for the whole package.

## Omniverse architecture perspective
This package is a foundational SDK layer for a Steam/Battle.net-like ecosystem (multi-game runtime + launcher/liveops integrations). Reliability priorities are:
1. Transport correctness and resiliency (timeouts, retries, error envelopes).
2. Deterministic content/economy data contracts.
3. Operational observability and typed boundaries across subsystems.

## Risks / gaps
- Mixed legacy and modern patterns (typed + untyped maps).
- Generated data and runtime assumptions need stronger schema/test guardrails.
- Utility modules (time/task queue) need production-grade control surfaces.
- `api.ts` filter translation relies on loose `any` query shapes and dynamic regex construction, creating contract-drift and query-performance risk without targeted tests.
- Root TS/Jest config remains intentionally permissive (`strict: false`, `noImplicitAny: false`, broad coverage collection), which can hide contract drift and inflate test-runtime cost.
- `util.ts` wildcard re-export from package root can blur module boundaries and increase accidental circular import/export behavior during build refactors.

## Follow-ups
- Continue bottom-up analysis for remaining leaf folders before refining parent summaries further.
- Add protocol edge-case tests (id collisions, late responses, malformed payload permutations).
- Expand folder README/ANALYSIS coverage with explicit cross-folder dependency notes.
- Add focused tests for `api.ts` `getFilter` semantics (`OR`/`AND` nesting, id/_id mapping, empty-contains no-op, and regex escaping).
- Add build/test config guard checks (export-map path validity and duplicate include-path cleanup) to reduce packaging drift.
- Clarify `util.ts` ownership intent (keep alias intentionally or replace with explicit utility exports) and add a smoke test for subpath import behavior.
