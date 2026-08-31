/* BlastTier player management */
const KEY="blasttier_players_v1";
const LOGOS={
 overall:"assets/overall.png",ltms:"assets/ltms.png",vanilla:"assets/vanilla.png",uhc:"assets/uhc.png",
 pot:"assets/pot.png",nethop:"assets/nethop.png",smp:"assets/smp.png",sword:"assets/sword.png",
 axe:"assets/axe.png",mace:"assets/mace.png",cart:"assets/cart.png",spearmace:"assets/spearmace.png",
 "diamond-smp":"assets/diamond-smp.png"
};
const NAMES={ltms:"LTMs",vanilla:"Vanilla",uhc:"UHC",pot:"Pot",nethop:"NethOP",smp:"SMP","diamond-smp":"Diamond SMP",sword:"Sword",axe:"Axe",mace:"Mace",cart:"Cart",spearmace:"SpearMace"};
const DEFAULT_KITS=Object.entries(NAMES).map(([id,name])=>({name,icon:id}));
let data=JSON.parse(localStorage.getItem(KEY)||"null")||{players:[],kits:DEFAULT_KITS};
function save(){localStorage.setItem(KEY,JSON.stringify(data))}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function $(s){return document.querySelector(s)}
function modal(html){let m=document.createElement("div");m.className="modal show";m.innerHTML=`<div class="box">${html}</div>`;document.body.appendChild(m);return m}
function closeModal(m){if(m)m.remove()}
function img(kit){let k=data.kits.find(x=>x.name===kit);return k?.icon?`assets/${k.icon}.png`:(LOGOS[kit?.toLowerCase()]||LOGOS.sword)}
function profile(id){
 const p=data.players.find(x=>x.id===id); if(!p)return;
 const m=modal(`<button class="close">×</button><h2>${esc(p.name)}</h2>
 <div class="profile-preview">${p.skin?`<img src="${p.skin}">`:""}</div>
 <div class="profile-meta"><b>${esc(p.rank)}</b><span>${esc(p.region)}</span><span>${+p.points||0} points</span></div>
 <h3>Kit Tiers</h3><div class="profile-tiers">${(p.combos||[]).map(c=>`<div class="profile-tier"><img src="${img(c.kit)}"><b>${esc(c.kit)}</b><strong>${esc(c.tier)}</strong></div>`).join("")||"<span class='muted'>No kit tiers</span>"}</div>
 <div class="profile-actions"><button type="button" class="btn primary" id="profileEdit">Edit Player</button></div>`);
 m.querySelector(".close").onclick=()=>closeModal(m);
 m.querySelector("#profileEdit").onclick=()=>{closeModal(m);editPlayer(p.id)};
}
function editPlayer(id){
 const p=data.players.find(x=>x.id===id); if(!p)return;
 // Work on a draft so Cancel never changes the saved player.
 let draftCombos=(p.combos||[]).map(c=>({kit:c.kit,tier:c.tier||""}));
 const m=modal(`<button class="close" type="button">×</button><h2>Edit Player</h2>
 <div class="form edit-form">
 <label>Player name</label><input id="epn" value="${esc(p.name)}">
 <label>Rank</label><select id="epr">${["Combat Grandmaster","Combat Master","Combat Ace","Rookie"].map(x=>`<option ${x===p.rank?"selected":""}>${x}</option>`).join("")}</select>
 <label>Points</label><input id="epp" type="number" value="${+p.points||0}">
 <label>Region</label><select id="epg">${["NA","EU","AS","OCE","SA"].map(x=>`<option ${x===p.region?"selected":""}>${x}</option>`).join("")}</select>
 <label>Skin</label><input id="eps" type="file" accept="image/*">
 <h3>Kit + Tier</h3><div class="kit-tier-head"><span>Kit</span><span>Tier</span><span></span></div>
 <div id="editCombos"></div>
 <button type="button" class="btn primary add-kit-tier" id="addKitTier">＋ Add Kit + Tier</button>
 <div class="form-actions edit-actions"><button type="button" class="btn" id="cancelEdit">Cancel</button><button type="button" class="btn primary" id="saveEdit">Save Changes</button></div>
 <button type="button" class="btn danger full-delete" id="deletePlayer">Delete Player</button>
 </div>`);
 m.querySelector('.close').onclick=()=>closeModal(m);
 m.querySelector('#cancelEdit').onclick=()=>closeModal(m);
 function renderCombos(){
   const box=m.querySelector('#editCombos');
   box.innerHTML=draftCombos.length?draftCombos.map((c,i)=>`<div class="edit-combo">
   <select class="edit-kit">${data.kits.map(k=>`<option value="${esc(k.name)}" ${k.name===c.kit?'selected':''}>${esc(k.name)}</option>`).join('')}</select>
   <input class="edit-tier" value="${esc(c.tier)}" placeholder="HT1 / LT1">
   <button type="button" class="btn danger remove-kit" data-i="${i}" title="Remove kit">×</button></div>`).join(''):'<div class="muted edit-empty">No kit tiers added yet.</div>';
   box.querySelectorAll('.remove-kit').forEach(b=>b.onclick=()=>{draftCombos.splice(+b.dataset.i,1);renderCombos()});
 }
 m.querySelector('#addKitTier').onclick=()=>{
   const available=data.kits.find(k=>!draftCombos.some(c=>c.kit===k.name));
   if(!available){alert('All available kits are already added.');return}
   draftCombos.push({kit:available.name,tier:''});
   renderCombos();
   const last=m.querySelector('.edit-combo:last-child');
   if(last){last.scrollIntoView({behavior:'smooth',block:'center'});last.querySelector('.edit-tier')?.focus()}
 };
 m.querySelector('#deletePlayer').onclick=()=>{if(confirm(`Delete ${p.name}?`)){data.players=data.players.filter(x=>x.id!==p.id);save();closeModal(m);renderRows()}};
 m.querySelector('#saveEdit').onclick=()=>{
   const n=m.querySelector('#epn').value.trim();if(!n)return alert('Enter player name.');
   p.name=n;p.rank=m.querySelector('#epr').value;p.points=+m.querySelector('#epp').value||0;p.region=m.querySelector('#epg').value;
   p.combos=[...m.querySelectorAll('.edit-combo')].map(r=>({kit:r.querySelector('.edit-kit').value,tier:r.querySelector('.edit-tier').value.trim()})).filter(x=>x.tier);
   const f=m.querySelector('#eps').files[0],done=()=>{save();closeModal(m);renderRows()};
   if(f){const r=new FileReader();r.onload=e=>{p.skin=e.target.result;done()};r.readAsDataURL(f)}else done();
 };
 renderCombos();
}

