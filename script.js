
const KIT_DEFAULT=[['Overall','overall'],['LTMs','ltms'],['Vanilla','vanilla'],['UHC','uhc'],['Pot','pot'],['NethOP','nethop'],['SMP','smp'],['Sword','sword'],['Axe','axe'],['Mace','mace']];
const KEY='blasttier_final_v3';
let data=JSON.parse(localStorage.getItem(KEY)||'null');
if(!data)data={players:[],kits:KIT_DEFAULT.slice(1).map(x=>({name:x[0],icon:x[1]})),tiers:[],messages:[]};
const $=s=>document.querySelector(s); const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function save(){localStorage.setItem(KEY,JSON.stringify(data))}
function kitByName(n){return data.kits.find(k=>k.name===n)}
function kitIcon(k){return (kitByName(k)?.icon)||'sword'}
function img(k){return `assets/${kitIcon(k)}.png`}
function allKits(){return [{name:'Overall',icon:'overall'},...data.kits]}
function tabs(){let b=$('#tabs');if(!b)return;b.innerHTML=allKits().map(k=>`<button class="tab ${k.name==='Overall'?'active':''}" data-kit="${esc(k.name)}"><img src="assets/${k.icon}.png"><span>${esc(k.name)}</span></button>`).join('');b.querySelectorAll('.tab').forEach(x=>x.onclick=()=>{b.querySelectorAll('.tab').forEach(y=>y.classList.remove('active'));x.classList.add('active');renderRows(x.dataset.kit)})}
function playerCombos(p){return (p.combos||[]).map(c=>`<div class="combo"><img src="${img(c.kit)}"><span class="tier">${esc(c.tier)}</span></div>`).join('')}

var editingPlayer=null;
function openEditPlayer(id){
 editingPlayer=players.find(function(p){return p.id===id}); if(!editingPlayer)return;
 var m=document.getElementById("editPlayerModal"); if(!m)return;
 document.getElementById("epName").value=editingPlayer.name||"";
 document.getElementById("epRank").value=editingPlayer.rank||"LT3";
 document.getElementById("epPoints").value=editingPlayer.points||0;
 document.getElementById("epRegion").value=editingPlayer.region||"AS";
 renderEditCombos(); m.classList.add("show");
}
function renderEditCombos(){
 var b=document.getElementById("editCombos"); if(!b)return;
 var cs=editingPlayer?.combos||[];
 b.innerHTML=cs.length?cs.map(function(c,i){
  return '<div class="edit-combo"><select class="edit-kit" data-i="'+i+'">'+kits.map(function(k){return '<option '+(k.name===c.kit?'selected':'')+'>'+esc(k.name)+'</option>'}).join("")+'</select><input class="edit-tier" data-i="'+i+'" value="'+esc(c.tier||"")+'" placeholder="Tier"><button type="button" class="btn danger remove-combo" data-i="'+i+'">×</button></div>';
 }).join(""):'<div class="edit-empty">No kit tiers added yet.</div>';
 b.querySelectorAll(".remove-combo").forEach(function(x){x.onclick=function(){editingPlayer.combos.splice(Number(x.dataset.i),1);renderEditCombos()}});
}
function addPlayerKit(){
 if(!editingPlayer)return;
 editingPlayer.combos=editingPlayer.combos||[];
 editingPlayer.combos.push({kit:kits[0]?.name||"Sword",tier:""});
 renderEditCombos();
}
function saveEditedPlayer(){
 if(!editingPlayer)return;
 var n=document.getElementById("epName").value.trim(); if(!n)return alert("Enter a player name.");
 editingPlayer.name=n; editingPlayer.rank=document.getElementById("epRank").value;
 editingPlayer.points=Number(document.getElementById("epPoints").value)||0;
 editingPlayer.region=document.getElementById("epRegion").value;
 editingPlayer.combos=Array.from(document.querySelectorAll(".edit-combo")).map(function(r){return {kit:r.querySelector(".edit-kit").value,tier:r.querySelector(".edit-tier").value.trim()}}).filter(function(x){return x.tier});
 save();closeModals();editingPlayer=null;renderPlayers();
}
function deletePlayer(id){
 var p=players.find(function(x){return x.id===id}); if(!p)return;
 if(!confirm('Delete player "'+p.name+'"?'))return;
 players=players.filter(function(x){return x.id!==id});save();renderPlayers();
}

