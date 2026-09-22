/**
 * Player's house interior — a close recreation of the Pokémon FireRed/LeafGreen
 * protagonist house in Pallet Town.
 *
 * This file is a thin re-export wrapper. All logic has been decomposed into
 * modular, reusable components under src/components/ and the house-specific
 * assembly under src/house/AshHouse/.
 *
 * To modify the house:
 *   - Furniture layout  → src/house/AshHouse/config.js
 *   - Individual pieces → src/components/*.js
 *   - Assembly / door   → src/house/AshHouse/AshHouse.js
 *   - Building constants → src/house/AshHouse/constants.js
 *   - Shared colors/utils → src/components/shared.js
 *
 * @param {THREE.Scene} scene
 * @param {THREE.Vector3} exteriorDoorWorldPos - world position of the exterior door
 * @param {number} doorDirection - 1 = south-facing (default), -1 = north-facing
 */
export { setupPlayerHouse, HOUSE_ORIGIN } from "./house/AshHouse/AshHouse.js";
