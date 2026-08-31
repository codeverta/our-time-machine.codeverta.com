"use client";

import { ANOMALIES, COMPASS_MARKS, COPY, DISCOVERIES, NPCS } from "../game/data";
import type { CharacterChoice, Lang, NearTarget, SceneAsset } from "../game/types";

type Props = {
  lang: Lang; character: CharacterChoice; avatar: string | null; heading: number; near: NearTarget;
  relics: SceneAsset[]; riftStable: boolean; discoveries: number; sound: boolean;
  onToggleSound: () => void; onToggleLang: () => void; onDiary: () => void; onInteract: () => void;
};

export default function GameHUD(props: Props) {
  const { lang, character, avatar, heading, near, relics, riftStable, discoveries, sound } = props; const copy = COPY[lang]; const headingIndex = Math.round(heading / 45);
  const relic = ANOMALIES.find(item => item.id === near.id); const discovery = DISCOVERIES.find(item => item.id === near.id); const npc = NPCS.find(item => item.id === near.id);
  const prompt = near.type === "npc" ? copy.talk : near.type === "relic" ? copy.collect : near.type === "portal" ? copy.stabilize : copy.inspect;
  const promptName = near.type === "npc" ? npc?.name : near.type === "portal" ? (relics.length === ANOMALIES.length ? "Retakan waktu siap" : `Butuh ${ANOMALIES.length - relics.length} anomali lagi`) : relic?.label || discovery?.title;
  return <><header className="topbar"><div className="brand"><span className="brand-mark">OTM</span><span>OUR TIME MACHINE<small>MAJAPAHIT · 1350 M</small></span></div><div className="mission"><small>{copy.mission}</small><strong>{riftStable ? "Retakan waktu telah stabil" : copy.missionText}</strong></div><div className="header-actions"><button aria-label="Toggle sound" onClick={props.onToggleSound}>{sound ? "♪" : "♩"}</button><button className="lang" onClick={props.onToggleLang}>{lang.toUpperCase()} <span>⌄</span></button></div></header>
    <div className="status-card"><span className="pulse" /><div><small>{copy.active}</small><strong>{copy.place}</strong><p>{copy.period}</p></div></div>
    <div className="compass"><i /><div className="compass-strip" style={{ transform: `translateX(${-((8 + heading / 45) * 44 + 22)}px)` }}>{Array.from({ length: 24 }, (_, index) => <span className={index === 8 + headingIndex ? "active" : ""} key={index}>{COMPASS_MARKS[index % 8]}</span>)}</div><b>{String(Math.round(heading)).padStart(3, "0")}°</b></div>
    <div className={`rift-quest ${riftStable ? "complete" : ""}`}><div className="rift-orb">{riftStable ? "✓" : "◈"}</div><div><small>TIME RIFT QUEST</small><strong>{riftStable ? "STABIL" : `${relics.length} / ${ANOMALIES.length} ANOMALI`}</strong><div className="rift-progress"><i style={{ width: `${riftStable ? 100 : relics.length / ANOMALIES.length * 100}%` }} /></div></div></div>
    <div className="controls"><span>W</span><div><span>A</span><span>S</span><span>D</span></div><small>{copy.move}</small></div>
    <div className="action-controls"><div><kbd>SPACE</kbd><span>LOMPAT<small>Jump</small></span></div><div><kbd>← ↑ ↓ →</kbd><span>KAMERA<small>Rotate / tilt</small></span></div><div><kbd>E</kbd><span>INTERAKSI<small>Collect / talk</small></span></div><div><kbd>F</kbd><span>AKSI<small>Gestur</small></span></div></div>
    <button className="diary" onClick={props.onDiary}>✦ <span>{copy.diary}<small>{discoveries} / 3 {copy.discoveries}</small></span></button>
    <div className="player-id">{avatar ? <img src={avatar} alt="Avatar pemain" /> : <span className="mini-avatar" />}<div><small>{character.group.toUpperCase()}</small><b>{character.name}</b></div></div>
    {near.type && <button className="interact" onClick={props.onInteract}><kbd>E</kbd><span>{prompt}<small>{promptName}</small></span></button>}
  </>;
}
