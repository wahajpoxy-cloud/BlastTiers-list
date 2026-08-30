
const STORAGE_KEY="blastTierData_v5";
const BASE_KITS=[
{id:"overall",name:"Overall",img:"assets/overall.png"},
{id:"ltms",name:"LTMs",img:"assets/ltms.png"},
{id:"vanilla",name:"Vanilla",img:"assets/vanilla.png"},
{id:"uhc",name:"UHC",img:"assets/uhc.png"},
{id:"pot",name:"Pot",img:"assets/pot.png"},
{id:"nethop",name:"NethOP",img:"assets/nethop.png"},
{id:"smp",name:"SMP",img:"assets/smp.png"},
{id:"sword",name:"Sword",img:"assets/sword.png"},
{id:"axe",name:"Axe",img:"assets/axe.png"},
{id:"mace",name:"Mace",img:"assets/mace.png"}];
const DEFAULT={players:[],tiers:[],customKits:[],messages:[]};
let data=load(),pending=[];

function load(){try{let x=JSON.parse(localStorage.getItem(STORAGE_KEY));return x&&typeof x==="object"?{...DEFAULT,...x}:structuredClone(DEFAULT)}catch{return structuredClone(DEFAULT)}}
function save(){localStorage.setItem(STORAGE_KEY,JSON.stringify(data))}
function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function allKits(){return [...BASE_KITS,...data.customKits]}
function getKit(n){return allKits().find(k=>k.name===n)||BASE_KITS[0]}

function openModal(id){const m=document.getElementById(id);if(m){m.classList.add("show");document.body.style.overflow="hidden";refreshSelects()}}
function closeModal(id){const m=document.getElementById(id);if(m){m.classList.remove("show");document.body.style.overflow=""}}
function closeModals(){document.querySelectorAll(".modal.show").forEach(m=>m.classList.remove("show"));document.body.style.overflow=""}

function refreshSelects(){
 const pt=document.getElementById("playerTier"),ck=document.getElementById("comboKit"),ct=document.getElementById("comboTier"),tk=document.getElementById("tierKit");
 if(pt)pt.innerHTML='<option value="">No player tier</option>'+data.tiers.map(t=>`<option>${esc(t.name)}</option>`).join("");
 if(ck)ck.innerHTML=allKits().filter(k=>k.id!=="overall").map(k=>`<option>${esc(k.name)}</option>`).join("");
 if(ct)ct.innerHTML=data.tiers.length?data.tiers.map(t=>`<option>${esc(t.name)}</option>`).join(""):'<option value="">No tiers yet</option>';
 if(tk)tk.innerHTML=allKits().filter(k=>k.id!=="overall").map(k=>`<option>${esc(k.name)}</option>`).join("");
 renderPending();
}

function renderPending(){
 const e=document.getElementById("chosen");if(!e)return;
 e.innerHTML=pending.map((x,i)=>`<div>${esc(x.kit)} → <b class="tier">${esc(x.tier)}</b> <button type="button" class="btn danger" onclick="removePending(${i})">×</button></div>`).join("");
}
function addCombo(){
 const k=document.getElementById("comboKit")?.value,t=document.getElementById("comboTier")?.value;
 if(!k||!t)return alert("Add a tier first.");
 if(pending.some(x=>x.kit===k))return alert("This kit is already added.");
 pending.push({kit:k,tier:t});renderPending();
}
function removePending(i){pending.splice(i,1);renderPending()}

function addPlayer(){
 const name=document.getElementById("playerName")?.value.trim();
 if(!name)return alert("Enter player name.");
 if(data.players.some(p=>p.name.toLowerCase()===name.toLowerCase()))return alert("Player already exists.");
 if(!pending.length)return alert("Add at least one Kit + Tier.");
 const p={id:Date.now()+Math.random(),name,rank:document.getElementById("playerRank")?.value||"Combat Master",
 points:Number(document.getElementById("playerPoints")?.value||0),region:document.getElementById("playerRegion")?.value||"NA",
 playerTier:document.getElementById("playerTier")?.value||"",combos:[...pending],skin:""};
 const file=document.getElementById("playerSkin")?.files?.[0];
 const finish=()=>{data.players.push(p);save();pending=[];document.getElementById("playerForm")?.reset();closeModals();refreshAll()};
 if(file){
  if(file.size>2*1024*1024)return alert("Skin must be under 2 MB.");
  const r=new FileReader();r.onload=()=>{p.skin=r.result;finish()};r.readAsDataURL(file);
 }else finish();
}

