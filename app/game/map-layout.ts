export type MapProp = {
  id: string;
  path: string;
  x: number;
  z: number;
  size: number;
  rotation?: number;
  collider?: [halfWidth: number, halfDepth: number];
};

export const MAP_BOUNDS = { minX: -64, maxX: 64, minZ: -112, maxZ: 112 } as const;
export const CANAL = { x: 18, z: -8, halfWidth: 4, halfDepth: 47, bridges: [-26, 7, 28] } as const;
export const RIVER = { x: 0, z: 82, halfWidth: 64, halfDepth: 5, bridges: [0, 35] } as const;

const asset = (category: string, name: string) => `/assets/world/${category}/${name}.glb`;
const prop = (id: string, category: string, name: string, x: number, z: number, size: number, rotation = 0, collider?: [number, number]): MapProp => ({ id, path: asset(category, name), x, z, size, rotation, collider });

export const BUILDING_PROPS: MapProp[] = [
  prop("candi", "environments", "low_poly_majapahit_royal_rest", 0, -72, 29, Math.PI, [13.5, 11.5]),
  prop("padepokan", "buildings", "small_padepokan", -30, -67, 12, Math.PI / 2, [5.6, 4.9]),
  prop("village-head", "buildings", "village_head_house", -23, -30, 13, Math.PI / 2, [5.5, 4.8]),
  prop("village-hall", "buildings", "village_hall", -22, -12, 14, Math.PI / 2, [5.8, 5]),
  prop("resident-a", "buildings", "resident_bamboo_house", -21, 6, 11, Math.PI / 2, [4.6, 4.2]),
  prop("resident-b", "buildings", "resident_bamboo_house", -22, 20, 10.5, Math.PI / 2, [4.4, 4]),
  prop("resident-c", "buildings", "resident_bamboo_house", 34, -31, 10.5, -Math.PI / 2, [4.4, 4]),
  prop("warung", "buildings", "simple_warung", 33, -14, 11, -Math.PI / 2, [4.7, 4]),
  prop("communal-kitchen", "buildings", "communal_kitchen", 34, 3, 11.5, -Math.PI / 2, [4.8, 4.1]),
  prop("healer", "buildings", "healer_house", 34, 20, 11.5, -Math.PI / 2, [4.7, 4.3]),
  prop("blacksmith-house", "buildings", "blacksmith_house", -38, 32, 13, Math.PI / 2, [5.8, 4.6]),
  prop("blacksmith", "buildings", "blacksmith_workshop", -25, 34, 11.5, 0, [4.8, 4.2]),
  prop("rice-mill", "buildings", "traditional_rice_mill", 25, 34, 11.5, 0, [4.8, 4.2]),
  prop("pottery-house", "buildings", "blacksmith_workshop", 39, 33, 10.5, -Math.PI / 2, [4.4, 3.8]),
  prop("cattle-shed", "buildings", "cattle_shed", -50, 52, 12, Math.PI / 2, [5.3, 4.2]),
  prop("chicken-coop", "buildings", "chicken_coop", 49, 52, 9, -Math.PI / 2, [3.8, 3.5]),
  prop("harvest-storage", "buildings", "harvest_storage", -44, 69, 12, Math.PI / 2, [5.1, 4.4]),
  prop("rice-barn", "buildings", "rice_barn", 43, 68, 10.5, -Math.PI / 2, [4.4, 4.2]),
  prop("guard-post", "buildings", "village_gate_guard_post", 0, 98, 14, Math.PI, [6, 4.8]),
  prop("guard-house", "buildings", "village_guard_house", 18, 99, 11, Math.PI, [4.6, 4.2]),
];

export const FARM_PROPS: MapProp[] = [
  prop("field-a", "agriculture", "rice_field", -29, 49, 15), prop("field-b", "agriculture", "rice_field", -13, 49, 15),
  prop("field-c", "agriculture", "rice_field", 12, 49, 15), prop("field-d", "agriculture", "rice_field", 29, 49, 15),
  prop("field-e", "agriculture", "rice_field", -29, 64, 15, Math.PI), prop("field-f", "agriculture", "vegetable_garden", -13, 64, 14),
  prop("field-g", "agriculture", "grain_corn_field", 12, 64, 14), prop("field-h", "agriculture", "rice_field", 29, 64, 15, Math.PI),
  prop("orchard", "agriculture", "fruit_orchard", 52, 66, 14, Math.PI / 2, [5.5, 4.2]),
  prop("granary", "agriculture", "small_granary", 0, 69, 9, Math.PI, [3.7, 3.2]),
  prop("hay-a", "agriculture", "haystack", -37, 59, 5.5, 0, [1.7, 1.7]), prop("hay-b", "agriculture", "haystack", 38, 59, 5, 1, [1.6, 1.6]),
  prop("drying-rack", "agriculture", "crop_drying_rack", -38, 43, 9, .4, [3.5, 2.6]),
  prop("cart", "agriculture", "wooden_cart", 37, 42, 8, -.5, [2.8, 2]),
  prop("plow", "agriculture", "rice_field_plow", 7, 57, 5.5, .3), prop("sacks", "agriculture", "rice_sacks", -6, 70, 4),
  prop("basket-a", "agriculture", "bamboo_basket", -29, 39, 2.5, .4), prop("basket-b", "agriculture", "bamboo_basket", 31, 39, 2.4, -.6),
];

