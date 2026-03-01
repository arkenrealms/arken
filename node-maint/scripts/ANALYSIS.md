# arken/packages/node/scripts/ANALYSIS.md

## Folder
`arken/packages/node/scripts`

## Purpose
- Houses local maintenance scripts that regenerate protocol-adjacent artifacts.
- Current scope is ZK artifact regeneration for the `updateLeaf` circuit flow.

## Notable files and responsibilities
- `zk-regen-updateLeaf.ts`
  - Verifies circuit source existence in `data/zk/circuits/updateLeaf.circom`.
  - Downloads PTAU if missing, runs contribution, compiles circom output, and emits Groth16 keys.
  - Writes build outputs to `data/zk/build/*` (`.r1cs`, `.zkey`, `verification_key.json`, wasm bundle).

## Protocol/test relevance
- Regenerated proving/verifying keys directly influence cross-runtime proof compatibility.
- No dedicated test harness currently verifies script determinism or validates artifact-shape invariants after regeneration.

## Risks/gaps
- Uses `wget` and globally-installed CLIs, so portability depends on host tooling availability.
- Randomness contribution step means output drift can occur without explicit versioning policy.
- Full `execSync` shell invocation has low guardrails (no dry-run/target path override).

## Follow-ups
- Add lightweight script validation checks (tool presence + output file sanity assertions).
- Document artifact versioning/commit policy in `data/zk` and CI checks.
- Consider deterministic/non-interactive regeneration mode for automated pipelines.
