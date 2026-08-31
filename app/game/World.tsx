"use client";

import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { useEffect, useRef } from "react";
import { ANOMALIES, CHARACTERS, DISCOVERIES, NPCS } from "./data";
import { createWorldPropStreamer } from "./map-assets";
import { CANAL, COLLIDABLE_PROPS, MAP_BOUNDS, RIVER } from "./map-layout";
import type { CharacterChoice, DebugSettings, Discovery, NearTarget, NpcDefinition, SceneAsset } from "./types";
import { addGate, addTimeRift, createPerson, fitModel, fitModelToSize } from "./three-utils";

type WorldProps = {
  character: CharacterChoice;
  onNear: (target: NearTarget) => void;
  onTalk: (npc: NpcDefinition) => void;
  onDiscover: (discovery: Discovery) => void;
  onCollectRelic: (asset: SceneAsset) => void;
  onPortal: () => void;
  onHeading: (degrees: number) => void;
  onLoadProgress: (progress: number, status: string) => void;
  onReady: () => void;
  collectedRelicIds: string[];
  debug: DebugSettings;
};

const PLAYER_RADIUS = .48;

function hitsBox(x: number, z: number, centerX: number, centerZ: number, halfX: number, halfZ: number) {
  return Math.abs(x - centerX) < halfX + PLAYER_RADIUS && Math.abs(z - centerZ) < halfZ + PLAYER_RADIUS;
}

function positionBlocked(x: number, z: number) {
  if (x < MAP_BOUNDS.minX || x > MAP_BOUNDS.maxX || z < MAP_BOUNDS.minZ || z > MAP_BOUNDS.maxZ) return true;
  if (COLLIDABLE_PROPS.some(item => hitsBox(x, z, item.x, item.z, item.collider[0], item.collider[1]))) return true;
  if (hitsBox(x, z, -3.3, -36, 1.35, 1.25) || hitsBox(x, z, 3.3, -36, 1.35, 1.25)) return true;
  const onCanalBridge = CANAL.bridges.some(bridgeZ => Math.abs(z - bridgeZ) < 2.6);
  if (!onCanalBridge && hitsBox(x, z, CANAL.x, CANAL.z, CANAL.halfWidth, CANAL.halfDepth)) return true;
  const onRiverBridge = RIVER.bridges.some(bridgeX => Math.abs(x - bridgeX) < 3.2);
  if (!onRiverBridge && hitsBox(x, z, RIVER.x, RIVER.z, RIVER.halfWidth, RIVER.halfDepth)) return true;
  if (Math.hypot(x, z - 20) < 1.75 + PLAYER_RADIUS) return true;
  if (NPCS.some(npc => Math.hypot(x - npc.x, z - npc.z) < .6 + PLAYER_RADIUS)) return true;
  return false;
}

