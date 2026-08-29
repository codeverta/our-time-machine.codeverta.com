"use client";

import * as THREE from "three";
import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";

type Lang = "id" | "en";
type Discovery = { id:string; title:string; year:string; text:string; x:number; z:number; icon:string };

const DISCOVERIES: Discovery[] = [
  {id:"piggy",title:"Celengan Terakota",year:"Abad 13–15",text:"Celengan tanah liat bakar menunjukkan bahwa kebiasaan menabung telah dikenal pada masa Majapahit. Kata celengan berakar dari celeng, babi dalam bahasa Jawa Kuno.",x:-7,z:-5,icon:"◒"},
  {id:"canal",title:"Kanal Kota",year:"Abad ke-14",text:"Jejak kanal, waduk, dan kolam memperlihatkan tata air Trowulan yang terencana untuk irigasi, pengendalian banjir, dan kelembapan kota.",x:8,z:-10,icon:"≋"},
  {id:"gate",title:"Gapura Bata Merah",year:"Masa Majapahit",text:"Bata merah menjadi ciri kuat arsitektur Majapahit. Situs Trowulan menyimpan gapura, candi, permukiman, dan ribuan artefak kehidupan kota.",x:0,z:-13,icon:"▥"},
];

const COPY = {
  id:{mission:"MISI SAAT INI",missionText:"Temui penjaga gapura dan kumpulkan 3 penemuan",active:"DESTINASI AKTIF",place:"Trowulan, Nusantara",period:"Masa pemerintahan Hayam Wuruk",move:"BERGERAK",talk:"BICARA",inspect:"PERIKSA",diary:"TIME TRAVEL DIARY",discoveries:"PENEMUAN",ask:"Tanyakan tentang kehidupan Majapahit…",send:"TANYAKAN",npcIntro:"Salam, penjelajah waktu. Aku Arya Wira, penjaga kawasan kota. Apa yang ingin kamu ketahui?",notNear:"Dekati objek atau penjaga untuk berinteraksi.",found:"Penemuan baru dicatat!",submit:"KIRIM DIARY",summary:"Tuliskan rangkuman perjalananmu (minimal 80 karakter)…",locked:"Kumpulkan 3 penemuan sebelum mengirim diary.",complete:"Perjalanan bab pertama selesai! Catatanmu tersimpan di perangkat ini.",sources:"SUMBER FAKTA"},
  en:{mission:"CURRENT QUEST",missionText:"Meet the gatekeeper and collect 3 discoveries",active:"ACTIVE DESTINATION",place:"Trowulan, Nusantara",period:"Reign of Hayam Wuruk",move:"MOVE",talk:"TALK",inspect:"INSPECT",diary:"TIME TRAVEL DIARY",discoveries:"DISCOVERIES",ask:"Ask about life in Majapahit…",send:"ASK",npcIntro:"Greetings, time traveler. I am Arya Wira, guardian of this city quarter. What would you like to know?",notNear:"Move closer to an object or the guard to interact.",found:"New discovery recorded!",submit:"SUBMIT DIARY",summary:"Write a summary of your journey (at least 80 characters)…",locked:"Collect all 3 discoveries before submitting your diary.",complete:"Chapter one complete! Your diary is saved on this device.",sources:"FACT SOURCES"}
};

