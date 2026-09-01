
const KIT_DEFAULT=[['Overall','overall'],['LTMs','ltms'],['Vanilla','vanilla'],['UHC','uhc'],['Pot','pot'],['NethOP','nethop'],['SMP','smp'],['Diamond SMP','diamond-smp'],['Sword','sword'],['Axe','axe'],['Mace','mace'],['Cart','cart'],['SpearMace','spearmace']];
const KEY='blasttier_final_v6';
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
function renderRows(filter='Overall'){
 let rows=$('#rows');if(!rows)return;
 let list=data.players.slice().sort((a,b)=>(+b.points||0)-(+a.points||0));
 if(filter!=='Overall')list=list.filter(p=>(p.combos||[]).some(c=>c.kit===filter));
 if(!list.length){rows.innerHTML='<div class="empty"><h2>No players yet</h2><p>Add a player to start building rankings.</p></div>';return}
 rows.innerHTML=list.map((p,i)=>{
   let combos=(p.combos||[]).map(c=>`<div class="combo"><img src="${img(c.kit)}"><span class="tier">${esc(c.tier)}</span></div>`).join('');
   return `<div class="player-row" data-player="${esc(p.id)}">
     <div class="place">${i+1}.</div>
     <div class="player-info"><div class="skin">${p.skin?`<img src="${p.skin}">`:esc(p.name.slice(0,2).toUpperCase())}</div>
       <div><div class="pname">${esc(p.name)}</div><div class="meta">◆ ${esc(p.rank)} (${+p.points||0} points)</div></div>
     </div>
     <div class="region">${esc(p.region)}</div>
     <div class="combos">${combos||'<span class="muted">No tiers</span>'}</div>
     <div class="row-actions"><button type="button" class="btn edit-row" data-edit="${esc(p.id)}">Edit</button></div>
   </div>`;
 }).join('');
 rows.querySelectorAll('.player-row').forEach(r=>r.onclick=e=>{if(!e.target.closest('.row-actions'))profile(r.dataset.player)});
 rows.querySelectorAll('.edit-row').forEach(b=>b.onclick=e=>{e.stopPropagation();editPlayer(b.dataset.edit)});
}

