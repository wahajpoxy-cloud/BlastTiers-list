(() => {
"use strict";

const KEY = "blastTierData_v6";
const KITS = [
 ["overall","Overall","assets/overall.png"],["ltms","LTMs","assets/ltms.png"],
 ["vanilla","Vanilla","assets/vanilla.png"],["uhc","UHC","assets/uhc.png"],
 ["pot","Pot","assets/pot.png"],["nethop","NethOP","assets/nethop.png"],
 ["smp","SMP","assets/smp.png"],["sword","Sword","assets/sword.png"],
 ["axe","Axe","assets/axe.png"],["mace","Mace","assets/mace.png"]
];
const EMPTY={players:[],tiers:[],customKits:[],messages:[]};
let db = readDB(), pending=[];

function readDB(){
  try { const x=JSON.parse(localStorage.getItem(KEY)); return x && typeof x==="object" ? {
    players:Array.isArray(x.players)?x.players:[], tiers:Array.isArray(x.tiers)?x.tiers:[],
    customKits:Array.isArray(x.customKits)?x.customKits:[], messages:Array.isArray(x.messages)?x.messages:[]
  }:structuredClone(EMPTY); } catch(e){ return structuredClone(EMPTY); }
}
function writeDB(){ try{localStorage.setItem(KEY,JSON.stringify(db));}catch(e){alert("Browser storage is unavailable.");} }
function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function kitList(){return KITS.map(x=>({id:x[0],name:x[1],img:x[2]})).concat(db.customKits)}
function findKit(n){return kitList().find(x=>x.name===n)||{name:n,img:"assets/overall.png"}}

window.openModal=function(id){
  const m=document.getElementById(id);
  if(!m){alert("This button is missing its panel: "+id);return;}
  m.classList.add("show"); document.body.style.overflow="hidden"; refreshSelects();
};
window.closeModal=function(id){
  const m=document.getElementById(id); if(m)m.classList.remove("show");
  if(!document.querySelector(".modal.show"))document.body.style.overflow="";
};
window.closeAll=function(){document.querySelectorAll(".modal").forEach(m=>m.classList.remove("show"));document.body.style.overflow=""};

function refreshSelects(){
  const playerTier=document.getElementById("playerTier");
  const comboKit=document.getElementById("comboKit");
  const comboTier=document.getElementById("comboTier");
  const tierKit=document.getElementById("tierKit");
  if(playerTier)playerTier.innerHTML='<option value="">No player tier</option>'+db.tiers.map(t=>`<option value="${esc(t.name)}">${esc(t.name)}</option>`).join("");
  if(comboKit)comboKit.innerHTML=kitList().filter(k=>k.id!=="overall").map(k=>`<option value="${esc(k.name)}">${esc(k.name)}</option>`).join("");
  if(comboTier)comboTier.innerHTML=db.tiers.length?db.tiers.map(t=>`<option value="${esc(t.name)}">${esc(t.name)}</option>`).join(""):'<option value="">No tiers yet</option>';
  if(tierKit)tierKit.innerHTML=kitList().filter(k=>k.id!=="overall").map(k=>`<option value="${esc(k.name)}">${esc(k.name)}</option>`).join("");
  renderPending();
}
function renderPending(){
  const e=document.getElementById("chosen"); if(!e)return;
  e.innerHTML=pending.map((x,i)=>`<div>${esc(x.kit)} → <b class="tier">${esc(x.tier)}</b> <button type="button" class="btn danger" onclick="removePending(${i})">×</button></div>`).join("");
}
window.addCombo=function(){
  const k=document.getElementById("comboKit")?.value, t=document.getElementById("comboTier")?.value;
  if(!k||!t)return alert("First add a tier with Add Tier.");
  if(pending.some(x=>x.kit===k))return alert("This kit is already added.");
  pending.push({kit:k,tier:t}); renderPending();
};
window.removePending=function(i){pending.splice(i,1);renderPending()};

window.addPlayer=function(){
  const name=document.getElementById("playerName")?.value.trim();
  if(!name)return alert("Enter player name.");
  if(db.players.some(p=>p.name.toLowerCase()===name.toLowerCase()))return alert("Player already exists.");
  if(!pending.length)return alert("Add at least one Kit + Tier.");
  const p={
    id:crypto.randomUUID?crypto.randomUUID():String(Date.now()+Math.random()),
    name, rank:document.getElementById("playerRank")?.value||"Combat Master",
    points:Number(document.getElementById("playerPoints")?.value||0),
    region:document.getElementById("playerRegion")?.value||"NA",
    playerTier:document.getElementById("playerTier")?.value||"",
    combos:pending.map(x=>({...x})), skin:""
  };
  const file=document.getElementById("playerSkin")?.files?.[0];
  const finish=()=>{db.players.push(p);writeDB();pending=[];document.getElementById("playerForm")?.reset();closeAll();renderAll();};
  if(file){
    if(file.size>3*1024*1024)return alert("Skin image must be under 3 MB.");
    const reader=new FileReader();
    reader.onload=()=>{p.skin=reader.result;finish()};
    reader.onerror=()=>alert("Could not read the skin file.");
    reader.readAsDataURL(file);
  } else finish();
};

function playerRow(p,i){
  const combos=(p.combos||[]).map(c=>{
    const k=findKit(c.kit);
    return `<div class="combo"><img src="${esc(k.img)}" alt=""><span>${esc(c.kit)}<br><b class="tier">${esc(c.tier)}</b></span></div>`;
  }).join("");
  return `<div class="player">
    <div class="place">${i+1}.</div>
    <div class="skin">${p.skin?`<img src="${p.skin}" alt="">`:""}</div>
    <div><div class="name">${esc(p.name)}</div><div class="meta">◆ ${esc(p.rank)} (${Number(p.points)||0} points)${p.playerTier?` • ${esc(p.playerTier)}`:""}</div></div>
    <div class="region">${esc(p.region)}</div>
    <div class="combos">${combos||"<span class='meta'>No kits</span>"}</div>
    <button type="button" class="btn danger" onclick="deletePlayer('${esc(p.id)}')">Delete</button>
  </div>`;
}
window.deletePlayer=function(id){
  if(!confirm("Delete this player?"))return;
  db.players=db.players.filter(p=>String(p.id)!==String(id));writeDB();renderAll();
};
function renderPlayers(el,kitName){
  if(!el)return;
  const q=(document.getElementById("searchBox")?.value||"").trim().toLowerCase();
  let a=db.players.filter(p=>String(p.name).toLowerCase().includes(q));
  if(kitName)a=a.filter(p=>(p.combos||[]).some(c=>c.kit===kitName));
  a.sort((x,y)=>(Number(y.points)||0)-(Number(x.points)||0));
  el.innerHTML=a.length?a.map(playerRow).join(""):`<div class="empty"><div class="big">🏆</div><h2>No players yet!</h2><p>Add a player to start the rankings.</p></div>`;
}

window.addTier=function(){
  const name=document.getElementById("tierName")?.value.trim();
  const k=document.getElementById("tierKit")?.value;
  if(!name)return alert("Enter tier name.");
  if(!k)return alert("Choose a kit.");
  if(db.tiers.some(t=>t.name.toLowerCase()===name.toLowerCase()&&t.kit===k))return alert("That tier already exists for this kit.");
  db.tiers.push({id:String(Date.now()+Math.random()),name,kit:k});
  writeDB(); document.getElementById("tierName").value=""; closeAll(); refreshAll();
};
window.addKit=function(){
  const name=document.getElementById("kitName")?.value.trim();
  if(!name)return alert("Enter kit name.");
  if(kitList().some(k=>k.name.toLowerCase()===name.toLowerCase()))return alert("Kit already exists.");
  // Custom kit is stored without touching any existing asset.
  db.customKits.push({id:"custom-"+Date.now(),name,img:"assets/overall.png"});
  writeDB();document.getElementById("kitName").value="";closeAll();refreshAll();
};
function renderKitGrid(){
  const e=document.getElementById("kitGrid");if(!e)return;
  e.innerHTML=kitList().filter(k=>k.id!=="overall").map(k=>`<a class="card" href="${k.id.startsWith("custom-")?"index.html":k.id+".html"}"><img src="${esc(k.img)}" alt=""><h3>${esc(k.name)}</h3></a>`).join("");
}
function renderTierGrid(){
  const e=document.getElementById("tierGrid");if(!e)return;
  e.innerHTML=db.tiers.length?db.tiers.map(t=>`<div class="card"><h3>${esc(t.name)}</h3><div class="sub">${esc(t.kit)}</div></div>`).join(""):'<div class="notice">No tiers added yet.</div>';
}
window.sendChat=function(){
  const i=document.getElementById("chatInput"),v=i?.value.trim();if(!v)return;
  db.messages.push({user:"You",text:v,time:Date.now()});writeDB();i.value="";renderChat();
};
function renderChat(){
  const e=document.getElementById("messages");if(!e)return;
  e.innerHTML=db.messages.map(m=>`<div class="msg"><b>${esc(m.user)}</b><br>${esc(m.text)}</div>`).join("");
  e.scrollTop=e.scrollHeight;
}
function refreshAll(){
  refreshSelects();
  renderPlayers(document.getElementById("playerList"),document.body.dataset.kit||null);
  renderPlayers(document.getElementById("rankingList"),null);
  renderKitGrid();renderTierGrid();renderChat();
}
window.addEventListener("DOMContentLoaded",()=>{
  document.getElementById("searchBox")?.addEventListener("input",refreshAll);
  document.getElementById("playerForm")?.addEventListener("submit",e=>{e.preventDefault();addPlayer()});
  document.getElementById("chatInput")?.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();sendChat()}});
  document.querySelectorAll(".modal").forEach(m=>m.addEventListener("click",e=>{if(e.target===m)closeModal(m.id)}));
  document.addEventListener("keydown",e=>{if(e.key==="Escape")closeAll()});
  refreshAll();
});
})();