function answerQuestion(question:string, lang:Lang) {
  const q=question.toLowerCase();
  const id = lang === "id";
  if(/hayam|raja|king/.test(q)) return id ? "Hayam Wuruk, bergelar Rajasanagara, naik takhta pada 1350. Pada masanya Majapahit berkembang sebagai pusat politik dan perdagangan penting di Nusantara." : "Hayam Wuruk, titled Rajasanagara, took the throne in 1350. Under his reign, Majapahit grew into a major political and trading center in the archipelago.";
  if(/gajah|patih|palapa/.test(q)) return id ? "Gajah Mada adalah mahapatih Majapahit yang dikenal melalui Sumpah Palapa. Ia membantu pemerintahan pada masa Tribhuwana dan Hayam Wuruk." : "Gajah Mada was Majapahit’s chief minister, remembered for the Palapa Oath. He served during the reigns of Tribhuwana and Hayam Wuruk.";
  if(/makan|food|rice|padi/.test(q)) return id ? "Masyarakat mengandalkan pertanian padi dari tanah subur dan tata air yang baik. Pasar juga mempertemukan hasil kebun, ikan, rempah, tembikar, dan barang dagang." : "People relied on rice agriculture supported by fertile land and water management. Markets also offered garden produce, fish, spices, pottery, and traded goods.";
  if(/agama|relig|islam|hindu|budd/.test(q)) return id ? "Hindu Siwa dan Buddha berkembang di Majapahit, sementara bukti makam di Troloyo menunjukkan komunitas Muslim juga hadir. Kehidupan kota bersifat majemuk." : "Shaivite Hinduism and Buddhism flourished, while graves at Troloyo show that Muslim communities were also present. Urban life was diverse.";
  if(/nagara|kitab|book|prapanca/.test(q)) return id ? "Mpu Prapanca menggubah Nagarakretagama pada 1365. Kakawin itu menjadi sumber penting tentang perjalanan Hayam Wuruk dan gambaran Majapahit." : "Mpu Prapanca composed the Nagarakretagama in 1365. The poem is an important source on Hayam Wuruk’s journeys and Majapahit.";
  if(/kanal|air|water|city|kota/.test(q)) return id ? "Trowulan memiliki jaringan kanal, waduk, dan kolam. Temuan arkeologi menunjukkan tata kota yang terencana, dengan kawasan permukiman, pasar, upacara, dan kegiatan produksi." : "Trowulan had canals, reservoirs, and ponds. Archaeology points to a planned city with residential, market, ceremonial, and production areas.";
  return id ? "Bukti terbaik kita berasal dari prasasti, kakawin seperti Nagarakretagama, serta temuan arkeologi Trowulan. Tanyakan kepadaku tentang Hayam Wuruk, Gajah Mada, makanan, agama, kanal, atau kitab." : "Our best evidence comes from inscriptions, poems such as the Nagarakretagama, and archaeology at Trowulan. Ask me about Hayam Wuruk, Gajah Mada, food, religion, canals, or manuscripts.";
}

function createPerson(color:number, skin:number, scale=1) {
  const g=new THREE.Group();
  const mat=new THREE.MeshStandardMaterial({color,roughness:.72});
  const skinMat=new THREE.MeshStandardMaterial({color:skin,roughness:.8});
  const dark=new THREE.MeshStandardMaterial({color:0x24140e,roughness:.9});
  const body=new THREE.Mesh(new THREE.CapsuleGeometry(.32,.7,5,10),mat);body.position.y=1.15;g.add(body);
  const sash=new THREE.Mesh(new THREE.BoxGeometry(.74,.15,.16),new THREE.MeshStandardMaterial({color:0xe0b85f,metalness:.1}));sash.position.set(0,1.18,.28);sash.rotation.z=-.18;g.add(sash);
  const head=new THREE.Mesh(new THREE.SphereGeometry(.27,18,14),skinMat);head.position.y=1.9;g.add(head);
  const hair=new THREE.Mesh(new THREE.SphereGeometry(.285,16,10,0,Math.PI*2,0,1.3),dark);hair.position.y=1.98;g.add(hair);
  [-1,1].forEach(s=>{const arm=new THREE.Mesh(new THREE.CapsuleGeometry(.09,.55,4,8),skinMat);arm.position.set(s*.42,1.2,0);arm.rotation.z=s*.15;g.add(arm);const leg=new THREE.Mesh(new THREE.CapsuleGeometry(.12,.62,4,8),dark);leg.position.set(s*.17,.43,0);g.add(leg)});
  g.scale.setScalar(scale);return g;
}

