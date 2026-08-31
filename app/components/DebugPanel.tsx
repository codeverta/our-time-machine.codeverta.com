"use client";

import { ANOMALIES } from "../game/data";
import type { DebugSettings, SceneAsset } from "../game/types";

type Props = {
  open: boolean;
  settings: DebugSettings;
  relics: SceneAsset[];
  riftStable: boolean;
  onClose: () => void;
  onCollectNext: () => void;
  onComplete: () => void;
  onSkip: () => void;
  onReset: () => void;
  onTeleport: (x: number, z: number) => void;
  onToggleNoclip: () => void;
  onToggleSpeed: () => void;
  onToggleColliders: () => void;
};

export default function DebugPanel(props: Props) {
  if (!props.open) return null;
  const next = ANOMALIES.find(asset => !props.relics.some(relic => relic.id === asset.id));
  return <aside className="debug-panel"><header><div><small>DEVELOPER TOOLS</small><strong>GAME DEBUG</strong></div><button onClick={props.onClose}>×</button></header>
    <div className="debug-status"><span>QUEST</span><b>{props.riftStable ? "COMPLETE" : `${props.relics.length}/${ANOMALIES.length}`}</b></div>
    <section><small>QUEST CONTROL</small><div className="debug-grid"><button disabled={!next} onClick={props.onCollectNext}>＋ NEXT ITEM</button><button onClick={props.onComplete}>✓ COMPLETE</button><button onClick={props.onSkip}>» SKIP QUEST</button><button className="danger" onClick={props.onReset}>↺ RESET</button></div></section>
    <section><small>PLAYER</small><div className="debug-grid"><button className={props.settings.noclip ? "active" : ""} onClick={props.onToggleNoclip}>NOCLIP {props.settings.noclip ? "ON" : "OFF"}</button><button className={props.settings.speedMultiplier > 1 ? "active" : ""} onClick={props.onToggleSpeed}>SPEED ×{props.settings.speedMultiplier}</button><button className={props.settings.showColliders ? "active" : ""} onClick={props.onToggleColliders}>COLLIDERS {props.settings.showColliders ? "ON" : "OFF"}</button></div></section>
    <section><small>TELEPORT · 8 ZONA</small><div className="debug-grid"><button onClick={() => props.onTeleport(0, -96)}>HUTAN UTARA</button><button onClick={() => props.onTeleport(0, -56)}>CANDI</button><button onClick={() => props.onTeleport(0, -4)}>DESA</button><button onClick={() => props.onTeleport(0, 32)}>WORKSHOP</button><button onClick={() => props.onTeleport(0, 55)}>SAWAH</button><button onClick={() => props.onTeleport(0, 76)}>SUNGAI</button><button onClick={() => props.onTeleport(0, 91)}>POS JAGA</button><button onClick={() => props.onTeleport(0, 106)}>HUTAN SELATAN</button>{next && <button onClick={() => props.onTeleport(next.x, next.z + 2)}>NEXT ANOMALY</button>}</div></section>
    <footer><kbd>F2</kbd><span>buka / tutup debug</span></footer>
  </aside>;
}
