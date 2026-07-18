# Care Center Simulator — Frontend Design

## Purpose

The simulator is the visible POC stage. It demonstrates routine operational
support before Mira, formal A2A, clinical escalation, or additional human roles
are introduced into the interface.

## Layout

- Fixed-camera SVG/CSS 2.5D treatment floor.
- Central fictional Care Operations Hub containing Atlas Home and supplies.
- Four smaller treatment chairs positioned around the perimeter.
- Simplified seated patient figures provide presence without realistic identity
  or clinical detail.
- The left treatment floor receives most of the viewport; the compact right
  panel is a development and trace surface.

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

## Deterministic routes

Atlas does not perform robot navigation in this POC. Each destination owns a
fixed waypoint route. A typical Chair 1 delivery is:

```text
Atlas Home → center-north → north-west-turn → Chair 1 service point
```

Inactive routes use a quiet dashed line. The active route is highlighted.
Atlas advances between visible route points at a fixed interval. The deliberate
step movement avoids coupling the POC to continuous robot motion and remains
stable in the in-app browser. This model is deterministic, unit-testable, and
outside future robot internals.

## Routine-support interaction

1. Select a patient chair.
2. Choose Water, Coffee, or Blanket in the Patient Request card.
3. The simulator records the request.
4. Atlas accepts the support task and follows the highlighted route.
5. Atlas arrives at the chair service point.
6. Complete delivery and record the outcome.

The compact Field Controls remain available for waypoint, patrol, stop, reset,
and development testing. They are not the final end-user workflow.

## Progressive role introduction

Only roles with an implemented use case appear in the current simulator view.
This does not remove human RN or PCT authority from the product architecture.
Those roles will enter the interface when a clinical-decision or physical-help
scenario requires them.

## TDD and browser acceptance

- Unit tests cover floor ownership, chair positions, route topology, route
  coordinates, Atlas commands, reset, and deterministic patrol.
- Production builds must pass before browser acceptance.
- Browser acceptance verifies patient selection, request creation, route turns,
  persistent Three.js visibility, arrival, delivery, and event trace.