function addGate(scene:THREE.Scene) {
  const brick=new THREE.MeshStandardMaterial({color:0x9d3f26,roughness:.92});
  const dark=new THREE.MeshStandardMaterial({color:0x6d291c,roughness:1});
  const group=new THREE.Group();group.position.set(0,0,-16);
  [-3.3,3.3].forEach(x=>{for(let i=0;i<5;i++){const m=new THREE.Mesh(new THREE.BoxGeometry(2.2-i*.22,1.25,1.8-i*.12),i%2?dark:brick);m.position.set(x,i*1.05+.6,0);group.add(m)}});
  const lintel=new THREE.Mesh(new THREE.BoxGeometry(8.8,1,2),brick);lintel.position.y=5.65;group.add(lintel);
  const top=new THREE.Mesh(new THREE.BoxGeometry(7.4,.8,1.7),dark);top.position.y=6.55;group.add(top);
  scene.add(group);
}

function World({onNear,onDiscover,character}:{onNear:(type:"npc"|"object"|null,id?:string)=>void;onDiscover:(d:Discovery)=>void;character:number}) {
  const mount=useRef<HTMLDivElement>(null); const cbNear=useRef(onNear); const cbDiscover=useRef(onDiscover);
  useEffect(()=>{cbNear.current=onNear;cbDiscover.current=onDiscover},[onNear,onDiscover]);
  useEffect(()=>{
    const el=mount.current;if(!el)return;
    const scene=new THREE.Scene();scene.background=new THREE.Color(0x69a8a0);scene.fog=new THREE.FogExp2(0x8eb5a0,.025);
    const camera=new THREE.PerspectiveCamera(58,el.clientWidth/el.clientHeight,.1,150);camera.position.set(0,7,10);
    const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:"high-performance"});renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.setSize(el.clientWidth,el.clientHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;el.appendChild(renderer.domElement);
    scene.add(new THREE.HemisphereLight(0xffe6bd,0x28462e,2.1));const sun=new THREE.DirectionalLight(0xffd79a,3.2);sun.position.set(-8,15,8);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);scene.add(sun);
    const ground=new THREE.Mesh(new THREE.PlaneGeometry(120,120,32,32),new THREE.MeshStandardMaterial({color:0x5c7435,roughness:1}));ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground);
    const path=new THREE.Mesh(new THREE.PlaneGeometry(4,34),new THREE.MeshStandardMaterial({color:0x9b7550,roughness:1}));path.rotation.x=-Math.PI/2;path.position.set(0,.012,-5);scene.add(path);
    for(let i=0;i<44;i++){const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.12,.2,1.7,6),new THREE.MeshStandardMaterial({color:0x573820}));const leaves=new THREE.Mesh(new THREE.ConeGeometry(.75+Math.random()*.55,2+Math.random(),7),new THREE.MeshStandardMaterial({color:i%3?0x31562c:0x496e34}));const x=(Math.random()-.5)*45,z=(Math.random()-.5)*48;if(Math.abs(x)<3)continue;trunk.position.set(x,.85,z);leaves.position.set(x,2.3,z);trunk.castShadow=true;scene.add(trunk,leaves)}
    const water=new THREE.Mesh(new THREE.PlaneGeometry(7,28),new THREE.MeshStandardMaterial({color:0x2d8881,roughness:.2,metalness:.1,transparent:true,opacity:.82}));water.rotation.x=-Math.PI/2;water.position.set(10,.02,-6);scene.add(water);
    for(let i=0;i<7;i++){const h=new THREE.Group();const base=new THREE.Mesh(new THREE.BoxGeometry(2.5,1.5,2.4),new THREE.MeshStandardMaterial({color:0xc79461}));base.position.y=.75;const roof=new THREE.Mesh(new THREE.ConeGeometry(2.05,1.15,4),new THREE.MeshStandardMaterial({color:0x56351f}));roof.rotation.y=Math.PI/4;roof.position.y=2;h.add(base,roof);h.position.set(i%2? -7:6,0,2-i*5);scene.add(h)}
    addGate(scene);
    const colors=[0x8a3e29,0x224f56,0x6c3d76,0x3d6134];const player=createPerson(colors[character%colors.length],0xb87850);player.position.set(0,0,6);scene.add(player);
    const npc=createPerson(0x6f2a25,0xa76342,1.05);npc.position.set(-2,0,-11);npc.rotation.y=.35;scene.add(npc);
    const npcHalo=new THREE.Mesh(new THREE.TorusGeometry(.55,.035,8,32),new THREE.MeshBasicMaterial({color:0xf1c972}));npcHalo.rotation.x=Math.PI/2;npcHalo.position.set(-2,.06,-11);scene.add(npcHalo);
    const markers=new Map<string,THREE.Group>();DISCOVERIES.forEach((d,i)=>{const g=new THREE.Group();const gem=new THREE.Mesh(i===0?new THREE.SphereGeometry(.32,14,10):i===1?new THREE.BoxGeometry(.6,.22,.6):new THREE.BoxGeometry(.5,.7,.25),new THREE.MeshStandardMaterial({color:0xe8bb5c,emissive:0x51370b,emissiveIntensity:.45}));gem.position.y=.8;const ring=new THREE.Mesh(new THREE.TorusGeometry(.55,.025,6,26),new THREE.MeshBasicMaterial({color:0xffda78}));ring.position.y=.1;ring.rotation.x=Math.PI/2;g.add(gem,ring);g.position.set(d.x,0,d.z);scene.add(g);markers.set(d.id,g)});
    const keys=new Set<string>();let near:{type:"npc"|"object"|null,id?:string}={type:null};let bob=0;
    const down=(e:KeyboardEvent)=>{keys.add(e.key.toLowerCase());if(e.key.toLowerCase()==="e"){if(near.type==="object"){const d=DISCOVERIES.find(x=>x.id===near.id);if(d){cbDiscover.current(d);const m=markers.get(d.id);if(m)m.visible=false}}}};const up=(e:KeyboardEvent)=>keys.delete(e.key.toLowerCase());window.addEventListener("keydown",down);window.addEventListener("keyup",up);
    let raf=0;const clock=new THREE.Clock();
    const tick=()=>{const dt=Math.min(clock.getDelta(),.04);let dx=0,dz=0;if(keys.has("w")||keys.has("arrowup"))dz-=1;if(keys.has("s")||keys.has("arrowdown"))dz+=1;if(keys.has("a")||keys.has("arrowleft"))dx-=1;if(keys.has("d")||keys.has("arrowright"))dx+=1;if(dx||dz){const l=Math.hypot(dx,dz);player.position.x+=dx/l*dt*4.5;player.position.z+=dz/l*dt*4.5;player.position.x=THREE.MathUtils.clamp(player.position.x,-18,18);player.position.z=THREE.MathUtils.clamp(player.position.z,-20,18);player.rotation.y=Math.atan2(dx,dz);bob+=dt*10;player.position.y=Math.abs(Math.sin(bob))*.08}else player.position.y*=.85;
      const target=new THREE.Vector3(player.position.x,5.3,player.position.z+8.5);camera.position.lerp(target,.08);camera.lookAt(player.position.x,1.1,player.position.z-3.5);
      let next:{type:"npc"|"object"|null,id?:string}={type:null};if(player.position.distanceTo(npc.position)<2.8)next={type:"npc"};else for(const d of DISCOVERIES){const m=markers.get(d.id);if(m?.visible&&player.position.distanceTo(m.position)<2.2){next={type:"object",id:d.id};break}}if(next.type!==near.type||next.id!==near.id){near=next;cbNear.current(next.type,next.id)}
      const t=performance.now()*.001;markers.forEach(m=>{m.rotation.y+=.012;m.position.y=Math.sin(t*2+m.position.x)*.08});renderer.render(scene,camera);raf=requestAnimationFrame(tick)};tick();
    const resize=()=>{if(!el)return;camera.aspect=el.clientWidth/el.clientHeight;camera.updateProjectionMatrix();renderer.setSize(el.clientWidth,el.clientHeight)};window.addEventListener("resize",resize);
    return()=>{cancelAnimationFrame(raf);window.removeEventListener("resize",resize);window.removeEventListener("keydown",down);window.removeEventListener("keyup",up);renderer.dispose();el.removeChild(renderer.domElement)};
  },[character]);
  return <div className="world3d" ref={mount}/>;
}

