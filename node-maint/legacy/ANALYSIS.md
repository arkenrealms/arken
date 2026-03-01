# arken/packages/node/legacy/ANALYSIS.md

## Folder purpose
Legacy compatibility surface for historical Arken game/runtime data and contract-adjacent helpers.

## Child context summary
- `legacy/data`: content/rule adapter layer over generated game catalogs and hardcoded legacy dictionaries.
- `legacy/contracts`: large compatibility artifact bundle (113 JSON files) spanning mixed Truffle/Hardhat schema families plus ABI-only files.

## Key top-level files
- `contractData.ts`, `contractInfo.ts`, `farmInfo.ts`: contract and farm metadata helpers.
- `getOld*` files: migration/lookup helpers for legacy usernames/user meta.
- `types.ts`: legacy typing surface.

## Architectural context
Acts as a bridge for backward compatibility while the platform evolves toward an omniverse-grade architecture (multi-game, liveops-ready, policy-driven content).

## Risks / gaps
- Legacy responsibilities are broad and not sharply bounded by domain.
- Potential coupling between game content, wallet policy, and contract metadata.

## Follow-ups
- Add artifact-shape smoke tests to guard mixed contract JSON schemas consumed by legacy helpers.
- Define migration boundary: what remains legacy vs promoted into modern typed modules.
