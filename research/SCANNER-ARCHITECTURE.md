# Scanner architecture (summary)
See full agent design in session notes. Defaults:

- Capture: guided still photo (not continuous video ID)
- On-device: card/slab quad detect → perspective warp → blur/glare quality gate
- Identify: visual embedding ANN (primary) + ROI OCR (secondary) + slab cert# exact path
- UX: top 5 candidates, mandatory confirm, never silent single wrong match
- Latency: P50 ≤1s, P95 ≤2s; upload vector or tight crop only
- Ban: full-image cloud OCR as sole method; multi-MB uploads on critical path

MVP: server-side embed + ANN on seed catalog (Pokémon EN + flagship sports sets); expand weekly.
