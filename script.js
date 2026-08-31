
(function(){
"use strict";

var KEY="blastTierData_WORKING";
var KITS=[
{id:"overall",name:"Overall",img:"assets/overall.png"},
{id:"ltms",name:"LTMs",img:"assets/ltms.png"},
{id:"vanilla",name:"Vanilla",img:"assets/vanilla.png"},
{id:"uhc",name:"UHC",img:"assets/uhc.png"},
{id:"pot",name:"Pot",img:"assets/pot.png"},
{id:"nethop",name:"NethOP",img:"assets/nethop.png"},
{id:"smp",name:"SMP",img:"assets/smp.png"},
{id:"sword",name:"Sword",img:"assets/sword.png"},
{id:"axe",name:"Axe",img:"assets/axe.png"},
{id:"mace",name:"Mace",img:"assets/mace.png"}
];
var db={players:[],tiers:[],customKits:[],messages:[]};
var pending=[];

function load(){
 try{
  var raw=localStorage.getItem(KEY);
  if(raw){
   var x=JSON.parse(raw);
   db.players=Array.isArray(x.players)?x.players:[];
   db.tiers=Array.isArray(x.tiers)?x.tiers:[];
   db.customKits=Array.isArray(x.customKits)?x.customKits:[];
   db.messages=Array.isArray(x.messages)?x.messages:[];
  }
 }catch(e){}
}
function save(){try{localStorage.setItem(KEY,JSON.stringify(db));}catch(e){}}
function esc(s){
 return String(s==null?"":s).replace(/[&<>"']/g,function(c){
  return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
 });
}
function kits(){return KITS.concat(db.customKits||[]);}
function getKit(name){
 var a=kits(),i;
 for(i=0;i<a.length;i++)if(a[i].name===name)return a[i];
 return {name:name,img:"assets/overall.png"};
}
function byId(id){return document.getElementById(id);}
function show(id){
 var x=byId(id);if(x){x.classList.add("show");document.body.style.overflow="hidden";refreshSelects();}
}
function hide(id){
 var x=byId(id);if(x)x.classList.remove("show");
 if(!document.querySelector(".modal.show"))document.body.style.overflow="";
}
function hideAll(){
 var a=document.querySelectorAll(".modal"),i;
 for(i=0;i<a.length;i++)a[i].classList.remove("show");
 document.body.style.overflow="";
}
window.openModal=show; window.closeModal=hide; window.closeAll=hideAll;

function refreshSelects(){
 var a=byId("playerTier"),b=byId("comboKit"),c=byId("comboTier"),d=byId("tierKit"),i;
 if(a){
  a.innerHTML='<option value="">No player tier</option>';
  for(i=0;i<db.tiers.length;i++)a.innerHTML+='<option value="'+esc(db.tiers[i].name)+'">'+esc(db.tiers[i].name)+'</option>';
 }
 if(b){
  b.innerHTML="";
  var ks=kits();for(i=0;i<ks.length;i++)if(ks[i].id!=="overall")b.innerHTML+='<option value="'+esc(ks[i].name)+'">'+esc(ks[i].name)+'</option>';
 }
 if(c){
  c.innerHTML="";
  if(!db.tiers.length)c.innerHTML='<option value="">No tiers yet</option>';
  for(i=0;i<db.tiers.length;i++)c.innerHTML+='<option value="'+esc(db.tiers[i].name)+'">'+esc(db.tiers[i].name)+'</option>';
 }
 if(d){
  d.innerHTML="";
  var ks2=kits();for(i=0;i<ks2.length;i++)if(ks2[i].id!=="overall")d.innerHTML+='<option value="'+esc(ks2[i].name)+'">'+esc(ks2[i].name)+'</option>';
 }
 renderPending();
}
function renderPending(){
 var e=byId("chosen"),i;if(!e)return;
 e.innerHTML="";
 for(i=0;i<pending.length;i++){
  e.innerHTML+='<div>'+esc(pending[i].kit)+' → <b class="tier">'+esc(pending[i].tier)+'</b> '+
   '<button type="button" class="btn danger" data-remove="'+i+'">×</button></div>';
 }
}
window.addCombo=function(){
 var k=byId("comboKit"),t=byId("comboTier"),i;
 if(!k||!t||!k.value||!t.value)return alert("First add a Tier.");
 for(i=0;i<pending.length;i++)if(pending[i].kit===k.value)return alert("This kit is already added.");
 pending.push({kit:k.value,tier:t.value});renderPending();
};
window.removePending=function(i){pending.splice(Number(i),1);renderPending();};

window.addPlayer=function(){
 var n=byId("playerName"),rank=byId("playerRank"),pts=byId("playerPoints"),reg=byId("playerRegion"),pt=byId("playerTier"),skin=byId("playerSkin"),i;
 if(!n||!n.value.trim())return alert("Enter player name.");
 for(i=0;i<db.players.length;i++)if(db.players[i].name.toLowerCase()===n.value.trim().toLowerCase())return alert("Player already exists.");
 if(!pending.length)return alert("Add at least one Kit + Tier.");
 var p={id:String(Date.now())+String(Math.random()),name:n.value.trim(),rank:rank?rank.value:"Combat Master",
 points:pts?Number(pts.value||0):0,region:reg?reg.value:"NA",playerTier:pt?pt.value:"",
 combos:pending.slice(),skin:""};
 function finish(){db.players.push(p);save();pending=[];var f=byId("playerForm");if(f)f.reset();hideAll();refreshAll();}
 if(skin&&skin.files&&skin.files[0]){
  if(skin.files[0].size>3145728)return alert("Skin must be under 3 MB.");
  var r=new FileReader();
  r.onload=function(){p.skin=r.result;finish();};
  r.onerror=function(){alert("Could not read the skin.");};
  r.readAsDataURL(skin.files[0]);
 }else finish();
};

function row(p,i){
 var html="",j,c,k;
 for(j=0;j<(p.combos||[]).length;j++){
  c=p.combos[j];k=getKit(c.kit);
  html+='<div class="combo"><img src="'+esc(k.img)+'" alt=""><span>'+esc(c.kit)+'<br><b class="tier">'+esc(c.tier)+'</b></span></div>';
 }
 return '<div class="player"><div class="place">'+(i+1)+'.</div><div class="skin">'+
 (p.skin?'<img src="'+p.skin+'" alt="">':"")+'</div><div><div class="name">'+esc(p.name)+'</div>'+
 '<div class="meta">◆ '+esc(p.rank)+' ('+(Number(p.points)||0)+' points)'+(p.playerTier?' • '+esc(p.playerTier):"")+
 '</div></div><div class="region">'+esc(p.region)+'</div><div class="combos">'+html+
 '</div><button type="button" class="btn danger delete-player" data-delete="'+esc(p.id)+'">Delete</button></div>';
}
function renderPlayers(e,kitName){
 if(!e)return;
 var q=byId("searchBox"),query=q?(q.value||"").toLowerCase():"",a=[],i,p,j,ok;
 for(i=0;i<db.players.length;i++){
  p=db.players[i];if(p.name.toLowerCase().indexOf(query)<0)continue;
  if(kitName){
   ok=false;for(j=0;j<(p.combos||[]).length;j++)if(p.combos[j].kit===kitName)ok=true;
   if(!ok)continue;
  }
  a.push(p);
 }
 a.sort(function(x,y){return (Number(y.points)||0)-(Number(x.points)||0);});
 if(!a.length){e.innerHTML='<div class="empty"><div class="big">🏆</div><h2>No players yet!</h2><p>Add a player to start the rankings.</p></div>';return;}
 e.innerHTML="";for(i=0;i<a.length;i++)e.innerHTML+=row(a[i],i);
}
window.deletePlayer=function(id){
 if(!confirm("Delete this player?"))return;
 db.players=db.players.filter(function(p){return String(p.id)!==String(id);});
 save();refreshAll();
};
window.addTier=function(){
 var n=byId("tierName"),k=byId("tierKit"),i;
 if(!n||!n.value.trim())return alert("Enter tier name.");
 if(!k||!k.value)return alert("Choose a kit.");
 for(i=0;i<db.tiers.length;i++)if(db.tiers[i].name.toLowerCase()===n.value.trim().toLowerCase()&&db.tiers[i].kit===k.value)return alert("That tier already exists.");
 db.tiers.push({id:String(Date.now()),name:n.value.trim(),kit:k.value});save();hideAll();refreshAll();
};
window.addKit=function(){
 var n=byId("kitName"),i;
 if(!n||!n.value.trim())return alert("Enter kit name.");
 var ks=kits();for(i=0;i<ks.length;i++)if(ks[i].name.toLowerCase()===n.value.trim().toLowerCase())return alert("Kit already exists.");
 db.customKits.push({id:"custom-"+Date.now(),name:n.value.trim(),img:"assets/overall.png"});
 save();hideAll();refreshAll();
};
function renderKits(){
 var e=byId("kitGrid"),ks,i;if(!e)return;ks=kits();e.innerHTML="";
 for(i=0;i<ks.length;i++)if(ks[i].id!=="overall")e.innerHTML+='<a class="card" href="'+ks[i].id+'.html"><img src="'+esc(ks[i].img)+'" alt=""><h3>'+esc(ks[i].name)+'</h3></a>';
}
function chat(){
 var e=byId("messages"),i;if(!e)return;e.innerHTML="";
 for(i=0;i<db.messages.length;i++)e.innerHTML+='<div class="msg"><b>'+esc(db.messages[i].user)+'</b><br>'+esc(db.messages[i].text)+'</div>';
 e.scrollTop=e.scrollHeight;
}
window.sendChat=function(){
 var i=byId("chatInput");if(!i||!i.value.trim())return;
 db.messages.push({user:"You",text:i.value.trim(),time:Date.now()});save();i.value="";chat();
};
function refreshAll(){
 load();refreshSelects();
 renderPlayers(byId("playerList"),document.body.getAttribute("data-kit")||null);
 renderPlayers(byId("rankingList"),null);renderKits();chat();
}
function bind(){
 var search=byId("searchBox"),i,a;
 if(search)search.addEventListener("input",refreshAll);
 a=document.querySelectorAll("[data-open]");
 for(i=0;i<a.length;i++)a[i].addEventListener("click",function(){show(this.getAttribute("data-open"));});
 a=document.querySelectorAll("[data-close]");
 for(i=0;i<a.length;i++)a[i].addEventListener("click",function(){hide(this.getAttribute("data-close"));});
 a=document.querySelectorAll("[data-add-combo]");
 for(i=0;i<a.length;i++)a[i].addEventListener("click",window.addCombo);
 a=document.querySelectorAll(".modal");
 for(i=0;i<a.length;i++)a[i].addEventListener("click",function(e){if(e.target===this)hide(this.id);});
 document.addEventListener("click",function(e){
  var d=e.target.getAttribute("data-delete"),r=e.target.getAttribute("data-remove");
  if(d!==null)window.deletePlayer(d);
  if(r!==null)window.removePending(r);
 });
 var pf=byId("playerForm");if(pf)pf.addEventListener("submit",function(e){e.preventDefault();window.addPlayer();});
 var tf=byId("addTierForm");if(tf)tf.addEventListener("submit",function(e){e.preventDefault();window.addTier();});
 var kf=byId("addKitForm");if(kf)kf.addEventListener("submit",function(e){e.preventDefault();window.addKit();});
 var ci=byId("chatInput");if(ci)ci.addEventListener("keydown",function(e){if(e.key==="Enter"){e.preventDefault();window.sendChat();}});
}
function start(){load();bind();refreshAll();}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start);else start();

})();