export default function World({ character, onNear, onTalk, onDiscover, onCollectRelic, onPortal, onHeading, onLoadProgress, onReady, collectedRelicIds, debug }: WorldProps) {
  const mount = useRef<HTMLDivElement>(null);
  const callbacks = useRef({ onNear, onTalk, onDiscover, onCollectRelic, onPortal, onHeading, onLoadProgress, onReady });
  const debugRef = useRef(debug);
  useEffect(() => { callbacks.current = { onNear, onTalk, onDiscover, onCollectRelic, onPortal, onHeading, onLoadProgress, onReady }; }, [onNear, onTalk, onDiscover, onCollectRelic, onPortal, onHeading, onLoadProgress, onReady]);
  useEffect(() => { debugRef.current = debug; }, [debug]);

  useEffect(() => {
    const element = mount.current; if (!element) return; let disposed = false;
    const scene = new THREE.Scene(); scene.background = new THREE.Color(0x69a8a0); scene.fog = new THREE.FogExp2(0x8eb5a0, .0065);
    const camera = new THREE.PerspectiveCamera(58, element.clientWidth / element.clientHeight, .1, 360); camera.position.set(0, 5.3, 14.5); camera.up.set(0, 1, 0);
    const deviceMemory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory || 8;
    const lowPower = navigator.hardwareConcurrency <= 4 || deviceMemory <= 4;
    const maxRenderDpr = Math.min(devicePixelRatio, lowPower ? .9 : 1.2);
    let renderDpr = maxRenderDpr;
    const renderer = new THREE.WebGLRenderer({ antialias: !lowPower && devicePixelRatio <= 1.5, powerPreference: "high-performance", alpha: false }); renderer.setPixelRatio(renderDpr); renderer.setSize(element.clientWidth, element.clientHeight); renderer.shadowMap.enabled = !lowPower; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.shadowMap.autoUpdate = false; renderer.outputColorSpace = THREE.SRGBColorSpace; element.appendChild(renderer.domElement);
    scene.add(new THREE.HemisphereLight(0xffe6bd, 0x28462e, 2.1)); const sun = new THREE.DirectionalLight(0xffd79a, 3.2); sun.position.set(-28, 45, 24); sun.castShadow = !lowPower; sun.shadow.mapSize.set(1024, 1024); sun.shadow.camera.left = -80; sun.shadow.camera.right = 80; sun.shadow.camera.top = 125; sun.shadow.camera.bottom = -125; sun.shadow.camera.far = 190; sun.shadow.normalBias = .035; scene.add(sun);

    let characterReady = false; let initialWorldProgress = 0; let firstFrameReady = false; let readySent = false;
    const publishLoad = () => {
      const progress = 18 + (characterReady ? 42 : 0) + initialWorldProgress * 35 + (firstFrameReady ? 5 : 0);
      const status = !characterReady ? "Memuat karakter terpilih…" : initialWorldProgress < 1 ? "Membangun lingkungan kedatangan…" : "Menstabilkan kamera…";
      callbacks.current.onLoadProgress(Math.min(progress, 100), status);
      if (!readySent && characterReady && initialWorldProgress >= 1 && firstFrameReady) { readySent = true; callbacks.current.onLoadProgress(100, "Lorong waktu siap"); callbacks.current.onReady(); }
    };
    callbacks.current.onLoadProgress(8, "Membuka lorong waktu…");
    const readinessTimeout = window.setTimeout(() => { initialWorldProgress = 1; publishLoad(); }, 12000);

    const ground = new THREE.Mesh(new THREE.PlaneGeometry(140, 240, 1, 1), new THREE.MeshStandardMaterial({ color: 0x5c7435, roughness: 1, side: THREE.DoubleSide })); ground.rotation.x = -Math.PI / 2; ground.position.y = -.025; ground.receiveShadow = renderer.shadowMap.enabled; ground.frustumCulled = false; scene.add(ground); if (renderer.shadowMap.enabled) renderer.shadowMap.needsUpdate = true;
    const pathMaterial = new THREE.MeshStandardMaterial({ color: 0x9b7550, roughness: 1 });
    const addPath = (width: number, depth: number, x: number, z: number) => { const path = new THREE.Mesh(new THREE.PlaneGeometry(width, depth), pathMaterial); path.rotation.x = -Math.PI / 2; path.position.set(x, .012, z); path.receiveShadow = true; scene.add(path); };
    addPath(5.5, 224, 0, 0); addPath(104, 4.5, 0, -8); addPath(104, 3, 0, 34); [43, 57, 71].forEach(z => addPath(100, 2.2, 0, z));
    const waterMaterial = new THREE.MeshStandardMaterial({ color: 0x2d8881, roughness: .2, metalness: .1, transparent: true, opacity: .84 });
    const canal = new THREE.Mesh(new THREE.PlaneGeometry(CANAL.halfWidth * 2, CANAL.halfDepth * 2), waterMaterial); canal.rotation.x = -Math.PI / 2; canal.position.set(CANAL.x, .02, CANAL.z); scene.add(canal);
    const river = new THREE.Mesh(new THREE.PlaneGeometry(RIVER.halfWidth * 2, RIVER.halfDepth * 2), waterMaterial); river.rotation.x = -Math.PI / 2; river.position.set(RIVER.x, .025, RIVER.z); scene.add(river);
    CANAL.bridges.forEach(bridgeZ => { const bridge = new THREE.Mesh(new THREE.BoxGeometry(10, .18, 5), new THREE.MeshStandardMaterial({ color: 0x7a4a2d, roughness: .88 })); bridge.position.set(CANAL.x, .1, bridgeZ); bridge.castShadow = true; bridge.receiveShadow = true; scene.add(bridge); });
    const worldStreamer = createWorldPropStreamer(scene, () => disposed, () => { if (renderer.shadowMap.enabled) renderer.shadowMap.needsUpdate = true; }, progress => { initialWorldProgress = progress; publishLoad(); });
    addGate(scene, -36); const rift = addTimeRift(scene, 20);

    const colliderHelpers = new THREE.Group(); const colliderMaterial = new THREE.MeshBasicMaterial({ color: 0xff3f70, wireframe: true, transparent: true, opacity: .7 });
    const addBoxHelper = (x: number, z: number, width: number, depth: number, height = 3) => { const helper = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), colliderMaterial); helper.position.set(x, height / 2, z); colliderHelpers.add(helper); };
    COLLIDABLE_PROPS.forEach(item => addBoxHelper(item.x, item.z, item.collider[0] * 2 + PLAYER_RADIUS * 2, item.collider[1] * 2 + PLAYER_RADIUS * 2, item.size * .5)); addBoxHelper(-3.3, -36, 3.66, 3.46, 6); addBoxHelper(3.3, -36, 3.66, 3.46, 6); addBoxHelper(CANAL.x, CANAL.z, CANAL.halfWidth * 2, CANAL.halfDepth * 2, .2); addBoxHelper(RIVER.x, RIVER.z, RIVER.halfWidth * 2, RIVER.halfDepth * 2, .2);
    NPCS.forEach(npc => { const helper = new THREE.Mesh(new THREE.CylinderGeometry(1.08, 1.08, 2.2, 12), colliderMaterial); helper.position.set(npc.x, 1.1, npc.z); colliderHelpers.add(helper); }); const portalHelper = new THREE.Mesh(new THREE.CylinderGeometry(2.23, 2.23, 3, 20), colliderMaterial); portalHelper.position.set(0, 1.5, 20); colliderHelpers.add(portalHelper); colliderHelpers.visible = false; scene.add(colliderHelpers);

    const discoveryMarkers = new Map<string, THREE.Group>(); DISCOVERIES.forEach((discovery, index) => { const marker = new THREE.Group(); const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(.46, .58, .14, 12), new THREE.MeshStandardMaterial({ color: 0x70402d, roughness: .86 })); pedestal.position.y = .07; const fallback = new THREE.Mesh(index === 0 ? new THREE.SphereGeometry(.32, 14, 10) : index === 1 ? new THREE.BoxGeometry(.6, .22, .6) : new THREE.BoxGeometry(.5, .7, .25), new THREE.MeshStandardMaterial({ color: 0xe8bb5c, emissive: 0x51370b, emissiveIntensity: .45 })); fallback.position.y = .62; const ring = new THREE.Mesh(new THREE.TorusGeometry(.6, .025, 6, 26), new THREE.MeshBasicMaterial({ color: 0xffda78 })); ring.position.y = .12; ring.rotation.x = Math.PI / 2; marker.add(pedestal, fallback, ring); marker.position.set(discovery.x, 0, discovery.z); scene.add(marker); discoveryMarkers.set(discovery.id, marker); if (discovery.modelPath) new GLTFLoader().load(discovery.modelPath, gltf => { if (disposed) return; const model = gltf.scene; fitModelToSize(model, discovery.modelSize || .6); model.position.y += .16; model.traverse(object => { if (object instanceof THREE.Mesh) { object.castShadow = true; object.receiveShadow = true; } }); marker.remove(fallback); marker.add(model); }); });

    const assetModels = new Map<string, THREE.Group>(); const animatedAssets: THREE.Group[] = [];
    ANOMALIES.forEach((asset, index) => {
      const holder = new THREE.Group(); holder.name = `asset-${asset.id}`; holder.position.set(asset.x, 0, asset.z); holder.userData.baseY = 0; holder.userData.phase = index * .73; holder.userData.kind = asset.kind;
      const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(asset.kind === "anomaly" ? .58 : .45, asset.kind === "anomaly" ? .72 : .56, .16, 12), new THREE.MeshStandardMaterial({ color: asset.kind === "anomaly" ? 0x214d46 : 0x71412f, roughness: .8, emissive: asset.kind === "anomaly" ? 0x163f39 : 0x000000, emissiveIntensity: .7 })); pedestal.position.y = .08; holder.add(pedestal);
      const fallback = new THREE.Mesh(new THREE.OctahedronGeometry(.32), new THREE.MeshStandardMaterial({ color: asset.kind === "anomaly" ? 0x75ddd0 : 0xd5aa59, emissive: asset.kind === "anomaly" ? 0x2b8b80 : 0x5f3d12, emissiveIntensity: 1 })); fallback.position.y = .65; holder.add(fallback);
      if (asset.kind === "anomaly") { const halo = new THREE.Mesh(new THREE.TorusGeometry(.75, .025, 8, 32), new THREE.MeshBasicMaterial({ color: 0x7df4e6 })); halo.rotation.x = Math.PI / 2; halo.position.y = .18; holder.add(halo); animatedAssets.push(holder); }
      holder.visible = !collectedRelicIds.includes(asset.id); scene.add(holder); assetModels.set(asset.id, holder);
      new GLTFLoader().load(asset.path, gltf => { if (disposed) return; const model = gltf.scene; fitModelToSize(model, asset.size); model.position.y += .18; model.traverse(object => { if (object instanceof THREE.Mesh) { object.castShadow = true; object.receiveShadow = true; } }); holder.remove(fallback); holder.add(model); });
    });

    const colors = [0x8a3e29, 0x224f56, 0x6c3d76, 0x3d6134]; const colorIndex = CHARACTERS.findIndex(item => item.id === character.id) % colors.length;
    const player = new THREE.Group(); const fallbackPlayer = createPerson(colors[Math.max(0, colorIndex)], 0xb87850); player.add(fallbackPlayer); player.position.set(0, 0, 6); player.visible = false; scene.add(player);
    let mixer: THREE.AnimationMixer | null = null; let playerModel: THREE.Object3D | null = null; let modelRightArm: THREE.Object3D | null = null; const actions = new Map<string, THREE.AnimationAction>(); let currentAction: THREE.AnimationAction | null = null; let currentAnimation = "";
    const playAnimation = (name: string) => { if (!mixer || currentAnimation === name) return; const next = actions.get(name) || actions.get("idle") || actions.values().next().value; if (!next) return; next.reset().fadeIn(.18).play(); if (currentAction && currentAction !== next) currentAction.fadeOut(.18); currentAction = next; currentAnimation = name; };
    new GLTFLoader().load(character.path, gltf => { if (disposed) return; playerModel = gltf.scene; playerModel.traverse(object => { if (object instanceof THREE.Mesh) { object.castShadow = false; object.receiveShadow = false; object.frustumCulled = false; } if (object.name.toLowerCase().includes("rightarm")) modelRightArm = object; }); fitModel(playerModel, 2.15); player.remove(fallbackPlayer); player.add(playerModel); player.visible = true; characterReady = true; if (gltf.animations.length) { mixer = new THREE.AnimationMixer(playerModel); gltf.animations.forEach(clip => actions.set(clip.name, mixer!.clipAction(clip))); playAnimation("idle"); } publishLoad(); }, undefined, () => { if (disposed) return; player.visible = true; characterReady = true; publishLoad(); });

    const npcModels = new Map<string, THREE.Group>(); const npcMixers: THREE.AnimationMixer[] = [];
    NPCS.forEach((npc, index) => { const holder = new THREE.Group(); holder.position.set(npc.x, 0, npc.z); holder.rotation.y = npc.rotation; const fallback = createPerson(index ? 0x3c626b : 0x6f2a25, index ? 0xb97b58 : 0xa76342, 1.05); holder.add(fallback); const halo = new THREE.Mesh(new THREE.TorusGeometry(.58, .035, 8, 32), new THREE.MeshBasicMaterial({ color: index ? 0x78d3c2 : 0xf1c972 })); halo.rotation.x = Math.PI / 2; halo.position.y = .06; holder.add(halo); scene.add(holder); npcModels.set(npc.id, holder); new GLTFLoader().load(npc.path, gltf => { if (disposed) return; const model = gltf.scene; fitModel(model, 2.15); model.traverse(object => { if (object instanceof THREE.Mesh) { object.castShadow = false; object.receiveShadow = false; } }); holder.remove(fallback); holder.add(model); const idle = gltf.animations.find(clip => clip.name === "idle") || gltf.animations[0]; if (idle) { const npcMixer = new THREE.AnimationMixer(model); npcMixer.clipAction(idle).play(); npcMixers.push(npcMixer); } }); });

    const armL = fallbackPlayer.getObjectByName("armL") as THREE.Mesh; const armR = fallbackPlayer.getObjectByName("armR") as THREE.Mesh; const legL = fallbackPlayer.getObjectByName("legL") as THREE.Mesh; const legR = fallbackPlayer.getObjectByName("legR") as THREE.Mesh;
    const keys = new Set<string>(); let near: NearTarget = { type: null }; let bob = 0; let jumpY = 0; let jumpVelocity = 0; let cameraYaw = 0; let cameraHeight = 5.3; let actionUntil = 0; let lastHeading = -1; let lastHeadingUpdate = 0; let lastDebugCommand = 0;
    const interact = () => { if (near.type === "npc") { const npc = NPCS.find(item => item.id === near.id); if (npc) callbacks.current.onTalk(npc); } if (near.type === "object") { const discovery = DISCOVERIES.find(item => item.id === near.id); if (discovery) { callbacks.current.onDiscover(discovery); const marker = discoveryMarkers.get(discovery.id); if (marker) marker.visible = false; } } if (near.type === "relic") { const asset = ANOMALIES.find(item => item.id === near.id); const model = asset && assetModels.get(asset.id); if (asset && model?.visible) { model.visible = false; callbacks.current.onCollectRelic(asset); near = { type: null }; callbacks.current.onNear(near); } } if (near.type === "portal") callbacks.current.onPortal(); };
    const down = (event: KeyboardEvent) => { const key = event.key.toLowerCase(); if ([" ", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(key)) event.preventDefault(); keys.add(key); if (key === " " && !event.repeat && jumpY === 0) jumpVelocity = 7.2; if (key === "f" && !event.repeat) actionUntil = performance.now() + 900; if (key === "e" && !event.repeat) interact(); };
    const up = (event: KeyboardEvent) => keys.delete(event.key.toLowerCase()); window.addEventListener("keydown", down); window.addEventListener("keyup", up);

    worldStreamer.update(player.position);
    const cameraDestination = new THREE.Vector3(); let tickCount = 0; let performanceFrames = 0; let performanceWindow = performance.now(); let lastDprChange = 0;
    let frame = 0; const clock = new THREE.Clock(); const tick = () => {
      tickCount += 1;
      const delta = Math.min(clock.getDelta(), .04); if (keys.has("arrowleft")) cameraYaw -= delta * 1.75; if (keys.has("arrowright")) cameraYaw += delta * 1.75; if (keys.has("arrowup")) cameraHeight = Math.min(8.2, cameraHeight + delta * 3.4); if (keys.has("arrowdown")) cameraHeight = Math.max(3.1, cameraHeight - delta * 3.4);
      const debugState = debugRef.current; colliderHelpers.visible = debugState.showColliders; const command = debugState.command; if (command && command.nonce !== lastDebugCommand) { lastDebugCommand = command.nonce; if (command.type === "teleport" && command.x !== undefined && command.z !== undefined) player.position.set(command.x, 0, command.z); if (command.type === "hide-relic" && command.targetId) { const relic = assetModels.get(command.targetId); if (relic) relic.visible = false; } }
      let inputX = 0, inputZ = 0; if (keys.has("w")) inputZ -= 1; if (keys.has("s")) inputZ += 1; if (keys.has("a")) inputX -= 1; if (keys.has("d")) inputX += 1; const moving = Boolean(inputX || inputZ); const speed = (keys.has("shift") ? 7 : 4.5) * debugState.speedMultiplier;
      if (moving) { const length = Math.hypot(inputX, inputZ); inputX /= length; inputZ /= length; const dx = inputX * Math.cos(cameraYaw) + inputZ * Math.sin(cameraYaw); const dz = -inputX * Math.sin(cameraYaw) + inputZ * Math.cos(cameraYaw); const nextX = player.position.x + dx * delta * speed; const nextZ = player.position.z + dz * delta * speed; if (debugState.noclip || !positionBlocked(nextX, player.position.z)) player.position.x = nextX; if (debugState.noclip || !positionBlocked(player.position.x, nextZ)) player.position.z = nextZ; player.rotation.y = Math.atan2(dx, dz); bob += delta * (speed > 5 ? 15 : 10); }
      if (jumpVelocity !== 0 || jumpY > 0) { jumpVelocity -= 18 * delta; jumpY = Math.max(0, jumpY + jumpVelocity * delta); if (jumpY === 0) jumpVelocity = 0; } const grounded = jumpY === 0; const walkBob = moving && grounded ? Math.abs(Math.sin(bob)) * .08 : 0; player.position.y = jumpY + walkBob;
      const swing = moving && grounded ? Math.sin(bob) * .58 : 0; armL.rotation.x = THREE.MathUtils.lerp(armL.rotation.x, swing, .24); armR.rotation.x = THREE.MathUtils.lerp(armR.rotation.x, -swing, .24); legL.rotation.x = THREE.MathUtils.lerp(legL.rotation.x, -swing * .8, .24); legR.rotation.x = THREE.MathUtils.lerp(legR.rotation.x, swing * .8, .24); const acting = performance.now() < actionUntil; if (acting) { armR.rotation.x = -1.2; armR.rotation.z = -1.65 + Math.sin(performance.now() * .02) * .18; } else armR.rotation.z = THREE.MathUtils.lerp(armR.rotation.z, .15, .18);
      playAnimation(acting ? "emote-yes" : !grounded ? (jumpVelocity >= 0 ? "jump" : "fall") : moving ? (speed > 5 ? "sprint" : "walk") : "idle"); mixer?.update(delta); npcMixers.forEach(npcMixer => npcMixer.update(delta)); if (modelRightArm && actions.size === 1 && acting) modelRightArm.rotation.z = -.8 + Math.sin(performance.now() * .02) * .12;
      if (tickCount % 8 === 0) worldStreamer.update(player.position);
      const radius = 8.5; cameraDestination.set(player.position.x + Math.sin(cameraYaw) * radius, player.position.y + cameraHeight, player.position.z + Math.cos(cameraYaw) * radius); camera.position.lerp(cameraDestination, .1); camera.lookAt(player.position.x, player.position.y + 1.15, player.position.z);
      const heading = ((THREE.MathUtils.radToDeg(-cameraYaw) % 360) + 360) % 360; const now = performance.now(); if (now - lastHeadingUpdate > 50 && Math.abs(heading - lastHeading) > .5) { lastHeading = heading; lastHeadingUpdate = now; callbacks.current.onHeading(heading); }
      let next: NearTarget = { type: null }; for (const npc of NPCS) { const model = npcModels.get(npc.id); if (model && player.position.distanceTo(model.position) < 2.8) { next = { type: "npc", id: npc.id }; break; } } if (!next.type) { for (const discovery of DISCOVERIES) { const marker = discoveryMarkers.get(discovery.id); if (marker?.visible && player.position.distanceTo(marker.position) < 2.2) { next = { type: "object", id: discovery.id }; break; } } if (!next.type) { for (const anomaly of ANOMALIES) { const model = assetModels.get(anomaly.id); if (model?.visible && player.position.distanceTo(model.position) < 2.4) { next = { type: "relic", id: anomaly.id }; break; } } } if (!next.type && player.position.distanceTo(rift.portal.position) < 2.5) next = { type: "portal" }; }
      if (next.type !== near.type || next.id !== near.id) { near = next; callbacks.current.onNear(next); }
      const time = performance.now() * .001; discoveryMarkers.forEach(marker => { marker.rotation.y += .012; marker.position.y = Math.sin(time * 2 + marker.position.x) * .08; }); animatedAssets.forEach(holder => { if (!holder.visible) return; holder.rotation.y += .014; holder.position.y = Math.sin(time * 2.1 + holder.userData.phase) * .12; }); rift.outer.rotation.z += .008; rift.inner.material.opacity = .22 + Math.sin(time * 2.4) * .08;
      performanceFrames += 1; const elapsed = now - performanceWindow; if (elapsed > 2500) { const fps = performanceFrames * 1000 / elapsed; if (now - lastDprChange > 4000) { const nextDpr = fps < 44 ? Math.max(.65, renderDpr - .1) : fps > 57 ? Math.min(maxRenderDpr, renderDpr + .05) : renderDpr; if (Math.abs(nextDpr - renderDpr) > .01) { renderDpr = nextDpr; renderer.setPixelRatio(renderDpr); renderer.setSize(element.clientWidth, element.clientHeight, false); lastDprChange = now; } } performanceFrames = 0; performanceWindow = now; }
      renderer.render(scene, camera); if (!firstFrameReady) { firstFrameReady = true; publishLoad(); } frame = requestAnimationFrame(tick);
    }; tick();
    const resize = () => { camera.aspect = element.clientWidth / element.clientHeight; camera.updateProjectionMatrix(); renderer.setSize(element.clientWidth, element.clientHeight); }; window.addEventListener("resize", resize);
    return () => { disposed = true; window.clearTimeout(readinessTimeout); cancelAnimationFrame(frame); window.removeEventListener("resize", resize); window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); mixer?.stopAllAction(); npcMixers.forEach(npcMixer => npcMixer.stopAllAction()); renderer.dispose(); if (renderer.domElement.parentElement === element) element.removeChild(renderer.domElement); };
  }, [character]);
  return <div className="world3d" ref={mount} />;
}
