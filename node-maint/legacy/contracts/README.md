# arken/packages/node/legacy/contracts

Legacy EVM contract artifact bundle used by `legacy/*` metadata helpers and migration-era runtime paths.

## What is here
- 100+ compiled artifact JSON files (`*.json`), including ABI + bytecode/metadata variants.
- Mixed compiler-era formats are present:
  - Truffle-like (`contractName`, `metadata`, `sourceMap`, ...)
  - Hardhat-style (`_format`, `sourceName`, `linkReferences`, ...)
  - ABI-only helper files (`*.abi.json`)

## Why it matters
This folder is effectively a frozen compatibility snapshot for historical Arken contracts. Runtime safety depends on predictable artifact shape, naming stability, and controlled updates.

## Maintenance notes
- Treat artifacts as generated inputs, not hand-authored logic.
- Prefer additive changes with provenance (compiler/toolchain/source commit).
- Validate consumers against both artifact schemas before removing legacy keys.