export const INFRASTRUCTURE_PROPS: MapProp[] = [
  prop("village-well", "infrastructure", "stone_well", -7, -8, 8, 0, [2.8, 2.6]),
  prop("fish-pond", "infrastructure", "fish_pond", 48, 13, 12, Math.PI / 2),
  prop("irrigation-a", "infrastructure", "rice_field_irrigation", -21, 57, 12),
  prop("irrigation-b", "infrastructure", "rice_field_irrigation", 21, 57, 12, Math.PI),
  prop("dam", "infrastructure", "small_dam", -50, 82, 11, Math.PI / 2, [4.4, 2.2]),
  prop("dock", "infrastructure", "small_river_dock", 50, 76, 11, Math.PI / 2, [4, 2.2]),
  prop("water-place", "infrastructure", "water_fetching_place", -30, 76, 9, 0, [3.2, 2.3]),
  prop("stepping-stones", "infrastructure", "river_stepping_stones", -21, 82, 10, Math.PI / 2),
  prop("bridge-main", "infrastructure", "wooden_bridge", 0, 82, 12, 0),
  prop("bridge-east", "infrastructure", "wooden_bridge", 35, 82, 12, 0),
];

const EDGE_TREE_SITES: [number, number][] = [];
for (let z = -105; z <= 108; z += 13) { EDGE_TREE_SITES.push([-58 + (z % 3), z], [58 - (z % 4), z + 5]); }
for (let x = -52; x <= 52; x += 11) { EDGE_TREE_SITES.push([x, -104 + Math.abs(x % 7)], [x + 4, 108 - Math.abs(x % 6)]); }
const FOREST_TREE_SITES: [number, number][] = [
  [-46,-94],[-34,-101],[-22,-91],[-8,-99],[13,-93],[27,-102],[42,-91],[51,-78],[-48,-78],[-37,-84],[-24,-76],[26,-81],[39,-76],
  [-49,101],[-37,108],[-24,99],[-10,106],[10,100],[27,108],[42,101],[53,91],[-51,91],[-35,94],[34,92]
];

export const NATURE_PROPS: MapProp[] = [
  ...[...EDGE_TREE_SITES, ...FOREST_TREE_SITES].map(([x, z], index) => prop(`tree-${index}`, "nature", index % 6 === 0 ? "bamboo_tree" : "large_tree", x, z, index % 6 === 0 ? 6.8 : 8.4 + (index % 4), index * 1.71, [1.1, 1.1])),
  prop("bamboo-grove-n", "agriculture", "bamboo_grove", -47, -87, 10, .2, [3.4, 3.4]), prop("bamboo-grove-s", "agriculture", "bamboo_grove", 47, 102, 10, -.5, [3.4, 3.4]),
  prop("coconut-a", "agriculture", "coconut_tree", 52, 72, 8, .2, [1.2, 1.2]), prop("coconut-b", "agriculture", "coconut_tree", -54, 70, 8.5, 1.5, [1.2, 1.2]),
  prop("north-cliff", "nature", "dirt_cliff", -42, -105, 13, .4, [4.8, 3.2]), prop("south-hill", "nature", "hill", 42, 108, 14, -.3, [5.2, 4.3]),
  prop("waterfall", "nature", "small_waterfall", 54, -96, 11, .3, [3.5, 2.8]), prop("stream", "nature", "small_stream", 43, -88, 13, .8),
  prop("fallen-log-n", "nature", "fallen_log", -28, -88, 6, .4, [2.4, 1.1]), prop("fallen-log-s", "nature", "fallen_log", 29, 100, 6, -.7, [2.4, 1.1]),
  prop("boulder-n", "nature", "large_boulder", 18, -101, 5, .3, [1.7, 1.7]), prop("boulder-s", "nature", "large_boulder", -18, 103, 5, .6, [1.7, 1.7]),
  ...[[-40,-80],[-15,-89],[34,-92],[48,-73],[-45,92],[-22,96],[19,104],[43,92]].map(([x,z], index) => prop(`bush-${index}`, "nature", "bush", x, z, 4.2, index)),
  ...[[-33,-95],[-5,-91],[29,-88],[-39,99],[4,106],[35,103]].map(([x,z], index) => prop(`grass-${index}`, "nature", index % 2 ? "wildflowers" : "tall_grass", x, z, 3.8, index)),
  prop("mushrooms", "nature", "mushrooms", -12, -98, 3.5, .2), prop("rocks", "nature", "field_rocks", 8, -88, 4.5, .8), prop("branch", "nature", "fallen_branch", 38, 105, 4.5, -.4),
];

export const WORLD_PROPS = [...BUILDING_PROPS, ...FARM_PROPS, ...INFRASTRUCTURE_PROPS, ...NATURE_PROPS];
export const COLLIDABLE_PROPS = WORLD_PROPS.filter((item): item is MapProp & { collider: [number, number] } => Boolean(item.collider));
