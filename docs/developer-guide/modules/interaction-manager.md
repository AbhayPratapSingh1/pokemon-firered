# InteractionManager Module

**File:** `src/InteractionManager.js` (55 lines)

## Purpose

Minimal proximity-based interaction system for E-key interactions.

## Responsibilities

- Each frame: find nearest interactable within range (1.6m)
- Show "Press E" prompt when near an interactable
- Show message for 2.5 seconds when E is pressed

## Public Interface

```javascript
class InteractionManager {
  constructor()
  update(delta, input, player, interactables)
}
```

## Interactable Structure

```javascript
{
  name: string,         // e.g. "TV"
  prompt: string,       // e.g. "Press E to watch TV"
  position: Vector3,    // World position for proximity check
  message: string,      // e.g. "It's a TV. Nothing interesting is on."
}
```

## Constants

| Constant | Value | Purpose |
|----------|-------|---------|
| `INTERACT_RANGE` | 1.6 | Max distance for interaction |
| Message display time | 2.5s | Hardcoded in `_showMessage` |
