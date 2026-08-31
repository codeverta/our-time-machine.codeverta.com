import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { WORLD_PROPS, type MapProp } from "./map-layout";
import { fitModelToSize } from "./three-utils";

type SourceState = { source?: THREE.Group; loading: boolean; failed: boolean };
type RuntimeProp = { placement: MapProp; model?: THREE.Group };

function visibleDistance(path: string) {
  if (path.includes("/environments/")) return 145;
  if (path.includes("/buildings/")) return 82;
  if (path.includes("/infrastructure/")) return 68;
  if (path.includes("/agriculture/") && !path.includes("tree") && !path.includes("grove")) return 62;
  if (/large_tree|bamboo_tree|coconut_tree|bamboo_grove|dirt_cliff|hill|waterfall/.test(path)) return 54;
  return 38;
}

function groundSink(path: string, size: number) {
  if (path.includes("/environments/")) return Math.min(.72, Math.max(.5, size * .022));
  if (path.includes("/buildings/")) return Math.min(.72, Math.max(.44, size * .045));
  if (/large_tree|bamboo_tree|coconut_tree|bamboo_grove/.test(path)) return Math.min(.62, Math.max(.34, size * .055));
  if (/wildflowers|tall_grass|bush|mushrooms|dry_leaves/.test(path)) return Math.min(.25, Math.max(.14, size * .045));
  if (/field_rocks|large_boulder|fallen_log|fallen_branch/.test(path)) return Math.min(.38, Math.max(.22, size * .06));
  if (/fruit_orchard/.test(path)) return .28;
  if (/rice_field|vegetable_garden|grain_corn_field/.test(path)) return .18;
  if (/stone_well/.test(path)) return .42;
  if (/wooden_bridge/.test(path)) return .4;
  if (/small_dam|small_river_dock|water_fetching_place/.test(path)) return .34;
  if (/fish_pond|rice_field_irrigation|river_stepping_stones|village_drain/.test(path)) return .2;
  if (/small_stream|dirt_road|stone_road|small_ditch/.test(path)) return .12;
  if (/small_granary/.test(path)) return .36;
  if (/crop_drying_rack|wooden_cart|rice_field_plow|haystack/.test(path)) return .22;
  if (/bamboo_basket|farming_hoe|rice_sacks/.test(path)) return .14;
  if (path.includes("/infrastructure/")) return .22;
  if (path.includes("/agriculture/")) return .18;
  if (path.includes("/nature/")) return .2;
  return .12;
}

export function createWorldPropStreamer(scene: THREE.Scene, isDisposed: () => boolean, onStaticChange: () => void, onInitialProgress?: (progress: number) => void) {
  const root = new THREE.Group();
  root.name = "majapahit-streamed-props";
  scene.add(root);

  const loader = new GLTFLoader();
  const sources = new Map<string, SourceState>();
  const props: RuntimeProp[] = WORLD_PROPS.map(placement => ({ placement }));
  const initialProps = props.filter(({ placement }) => placement.x ** 2 + (placement.z - 6) ** 2 < 58 ** 2);
  const paths = [...new Set(WORLD_PROPS.map(item => item.path))];
  paths.forEach(path => sources.set(path, { loading: false, failed: false }));
  let loadingCount = 0;

  const loadSource = (path: string) => {
    const state = sources.get(path);
    if (!state || state.loading || state.source || state.failed || loadingCount >= 2) return;
    state.loading = true;
    loadingCount += 1;
    loader.load(path, gltf => {
      loadingCount -= 1;
      state.loading = false;
      if (isDisposed()) return;
      state.source = gltf.scene;
    }, undefined, error => {
      loadingCount -= 1;
      state.loading = false;
      state.failed = true;
      console.warn(`World asset gagal dimuat: ${path}`, error);
    });
  };

  const instantiate = (runtime: RuntimeProp) => {
    const source = sources.get(runtime.placement.path)?.source;
    if (!source || runtime.model) return;
    const normalized = source.clone(true);
    fitModelToSize(normalized, runtime.placement.size);
    const holder = new THREE.Group();
    holder.add(normalized);
    holder.position.set(runtime.placement.x, -groundSink(runtime.placement.path, runtime.placement.size), runtime.placement.z);
    holder.rotation.y = runtime.placement.rotation || 0;
    holder.name = runtime.placement.id;
    holder.userData.maxDistanceSq = visibleDistance(runtime.placement.path) ** 2;
    const castsShadow = runtime.placement.path.includes("/buildings/") || runtime.placement.path.includes("/environments/");
    holder.traverse(object => {
      if (object instanceof THREE.Mesh) {
        object.castShadow = castsShadow;
        object.receiveShadow = castsShadow || runtime.placement.size > 8;
      }
    });
    root.add(holder);
    runtime.model = holder;
    onStaticChange();
    const initialLoaded = initialProps.filter(item => Boolean(item.model)).length;
    onInitialProgress?.(initialProps.length ? initialLoaded / initialProps.length : 1);
  };

  return {
    root,
    update(playerPosition: THREE.Vector3) {
      props.forEach(runtime => {
        if (!runtime.model) return;
        const dx = playerPosition.x - runtime.placement.x;
        const dz = playerPosition.z - runtime.placement.z;
        runtime.model.visible = dx * dx + dz * dz <= runtime.model.userData.maxDistanceSq;
      });

      const waiting = props
        .filter(runtime => !runtime.model)
        .map(runtime => ({ runtime, distanceSq: (playerPosition.x - runtime.placement.x) ** 2 + (playerPosition.z - runtime.placement.z) ** 2 }))
        .filter(item => item.distanceSq < (visibleDistance(item.runtime.placement.path) + 18) ** 2)
        .sort((a, b) => a.distanceSq - b.distanceSq);

      const neededPaths = [...new Set(waiting.map(item => item.runtime.placement.path))];
      for (const path of neededPaths) {
        if (loadingCount >= 2) break;
        loadSource(path);
      }

      let created = 0;
      for (const item of waiting) {
        if (created >= 3) break;
        if (sources.get(item.runtime.placement.path)?.source) {
          instantiate(item.runtime);
          created += 1;
        }
      }
    },
  };
}
