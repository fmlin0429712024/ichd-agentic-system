# Atlas A2A adapter

This directory contains the minimal official-A2A v1.0 server adapter. It serves
Atlas's Agent Card, accepts JSON-RPC messages, validates the provider-owned task
contract, and returns a correlated A2A artifact. It is protocol hosting and a
deterministic POC capability adapter—not robot control or a second custom agent
runtime.

Run from `aide-agv-agent/`:

```bash
npm start
```

The localhost endpoint is `http://127.0.0.1:8043`; discovery is published at
`/.well-known/agent-card.json`.
