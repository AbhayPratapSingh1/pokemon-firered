/**
 * Oak's Lab Interior Layout Reference (FireRed/LeafGreen)
 * 
 * Saved for future implementation. Currently using Ash's House
 * duplicate at this position instead.
 * 
 * Layout (top-down, facing south/entrance):
 * 
 *   ┌──────────────────────────────────────────────┐
 *   │           [BOOKSHELF-CENTER]                 │
 *   │  [MACHINE-TL]                    [MACHINE-TR]│
 *   │                                              │
 *   │     [PC DESK] [CHAIR]    [TABLE]             │
 *   │     +--------+           +--------+          │
 *   │     |   PC   |           |O  O  O |          │
 *   │     +--------+           +--------+          │
 *   │                                              │
 *   │  [SHELF-L]  (P)              (P)  [SHELF-R] │
 *   │            [PLANT]        [PLANT]            │
 *   │                                              │
 *   │                 [DOORWAY]                    │
 *   └──────────────────────────────────────────────┘
 * 
 * Components used:
 * - LabShelf: bookshelf with colorful books
 * - LabMachine: console with glowing screen
 * - LabDesk: desk with computer monitor
 * - LabPlant: potted plant with leaves
 * - Table + 3 Pokeballs
 * 
 * Dimensions: 10x8m, wallHeight: 3.2m
 * Wall color: cream (#f5f5dc)
 * Roof: red trim (#c62828), flat
 * Door: 1.4m wide, 2.2m tall
 */

export const OAK_LAB_INTERIOR_LAYOUT = {
  width: 10,
  depth: 8,
  wallHeight: 3.2,
  wallColor: 0xf5f5dc,
  trimColor: 0xc62828,
  doorWidth: 1.4,
  doorHeight: 2.2,
  
  // Furniture positions (local coordinates)
  furniture: [
    // North wall
    { type: "labShelf", x: 0, z: -3.5 },           // center shelf
    { type: "labMachine", x: -4.3, z: -3.3 },      // top-left machine
    { type: "labMachine", x: 4.3, z: -3.3 },       // top-right machine
    
    // Center
    { type: "labDesk", x: -2.5, z: -1.3 },         // PC desk (left)
    { type: "chair", x: -2.5, z: -0.7 },           // Chair
    { type: "table", x: 2.5, z: -1.3 },            // Table (right)
    { type: "pokeball", x: 2.15, z: -1.3 },        // 3 pokeballs
    { type: "pokeball", x: 2.5, z: -1.3 },
    { type: "pokeball", x: 2.85, z: -1.3 },
    
    // South wall
    { type: "labShelf", x: -4.0, z: 3.5 },         // left shelf
    { type: "labShelf", x: 4.0, z: 3.5 },          // right shelf
    { type: "labPlant", x: -1.0, z: 3.4 },         // left plant
    { type: "labPlant", x: 1.0, z: 3.4 },          // right plant
  ],
};