function renderRows(filter='Overall'){
 let rows=$('#rows');if(!rows)return;let list=data.players.slice().sort((a,b)=>(+b.points||0)-(+a.points||0));
 if(filter!=='Overall')list=list.filter(p=>(p.combos||[]).some(c=>c.kit===filter));
 if(!list.length){rows.innerHTML='<div class="empty"><h2>No players yet</h2><p>Add a player to start building rankings.</p></div>';return}
 rows.innerHTML=list.map((p,i)=>`<div class="player-row" data-player="${esc(p.id)}"><div class="place">${i+1}.</div><div class="player-info"><div class="skin">${p.skin?`<img src="${p.skin}">`:esc(p.name.slice(0,2).toUpperCase())}</div><div><div class="pname">${esc(p.name)}</div><div class="meta">◆ ${esc(p.rank)} (${+p.points||0} points)</div></div></div><div class="region">${esc(p.region)}</div><div class="combos">${playerCombos(p)||'<span class="muted">No tiers</span>'}</div><button class="btn danger delete-player" data-delete="${esc(p.id)}">Delete</button></div>`).join('');
 rows.querySelectorAll('[data-player]').forEach(r=>r.onclick=e=>{if(e.target.closest('.delete-player'))return;profile(r.dataset.player)});
 rows.querySelectorAll('.delete-player').forEach(b=>b.onclick=e=>{e.stopPropagation();deletePlayer(b.dataset.delete)});
}
function renderHomeKits(){let b=$('#homeKits');if(!b)return;b.innerHTML=data.kits.map(k=>`<a class="kit-card" href="${k.name.toLowerCase()==='ltms'?'ltms':k.name.toLowerCase()==='nethop'?'nethop':k.name.toLowerCase()}.html"><img src="assets/${k.icon}.png"><strong>${esc(k.name)}</strong></a>`).join('')}
function modal(inner){let m=document.createElement('div');m.className='modal show';m.innerHTML=`<div class="modal-card">${inner}</div>`;document.body.appendChild(m);m.addEventListener('click',e=>{if(e.target===m)m.remove()});return m}
function profile(id){let p=data.players.find(x=>x.id===id);if(!p)return;let combos=(p.combos||[]).map(c=>`<div class="combo"><img src="${img(c.kit)}"><span class="tier">${esc(c.tier)}</span></div>`).join('');let m=modal(`<button class="close">×</button><div class="profile"><div class="big-skin">${p.skin?`<img src="${p.skin}">`:esc(p.name.slice(0,2))}</div><h2>${esc(p.name)}</h2><div class="pill">◆ ${esc(p.rank)}</div><div class="muted">${esc(p.region)}</div><a class="btn" style="margin-top:12px" target="_blank" rel="noopener" href="https://namemc.com/search?q=${encodeURIComponent(p.name)}">◉ NameMC ↗</a><h3>POSITION</h3><div class="position"><b>${data.players.slice().sort((a,b)=>(+b.points||0)-(+a.points||0)).findIndex(x=>x.id===p.id)+1}.</b> 🏆 <strong>OVERALL</strong> <span class="muted">(${+p.points||0} points)</span></div><h3>TIERS</h3><div class="profile-tiers">${combos||'<span class="muted">No tiers</span>'}</div></div>`);m.querySelector('.close').onclick=()=>m.remove()}
function deletePlayer(id){let p=data.players.find(x=>x.id===id);if(!p)return;if(confirm(`Delete player "${p.name}"?`)){data.players=data.players.filter(x=>x.id!==id);save();renderRows(document.querySelector('.tab.active')?.dataset.kit||'Overall')}}
function tierOptions(){return data.tiers.map(t=>`<option value="${esc(t.name)}" data-kit="${esc(t.kit)}">${esc(t.kit)} — ${esc(t.name)}</option>`).join('')}
function addPlayer(){let m=modal(`<button class="close">×</button><h2>Add Player</h2><div class="form"><label>Player name</label><input id="pn"><label>Player rank</label><select id="pr"><option>Combat Grandmaster</option><option>Combat Master</option><option>Combat Ace</option><option>Rookie</option></select><label>Points</label><input id="pp" type="number" value="0"><label>Region</label><select id="pg"><option>NA</option><option>EU</option><option>AS</option><option>SA</option><option>AU</option></select><label>Player skin</label><input id="ps" type="file" accept="image/*"><label>Tier</label><select id="pt"><option value="">No tier</option>${tierOptions()}</select><div class="form-actions"><button class="btn" id="cancel">Cancel</button><button class="btn primary" id="add">Add Player</button></div></div>`);m.querySelector('.close').onclick=()=>m.remove();m.querySelector('#cancel').onclick=()=>m.remove();m.querySelector('#add').onclick=()=>{let n=$('#pn').value.trim();if(!n)return alert('Enter player name.');if(data.players.some(p=>p.name.toLowerCase()===n.toLowerCase()))return alert('Player already exists.');let p={id:crypto.randomUUID(),name:n,rank:$('#pr').value,points:+$('#pp').value||0,region:$('#pg').value,combos:$('#pt').value?[{kit:document.querySelector('#pt option:checked').dataset.kit,tier:$('#pt').value}]:[],skin:''};let f=$('#ps').files[0];let done=()=>{data.players.push(p);save();m.remove();tabs();renderRows(document.querySelector('.tab.active')?.dataset.kit||'Overall')};if(f){let r=new FileReader();r.onload=e=>{p.skin=e.target.result;done()};r.readAsDataURL(f)}else done()}}
function addTier(){let m=modal(`<button class="close">×</button><h2>Add Tier</h2><div class="form"><label>Tier name</label><input id="tn" placeholder="HT1"><label>Kit</label><select id="tk">${data.kits.map(k=>`<option>${esc(k.name)}</option>`).join('')}</select><div class="form-actions"><button class="btn" id="cancel">Cancel</button><button class="btn primary" id="add">Add Tier</button></div></div>`);m.querySelector('.close').onclick=()=>m.remove();m.querySelector('#cancel').onclick=()=>m.remove();m.querySelector('#add').onclick=()=>{let n=$('#tn').value.trim(),k=$('#tk').value;if(!n)return alert('Enter tier name.');data.tiers.push({name:n,kit:k});save();m.remove()}}
function addKit(){let m=modal(`<button class="close">×</button><h2>Add Kit</h2><div class="form"><label>Kit name</label><input id="kn" placeholder="Crystal"><label>Choose icon</label><div id="icons" class="icon-picker">${data.kits.map(k=>k.icon).filter((v,i,a)=>a.indexOf(v)===i).concat(['sword','axe','mace','pot','uhc','vanilla','ltms','nethop','smp']).filter((v,i,a)=>a.indexOf(v)===i).map(k=>`<button type="button" class="icon-pick" data-icon="${k}"><img src="assets/${k}.png"></button>`).join('')}</div><div class="form-actions"><button class="btn" id="cancel">Cancel</button><button class="btn primary" id="add">Add Kit</button></div></div>`);let selected='sword';m.querySelectorAll('.icon-pick').forEach(b=>b.onclick=()=>{selected=b.dataset.icon;m.querySelectorAll('.icon-pick').forEach(x=>x.classList.remove('selected'));b.classList.add('selected')});m.querySelector('.close').onclick=()=>m.remove();m.querySelector('#cancel').onclick=()=>m.remove();m.querySelector('#add').onclick=()=>{let n=$('#kn').value.trim();if(!n)return alert('Enter kit name.');if(data.kits.some(k=>k.name.toLowerCase()===n.toLowerCase()))return alert('Kit already exists.');data.kits.push({name:n,icon:selected});save();m.remove();tabs();renderRows()}}
function kitPage(){let b=$('#kitRows');if(!b)return;let name=document.title.split(' — ')[0];let list=data.players.filter(p=>(p.combos||[]).some(c=>c.kit===name)).sort((a,b)=>(+b.points||0)-(+a.points||0));b.innerHTML=list.length?list.map((p,i)=>`<div class="player-row" data-player="${p.id}"><div class="place">${i+1}.</div><div class="player-info"><div class="skin">${p.skin?`<img src="${p.skin}">`:esc(p.name.slice(0,2))}</div><div><div class="pname">${esc(p.name)}</div><div class="meta">${esc(p.rank)} • ${+p.points||0} points</div></div></div><div class="region">${esc(p.region)}</div><div class="combos"><div class="combo"><img src="assets/${kitIcon(name)}.png"><span class="tier">${esc(p.combos.find(c=>c.kit===name).tier)}</span></div></div><button class="btn danger delete-player" data-delete="${p.id}">Delete</button></div>`).join(''):'<div class="empty"><h2>No players yet</h2><p>No players have been added to this kit.</p></div>';b.querySelectorAll('[data-player]').forEach(r=>r.onclick=e=>{if(!e.target.closest('.delete-player'))profile(r.dataset.player)});b.querySelectorAll('.delete-player').forEach(x=>x.onclick=e=>{e.stopPropagation();deletePlayer(x.dataset.delete)})}
function chatInit(){let b=$('#messages');if(!b)return;function render(){b.innerHTML=data.messages.length?data.messages.map(m=>`<div class="message"><b>${esc(m.name)}</b> <span class="muted">${esc(m.time)}</span><div>${esc(m.text)}</div></div>`).join(''):'<div class="empty">No messages yet.</div>'}render();$('#sendChat').onclick=()=>{let i=$('#chatText'),t=i.value.trim();if(!t)return;data.messages.push({name:'You',text:t,time:new Date().toLocaleTimeString()});i.value='';save();render()}}
document.addEventListener('DOMContentLoaded',()=>{renderHomeKits();tabs();renderRows();kitPage();chatInit();$('#addPlayerBtn')?.addEventListener('click',addPlayer);$('#addTierBtn')?.addEventListener('click',addTier);$('#addKitBtn')?.addEventListener('click',addKit);$('#globalSearch')?.addEventListener('keydown',e=>{if(e.key==='Enter'){let q=e.target.value.trim().toLowerCase();if(q)location.href='rankings.html?search='+encodeURIComponent(q)}});let q=new URLSearchParams(location.search).get('search');if(q&&$('#rows')){setTimeout(()=>{$('#globalSearch').value=q;renderRows();let r=$('#rows');r.innerHTML=[...r.querySelectorAll('.player-row')].filter(x=>x.innerText.toLowerCase().includes(q)).map(x=>x.outerHTML).join('')||'<div class="empty">No matching player.</div>'},0)}});

document.addEventListener("click",function(e){
 var ed=e.target.closest&&e.target.closest(".edit-player"); if(ed){openEditPlayer(ed.dataset.edit);return}
 var del=e.target.closest&&e.target.closest(".delete-player"); if(del){deletePlayer(del.dataset.delete);return}
});