function Launcher({onLaunch}:{onLaunch:(character:number,avatar:string|null)=>void}){
  const [step,setStep]=useState(0);const [year,setYear]=useState(1350);const [character,setCharacter]=useState(0);const [avatar,setAvatar]=useState<string|null>(null);
  const upload=(e:ChangeEvent<HTMLInputElement>)=>{const f=e.target.files?.[0];if(f&&f.size<5_000_000){const r=new FileReader();r.onload=()=>setAvatar(String(r.result));r.readAsDataURL(f)}};
  return <div className="launcher"><div className="launch-brand"><span className="brand-mark">OTM</span><span>OUR TIME MACHINE<small>FROM SUPERCONTINENT TO SUPERCONTINENT</small></span></div><div className="stepper"><b className={step>=0?"on":""}>01</b><i/><b className={step>=1?"on":""}>02</b><i/><b className={step>=2?"on":""}>03</b></div>
    {step===0&&<div className="launch-grid"><section><p className="eyebrow">PILIH TITIK WAKTU</p><h1>Jelajahi<br/><em>jejak bumi.</em></h1><p className="lead">Geser lintasan waktu dari Pangea, melintasi masa kini, hingga prediksi superbenua berikutnya.</p><div className="timeline"><div className="range-label"><span>100 JUTA TAHUN LALU</span><strong>{year===1350?"1350 M":year}</strong><span>+100 JUTA TAHUN</span></div><input aria-label="Pilih tahun" type="range" min="-100" max="100" value={year===1350?0:year} onChange={e=>setYear(Number(e.target.value))}/><div className="era-tags"><span>PANGEA</span><span className="active">MAJAPAHIT</span><span>2026</span><span>AMASIA?</span></div></div></section><div className="earth-wrap"><div className="orbit"/><div className="earth"><i/><i/><i/></div><div className="earth-caption"><small>KOORDINAT TERPILIH</small><strong>7.56° S · 112.38° E</strong><span>TROWULAN, JAWA TIMUR</span></div></div></div>}
    {step===1&&<div className="character-step"><section><p className="eyebrow">PILIH PENJELAJAHMU</p><h1>Siapa yang akan<br/><em>menembus waktu?</em></h1><div className="char-picker"><button onClick={()=>setCharacter((character+3)%4)}>‹</button><div className={`avatar avatar-${character}`}>{avatar?<img src={avatar} alt="Karakter unggahan"/>:<><span className="head"/><span className="body"/></>}<i/></div><button onClick={()=>setCharacter((character+1)%4)}>›</button></div><div className="char-dots">{[0,1,2,3].map(i=><button aria-label={`Karakter ${i+1}`} key={i} onClick={()=>setCharacter(i)} className={i===character?"on":""}/>)}</div><label className="upload">＋ UNGGAH KARAKTERMU<input type="file" accept="image/*" onChange={upload}/></label><small>Foto hanya diproses dan disimpan di perangkatmu.</small></section></div>}
    {step===2&&<div className="destination"><section><p className="eyebrow">KONFIRMASI DESTINASI</p><h1>Kerajaan<br/><em>Majapahit</em></h1><div className="ticket"><div><small>WAKTU</small><strong>1350 M</strong></div><div><small>ERA</small><strong>Nusantara Kuno</strong></div><div><small>WILAYAH</small><strong>Trowulan, Jawa Timur</strong></div><div><small>MISI</small><strong>Jejak Kehidupan Kota</strong></div></div><div className="safety"><b>✓</b><p><strong>Jendela waktu stabil</strong><span>Mode edukasi · Konten sesuai usia 7–15 tahun</span></p></div></section></div>}
    <footer><button className="back" disabled={step===0} onClick={()=>setStep(step-1)}>← KEMBALI</button><p>{step===0?"Pilih waktu tujuan":step===1?"Pilih penjelajah":"Semua siap"}</p><button className="primary" onClick={()=>step<2?setStep(step+1):onLaunch(character,avatar)}>{step<2?"LANJUT":"READY TO TIME TRAVEL"} <span>→</span></button></footer>
  </div>
}

