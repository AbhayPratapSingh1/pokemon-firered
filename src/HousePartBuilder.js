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
  // Nature / outdoor
  house_grass: createGrassPart,
  house_tree: createTreePart,
  house_banner: createBannerPart,
  house_shelter: createShelterPart,
  house_water: createWaterPart,
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
  // Nature / outdoor
  { type: "house_grass", label: "Grass", category: "Nature" },
  { type: "house_tree", label: "Tree", category: "Nature" },
  { type: "house_banner", label: "Banner", category: "Structure" },
  { type: "house_shelter", label: "Shelter", category: "Structure" },
  { type: "house_water", label: "Water", category: "Nature" },
];
