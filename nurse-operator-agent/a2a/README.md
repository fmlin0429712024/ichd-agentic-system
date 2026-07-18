# Mira A2A adapter

This directory contains Mira's official-A2A v1.0 client adapter and deterministic
routine-event coordinator. Mira discovers Atlas, verifies the declared
capability, dispatches a provider-schema-valid task, consumes the A2A lifecycle,
validates the returned Atlas artifact, and preserves correlation identifiers.

`server.mjs` exposes `/poc/events` on port `8042` as a simulator-to-Mira event
adapter. That endpoint is explicitly not A2A; only Mira-to-Atlas communication
uses A2A. The directory remains transport and coordination wiring, not a custom
LLM runtime.