function kitSlug(n){return ({'LTMs':'ltms','NethOP':'nethop','Diamond SMP':'diamond-smp','SpearMace':'spearmace'}[n]||n.toLowerCase().replace(/\s+/g,'-'))}
function renderHomeKits(){let b=$('#homeKits');if(!b)return;b.innerHTML=data.kits.map(k=>`<a class="kit-card" href="${kitSlug(k.name)}.html"><img src="assets/${k.icon}.png"><strong>${esc(k.name)}</strong></a>`).join('')}
function modal(inner){let m=document.createElement('div');m.className='modal show';m.innerHTML=`<div class="modal-card">${inner}</div>`;document.body.appendChild(m);m.addEventListener('click',e=>{if(e.target===m)m.remove()});return m}
function profile(id){
 let p=data.players.find(x=>x.id===id);if(!p)return;
 let combos=(p.combos||[]).map(c=>`<div class="combo"><img src="${img(c.kit)}"><span class="tier">${esc(c.tier)}</span></div>`).join('');
 let pos=data.players.slice().sort((a,b)=>(+b.points||0)-(+a.points||0)).findIndex(x=>x.id===p.id)+1;
 let m=modal(`<button class="close">×</button>
 <div class="profile">
   <div class="big-skin">${p.skin?`<img src="${p.skin}">`:esc(p.name.slice(0,2))}</div>
   <h2>${esc(p.name)}</h2>
   <div class="pill">◆ ${esc(p.rank)}</div>
   <div class="muted">${esc(p.region)}</div>
   <a class="btn" style="margin-top:12px" target="_blank" rel="noopener" href="https://namemc.com/search?q=${encodeURIComponent(p.name)}">◉ NameMC ↗</a>
   <h3>POSITION</h3>
   <div class="position"><b>${pos}.</b> 🏆 <strong>OVERALL</strong> <span class="muted">(${+p.points||0} points)</span></div>
   <h3>TIERS</h3>
   <div class="profile-tiers">${combos||'<span class="muted">No tiers</span>'}</div>
   <div class="profile-actions profile-actions-last">
     <button type="button" class="btn primary edit-profile">Edit Player</button>
   </div>
 </div>`);
 m.querySelector('.close').onclick=()=>m.remove();
 m.querySelector('.edit-profile').onclick=()=>{m.remove();editPlayer(id)};
}
function deletePlayer(id){let p=data.players.find(x=>x.id===id);if(!p)return;if(confirm(`Delete player "${p.name}"?`)){data.players=data.players.filter(x=>x.id!==id);save();renderRows(document.querySelector('.tab.active')?.dataset.kit||'Overall')}}
function tierOptions(){return data.tiers.map(t=>`<option value="${esc(t.name)}" data-kit="${esc(t.kit)}">${esc(t.kit)} — ${esc(t.name)}</option>`).join('')}
function addPlayer(){
let m=modal(`<button class="close">×</button><h2>Add Player</h2><div class="form">
<label>Player name</label><input id="pn">
<label>Player rank</label><select id="pr"><option>Combat Grandmaster</option><option>Combat Master</option><option>Combat Ace</option><option>Rookie</option></select>
<label>Points</label><input id="pp" type="number" value="0">
<label>Region</label><select id="pg"><option>NA</option><option>EU</option><option>AS</option><option>SA</option><option>AU</option></select>
<label>Player skin</label><div class="skin-upload"><div id="newSkinPreview" class="skin-preview"><span>SKIN</span></div><label class="btn skin-btn" for="ps">Choose Skin</label><input id="ps" type="file" accept="image/*" hidden></div>
<div class="form-actions"><button class="btn" id="cancel">Cancel</button><button class="btn primary" id="add">Add Player</button></div>
</div>`);
m.querySelector('.close').onclick=()=>m.remove();
m.querySelector('#cancel').onclick=()=>m.remove();
m.querySelector('#add').onclick=()=>{
 let n=$('#pn').value.trim();
 if(!n)return alert('Enter player name.');
 if(data.players.some(p=>p.name.toLowerCase()===n.toLowerCase()))return alert('Player already exists.');
 let p={id:crypto.randomUUID(),name:n,rank:$('#pr').value,points:+$('#pp').value||0,region:$('#pg').value,combos:[],skin:''};
 let f=$('#ps').files[0];
 let done=()=>{data.players.push(p);save();m.remove();tabs();renderRows(document.querySelector('.tab.active')?.dataset.kit||'Overall')};
 if(f){let r=new FileReader();r.onload=e=>{p.skin=e.target.result;done()};r.readAsDataURL(f)}else done();
}
}
function editPlayer(id){
let p=data.players.find(x=>x.id===id);if(!p)return;
let m=modal(`<button class="close">×</button><h2>Edit Player</h2><div class="form">
<label>Player name</label><input id="epn" value="${esc(p.name)}">
<label>Player rank</label><select id="epr">${['Combat Grandmaster','Combat Master','Combat Ace','Rookie'].map(x=>`<option ${x===p.rank?'selected':''}>${x}</option>`).join('')}</select>
<label>Points</label><input id="epp" type="number" value="${+p.points||0}">
<label>Region</label><select id="epg">${['NA','EU','AS','SA','AU'].map(x=>`<option ${x===p.region?'selected':''}>${x}</option>`).join('')}</select>
<label>Player skin</label><div class="skin-upload"><div id="skinPreview" class="skin-preview">${p.skin?`<img src="${p.skin}">`:`<span>${esc(p.name.slice(0,2).toUpperCase())}</span>`}</div><label class="btn skin-btn" for="eps">Choose Skin</label><input id="eps" type="file" accept="image/*" hidden></div>
<h3 class="edit-title">PLAYER KIT TIERS</h3>
<div class="kit-tier-head"><span>Kit</span><span>Tier</span></div>
<div id="editCombos" class="edit-combos"></div>
<button type="button" class="btn primary" id="addPlayerKit">＋ Add Kit + Tier</button>
<div class="form-actions"><button class="btn" id="cancelEdit">Cancel</button><button class="btn primary" id="saveEdit">Save Changes</button></div><button type="button" class="btn danger delete-from-edit" id="deleteFromEdit">Delete Player</button>
</div>`);
m.querySelector('.close').onclick=()=>m.remove();m.querySelector('#cancelEdit').onclick=()=>m.remove();
m.querySelector('#deleteFromEdit').onclick=()=>{if(confirm(`Delete player "${p.name}"?`)){data.players=data.players.filter(x=>x.id!==id);save();m.remove();tabs();renderRows(document.querySelector('.tab.active')?.dataset.kit||'Overall')}};
function renderEdit(){
 let box=m.querySelector('#editCombos');let cs=p.combos||[];
 box.innerHTML=cs.length?cs.map((c,i)=>`<div class="edit-combo">
 <select class="edit-kit">${data.kits.map(k=>`<option value="${esc(k.name)}" ${k.name===c.kit?'selected':''}>${esc(k.name)}</option>`).join('')}</select>
 <input class="edit-tier" value="${esc(c.tier||'')}" placeholder="HT1 / LT1 / HT2">
 <button type="button" class="btn danger remove-kit" data-i="${i}" title="Remove this kit tier">×</button></div>`).join(''):'<div class="edit-empty">No kit tiers added yet.</div>';
 box.querySelectorAll('.remove-kit').forEach(b=>b.onclick=()=>{p.combos.splice(+b.dataset.i,1);renderEdit()});
}
function refreshAddKitButton(){
 const btn=m.querySelector('#addPlayerKit');
 if(!btn)return;
 const combos=p.combos||[];
 const available=data.kits.find(k=>!combos.some(c=>c.kit===k.name));
 btn.disabled=!available;
 btn.textContent=available?'＋ Add Kit + Tier':'✓ All Kits Added — Edit Existing Rows';
 btn.title=available?'Add another kit and tier':'All available kits are already assigned. Edit the rows above.';
}
m.querySelector('#addPlayerKit').onclick=()=>{
 p.combos=p.combos||[];
 const available=data.kits.find(k=>!p.combos.some(c=>c.kit===k.name));
 if(!available){refreshAddKitButton();return}
 p.combos.push({kit:available.name,tier:''});
 renderEdit();
 refreshAddKitButton();
};
m.querySelector('#saveEdit').onclick=()=>{
 let n=m.querySelector('#epn').value.trim();if(!n)return alert('Enter player name.');
 p.name=n;p.rank=m.querySelector('#epr').value;p.points=+m.querySelector('#epp').value||0;p.region=m.querySelector('#epg').value;
 p.combos=Array.from(m.querySelectorAll('.edit-combo')).map(r=>({kit:r.querySelector('.edit-kit').value,tier:r.querySelector('.edit-tier').value.trim()})).filter(x=>x.tier);
 let f=m.querySelector('#eps').files[0];
 let done=()=>{save();m.remove();renderRows(document.querySelector('.tab.active')?.dataset.kit||'Overall')};
 if(f){let r=new FileReader();r.onload=e=>{p.skin=e.target.result;done()};r.readAsDataURL(f)}else done();
};
renderEdit();
refreshAddKitButton();
}
function addTier(){let m=modal(`<button class="close">×</button><h2>Add Tier</h2><div class="form"><label>Tier name</label><input id="tn" placeholder="HT1"><label>Kit</label><select id="tk">${data.kits.map(k=>`<option>${esc(k.name)}</option>`).join('')}</select><div class="form-actions"><button class="btn" id="cancel">Cancel</button><button class="btn primary" id="add">Add Tier</button></div></div>`);m.querySelector('.close').onclick=()=>m.remove();m.querySelector('#cancel').onclick=()=>m.remove();m.querySelector('#add').onclick=()=>{let n=$('#tn').value.trim(),k=$('#tk').value;if(!n)return alert('Enter tier name.');data.tiers.push({name:n,kit:k});save();m.remove()}}
function addKit(){let m=modal(`<button class="close">×</button><h2>Add Kit</h2><div class="form"><label>Kit name</label><input id="kn" placeholder="Crystal"><label>Choose icon</label><div id="icons" class="icon-picker">${data.kits.map(k=>k.icon).filter((v,i,a)=>a.indexOf(v)===i).concat(['sword','axe','mace','pot','uhc','vanilla','ltms','nethop','smp','cart','spearmace','diamond-smp']).filter((v,i,a)=>a.indexOf(v)===i).map(k=>`<button type="button" class="icon-pick" data-icon="${k}"><img src="assets/${k}.png"></button>`).join('')}</div><div class="form-actions"><button class="btn" id="cancel">Cancel</button><button class="btn primary" id="add">Add Kit</button></div></div>`);let selected='sword';m.querySelectorAll('.icon-pick').forEach(b=>b.onclick=()=>{selected=b.dataset.icon;m.querySelectorAll('.icon-pick').forEach(x=>x.classList.remove('selected'));b.classList.add('selected')});m.querySelector('.close').onclick=()=>m.remove();m.querySelector('#cancel').onclick=()=>m.remove();m.querySelector('#add').onclick=()=>{let n=$('#kn').value.trim();if(!n)return alert('Enter kit name.');if(data.kits.some(k=>k.name.toLowerCase()===n.toLowerCase()))return alert('Kit already exists.');data.kits.push({name:n,icon:selected});save();m.remove();tabs();renderRows()}}
function kitPage(){
 let b=$('#kitRows'); if(!b)return;
 const name=document.title.split(' — ')[0].trim();
 const list=data.players.filter(p=>(p.combos||[]).some(c=>c.kit===name));
 const tierNum=t=>{const m=String(t||'').match(/(?:HT|LT)?\s*(\d+)/i);return m?Math.max(1,Math.min(10,parseInt(m[1],10))):99};
 const groups={1:[],2:[],3:[],4:[],5:[]};
 list.forEach(p=>{
   (p.combos||[]).filter(c=>c.kit===name).forEach(c=>{
     const n=tierNum(c.tier); if(n<=5) groups[n].push({p,c});
   });
 });
 const colors=['gold','silver','bronze','red','gray'];
 b.innerHTML=`<div class="kit-board-wrap"><div class="kit-board">${[1,2,3,4,5].map((n,i)=>{
   const arr=groups[n].slice().sort((a,z)=>(+z.p.points||0)-(+a.p.points||0));
   return `<section class="kit-tier-column tier-col-${n}">
     <div class="kit-tier-title ${colors[i]}">TIER #${n}</div>
     <div class="kit-tier-list">${arr.length?arr.map(({p})=>`<div class="kit-player-card" data-player="${esc(p.id)}">
       <div class="kit-player-left">
         <div class="kit-player-skin">${p.skin?`<img src="${p.skin}" alt="">`:esc(p.name.slice(0,2).toUpperCase())}</div>
         <strong>${esc(p.name)}</strong>
         <span class="up">⌃</span>
       </div>
       <span class="kit-region">${esc(p.region)}</span>
     </div>`).join(''):'<div class="kit-empty">No players</div>'}</div>
   </section>`;
 }).join('')}</div></div>`;
 b.querySelectorAll('[data-player]').forEach(r=>r.onclick=()=>profile(r.dataset.player));
}

