"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import DebugPanel from "./components/DebugPanel";
import GameLoadingScreen from "./components/GameLoadingScreen";
import GameHUD from "./components/GameHUD";
import KnowledgePanels from "./components/KnowledgePanels";
import Launcher from "./components/Launcher";
import { ANOMALIES, CHARACTERS, DISCOVERIES, NPCS, answerQuestion } from "./game/data";
import World from "./game/World";
import type { CharacterChoice, ChatMessage, DebugCommand, DebugSettings, Discovery, Lang, NearTarget, NpcDefinition, PanelType, SceneAsset } from "./game/types";

export default function Home() {
  const [launched, setLaunched] = useState(false);
  const [character, setCharacter] = useState<CharacterChoice>(CHARACTERS[0]);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [lang, setLang] = useState<Lang>("id");
  const [near, setNear] = useState<NearTarget>({ type: null });
  const [collected, setCollected] = useState<Discovery[]>([]);
  const [relics, setRelics] = useState<SceneAsset[]>([]);
  const [riftStable, setRiftStable] = useState(false);
  const [riftNotice, setRiftNotice] = useState<string | null>(null);
  const [panel, setPanel] = useState<PanelType>(null);
  const [question, setQuestion] = useState("");
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [activeNpc, setActiveNpc] = useState<NpcDefinition>(NPCS[0]);
  const [summary, setSummary] = useState("");
  const [done, setDone] = useState(false);
  const [sound, setSound] = useState(true);
  const [heading, setHeading] = useState(0);
  const [debugOpen, setDebugOpen] = useState(false);
  const [debugSettings, setDebugSettings] = useState<DebugSettings>({ noclip: false, speedMultiplier: 1, showColliders: false, command: null });
  const [worldRevision, setWorldRevision] = useState(0);
  const [questSkipped, setQuestSkipped] = useState(false);
  const [showCompletionCard, setShowCompletionCard] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [loadStatus, setLoadStatus] = useState("Menyiapkan perjalanan…");
  const noticeTimer = useRef<number | null>(null); const completionTimer = useRef<number | null>(null); const readyTimer = useRef<number | null>(null);

  useEffect(() => { try { const saved = localStorage.getItem("otm-diary"); if (saved) { const diary = JSON.parse(saved); setSummary(diary.summary || ""); setDone(Boolean(diary.done)); } } catch { /* device-local save is optional */ } const key = (event: KeyboardEvent) => { if (event.key === "F2") { event.preventDefault(); setDebugOpen(current => !current); } }; window.addEventListener("keydown", key); return () => { window.removeEventListener("keydown", key); if (noticeTimer.current) window.clearTimeout(noticeTimer.current); if (completionTimer.current) window.clearTimeout(completionTimer.current); if (readyTimer.current) window.clearTimeout(readyTimer.current); }; }, []);
  const showNotice = useCallback((message: string, duration = 2600) => { if (noticeTimer.current) window.clearTimeout(noticeTimer.current); setRiftNotice(message); noticeTimer.current = window.setTimeout(() => setRiftNotice(null), duration); }, []);
  const showQuestResult = useCallback(() => { if (completionTimer.current) window.clearTimeout(completionTimer.current); setShowCompletionCard(true); completionTimer.current = window.setTimeout(() => setShowCompletionCard(false), 4200); }, []);
  const speak = useCallback((text: string) => { if (!sound || !("speechSynthesis" in window)) return; speechSynthesis.cancel(); const utterance = new SpeechSynthesisUtterance(text); utterance.lang = lang === "id" ? "id-ID" : "en-US"; utterance.rate = .92; utterance.pitch = .95; speechSynthesis.speak(utterance); }, [lang, sound]);
  const openTalk = useCallback((npc: NpcDefinition) => { setActiveNpc(npc); setPanel("npc"); setChat([{ role: "npc", text: npc.intro[lang] }]); speak(npc.intro[lang]); }, [lang, speak]);
  const discover = useCallback((discovery: Discovery) => { setCollected(current => current.some(item => item.id === discovery.id) ? current : [...current, discovery]); setPanel("fact"); }, []);
  const collectRelic = useCallback((asset: SceneAsset) => { setRelics(current => current.some(item => item.id === asset.id) ? current : [...current, asset]); showNotice(`${asset.label} didapatkan`, 2200); }, [showNotice]);
  const usePortal = useCallback(() => { if (relics.length < ANOMALIES.length) { showNotice(`Retakan belum stabil · cari ${ANOMALIES.length - relics.length} anomali lagi`); return; } setQuestSkipped(false); setRiftStable(true); showNotice("Retakan waktu berhasil distabilkan!", 3200); showQuestResult(); }, [relics.length, showNotice, showQuestResult]);
  const prepareWorld = useCallback(() => { if (readyTimer.current) window.clearTimeout(readyTimer.current); setSceneReady(false); setLoadProgress(4); setLoadStatus("Membuka lorong waktu…"); }, []);
  const handleLoadProgress = useCallback((progress: number, status: string) => { setLoadProgress(current => Math.max(current, progress)); setLoadStatus(status); }, []);
  const handleWorldReady = useCallback(() => { setLoadProgress(100); setLoadStatus("Lorong waktu siap"); if (readyTimer.current) window.clearTimeout(readyTimer.current); readyTimer.current = window.setTimeout(() => setSceneReady(true), 380); }, []);
  const launch = (choice: CharacterChoice, profile: string | null) => { prepareWorld(); setCharacter(choice); setAvatar(profile); setLaunched(true); setChat([{ role: "npc", text: NPCS[0].intro[lang] }]); };
  const ask = (event: FormEvent) => { event.preventDefault(); if (!question.trim()) return; const answer = answerQuestion(question, lang); setChat(current => [...current, { role: "you", text: question }, { role: "npc", text: answer }]); setQuestion(""); window.setTimeout(() => speak(answer), 120); };
  const submitDiary = () => { if (collected.length < DISCOVERIES.length || summary.trim().length < 80) return; setDone(true); localStorage.setItem("otm-diary", JSON.stringify({ summary, done: true, date: new Date().toISOString() })); };
  const triggerInteract = () => { window.dispatchEvent(new KeyboardEvent("keydown", { key: "e" })); window.dispatchEvent(new KeyboardEvent("keyup", { key: "e" })); };
  const sendDebugCommand = (command: Omit<DebugCommand, "nonce">) => setDebugSettings(current => ({ ...current, command: { ...command, nonce: Date.now() } }));
  const debugCollectNext = () => { const next = ANOMALIES.find(asset => !relics.some(relic => relic.id === asset.id)); if (!next) return; setRelics(current => [...current, next]); sendDebugCommand({ type: "hide-relic", targetId: next.id }); showNotice(`DEBUG · ${next.label} ditambahkan`); };
  const debugFinish = (skipped: boolean) => { prepareWorld(); setRelics(ANOMALIES); setRiftStable(true); setQuestSkipped(skipped); setDebugSettings(current => ({ ...current, command: null })); setWorldRevision(current => current + 1); showNotice(skipped ? "DEBUG · quest dilewati" : "DEBUG · quest diselesaikan otomatis", 3000); showQuestResult(); };
  const debugReset = () => { prepareWorld(); setRelics([]); setRiftStable(false); setQuestSkipped(false); setShowCompletionCard(false); setDebugSettings(current => ({ ...current, command: null })); setWorldRevision(current => current + 1); showNotice("DEBUG · quest dan item di-reset"); };
  const activeDiscovery = DISCOVERIES.find(item => item.id === near.id) || collected[collected.length - 1];

  if (!launched) return <Launcher onLaunch={launch} />;
  return <main className="game-shell">
    <World key={`${character.id}-${worldRevision}`} character={character} collectedRelicIds={relics.map(relic => relic.id)} debug={debugSettings} onNear={setNear} onTalk={openTalk} onDiscover={discover} onCollectRelic={collectRelic} onPortal={usePortal} onHeading={setHeading} onLoadProgress={handleLoadProgress} onReady={handleWorldReady} />
    {!sceneReady && <GameLoadingScreen progress={loadProgress} status={loadStatus} character={character} />}
    {sceneReady && <><div className="cinematic" />
      <GameHUD lang={lang} character={character} avatar={avatar} heading={heading} near={near} relics={relics} riftStable={riftStable} discoveries={collected.length} sound={sound} onToggleSound={() => setSound(current => !current)} onToggleLang={() => setLang(current => current === "id" ? "en" : "id")} onDiary={() => setPanel("diary")} onInteract={triggerInteract} />
      {riftNotice && <div className={`rift-notice ${riftStable ? "complete" : ""}`}>{riftStable ? "✓" : "◈"} {riftNotice}</div>}
      {riftStable && showCompletionCard && <div className="chapter-complete"><small>{questSkipped ? "QUEST SKIPPED" : "QUEST COMPLETE"}</small><strong>{questSkipped ? "TIME RIFT BYPASSED" : "TIME RIFT STABILIZED"}</strong><span>Pesan ini akan tertutup otomatis. Eksplorasi tetap dapat dilanjutkan.</span></div>}
      <button className="debug-trigger" onClick={() => setDebugOpen(current => !current)}><kbd>F2</kbd> DEBUG</button>
      <DebugPanel open={debugOpen} settings={debugSettings} relics={relics} riftStable={riftStable} onClose={() => setDebugOpen(false)} onCollectNext={debugCollectNext} onComplete={() => debugFinish(false)} onSkip={() => debugFinish(true)} onReset={debugReset} onTeleport={(x, z) => sendDebugCommand({ type: "teleport", x, z })} onToggleNoclip={() => setDebugSettings(current => ({ ...current, noclip: !current.noclip }))} onToggleSpeed={() => setDebugSettings(current => ({ ...current, speedMultiplier: current.speedMultiplier > 1 ? 1 : 2.5 }))} onToggleColliders={() => setDebugSettings(current => ({ ...current, showColliders: !current.showColliders }))} />
      <KnowledgePanels panel={panel} npc={activeNpc} lang={lang} chat={chat} question={question} collected={collected} activeDiscovery={activeDiscovery} summary={summary} done={done} onClose={() => setPanel(null)} onSpeak={speak} onQuestion={setQuestion} onAsk={ask} onSummary={setSummary} onSubmitDiary={submitDiary} />
    </>}
  </main>;
}
