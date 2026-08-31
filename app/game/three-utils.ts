import * as THREE from "three";

export function fitModel(model: THREE.Object3D, targetHeight: number) {
  model.updateMatrixWorld(true);
  const initial = new THREE.Box3().setFromObject(model);
  const size = initial.getSize(new THREE.Vector3());
  model.scale.setScalar(targetHeight / Math.max(size.y, .001));
  model.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  model.position.set(-center.x, -box.min.y, -center.z);
}

export function fitModelToSize(model: THREE.Object3D, targetSize: number) {
  model.updateMatrixWorld(true);
  const initial = new THREE.Box3().setFromObject(model);
  const size = initial.getSize(new THREE.Vector3());
  model.scale.setScalar(targetSize / Math.max(size.x, size.y, size.z, .001));
  model.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  model.position.set(-center.x, -box.min.y, -center.z);
}

export function createPerson(color: number, skin: number, scale = 1) {
  const group = new THREE.Group();
  const cloth = new THREE.MeshStandardMaterial({ color, roughness: .72 });
  const skinMaterial = new THREE.MeshStandardMaterial({ color: skin, roughness: .8 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x24140e, roughness: .9 });
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(.32, .7, 5, 10), cloth); body.position.y = 1.15; group.add(body);
  const sash = new THREE.Mesh(new THREE.BoxGeometry(.74, .15, .16), new THREE.MeshStandardMaterial({ color: 0xe0b85f, metalness: .1 })); sash.position.set(0, 1.18, .28); sash.rotation.z = -.18; group.add(sash);
  const head = new THREE.Mesh(new THREE.SphereGeometry(.27, 18, 14), skinMaterial); head.position.y = 1.9; group.add(head);
  const hair = new THREE.Mesh(new THREE.SphereGeometry(.285, 16, 10, 0, Math.PI * 2, 0, 1.3), dark); hair.position.y = 1.98; group.add(hair);
  [-1, 1].forEach(side => {
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(.09, .55, 4, 8), skinMaterial); arm.name = side < 0 ? "armL" : "armR"; arm.position.set(side * .42, 1.2, 0); arm.rotation.z = side * .15; group.add(arm);
    const leg = new THREE.Mesh(new THREE.CapsuleGeometry(.12, .62, 4, 8), dark); leg.name = side < 0 ? "legL" : "legR"; leg.position.set(side * .17, .43, 0); group.add(leg);
  });
  group.scale.setScalar(scale);
  return group;
}

export function addGate(scene: THREE.Scene, z = -36) {
  const brick = new THREE.MeshStandardMaterial({ color: 0x9d3f26, roughness: .92 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x6d291c, roughness: 1 });
  const group = new THREE.Group(); group.position.set(0, 0, z);
  [-3.3, 3.3].forEach(x => {
    for (let i = 0; i < 5; i++) {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(2.2 - i * .22, 1.25, 1.8 - i * .12), i % 2 ? dark : brick);
      mesh.position.set(x, i * 1.05 + .6, 0); group.add(mesh);
    }
  });
  const lintel = new THREE.Mesh(new THREE.BoxGeometry(8.8, 1, 2), brick); lintel.position.y = 5.65; group.add(lintel);
  const top = new THREE.Mesh(new THREE.BoxGeometry(7.4, .8, 1.7), dark); top.position.y = 6.55; group.add(top);
  scene.add(group);
}

export function addTimeRift(scene: THREE.Scene, z = 20) {
  const portal = new THREE.Group(); portal.name = "time-rift"; portal.position.set(0, 0, z);
  const outer = new THREE.Mesh(new THREE.TorusGeometry(1.35, .12, 10, 56), new THREE.MeshStandardMaterial({ color: 0xe3b85a, emissive: 0xa26d18, emissiveIntensity: 1.8, metalness: .55, roughness: .25 })); outer.position.y = 1.45;
  const inner = new THREE.Mesh(new THREE.CircleGeometry(1.15, 48), new THREE.MeshBasicMaterial({ color: 0x56b9b0, transparent: true, opacity: .28, side: THREE.DoubleSide })); inner.position.y = 1.45;
  const base = new THREE.Mesh(new THREE.CylinderGeometry(1.65, 1.9, .28, 24), new THREE.MeshStandardMaterial({ color: 0x683627, roughness: .9 })); base.position.y = .14;
  portal.add(base, outer, inner); scene.add(portal);
  return { portal, outer, inner };
}

