# arken/workstreams/matchmaking-system/CHECKLIST.md

## Discovery
- [ ] Define player intents: casual, ranked, custom, party matchmaking.
- [ ] Define supported game modes and queue constraints.
- [ ] Define latency/region policy and fallback behavior.

## Research
- [ ] Analyze reference patterns from Steam/Battle.net/Riot-style systems.
- [ ] Compare queue-time vs match-quality tradeoff approaches.
- [ ] Document anti-smurf/anti-abuse and dodging penalties.

## Architecture
- [ ] Propose service boundaries (queue service, rating service, session orchestration).
- [ ] Define data model for queue tickets, party state, MMR snapshot.
- [ ] Define APIs/events for enqueue, update, dequeue, match-formed.

## Reliability
- [ ] Idempotency keys for enqueue/dequeue.
- [ ] Timeout, retry, and dead-letter handling.
- [ ] Observability: queue depth, match time, quality score, failure rates.

## Delivery
- [ ] Milestone 1: MVP queue + direct match creation.
- [ ] Milestone 2: skill-based balancing and party handling.
- [ ] Milestone 3: production hardening and analytics feedback loop.
