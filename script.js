const FIXED=[
 ["overall","Overall","assets/overall.png"],["ltms","LTMs","assets/ltms.png"],["vanilla","Vanilla","assets/vanilla.png"],["uhc","UHC","assets/uhc.png"],["pot","Pot","assets/pot.png"],
 ["nethop","NethOP","assets/nethop.png"],["smp","SMP","assets/smp.png"],["sword","Sword","assets/sword.png"],["axe","Axe","assets/axe.png"],["mace","Mace","assets/mace.png"]
];
let players=JSON.parse(localStorage.getItem("blast_players")||"[]");
let kits=JSON.parse(localStorage.getItem("blast_kits")||"[]");
let tiers=JSON.parse(localStorage.getItem("blast_tiers")||"[]");
let pending=[];let selectedLogo="sword";

function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function save(){localStorage.setItem("blast_players",JSON.stringify(players));localStorage.setItem("blast_kits",JSON.stringify(kits));localStorage.setItem("blast_tiers",JSON.stringify(tiers))}
function iconFor(name){let x=FIXED.find(a=>a[1].toLowerCase()==String(name).toLowerCase());return x?`<img src="${x[2]}" alt="${x[1]}">`:(kits.find(k=>k.name==name)?.logo||"<span>◉</span>")}
function renderTabs(){
 const e=document.getElementById("kitTabs");
 e.innerHTML=FIXED.map((x,i)=>`<button class="kit-tab ${i==0?"active":""}" onclick="${i==0?"show('home')":`openKit('${x[1]}',this)`}""><div class="kit-icon">${x[2]}</div>${x[1]}</button>`).join("");
}
function show(id){document.querySelectorAll(".page").forEach(x=>x.classList.remove("active"));document.getElementById(id).classList.add("active");renderPlayers();renderRankings();document.querySelectorAll(".kit-tab").forEach((b,i)=>b.classList.toggle("active",id=="home"&&i==0))}
function openKit(name,btn){document.querySelectorAll(".page").forEach(x=>x.classList.remove("active"));document.getElementById("kitPage").classList.add("active");document.getElementById("kitTitle").textContent=name;document.querySelectorAll(".kit-tab").forEach(b=>b.classList.remove("active"));btn.classList.add("active");let a=players.filter(p=>(p.combos||[]).some(c=>c.kit==name));document.getElementById("kitPlayerList").innerHTML=a.length?a.map((p)=>playerHTML(p,players.indexOf(p))).join(""):`<div class="empty"><b>◉</b><h2>No players in ${esc(name)} yet!</h2></div>`}
function openModal(id){document.getElementById(id).classList.add("show");updateSelects();if(id=="kitModal")logoPicker()}
function closeModals(){document.querySelectorAll(".modal").forEach(x=>x.classList.remove("show"))}
function updateSelects(){
 playerTier.innerHTML='<option value="">No Player Tier</option>'+tiers.map(t=>`<option>${esc(t.name)}</option>`).join("");
 tierKit.innerHTML=kits.length?kits.map(k=>`<option>${esc(k.name)}</option>`).join(""):'<option value="">No kits yet</option>';
 comboKit.innerHTML=[...FIXED.slice(1).map(x=>`<option>${x[1]}</option>`),...kits.map(k=>`<option>${esc(k.name)}</option>`)].join("");
 comboTier.innerHTML=tiers.length?tiers.map(t=>`<option>${esc(t.name)}</option>`).join(""):'<option value="">No tiers yet</option>';
}
function logoPicker(){document.getElementById("logoRow").innerHTML=FIXED.slice(1).map(x=>`<button class="${selectedLogo==x[0]?"selected":""}" onclick="selectedLogo='${x[0]}';logoPicker()"><div class="kit-icon">${x[2]}</div>${x[1]}</button>`).join("")}
function addKit(){let n=kitName.value.trim();if(!n)return alert("Enter kit name");if(kits.some(k=>k.name.toLowerCase()==n.toLowerCase()))return alert("Kit already exists");kits.push({name:n,logo:FIXED.find(x=>x[1].toLowerCase()==n.toLowerCase())?.[2]||"◉"});save();kitName.value="";closeModals();render()}
function addTier(){let n=tierName.value.trim();if(!n)return alert("Enter tier name");tiers.push({name:n,kit:tierKit.value});save();tierName.value="";closeModals();render()}
function addCombo(){if(!comboKit.value||!comboTier.value)return;pending.push({kit:comboKit.value,tier:comboTier.value});document.getElementById("chosen").innerHTML=pending.map((x,i)=>`<div>${iconFor(x.kit)} ${esc(x.kit)} → <b class="tier">${esc(x.tier)}</b> <button onclick="pending.splice(${i},1);addCombo()">×</button></div>`).join("")}
function addPlayer(){
 let n=playerName.value.trim();if(!n)return alert("Enter player name");
 let p={id:Date.now(),name:n,tier:playerTier.value,rank:playerRank.value,points:Number(playerPoints.value||0),region:playerRegion.value,combos:[...pending],skin:""};
 let f=playerSkin.files[0],done=()=>{players.push(p);pending=[];document.getElementById("chosen").innerHTML="";closeModals();save();render()};
 if(f){let r=new FileReader();r.onload=e=>{p.skin=e.target.result;done()};r.readAsDataURL(f)}else done()
}
function del(i){if(confirm("Delete this player?")){players.splice(i,1);save();render()}}
function playerHTML(p,i){let combos=(p.combos||[]).map(c=>`<div class="combo"><span class="kit-icon">${iconFor(c.kit)}</span><span>${esc(c.kit)}<br><b class="tier">${esc(c.tier)}</b></span></div>`).join("")||'<span class="muted">No kits assigned</span>';return `<div class="player"><span class="number">${i+1}.</span><div class="skin">${p.skin?`<img src="${p.skin}">`:""}</div><div class="pinfo"><div class="pname">${esc(p.name)}</div><div class="muted">◆ ${esc(p.rank)} (${esc(p.points)} points)${p.tier?" • "+esc(p.tier):""}</div></div><span class="region">${esc(p.region)}</span><div class="combos">${combos}</div><button class="delete" onclick="del(${i})">Delete</button></div>`}
function renderPlayers(){let e=document.getElementById("playerList");if(!e)return;let q=(search.value||"").toLowerCase();let a=players.filter(p=>p.name.toLowerCase().includes(q));e.innerHTML=a.length?a.map(p=>playerHTML(p,players.indexOf(p))).join(""):`<div class="empty"><b>🏆</b><h2>No players yet!</h2><p>Add a player to start the rankings.</p></div>`}
function renderRankings(){let e=document.getElementById("rankingList");if(!e)return;let a=[...players].sort((a,b)=>b.points-a.points);e.innerHTML=a.length?a.map((p,i)=>playerHTML(p,players.indexOf(p))).join(""):`<div class="empty"><b>🏆</b><h2>No rankings yet!</h2></div>`}
function renderKits(){let e=document.getElementById("kitGrid");if(!e)return;e.innerHTML=kits.length?kits.map(k=>`<div class="kit-card"><div class="kit-icon">${iconFor(k.name)}</div>${esc(k.name)}</div>`).join(""):'<span class="muted">No custom kits added yet.</span>'}
function render(){renderTabs();renderKits();renderPlayers();renderRankings();updateSelects()}
function sendChat(){let v=chatInput.value.trim();if(!v)return;messages.innerHTML+=`<div class="msg">${esc(v)}</div>`;chatInput.value=""}
render();