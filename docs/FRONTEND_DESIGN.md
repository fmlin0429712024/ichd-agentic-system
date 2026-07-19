# Care Center Simulator — Frontend Design

## Purpose

The simulator is the visible POC stage. It demonstrates Mira-centered
coordination, formal A2A work dispatch, and deterministic Atlas execution.

## Layout

- Fixed-camera SVG/CSS 2.5D treatment floor.
- Central fictional Care Operations Hub containing Atlas Home and supplies.
- Four smaller treatment chairs positioned around the perimeter.
- Simplified seated patient figures provide presence without realistic identity
  or clinical detail.
- The left treatment floor receives most of the viewport; the compact right
  panel is the conversation surface.

The radial arrangement is a fictional POC choice for visual clarity and balanced
Atlas access. It is not a recommended clinical-facility design.

## Rendering boundary

- CSS renders the static floor, hub, chairs, machines, and patient figures.
- SVG/DOM renders the route network, highlighted active route, and Atlas
  movement.
- Domain state remains renderer-independent TypeScript.

This renderer is intentionally stable in the in-app browser while retaining a
game-like, inspectable route presentation. The renderer can later be replaced
without changing the tested floor, route, task, or agent contracts.

## AGV Motion Emulator

Atlas does not perform robot navigation in this POC. The simulator-owned AGV
Motion Emulator executes deterministic routine rounds and assigned missions
over a fixed circulation graph.
It contains no physics, localization, collision avoidance, or autonomous path
planning. A typical Chair 1 leg is:

```text
Atlas Home → hub dock → south-west turn → north-west turn → Chair 1
```

Inactive routes use a quiet dashed line. The active route is highlighted.
Atlas advances smoothly between visible route points at a fixed interval. Its
routine round is `Chair 1 → Chair 2 → Chair 4 → Chair 3 → Hub`. Adjacent chairs
use the ring rather than returning through the center. A task interrupts at the
next safe waypoint; a delivery visits the hub only to pick up the item, travels
to the chair, records delivery, and resumes the round from that chair. This
model is deterministic, unit-testable, and outside Atlas agent internals.

## Conversation surface

The product interface has two tabs:

- **Patient → Mira:** select one fictional patient and speak naturally to Mira.
  Patient text is intake, not authorization. Mira may answer remotely or
  dispatch bounded physical work to Atlas through A2A.
- **RN → Mira:** the fictional registered nurse asks Mira for concise status,
  context, or coordination information. Mira cannot record an RN-owned decision.

The live event trace remains compact and collapsible below the conversation.
The former movement and item buttons are removed from the showcase surface and
retained only as test fixtures or a hidden development mode.

## Routine-support interaction

1. Select Daniel Kim in the Patient → Mira tab.
2. Ask Mira to bring a coffee in natural language.
3. Mira records the patient statement and validates the synthetic pre-approval.
4. Mira dispatches Atlas through A2A.
5. The browser receives a semantic motion mission and the emulator picks up the
   item at the operations hub.
6. Atlas follows the highlighted route to Chair 1, records delivery, and
   resumes its routine round.

Field controls remain available to automated tests and a hidden development
mode. They are not the end-user workflow.

## Progressive role introduction

Only roles with an implemented use case appear in the current simulator view.
This does not remove human RN or PCT authority from the product architecture.
Those roles will enter the interface when a clinical-decision or physical-help
scenario requires them.

## TDD and browser acceptance

- Unit tests cover floor ownership, chair positions, route topology, route
  coordinates, Atlas commands, reset, and deterministic patrol.
- Production builds must pass before browser acceptance.
- Browser acceptance verifies routine rounds, task interruption, A2A dispatch,
  pickup, route turns, delivery, patrol resumption, and the correlated trace.
