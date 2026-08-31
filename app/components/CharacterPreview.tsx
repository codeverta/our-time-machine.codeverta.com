"use client";

import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { useEffect, useRef } from "react";
import type { CharacterChoice } from "../game/types";
import { fitModel } from "../game/three-utils";

export default function CharacterPreview({ character }: { character: CharacterChoice }) {
  const mount = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = mount.current; if (!element) return; let disposed = false;
    const scene = new THREE.Scene(); const camera = new THREE.PerspectiveCamera(34, element.clientWidth / element.clientHeight, .1, 50); camera.position.set(0, 1.35, 5.4); camera.lookAt(0, 1.15, 0);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6)); renderer.setSize(element.clientWidth, element.clientHeight); renderer.outputColorSpace = THREE.SRGBColorSpace; element.appendChild(renderer.domElement);
    scene.add(new THREE.HemisphereLight(0xffe8c2, 0x18372e, 2.5)); const rim = new THREE.DirectionalLight(0xf2c76c, 3); rim.position.set(-3, 4, 3); scene.add(rim);
    const platform = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.5, .12, 48), new THREE.MeshStandardMaterial({ color: 0x183229, roughness: .55, metalness: .25 })); platform.position.y = -.08; scene.add(platform);
    let model: THREE.Object3D | null = null; let mixer: THREE.AnimationMixer | null = null;
    new GLTFLoader().load(character.path, gltf => { if (disposed) return; model = gltf.scene; fitModel(model, 2.55); scene.add(model); const idle = gltf.animations.find(animation => animation.name === "idle") || gltf.animations[0]; if (idle) { mixer = new THREE.AnimationMixer(model); mixer.clipAction(idle).play(); } });
    const clock = new THREE.Clock(); let frame = 0; const tick = () => { mixer?.update(Math.min(clock.getDelta(), .04)); if (model) model.rotation.y += .007; renderer.render(scene, camera); frame = requestAnimationFrame(tick); }; tick();
    const resize = () => { camera.aspect = element.clientWidth / element.clientHeight; camera.updateProjectionMatrix(); renderer.setSize(element.clientWidth, element.clientHeight); }; window.addEventListener("resize", resize);
    return () => { disposed = true; cancelAnimationFrame(frame); window.removeEventListener("resize", resize); mixer?.stopAllAction(); renderer.dispose(); if (renderer.domElement.parentElement === element) element.removeChild(renderer.domElement); };
  }, [character]);
  return <div className="character-preview" ref={mount} aria-label={`Pratinjau 3D ${character.name}`} />;
}

