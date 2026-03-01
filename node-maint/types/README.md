# @arken/node types

Ambient type augmentations for legacy runtime compatibility.

## Files
- `mongo.d.ts`: extends mongoose query interfaces with project-specific `asJSON()` helper typing.

## Notes
- This folder is declaration-only (no runtime code).
- Type drift risk is tied to mongoose generic signature changes across major versions.
