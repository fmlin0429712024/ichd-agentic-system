# Agentic CareLoop for In-Center Hemodialysis

A POC that wires a conversational AI coordinator, a formal agent-to-agent
protocol, and a mobile AGV worker into one traceable care loop — running in
a synthetic four-chair hemodialysis center.

> **Why this matters:** Hemodialysis centers run on repetitive, time-sensitive
> logistics while a single nurse manages four patients in parallel. This system
> explores what it looks like when AI handles coordination and a robot handles
> the physical work — while the human RN retains every clinical decision.

![CareLoop live simulation: routine round, Mira coordination, Atlas delivery, and patrol resumption](docs/assets/careloop-demo.gif)

*Real application capture — not a concept render.* Atlas performs a routine
round, Mira receives Daniel's request, formal A2A dispatches the delivery, and
Atlas resumes its round. [Static screenshot →](docs/assets/careloop-operations.jpg)

---

## How it works — three decoupled layers

```mermaid
flowchart TD
    P["🧑 Patient"]
    RN["👩‍⚕️ Human RN\nfinal clinical authority"]

    subgraph CANVAS["🖥️  Layer 3 · Operations Canvas  (care-center-simulator/)"]
        UI["Browser web app\nFloor map · Agent trace · Chat UI\nStreams CARELOOP_TELEMETRY — owns no logic"]
    end

    subgraph AGENTS["🧠  Layer 2 · Agentic Coordinator"]
        subgraph MIRA["Mira · nurse coordinator  (nurse-operator-agent/)"]
            M["OpenAI Agents SDK\ncontext · coordination · escalation"]
        end
    end

    subgraph PHYSICAL["🏥  Layer 1 · Physical World / Digital Twin  (physical-simulator/)"]
        ENV["HD Center Environment\nFour-chair treatment room\nNow: Webots R2025b digital twin · Future: real HD center"]
        AGV["🤖 AGV\nOEM body · Jetson onboard compute\nAtlas agent  (aide-agv-agent/)  ·  A2A task executor\nNow: Webots simulation · Future: real AGV hardware"]
        ENV -.->|"AGV operates inside"| AGV
    end

    %% force strict top-to-bottom layer ordering
    CANVAS ~~~ AGENTS
    AGENTS ~~~ PHYSICAL

    P -->|"conversation"| M
    RN <-->|"conversation + decision"| M
    UI -->|"CARELOOP_TELEMETRY"| M
    M ==>|"A2A protocol\nAgent Card + JSON contract"| AGV
    AGV -.->|"status + artifact"| M

    classDef human fill:#FCE7F3,stroke:#DB2777,color:#500724
    classDef digital fill:#DBEAFE,stroke:#2563EB,color:#172554
    classDef sim fill:#CCFBF1,stroke:#0F766E,color:#134E4A
    classDef canvas fill:#F3F4F6,stroke:#6B7280,color:#111827
    classDef robot fill:#FEF9C3,stroke:#CA8A04,color:#422006
    class RN,P human
    class M digital
    class ENV sim
    class UI canvas
    class AGV robot
```

Each layer is **independently replaceable** — the contracts between them stay stable:

| Layer | Now (POC) | Future |
|---|---|---|
| **Layer 1 · HD Center Environment** | Webots R2025b digital twin | Real hemodialysis center |
| **Layer 1 · AGV body** | Webots simulated robot | Real OEM AGV hardware |
| **Layer 1 · Atlas agent** | Node.js service (local) | Deployed to onboard Jetson |
| **Layer 2 · Mira coordinator** | Local Node.js + OpenAI Agents SDK | Site-edge server or cloud |
| **Layer 3 · Operations Canvas** | React/Vite web app | Native app; wall-mounted kiosk |

The **A2A protocol** is the only interface between Mira (Layer 2) and Atlas on
the AGV (Layer 1). In production, Mira sends an A2A task over the network to
Atlas running on the Jetson — the physical AGV executes, emits
`CARELOOP_TELEMETRY`, and the Canvas reflects reality.

---

