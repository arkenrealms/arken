# arken/packages/node/.rush/README.md

## Purpose
Rush workspace metadata/cache area for the `@arken/node` package.

## Contents
- `temp/shrinkwrap-deps.json`: resolved dependency integrity map used by Rush during install/lock reconciliation.
- `ANALYSIS.md`: local reliability notes for this cache surface.

## Notes
- Treat this folder as generated/cache infrastructure, not hand-authored runtime logic.
- If dependency state drifts unexpectedly, regenerate via the package manager/Rush flow rather than editing files manually.
