# arken/packages/node/scripts

Maintenance and regeneration scripts for package-local artifacts.

## Files
- `zk-regen-updateLeaf.ts`: Rebuilds Groth16 proving/verifying artifacts for `data/zk/circuits/updateLeaf.circom`.

## Usage notes
- Requires external tools (`circom`, `snarkjs`, and `wget`).
- Script writes outputs into `data/zk/build/*` and can replace committed artifacts.
- Run from `packages/node` context to keep relative paths stable.