function renderTabs(){
 const tabs=$("#tabs");if(!tabs)return;
 const arr=[["overall","Overall"],...Object.entries(NAMES)];
 tabs.innerHTML=arr.map(([id,name],i)=>`<button class="tab ${i===0?"active":""}" data-kit="${name}"><img src="${LOGOS[id]||`assets/${id}.png`}"><span>${name}</span></button>`).join("");
 tabs.querySelectorAll(".tab").forEach(b=>b.onclick=()=>{tabs.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));b.classList.add("active");renderRows(b.dataset.kit)});
}
function renderRows(filter="Overall"){
 const list=$("#playerList")||$("#rows"); if(!list)return;
 let ps=[...data.players].sort((a,b)=>(+b.points||0)-(+a.points||0));
 if(filter!=="Overall")ps=ps.filter(p=>(p.combos||[]).some(c=>c.kit===filter));
 if(!ps.length){list.innerHTML='<div class="empty"><div class="trophy">🏆</div><h2>No players yet!</h2><div>Add players to start building the BlastTier rankings.</div></div>';return}
 list.innerHTML=ps.map((p,i)=>`<div class="player-row" data-id="${esc(p.id)}">
 <div class="place">${i+1}.</div>
 <div class="player-info"><div class="skin">${p.skin?`<img src="${p.skin}">`:""}</div><div><div class="pname">${esc(p.name)}</div><div class="meta">◆ ${esc(p.rank)} (${+p.points||0} points)</div></div></div>
 <div class="region">${esc(p.region)}</div>
 <div class="combos">${(p.combos||[]).map(c=>`<div class="combo"><img src="${img(c.kit)}"><span>${esc(c.tier)}</span></div>`).join("")||'<span class="muted">No tiers</span>'}</div>
 <div class="row-actions"><button type="button" class="btn edit-player" data-edit="${esc(p.id)}">Edit</button></div>
 </div>`).join("");
 list.querySelectorAll(".player-row").forEach(r=>r.onclick=e=>{if(e.target.closest(".row-actions"))return;profile(r.dataset.id)});
 list.querySelectorAll(".edit-player").forEach(b=>b.onclick=e=>{e.stopPropagation();editPlayer(b.dataset.edit)});
}
function addPlayer(){
 const m=modal(`<button class="close">×</button><h2>Add Player</h2><div class="form">
 <label>Player name</label><input id="apn">
 <label>Rank</label><select id="apr"><option>Combat Grandmaster</option><option>Combat Master</option><option>Combat Ace</option><option>Rookie</option></select>
 <label>Points</label><input id="app" type="number" value="0"><label>Region</label><select id="apg"><option>NA</option><option>EU</option><option>AS</option><option>OCE</option><option>SA</option></select>
 <label>Skin</label><input id="aps" type="file" accept="image/*">
 <div class="form-actions"><button class="btn" id="cancel">Cancel</button><button class="btn primary" id="add">Add Player</button></div></div>`);
 m.querySelector(".close").onclick=()=>closeModal(m);m.querySelector("#cancel").onclick=()=>closeModal(m);
 m.querySelector("#add").onclick=()=>{
   const n=m.querySelector("#apn").value.trim();if(!n)return alert("Enter player name.");
   const p={id:crypto.randomUUID(),name:n,rank:m.querySelector("#apr").value,points:+m.querySelector("#app").value||0,region:m.querySelector("#apg").value,skin:"",combos:[]};
   const f=m.querySelector("#aps").files[0],done=()=>{data.players.push(p);save();closeModal(m);renderRows()};
   if(f){const r=new FileReader();r.onload=e=>{p.skin=e.target.result;done()};r.readAsDataURL(f)}else done();
 };
}
function init(){
 renderTabs();renderRows();
 const add=$("#addPlayerBtn")||document.querySelector('[onclick*="playerM"]');
 if(add){add.onclick=e=>{e.preventDefault();addPlayer()};add.removeAttribute("onclick")}
}
document.addEventListener("DOMContentLoaded",init);
