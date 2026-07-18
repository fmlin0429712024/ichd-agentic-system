# Care-center simulator

This directory owns the fictional treatment floor, deterministic scenarios,
synthetic measurements, browser UI, session state, and simulator contracts.

The simulator may display Atlas activity but must not implement Mira or Atlas
reasoning. It is the POC environment, not the inter-agent transport and not a
robotics stack.

Use a fixed-camera 2.5D Three.js scene. Keep floor layout, movement, commands,
and state in renderer-independent TypeScript modules. Develop Red → Green →
Refactor; browser rendering must consume tested domain state rather than own it.
