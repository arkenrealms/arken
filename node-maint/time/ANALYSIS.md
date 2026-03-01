# arken/packages/node/time/ANALYSIS.md

## Folder purpose
Small shared time/date utility layer for scheduling, delay handling, formatting, and async task sequencing.

## Key files and responsibilities
- `index.ts`: exports utility surface (`sleep`, `timestamp`, `debounce`, `createTaskQueue`, timezone helpers).
- `now.ts`: returns UTC `Date` via `moment.utc()`.
- `date.ts`: local formatted date string (`YYYY-MM-DD`).
- `fancyTimeFormat.ts`: human-ish duration formatter (`h:mm:ss` / `m:ss`) with untyped input.

## Additional implementation notes from this pass
- `createTaskQueue` executes serially with a default per-task delay (`1000ms`) and catches/logs task errors without structured reporting.
- `removeTimezoneOffset` manually adjusts with sign-branch behavior, which is easy to misuse without explicit UTC/local call-site contracts.
- `timestampToTime` uses local-time getters (`getHours`, `getMonth`, etc.) and not UTC variants.

## Architectural context (omniverse platform)
Time consistency is foundational for seasonal events, queue orchestration, matchmaking windows, reward vesting, and launcher/storefront timers. This module is currently lightweight but touches reliability-critical concerns.

## Risks / gaps
- Mixed UTC/local conventions (`now.ts` UTC vs `date.ts` local format).
- `createTaskQueue` still lacks cancellation, backpressure limits, and observability hooks (tail-handoff enqueue stall fixed with test coverage in this run).
- `debounce` uses broad `any` types; potential context surprises.

## Follow-ups
- Standardize UTC policy and expose explicit local/UTC APIs.
- Add unit tests for `removeTimezoneOffset`, `timestampToTime`, and queue ordering/delay semantics.
- Add optional instrumentation hooks for queue failures/latency (needed for liveops and worker reliability).
