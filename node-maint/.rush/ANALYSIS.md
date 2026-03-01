# arken/packages/node/.rush/ANALYSIS.md

## Folder
`arken/packages/node/.rush`

## Purpose
- Rush temporary metadata/cache for dependency and lock coordination.

## Key files
- `temp/shrinkwrap-deps.json`
  - Large dependency integrity map spanning runtime, test, and toolchain packages.
- `temp/{README.md,ANALYSIS.md}`
  - Generated-artifact ownership notes and lock-integrity guardrails for maintainers.

## Risks
- Stale temp metadata can create nondeterministic local dependency state.
- Manual edits to `shrinkwrap-deps.json` can desynchronize lock reconciliation and mask supply-chain drift.

## Next test/protocol checks
- Reinstall/regenerate via Rush and verify lock consistency.
- Re-run protocol-critical tests after dependency graph changes.
