import type { CharacterChoice, Discovery, Lang, NpcDefinition, SceneAsset } from "./types";

export const CHARACTERS: CharacterChoice[] = [
  ...["a", "b", "c", "d", "e", "f"].map((variant, index) => ({ id: `male-${variant}`, name: `Penjelajah Putra ${variant.toUpperCase()}`, short: `P${index + 1}`, group: "Putra" as const, path: `/assets/characters/character-male-${variant}.glb` })),
  ...["a", "b", "c", "d", "e", "f"].map((variant, index) => ({ id: `female-${variant}`, name: `Penjelajah Putri ${variant.toUpperCase()}`, short: `W${index + 1}`, group: "Putri" as const, path: `/assets/characters/character-female-${variant}.glb` })),

];

export const ERAS = [
  { label: "PANGEA", year: "100 JUTA TAHUN LALU", detail: "Pergerakan benua purba" },
  { label: "MAJAPAHIT", year: "1350 M", detail: "Trowulan · Nusantara Kuno" },
  { label: "2026", year: "2026", detail: "Masa kini" },
  { label: "AMASIA?", year: "+100 JUTA TAHUN", detail: "Prediksi superbenua masa depan" },
];

export const COMPASS_MARKS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];

export const DISCOVERIES: Discovery[] = [
  { id: "piggy", title: "Celengan Terakota", year: "Abad 13–15", text: "Celengan tanah liat bakar menunjukkan bahwa kebiasaan menabung telah dikenal pada masa Majapahit. Kata celengan berakar dari celeng, babi dalam bahasa Jawa Kuno.", x: -13, z: -7, icon: "◒", modelPath: "/assets/modeling-game-items/artifact.glb", modelSize: .58 },
  { id: "canal", title: "Kanal Kota", year: "Abad ke-14", text: "Jejak kanal, waduk, dan kolam memperlihatkan tata air Trowulan yang terencana untuk irigasi, pengendalian banjir, dan kelembapan kota.", x: 15, z: -10, icon: "≋", modelPath: "/assets/modeling-game-items/old_map.glb", modelSize: .8 },
  { id: "gate", title: "Gapura Bata Merah", year: "Masa Majapahit", text: "Bata merah menjadi ciri kuat arsitektur Majapahit. Situs Trowulan menyimpan gapura, candi, permukiman, dan ribuan artefak kehidupan kota.", x: 0, z: -33, icon: "▥" },
];

export const NPCS: NpcDefinition[] = [
  { id: "arya-wira", name: "Arya Wira", role: "Penjaga Gapura", path: "/assets/characters/character-male-d.glb", x: -2.2, z: -31, rotation: .35, intro: { id: "Salam, penjelajah waktu. Aku Arya Wira, penjaga gapura. Benda dari masa lain tersebar di Trowulan—temukan semuanya, lalu kembali ke retakan waktu.", en: "Greetings, time traveler. I am Arya Wira, guardian of the gate. Objects from other eras are scattered across Trowulan—find them, then return to the time rift." } },
  { id: "dyah-laras", name: "Dyah Laras", role: "Pencatat Gerbang", path: "/assets/characters/character-female-c.glb", x: 2.2, z: -31, rotation: -.35, intro: { id: "Aku Dyah Laras, pencatat orang dan barang yang melewati gerbang kota. Perhatikan kanal, artefak, dan bangunan di sekitarmu—semuanya menyimpan cerita.", en: "I am Dyah Laras, recorder of people and goods passing through the city gate. Observe the canals, artifacts, and buildings around you—each carries a story." } },
];

const itemPath = (id: string) => `/assets/modeling-game-items/${id}.glb`;

export const SCENE_ASSETS: SceneAsset[] = [
  { id: "weapon_kris", label: "Keris", path: itemPath("weapon_kris"), x: -11, z: 5, size: .65, kind: "heritage" },
  { id: "royal_seal", label: "Segel Kerajaan", path: itemPath("royal_seal"), x: -14, z: 2, size: .38, kind: "heritage" },
  { id: "old_map", label: "Peta Lama", path: itemPath("old_map"), x: -11, z: -1, size: .85, kind: "heritage" },
  { id: "armor", label: "Zirah", path: itemPath("armor"), x: -15, z: -5, size: 1.35, kind: "heritage" },
  { id: "amulet", label: "Amulet", path: itemPath("amulet"), x: -11, z: -10, size: .42, kind: "heritage" },
  { id: "candle", label: "Lilin", path: itemPath("candle"), x: 8, z: 5, size: .48, kind: "heritage" },
  { id: "quill", label: "Pena", path: itemPath("quill"), x: 11, z: 2, size: .58, kind: "heritage" },
  { id: "scroll_letter", label: "Surat Gulung", path: itemPath("scroll_letter"), x: 8, z: -1, size: .72, kind: "heritage" },
  { id: "ring", label: "Cincin", path: itemPath("ring"), x: 11, z: -5, size: .28, kind: "heritage" },
  { id: "artifact", label: "Artefak", path: itemPath("artifact"), x: 8, z: -10, size: .55, kind: "heritage" },
  { id: "toy", label: "Mainan Kuda", path: itemPath("toy"), x: -15, z: 12, size: .6, kind: "heritage" },
  { id: "music_box", label: "Kotak Musik", path: itemPath("music_box"), x: -10, z: 13, size: .55, kind: "heritage" },
  { id: "potion_elixir", label: "Eliksir", path: itemPath("potion_elixir"), x: 8, z: 13, size: .5, kind: "heritage" },
  { id: "ancient_key", label: "Kunci Kuno", path: itemPath("ancient_key"), x: 13, z: 12, size: .42, kind: "heritage" },
  { id: "artifact_fragment", label: "Fragmen Artefak", path: itemPath("artifact_fragment"), x: -5, z: 16, size: .46, kind: "heritage" },
  { id: "gear_machine_part", label: "Roda Mesin", path: itemPath("gear_machine_part"), x: 5, z: 16, size: .52, kind: "heritage" },
  { id: "pocket_watch", label: "Jam Saku Anomali", path: itemPath("pocket_watch"), x: -44, z: -91, size: .72, kind: "anomaly" },
  { id: "photograph", label: "Foto dari Masa Depan", path: itemPath("photograph"), x: 29, z: -69, size: .8, kind: "anomaly" },
  { id: "energy_cell", label: "Sel Energi", path: itemPath("energy_cell"), x: -43, z: 25, size: .75, kind: "anomaly" },
  { id: "time_crystal", label: "Kristal Waktu", path: itemPath("time_crystal"), x: 43, z: 62, size: .9, kind: "anomaly" },
  { id: "time_fragment", label: "Pecahan Waktu", path: itemPath("time_fragment"), x: -14, z: 101, size: .7, kind: "anomaly" },
];

