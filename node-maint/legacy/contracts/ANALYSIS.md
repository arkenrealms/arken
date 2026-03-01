# arken/packages/node/legacy/contracts/ANALYSIS.md

## Folder purpose
Compatibility artifact store for historical contract integrations used by `legacy` helpers and migration-era game/runtime flows.

## Source snapshot
- Artifact files: 113 JSON files.
- Observed schema families:
  - Legacy/Truffle-style: `contractName`, `abi`, `metadata`, `bytecode`, `deployedBytecode`, `sourceMap`, ...
  - Hardhat-style: `_format`, `contractName`, `sourceName`, `abi`, `bytecode`, `deployedBytecode`, `linkReferences`, ...
  - ABI-only helper surfaces (for selected contracts/tools).

## Protocol/test relevance
- These artifacts shape on-chain call encoding/decoding behavior in legacy paths.
- Mixed schemas increase parser/consumer drift risk when utilities assume one artifact shape.
- No local fixture/invariant tests in-folder currently verify artifact schema compatibility.

## Risks / gaps
- Very large binary-like JSON payloads can drift without clear provenance.
- Mixed compiler/toolchain formats make consumer assumptions fragile.
- Folder lacks explicit regeneration policy and schema guardrails.

## Follow-ups
- Add lightweight artifact-shape smoke tests at `legacy` boundary (required keys per schema family).
- Document provenance policy (source repo/tag + compiler/toolchain versions) for artifact refreshes.
- Consider splitting runtime-consumed ABI-only extracts from full build artifacts for reduced blast radius.
