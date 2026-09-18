import * as THREE from "three";
import { buildTV } from "./components/TV/TV.js";
import { buildPlant } from "./components/Plant/Plant.js";
import { buildCupboard } from "./components/Cupboard/Cupboard.js";
import { buildDiningSet } from "./components/DiningSet/DiningSet.js";
import { buildSink } from "./components/Sink/Sink.js";
import { buildBed } from "./components/Bed/Bed.js";
import { buildComputerDesk } from "./components/ComputerDesk/ComputerDesk.js";
import { buildGrass } from "./components/Grass/Grass.js";
import { buildTree } from "./components/Tree/Tree.js";
import { buildBanner } from "./components/Banner/Banner.js";
import { buildShelter } from "./components/Shelter/Shelter.js";
import { buildWater } from "./components/Water/Water.js";
import { buildTable } from "./components/Table/Table.js";
import { buildPokeball } from "./components/Pokeball/Pokeball.js";
import { buildChimney } from "./components/Chimney/Chimney.js";
import { buildMailbox } from "./components/Mailbox/Mailbox.js";
import { buildSign } from "./components/Sign/Sign.js";
import { buildWindowBox } from "./components/WindowBox/WindowBox.js";
import { buildFence } from "./components/Fence/Fence.js";
import { buildLabShelf } from "./components/LabShelf/LabShelf.js";
import { buildLabMachine } from "./components/LabMachine/LabMachine.js";
import { buildLabDesk } from "./components/LabDesk/LabDesk.js";
import { buildLabPlant } from "./components/LabPlant/LabPlant.js";

/**
 * Wraps each house component into a THREE.Group so it can be placed as a
 * single unit in the editor. Each builder is called with local origin at
 * (0, 0, 0) — the editor handles position/rotation/scale on the wrapper group.
 */

function wrapBuilder(builderFn, ...args) {
  const group = new THREE.Group();
  builderFn(group, 0, 0, 0, ...args);
  return group;
}

// --- Furniture builders ----------------------------------------------------

export function createTVPart({ facing = "south" } = {}) {
  return wrapBuilder(buildTV, facing);
}

export function createPlantPart() {
  return wrapBuilder(buildPlant);
}

export function createCupboardPart() {
  return wrapBuilder(buildCupboard);
}

export function createDiningSetPart() {
  return wrapBuilder(buildDiningSet);
}

export function createSinkPart() {
  return wrapBuilder(buildSink);
}

export function createBedPart() {
  return wrapBuilder(buildBed);
}

export function createComputerDeskPart() {
  return wrapBuilder(buildComputerDesk);
}

// --- Nature / outdoor builders ---------------------------------------------

export function createGrassPart() {
  return wrapBuilder(buildGrass);
}

export function createTreePart() {
  return wrapBuilder(buildTree);
}

export function createBannerPart() {
  return wrapBuilder(buildBanner);
}

export function createShelterPart() {
  return wrapBuilder(buildShelter);
}

export function createWaterPart() {
  return wrapBuilder(buildWater);
}

// --- Table & Pokeball builders -----------------------------------------------

export function createTablePart() {
  return wrapBuilder(buildTable);
}

export function createPokeballPart() {
  return wrapBuilder(buildPokeball);
}

// --- Outdoor / structure builders --------------------------------------------

export function createChimneyPart() {
  return wrapBuilder(buildChimney);
}

export function createMailboxPart() {
  return wrapBuilder(buildMailbox);
}

export function createSignPart() {
  return wrapBuilder(buildSign);
}

export function createWindowBoxPart() {
  return wrapBuilder(buildWindowBox);
}

export function createFencePart() {
  const group = new THREE.Group();
  buildFence(group, 0, 0, 0, 3);
  return group;
}

// --- Lab / research builders -------------------------------------------------

export function createLabShelfPart() {
  return wrapBuilder(buildLabShelf);
}

export function createLabMachinePart() {
  return wrapBuilder(buildLabMachine);
}

export function createLabDeskPart() {
  return wrapBuilder(buildLabDesk);
}

export function createLabPlantPart() {
  return wrapBuilder(buildLabPlant);
}

/**
 * Registry of house part builders, keyed by type name.
 * Each entry is a function that returns a THREE.Group.
 */
export const HOUSE_PART_BUILDERS = {
  // Furniture
  house_tv: createTVPart,
  house_plant: createPlantPart,
  house_cupboard: createCupboardPart,
  house_dining_set: createDiningSetPart,
  house_sink: createSinkPart,
  house_bed: createBedPart,
  house_computer_desk: createComputerDeskPart,
  house_table: createTablePart,
  house_pokeball: createPokeballPart,
  // Nature / outdoor
  house_grass: createGrassPart,
  house_tree: createTreePart,
  house_banner: createBannerPart,
  house_shelter: createShelterPart,
  house_water: createWaterPart,
  // Structure / decor
  house_chimney: createChimneyPart,
  house_mailbox: createMailboxPart,
  house_sign: createSignPart,
  house_window_box: createWindowBoxPart,
  house_fence: createFencePart,
  // Lab / research
  house_lab_shelf: createLabShelfPart,
  house_lab_machine: createLabMachinePart,
  house_lab_desk: createLabDeskPart,
  house_lab_plant: createLabPlantPart,
};

/**
 * Metadata for each house part — displayed in the palette.
 */
export const HOUSE_PART_DEFS = [
  // Furniture
  { type: "house_tv", label: "TV", category: "Furniture" },
  { type: "house_plant", label: "Plant", category: "Furniture" },
  { type: "house_cupboard", label: "Cupboard", category: "Furniture" },
  { type: "house_dining_set", label: "Dining Set", category: "Furniture" },
  { type: "house_sink", label: "Sink", category: "Furniture" },
  { type: "house_bed", label: "Bed", category: "Furniture" },
  { type: "house_computer_desk", label: "PC Desk", category: "Furniture" },
  { type: "house_table", label: "Table", category: "Furniture" },
  { type: "house_pokeball", label: "Pokeball", category: "Furniture" },
  // Nature / outdoor
  { type: "house_grass", label: "Grass", category: "Nature" },
  { type: "house_tree", label: "Tree", category: "Nature" },
  { type: "house_water", label: "Water", category: "Nature" },
  // Structure / decor
  { type: "house_banner", label: "Banner", category: "Structure" },
  { type: "house_shelter", label: "Shelter", category: "Structure" },
  { type: "house_chimney", label: "Chimney", category: "Structure" },
  { type: "house_mailbox", label: "Mailbox", category: "Structure" },
  { type: "house_sign", label: "Sign", category: "Structure" },
  { type: "house_window_box", label: "Window Box", category: "Structure" },
  { type: "house_fence", label: "Fence", category: "Structure" },
  // Lab / research
  { type: "house_lab_shelf", label: "Lab Shelf", category: "Lab" },
  { type: "house_lab_machine", label: "Lab Machine", category: "Lab" },
  { type: "house_lab_desk", label: "Lab Desk", category: "Lab" },
  { type: "house_lab_plant", label: "Lab Plant", category: "Lab" },
];