function playerHTML(p,i){
 const combos=(p.combos||[]).map(c=>{const k=getKit(c.kit);return `<div class="combo"><img src="${k.img}" alt=""><span>${esc(c.kit)}<br><b class="tier">${esc(c.tier)}</b></span></div>`}).join("");
 return `<div class="player"><div class="place">${i+1}.</div><div class="skin">${p.skin?`<img src="${p.skin}" alt="">`:""}</div>
 <div><div class="name">${esc(p.name)}</div><div class="meta">◆ ${esc(p.rank)} (${Number(p.points)||0} points)${p.playerTier?` • ${esc(p.playerTier)}`:""}</div></div>
 <div class="region">${esc(p.region)}</div><div class="combos">${combos}</div>
 <button class="btn danger delete-player" type="button" onclick="deletePlayer('${p.id}')">Delete</button></div>`;
}
function renderPlayers(el,kitName=null){
 if(!el)return;
 const q=(document.getElementById("searchBox")?.value||"").trim().toLowerCase();
 let a=data.players.filter(p=>p.name.toLowerCase().includes(q));
 if(kitName)a=a.filter(p=>(p.combos||[]).some(c=>c.kit===kitName));
 a.sort((x,y)=>(Number(y.points)||0)-(Number(x.points)||0));
 el.innerHTML=a.length?a.map(playerHTML).join(""):`<div class="empty"><div class="big">🏆</div><h2>No players yet!</h2><p>Add a player to start the rankings.</p></div>`;
}
function deletePlayer(id){if(confirm("Delete this player?")){data.players=data.players.filter(p=>String(p.id)!==String(id));save();refreshAll()}}

function addTier(){
 const name=document.getElementById("tierName")?.value.trim(),kit=document.getElementById("tierKit")?.value;
 if(!name||!kit)return alert("Enter tier name and kit.");
 if(data.tiers.some(t=>t.name.toLowerCase()===name.toLowerCase()&&t.kit===kit))return alert("That tier already exists.");
 data.tiers.push({id:Date.now()+Math.random(),name,kit});save();
 const f=document.getElementById("addTierForm");if(f)f.reset();closeModals();refreshAll();
}
function addKit(){
 const name=document.getElementById("kitName")?.value.trim();
 if(!name)return alert("Enter kit name.");
 if(allKits().some(k=>k.name.toLowerCase()===name.toLowerCase()))return alert("Kit already exists.");
 data.customKits.push({id:"custom-"+Date.now(),name,img:"assets/overall.png"});save();
 document.getElementById("kitName").value="";closeModals();refreshAll();
}
function renderKitGrid(){
 const e=document.getElementById("kitGrid");if(!e)return;
 e.innerHTML=allKits().filter(k=>k.id!=="overall").map(k=>`<a class="card" href="${k.id.startsWith("custom-")?"index.html":k.id+".html"}"><img src="${k.img}" alt=""><h3>${esc(k.name)}</h3></a>`).join("");
}
function renderTierGrid(){
 const e=document.getElementById("tierGrid");if(!e)return;
 e.innerHTML=data.tiers.length?data.tiers.map(t=>`<div class="card"><h3>${esc(t.name)}</h3><div class="sub">${esc(t.kit)}</div></div>`).join(""):'<div class="notice">No tiers added yet.</div>';
}
function chatInit(){
 const e=document.getElementById("messages");if(!e)return;
 e.innerHTML=data.messages.map(m=>`<div class="msg"><b>${esc(m.user)}</b><br>${esc(m.text)}</div>`).join("");
 e.scrollTop=e.scrollHeight;
}
function sendChat(){
 const i=document.getElementById("chatInput"),v=i?.value.trim();if(!v)return;
 data.messages.push({user:"You",text:v,time:Date.now()});save();i.value="";chatInit();
}
function refreshAll(){
 refreshSelects();
 const p=document.getElementById("playerList");if(p)renderPlayers(p,document.body.dataset.kit||null);
 const r=document.getElementById("rankingList");if(r)renderPlayers(r);
 renderKitGrid();renderTierGrid();chatInit();
}
document.addEventListener("click",e=>{
 const modal=e.target.closest(".modal");if(modal&&e.target===modal)closeModal(modal.id);
});
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeModals()});
document.addEventListener("DOMContentLoaded",()=>{
 const s=document.getElementById("searchBox");if(s)s.addEventListener("input",refreshAll);
 const f=document.getElementById("addPlayerForm");if(f)f.addEventListener("submit",e=>{e.preventDefault();addPlayer()});
 const tf=document.getElementById("addTierForm");if(tf)tf.addEventListener("submit",e=>{e.preventDefault();addTier()});
 const kf=document.getElementById("addKitForm");if(kf)kf.addEventListener("submit",e=>{e.preventDefault();addKit()});
 const ci=document.getElementById("chatInput");if(ci)ci.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();sendChat()}});
 document.querySelectorAll(".kit-tab").forEach(a=>a.classList.toggle("active",a.dataset.kit===(document.body.dataset.kit||"overall")));
 refreshAll();
});
