# arken/packages/node/legacy

Legacy compatibility surface for historical Arken runtime behavior.

## What lives here
- `data/`: legacy gameplay catalogs, item/economy constants, and restriction lists.
- `contracts/`: archived contract artifacts used by compatibility helpers.
- top-level `getOld*`, `contract*`, and `farmInfo` helpers for migration/runtime lookups.

## Why it matters
This folder bridges old data/contracts into current services. Changes should preserve backward compatibility and be paired with docs/tests when possible.