export function createMajapahitCompound(variant = 0) {
  const group = new THREE.Group();
  const brick = new THREE.MeshStandardMaterial({ color: variant % 2 ? 0x9b3c24 : 0xaa4325, roughness: .92 });
  const brickDark = new THREE.MeshStandardMaterial({ color: 0x71301f, roughness: .96 });
  const plaster = new THREE.MeshStandardMaterial({ color: 0xd6d0bb, roughness: .9 });
  const wood = new THREE.MeshStandardMaterial({ color: 0x3f2418, roughness: .86 });
  const roofMaterial = new THREE.MeshStandardMaterial({ color: variant % 2 ? 0x7d2818 : 0x902b16, roughness: .88 });
  const courtyard = new THREE.Mesh(new THREE.BoxGeometry(7.4, .18, 6.4), new THREE.MeshStandardMaterial({ color: 0x75634f, roughness: 1 })); courtyard.position.y = .09; courtyard.receiveShadow = true; group.add(courtyard);
  const foundation = new THREE.Mesh(new THREE.BoxGeometry(5.2, .55, 4.1), brick); foundation.position.set(0, .38, -.4); group.add(foundation);
  const wall = new THREE.Mesh(new THREE.BoxGeometry(4.5, 2.15, 3.35), plaster); wall.position.set(0, 1.65, -.55); wall.castShadow = true; group.add(wall);
  const lowerBand = new THREE.Mesh(new THREE.BoxGeometry(4.58, .7, 3.43), brick); lowerBand.position.set(0, .88, -.55); group.add(lowerBand);
  const porch = new THREE.Mesh(new THREE.BoxGeometry(5.3, .28, 1.25), brick); porch.position.set(0, .48, 1.5); group.add(porch);
  [-2.05, 2.05].forEach(x => { const column = new THREE.Mesh(new THREE.BoxGeometry(.24, 2.45, .24), wood); column.position.set(x, 1.72, 1.55); column.castShadow = true; group.add(column); });
  const door = new THREE.Mesh(new THREE.BoxGeometry(1.25, 1.75, .12), wood); door.position.set(0, 1.45, 1.16); group.add(door);
  [-1.45, 1.45].forEach(x => { const frame = new THREE.Mesh(new THREE.BoxGeometry(.82, .88, .12), wood); frame.position.set(x, 1.65, 1.16); const inset = new THREE.Mesh(new THREE.BoxGeometry(.56, .62, .14), brickDark); inset.position.set(x, 1.65, 1.23); group.add(frame, inset); });
  const roof = new THREE.Mesh(new THREE.ConeGeometry(3.75, 1.45, 4), roofMaterial); roof.position.set(0, 3.18, -.35); roof.rotation.y = Math.PI / 4; roof.scale.z = .82; roof.castShadow = true; group.add(roof);
  const upper = new THREE.Mesh(new THREE.ConeGeometry(2.05, .9, 4), roofMaterial); upper.position.set(0, 4.08, -.35); upper.rotation.y = Math.PI / 4; upper.scale.z = .78; upper.castShadow = true; group.add(upper);
  const wallSegments: [number, number, number, number][] = [[-2.8, .55, .25, 4.7], [2.8, .55, .25, 4.7], [-1.9, 3, 1.8, .25], [1.9, 3, 1.8, .25]];
  wallSegments.forEach(([x, z, width, depth]) => { const segment = new THREE.Mesh(new THREE.BoxGeometry(width, .72, depth), brick); segment.position.set(x, .42, z); group.add(segment); });
  [-2.8, 2.8, -1, 1].forEach((x, index) => { const pillar = new THREE.Mesh(new THREE.BoxGeometry(.42, 1.25, .42), brickDark); pillar.position.set(x, .65, index < 2 ? 3 : 3); group.add(pillar); });
  for (let index = 0; index < 6; index++) { const stone = new THREE.Mesh(new THREE.BoxGeometry(.55, .08, .42), brickDark); stone.position.set((index % 2 ? .16 : -.16), .21, 2.4 - index * .48); stone.rotation.y = (index % 2 ? 1 : -1) * .08; group.add(stone); }
  group.traverse(object => { if (object instanceof THREE.Mesh) { object.castShadow = true; object.receiveShadow = true; } });
  return group;
}
