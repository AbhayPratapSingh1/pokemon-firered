# Code Reading Guide

## Step 1: Find Application Entry Points

Two entry points, two HTML files:

- **Play mode**: `index.html` → loads `src/main.js`
- **Editor mode**: `editor.html` → loads `src/EditorApp.js`

Both use `<script type="module">` with import maps for Three.js.

## Step 2: Understand Bootstrap

### Play Mode (`src/main.js`)

```
Lines 1-8:     Imports
Lines 10-15:   Create WebGL renderer, attach to DOM
Lines 18-20:   Create scene, set background + fog
Lines 23-29:   Create perspective camera
Lines 32-45:   Add hemisphere light + directional sun light with shadows
Lines 48-49:   createWorld(scene) → ground + obstacles
Lines 52:      Create player at origin
Lines 55:      setupPlayerHouse(scene, doorPosition)
Lines 58-60:   Create InputManager, CameraController, InteractionManager
Lines 63-67:   Window resize handler
Lines 70-96:   Game loop (requestAnimationFrame)
```

### Editor Mode (`src/EditorApp.js`)

```
Lines 1-6:     Imports
Lines 8-13:    Create WebGL renderer
Lines 15-17:   Create scene
Lines 19-29:   Create camera + OrbitControls
Lines 31-42:   Add lights
Lines 44-56:   Create ground mesh + grid helper
Lines 58-59:   Create partsGroup (container for placed parts)
Lines 61-74:   Create shared state object
Lines 76-79:   Initialize palette, placement, inspector, camera pan
Lines 81-85:   Window resize handler
Lines 87-96:   Render loop
```

## Step 3: Follow One Simple Request — Player Movement

```
1. Input happens in Input.js
   └── _onKeyDown() adds key to this.keys Set
   └── update() edge-detects jump/interact

2. Player.js reads input in update()
   └── Computes inputVector from forward/backward/left/right
   └── Rotates by camera yaw
   └── Sets targetVelocity based on speed

3. Physics applied
   └── Smooth acceleration toward target
   └── Gravity integration
   └── Position integration

4. Ground clamping
   └── getGroundHeight(x, z) returns walkable surface
   └── Outdoors: always 0
   └── Indoors: quantized stair height or floor level

5. Collision push-out
   └── resolveCollisions() in Collision.js
   └── Computes AABB overlap
   └── Pushes out along minimum penetration axis

6. Animation
   └── idle / walk / run selected based on input
```

## Step 4: Find Business Logic

The "business logic" here is the game mechanics:

- **Movement** — `Player.js:141-234` (update method)
- **Collision** — `Collision.js:14-47` (resolveCollisions)
- **Staircase height** — `PlayerHouseInterior.js:535-568` (getGroundHeight)
- **Door teleport** — `PlayerHouseInterior.js:571-588` (update)
- **Interaction** — `InteractionManager.js:17-47` (update)
- **Model resolution** — `ModelStore.js:105-141` (resolveModelParts)

## Step 5: Find Data Access

- **Player model**: Loaded via GLTFLoader from `assets/adventurer.glb`
- **Saved models**: Read/written via `ModelStore.js` to `localStorage` key `townbuilder.models`
- **World geometry**: Built procedurally in `World.js` + `Buildings.js`
- **Interior geometry**: Built procedurally in `PlayerHouseInterior.js`

## Step 6: Read Tests

No tests exist. Verify behavior manually via the browser.

## Step 7: Trace One Complete Feature

Feature: **Entering the player's house**

```
1. Player walks toward house door in outdoor world
   └── Position approaches PLAYERS_HOUSE_DOOR_POSITION

2. main.js game loop calls playerHouse.update(delta, player)
   └── PlayerHouseInterior.js:571

3. outsideDoorZone.contains(x, z) returns true
   └── Zone check at line 578

4. Player position teleported to groundEntrySpawn
   └── Line 579

5. controller.inside = true
   └── Subsequent frames use interior obstacles + collision meshes

6. Player now walks on interior ground (height 0)
   └── getGroundHeight returns 0 for non-stair areas

7. Walking to NE corner encounters staircase
   └── getGroundHeight returns quantized step heights
```
