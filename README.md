# LARP

A minimal frontend concept for a satirical CS-career roguelite. The prototype
demonstrates how a Phaser 4 canvas can own the spatial world while Svelte owns
text-heavy, accessible interface panels.

## Run it

```bash
npm install
npm run dev
```

Useful checks:

```bash
npm run check
npm run build
```

## What the prototype includes

- a Phaser boot scene and a movable 2D campus map;
- keyboard movement, collision, camera follow, and interactive hotspots;
- Svelte-powered feed, planner, and résumé panels;
- a small typed presentation bridge between Phaser and Svelte;
- responsive styling and an itch.io-friendly relative-path Vite build;
- frontend-only mock data.

The map uses generated geometry, so there are no external game assets yet.
Move with WASD or the arrow keys and press `E` near a pulsing hotspot. The top
navigation and number keys also open the mock panels.

## Deliberate boundaries

`src/core`, `src/model`, and `src/systems` are intentionally empty placeholders.
There is no environment model, content repository, authoritative game state,
save system, or opportunity evaluation logic in this skeleton.

Mock data lives in `src/presentation/mocks`. Comments marked `TODO(backend)` and
the typed bridge in `src/presentation/bridge` identify the main future
integration seam: UI gestures should eventually dispatch game actions, while
panels should render selectors over an authoritative `GameState`.
