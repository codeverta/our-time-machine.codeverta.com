export type Lang = "id" | "en";

export type Discovery = {
  id: string;
  title: string;
  year: string;
  text: string;
  x: number;
  z: number;
  icon: string;
  modelPath?: string;
  modelSize?: number;
};

export type CharacterChoice = {
  id: string;
  name: string;
  short: string;
  group: "Putra" | "Putri" | "Special";
  path: string;
};

export type SceneAsset = {
  id: string;
  label: string;
  path: string;
  x: number;
  z: number;
  size: number;
  kind: "heritage" | "anomaly";
};

export type NearTarget = {
  type: "npc" | "object" | "relic" | "portal" | null;
  id?: string;
};

export type ChatMessage = { role: "npc" | "you"; text: string };

export type PanelType = "npc" | "diary" | "fact" | null;

export type NpcDefinition = {
  id: string;
  name: string;
  role: string;
  path: string;
  x: number;
  z: number;
  rotation: number;
  intro: Record<Lang, string>;
};

export type DebugCommand = {
  nonce: number;
  type: "teleport" | "hide-relic";
  x?: number;
  z?: number;
  targetId?: string;
};

export type DebugSettings = {
  noclip: boolean;
  speedMultiplier: number;
  showColliders: boolean;
  command: DebugCommand | null;
};