export default function Home(){
  const [launched,setLaunched]=useState(false);const [character,setCharacter]=useState(0);const [avatar,setAvatar]=useState<string|null>(null);const [lang,setLang]=useState<Lang>("id");const [near,setNear]=useState<{type:"npc"|"object"|null,id?:string}>({type:null});const [collected,setCollected]=useState<Discovery[]>([]);const [panel,setPanel]=useState<"npc"|"diary"|"fact"|null>(null);const [question,setQuestion]=useState("");const [chat,setChat]=useState<{role:"npc"|"you";text:string}[]>([]);const [summary,setSummary]=useState("");const [done,setDone]=useState(false);const [sound,setSound]=useState(true);const c=COPY[lang];
  useEffect(()=>{try{const saved=localStorage.getItem("otm-diary");if(saved){const d=JSON.parse(saved);setSummary(d.summary||"");setDone(Boolean(d.done))}}catch{}},[]);
  const speak=useCallback((text:string)=>{if(!sound||!("speechSynthesis" in window))return;speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang=lang==="id"?"id-ID":"en-US";u.rate=.92;u.pitch=.95;speechSynthesis.speak(u)},[lang,sound]);
  const launch=(ch:number,av:string|null)=>{setCharacter(ch);setAvatar(av);setLaunched(true);setChat([{role:"npc",text:COPY[lang].npcIntro}])};
  const discover=useCallback((d:Discovery)=>{setCollected(prev=>prev.some(x=>x.id===d.id)?prev:[...prev,d]);setPanel("fact")},[]);
  const interact=()=>{if(near.type==="npc"){setPanel("npc");if(chat.length===0)setChat([{role:"npc",text:c.npcIntro}]);speak(c.npcIntro)}else if(near.type==="object"){const d=DISCOVERIES.find(x=>x.id===near.id);if(d)discover(d)}};
  useEffect(()=>{const key=(e:KeyboardEvent)=>{if(e.key.toLowerCase()==="e"&&panel===null)interact();if(e.key==="Escape")setPanel(null)};window.addEventListener("keydown",key);return()=>window.removeEventListener("keydown",key)});
  const ask=(e:FormEvent)=>{e.preventDefault();if(!question.trim())return;const ans=answerQuestion(question,lang);setChat(v=>[...v,{role:"you",text:question},{role:"npc",text:ans}]);setQuestion("");setTimeout(()=>speak(ans),120)};
  const submitDiary=()=>{if(collected.length<3||summary.trim().length<80)return;setDone(true);localStorage.setItem("otm-diary",JSON.stringify({summary,done:true,date:new Date().toISOString()}))};
  const activeDiscovery=DISCOVERIES.find(x=>x.id===near.id)||collected[collected.length-1];
  if(!launched)return <Launcher onLaunch={launch}/>;
  return <main className="game-shell"><World character={character} onNear={(type,id)=>setNear({type,id})} onDiscover={discover}/><div className="cinematic"/>
    <header className="topbar"><div className="brand"><span className="brand-mark">OTM</span><span>OUR TIME MACHINE<small>MAJAPAHIT · 1350 M</small></span></div><div className="mission"><small>{c.mission}</small><strong>{c.missionText}</strong></div><div className="header-actions"><button aria-label="Toggle sound" onClick={()=>setSound(!sound)}>{sound?"♪":"♩"}</button><button className="lang" onClick={()=>setLang(lang==="id"?"en":"id")}>{lang.toUpperCase()} <span>⌄</span></button></div></header>
    <div className="status-card"><span className="pulse"/><div><small>{c.active}</small><strong>{c.place}</strong><p>{c.period}</p></div></div><div className="compass">W <b>◆</b> N <b>◆</b> E</div>
    <div className="controls"><span>W</span><div><span>A</span><span>S</span><span>D</span></div><small>{c.move}</small></div>
    <button className="diary" onClick={()=>setPanel("diary")}>✦ <span>{c.diary}<small>{collected.length} / 3 {c.discoveries}</small></span></button>
    <div className="player-id">{avatar?<img src={avatar} alt="Avatar pemain"/>:<span className={`mini-avatar c${character}`}/>}<div><small>PENJELAJAH</small><b>Traveler {String(character+1).padStart(2,"0")}</b></div></div>
    {near.type&&<button className="interact" onClick={interact}><kbd>E</kbd><span>{near.type==="npc"?c.talk:c.inspect}<small>{near.type==="npc"?"Arya Wira":DISCOVERIES.find(x=>x.id===near.id)?.title}</small></span></button>}
    {panel&&<div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setPanel(null)}}><section className={`panel ${panel}`}><button className="close" onClick={()=>setPanel(null)}>×</button>
      {panel==="npc"&&<><div className="npc-head"><div className="npc-portrait"><span/></div><div><small>PENJAGA GAPURA · NPC</small><h2>Arya Wira</h2><p>Warga Trowulan · 1350 M</p></div><button onClick={()=>chat.at(-1)&&speak(chat.at(-1)!.text)}>◖)))</button></div><div className="chat">{chat.map((m,i)=><div key={i} className={m.role}><small>{m.role==="npc"?"ARYA WIRA":"KAMU"}</small><p>{m.text}</p></div>)}</div><div className="suggestions">{[lang==="id"?"Siapa Hayam Wuruk?":"Who was Hayam Wuruk?",lang==="id"?"Bagaimana tata air kota?":"How was water managed?",lang==="id"?"Apa makanan sehari-hari?":"What did people eat?"].map(q=><button key={q} onClick={()=>setQuestion(q)}>{q}</button>)}</div><form onSubmit={ask}><input value={question} onChange={e=>setQuestion(e.target.value)} placeholder={c.ask}/><button>{c.send} →</button></form></>}
      {panel==="fact"&&activeDiscovery&&<><div className="fact-icon">{activeDiscovery.icon}</div><p className="eyebrow">{c.found}</p><h2>{activeDiscovery.title}</h2><small>{activeDiscovery.year}</small><p className="fact-copy">{activeDiscovery.text}</p><div className="fact-progress">{DISCOVERIES.map(d=><i key={d.id} className={collected.some(x=>x.id===d.id)?"on":""}/>)}</div><button className="primary wide" onClick={()=>setPanel(null)}>SIMPAN KE DIARY <span>→</span></button></>}
      {panel==="diary"&&<><div className="diary-title"><p className="eyebrow">CHAPTER 01</p><h2>Time Travel Diary</h2><p>Majapahit · Trowulan · 1350 M</p></div><div className="discovery-list">{DISCOVERIES.map(d=><article className={collected.some(x=>x.id===d.id)?"found":""} key={d.id}><b>{d.icon}</b><div><small>{collected.some(x=>x.id===d.id)?"DITEMUKAN":"BELUM DITEMUKAN"}</small><strong>{d.title}</strong></div><span>{collected.some(x=>x.id===d.id)?"✓":"?"}</span></article>)}</div><label className="summary-label">RANGKUMAN PERJALANAN <span>{summary.length}/80 min.</span><textarea value={summary} onChange={e=>setSummary(e.target.value)} placeholder={c.summary}/></label>{done?<div className="completed">✓ {c.complete}</div>:<><button className="primary wide" disabled={collected.length<3||summary.trim().length<80} onClick={submitDiary}>{c.submit} <span>→</span></button>{collected.length<3&&<small className="locked">⌁ {c.locked}</small>}</>}<details><summary>{c.sources}</summary><a href="https://whc.unesco.org/en/tentativelists/5466/" target="_blank">UNESCO · Trowulan, Former Capital City of Majapahit</a><a href="https://kebudayaan.kemdikbud.go.id/dpk/sosialisasi-hasil-kajian-zonasi-kcbn-trowulan/" target="_blank">Kemendikbud · Kawasan Cagar Budaya Trowulan</a><a href="https://www.museumnasional.or.id/4388/" target="_blank">Museum Nasional · Celengan Majapahit</a></details></>}
    </section></div>}
  </main>
}
