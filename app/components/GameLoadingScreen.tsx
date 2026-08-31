import type { CharacterChoice } from "../game/types";

type Props = { progress: number; status: string; character: CharacterChoice };

export default function GameLoadingScreen({ progress, status, character }: Props) {
  const percent = Math.max(0, Math.min(100, Math.round(progress)));
  return <div className="game-loading" role="status" aria-live="polite">
    <div className="loading-rift"><i /><i /><i /><span>OTM</span></div>
    <p className="eyebrow">MENYELARASKAN LORONG WAKTU</p>
    <h1>Memasuki <em>Majapahit</em></h1>
    <p className="loading-character">Penjelajah aktif · <b>{character.name}</b></p>
    <div className="loading-track"><i style={{ width: `${percent}%` }} /></div>
    <div className="loading-meta"><span>{status}</span><strong>{percent}%</strong></div>
    <small>Menyiapkan karakter, permukaan tanah, landmark, NPC, dan lingkungan di sekitar titik kedatangan.</small>
  </div>;
}