export const ANOMALIES = SCENE_ASSETS.filter(asset => asset.kind === "anomaly");

export const COPY = {
  id: { mission: "MISI SAAT INI", missionText: "Temukan 5 anomali dan stabilkan retakan waktu", active: "DESTINASI AKTIF", place: "Trowulan, Nusantara", period: "Masa pemerintahan Hayam Wuruk", move: "BERGERAK", talk: "BICARA", inspect: "PERIKSA", collect: "AMBIL", stabilize: "STABILKAN", diary: "TIME TRAVEL DIARY", discoveries: "PENEMUAN", ask: "Tanyakan tentang kehidupan Majapahit…", send: "TANYAKAN", npcIntro: "Salam, penjelajah waktu. Aku Arya Wira. Beberapa benda dari masa lain jatuh di Trowulan—temukan semuanya, lalu kembali ke retakan waktu.", found: "Penemuan baru dicatat!", submit: "KIRIM DIARY", summary: "Tuliskan rangkuman perjalananmu (minimal 80 karakter)…", locked: "Kumpulkan 3 penemuan sebelum mengirim diary.", complete: "Perjalanan bab pertama selesai! Catatanmu tersimpan di perangkat ini.", sources: "SUMBER FAKTA" },
  en: { mission: "CURRENT QUEST", missionText: "Find 5 anomalies and stabilize the time rift", active: "ACTIVE DESTINATION", place: "Trowulan, Nusantara", period: "Reign of Hayam Wuruk", move: "MOVE", talk: "TALK", inspect: "INSPECT", collect: "COLLECT", stabilize: "STABILIZE", diary: "TIME TRAVEL DIARY", discoveries: "DISCOVERIES", ask: "Ask about life in Majapahit…", send: "ASK", npcIntro: "Greetings, time traveler. I am Arya Wira. Objects from other eras have fallen across Trowulan—find them all, then return to the time rift.", found: "New discovery recorded!", submit: "SUBMIT DIARY", summary: "Write a summary of your journey (at least 80 characters)…", locked: "Collect all 3 discoveries before submitting your diary.", complete: "Chapter one complete! Your diary is saved on this device.", sources: "FACT SOURCES" },
} satisfies Record<Lang, Record<string, string>>;

export function answerQuestion(question: string, lang: Lang) {
  const q = question.toLowerCase(); const id = lang === "id";
  if (/hayam|raja|king/.test(q)) return id ? "Hayam Wuruk, bergelar Rajasanagara, naik takhta pada 1350. Pada masanya Majapahit berkembang sebagai pusat politik dan perdagangan penting di Nusantara." : "Hayam Wuruk, titled Rajasanagara, took the throne in 1350. Under his reign, Majapahit grew into a major political and trading center in the archipelago.";
  if (/gajah|patih|palapa/.test(q)) return id ? "Gajah Mada adalah mahapatih Majapahit yang dikenal melalui Sumpah Palapa. Ia membantu pemerintahan pada masa Tribhuwana dan Hayam Wuruk." : "Gajah Mada was Majapahit’s chief minister, remembered for the Palapa Oath.";
  if (/makan|food|rice|padi/.test(q)) return id ? "Masyarakat mengandalkan pertanian padi dari tanah subur dan tata air yang baik. Pasar juga mempertemukan hasil kebun, ikan, rempah, tembikar, dan barang dagang." : "People relied on rice agriculture supported by fertile land and water management.";
  if (/agama|relig|islam|hindu|budd/.test(q)) return id ? "Hindu Siwa dan Buddha berkembang di Majapahit, sementara bukti makam di Troloyo menunjukkan komunitas Muslim juga hadir." : "Shaivite Hinduism and Buddhism flourished, while graves at Troloyo show Muslim communities were also present.";
  if (/nagara|kitab|book|prapanca/.test(q)) return id ? "Mpu Prapanca menggubah Nagarakretagama pada 1365. Kakawin itu menjadi sumber penting tentang perjalanan Hayam Wuruk dan gambaran Majapahit." : "Mpu Prapanca composed the Nagarakretagama in 1365.";
  if (/kanal|air|water|city|kota/.test(q)) return id ? "Trowulan memiliki jaringan kanal, waduk, dan kolam. Temuan arkeologi menunjukkan tata kota yang terencana." : "Trowulan had canals, reservoirs, and ponds, pointing to a planned city.";
  return id ? "Bukti terbaik kita berasal dari prasasti, kakawin seperti Nagarakretagama, serta temuan arkeologi Trowulan." : "Our best evidence comes from inscriptions, poems such as the Nagarakretagama, and archaeology at Trowulan.";
}