## The cast

| | Role | What they do | What they don't do |
|---|---|---|---|
| **Mira** | AI coordinator | Converses with patients and the RN; assembles treatment context; delegates physical tasks via A2A | Make clinical decisions; physically move |
| **Atlas** | AGV worker | Accepts bounded A2A tasks; patrols the floor; delivers items; returns structured evidence | Chat with humans; make medical judgments |
| **Human RN** | Final authority | Owns every clinical and treatment decision | — |

---

## What runs today

The working end-to-end slice is Daniel Kim's pre-approved coffee request:

1. **Daniel** speaks to Mira from Chair 1.
2. **Mira** validates the pre-approval from synthetic treatment context.
3. **Mira** discovers Atlas via its Agent Card and sends a `deliver_item` A2A task.
4. **Atlas** diverts from its routine round, visits the Operations Hub, picks up the item.
5. **The simulation layer** (Webots or browser emulator) drives Atlas to Chair 1.
6. The full trace — patient message → Mira decision → A2A task → Atlas motion → artifact — is correlated by one mission ID and visible in the Operations Canvas.

### Four-chair story map

| Chair | Patient | Scenario | Status |
|---|---|---|---|
| 1 | **Daniel Kim** | Stable; pre-approved coffee request | ✅ Working end to end |
| 2 | **Noah Carter** | Anxiety; wants to end treatment early | Designed — needs RN decision flow |
| 3 | **Emma Morgan** | Synthetic hypotension signal | Designed — needs immediate RN alert flow |
| 4 | **Priya Shah** | Access-site soreness; normal machine values | Designed — needs uncertainty + RN review |

---

## Stack

| Component | Technology |
|---|---|
| Mira coordinator | OpenAI Agents SDK · Node.js |
| Agent communication | `@a2a-js/sdk` · A2A v1.0 JSON-RPC · Agent Card discovery |
| Atlas worker | Deterministic Node.js A2A service |
| Operations Canvas | React · TypeScript · Vite · SVG/CSS |
| Physical simulation | Webots R2025b · Python controller |
| Data | Static fictional JSON — no database, no real patient data |
| Tests | 49 automated tests + Webots mission acceptance |

---

## Run it locally

**Prerequisites:** Node.js, npm, and an OpenAI API key (for Mira only).

```bash
# Terminal 1 — Atlas worker
cd aide-agv-agent && npm install && npm start

# Terminal 2 — Mira coordinator
cd nurse-operator-agent && npm install
export OPENAI_API_KEY="sk-..."
npm start

# Terminal 3 — Operations Canvas (includes browser motion emulator)
cd care-center-simulator && npm install && npm run dev
```

Open `http://127.0.0.1:5173/`, select **Daniel Kim · Chair 1**, and ask:

> Hi Mira, please ask Atlas to bring me a cup of coffee.

**To add Webots physical simulation** (optional): install Webots R2025b on
Apple Silicon, then open `physical-simulator/worlds/careloop_center.wbt` and
start the simulation. Atlas executes the same mission and emits
`CARELOOP_TELEMETRY` to stdout. The Operations Canvas works with or without it.

---

## Repository layout

```
nurse-operator-agent/   Mira — coordinator, A2A client
aide-agv-agent/         Atlas — A2A worker, task executor
care-center-simulator/  Operations Canvas (web UI) + motion emulator
physical-simulator/     Webots world, Python controller, Body Adapter
poc-reference/          Synthetic patient profiles and treatment history
docs/                   PRD, technical spec, agent designs, ADRs
```

---

## Read next

- [PRD](docs/PRD.md) — product scope, personas, safety, and acceptance criteria
- [Technical Specification](docs/TECHNICAL_SPEC.md) — A2A, contracts, motion boundary
- [ADR-001 · Why Webots](docs/decisions/ADR-001-webots-physical-simulation.md)
- [Patient story map](poc-reference/patient-scenarios.md)

---

> All patients, staff, facilities, and values are fictional and synthetic.
> This is a concept demonstration — not a medical device or clinical system.
