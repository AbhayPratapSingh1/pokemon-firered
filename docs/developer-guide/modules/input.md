# Input Module

**File:** `src/Input.js` (112 lines)

## Purpose

Keyboard and mouse input manager with edge detection for single-frame events.

## Responsibilities

- Track held keys in a Set
- Pointer lock management (click to lock, ESC to unlock)
- Accumulate mouse movement deltas
- Edge-detect jump and interact (true for exactly one frame)

## Public Interface

```javascript
class InputManager {
  constructor(domElement)    // Canvas element
  update()                   // Call once per frame after reading state
  consumeMouseDelta() → { dx, dy }  // Read and reset mouse deltas

  // State getters
  get forward → boolean     // W or ArrowUp
  get backward → boolean    // S or ArrowDown
  get left → boolean        // A or ArrowLeft
  get right → boolean       // D or ArrowRight
  get sprint → boolean      // ShiftLeft or ShiftRight
  get jumpPressed → boolean // Space (edge-detected, single frame)
  get interactPressed → boolean // E (edge-detected, single frame)
  get isPointerLocked → boolean
}
```

## Key Constants

| Constant | Value | Purpose |
|----------|-------|---------|
| `MOVE_KEYS` | Set of key codes | Keys that get `preventDefault()` |

## Edge Detection

```
Frame N: Space not held → jumpHeld = false, jumpPressed = false
Frame N+1: Space held → jumpHeld = true, jumpPressed = true (one frame)
Frame N+2: Space held → jumpHeld = true, jumpPressed = false
Frame N+3: Space released → jumpHeld = false, jumpPressed = false
```

Same pattern for `interactPressed` (E key).