function setupGlobalSearch(){
  const input=document.querySelector('#globalSearch');
  if(!input)return;
  let box=document.querySelector('.search-results');
  if(!box){box=document.createElement('div');box.className='search-results';document.body.appendChild(box)}
  const draw=()=>{
    const q=input.value.trim().toLowerCase();
    if(!q){box.classList.remove('show');box.innerHTML='';return}
    const matches=data.players.filter(p=>String(p.name||'').toLowerCase().includes(q)).slice(0,8);
    box.innerHTML=matches.length?matches.map(p=>`<div class="search-result">
      <div class="search-result-main" data-search-profile="${esc(p.id)}"><strong>${esc(p.name)}</strong><span>${esc(p.rank)} • ${esc(p.region)} • ${+p.points||0} points</span></div>
      <div class="search-result-actions"><button type="button" class="btn" data-search-edit="${esc(p.id)}">Edit</button></div>
    </div>`).join(''):`<div class="search-empty">No players found.</div>`;
    box.classList.add('show');
    box.querySelectorAll('[data-search-profile]').forEach(x=>x.onclick=()=>{box.classList.remove('show');profile(x.dataset.searchProfile)});
    box.querySelectorAll('[data-search-edit]').forEach(x=>x.onclick=e=>{e.stopPropagation();box.classList.remove('show');editPlayer(x.dataset.searchEdit)});
  };
  input.addEventListener('input',draw);
  input.addEventListener('focus',draw);
  document.addEventListener('click',e=>{if(e.target!==input&&!box.contains(e.target))box.classList.remove('show')});
}

function init(){
  tabs();
  renderRows(document.querySelector('.tab.active')?.dataset.kit||'Overall');
  renderHomeKits();
  if(document.querySelector('#kitRows')) kitPage();
  const add=document.querySelector('#addPlayerBtn');
  if(add)add.onclick=addPlayer;
  const addKitBtn=document.querySelector('#addKitBtn');
  if(addKitBtn)addKitBtn.onclick=addKit;
  const addTierBtn=document.querySelector('#addTierBtn');
  if(addTierBtn)addTierBtn.onclick=addTier;
  setupGlobalSearch();
}

document.addEventListener('DOMContentLoaded',init);
