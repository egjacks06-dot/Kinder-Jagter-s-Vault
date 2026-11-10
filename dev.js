/* KJV 2.0 LOCAL DEVELOPMENT PREVIEW — NOT CLOUD CONNECTED */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const store=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const read=(k,f)=>{try{const v=JSON.parse(localStorage.getItem(k));return v===null?f:v}catch{return f}};
const seeds=window.KJV_STARTER_ARTICLES||[];
let articles=read('kjv2_articles',null)||seeds.map(a=>({...a,status:'published',author:'Starter library',updated:'Starter reference'}));
let revisions=read('kjv2_revisions',[]);
let checks=read('kjv2_checklists',{});
let editingId=null;
const games=[['minecraft','⛏️ Minecraft'],['cod','🧟 Call of Duty: Zombies'],['pokemon','⚡ Pokémon'],['siege','🛡️ Rainbow Six Siege'],['ark-evolved','🦕 ARK: Evolved'],['ark-ascended','🦖 ARK: Ascended']];
const templates={
 'blank':{category:'General',title:'',summary:'',body:''},
 'pokemon':{category:'Pokédex',title:'',summary:'Species, type and key traits.',body:'National number:\nTypes:\nAbilities:\nBase stats:\nEvolution methods (by game):\nLocations (by game):\nMoves and strategies:\nSources and version checked:'},
 'minecraft':{category:'Mobs',title:'',summary:'Short overview of this mob.',body:'Health:\nSpawning:\nBehaviour:\nDrops:\nCombat and farming tips:\nJava / Bedrock differences:\nSources and version checked:'},
 'zombies':{category:'Easter Eggs',title:'',summary:'Map and quest overview.',body:'Call of Duty title and map:\nPlayers required:\nPrerequisites:\nStep-by-step quest:\nRewards:\nVersion differences:\nSources and version checked:'},
 'siege':{category:'Operators',title:'',summary:'Operator role and specialty.',body:'Side and role:\nGadget:\nLoadout:\nStrengths and weaknesses:\nMap strategies:\nPatch / season checked:\nSources:'},
 'ark':{category:'Essentials',title:'',summary:'Core survival information.',body:'Game edition:\nCreature / topic:\nRequirements:\nMethod:\nWarnings:\nServer setting differences:\nSources:'}
};
const gameName=id=>games.find(g=>g[0]===id)?.[1]||id;
const persist=()=>{store('kjv2_articles',articles);store('kjv2_revisions',revisions);store('kjv2_checklists',checks)};
const alertText=(s)=>{$('devNotice').textContent=s};
function renderArticles(){
 const q=$('articleSearch').value.trim().toLowerCase(),g=$('articleGame').value;
 const filtered=articles.filter(a=>(!g||a.game===g)&&(!q||[a.title,a.summary,a.category,a.body,...(a.tags||[])].join(' ').toLowerCase().includes(q)));
 $('articleCount').textContent=`${filtered.length} article${filtered.length===1?'':'s'} shown · ${articles.length} total`;
 $('articleList').innerHTML=filtered.map(a=>`<article class="v2-card"><div class="v2-meta">${esc(gameName(a.game))} · ${esc(a.category)} · ${esc(a.edition||'Edition unspecified')}</div><h4>${esc(a.title)}</h4><p>${esc(a.summary)}</p><div class="v2-actions"><span class="v2-state">${esc(a.status||'draft')}</span><button class="btn" data-open-article="${esc(a.id)}">Read</button><button class="btn" data-edit-article="${esc(a.id)}">Edit</button></div></article>`).join('')||'<div class="empty">No articles match your search.</div>';
 document.querySelectorAll('[data-open-article]').forEach(b=>b.onclick=()=>openArticle(b.dataset.openArticle));
 document.querySelectorAll('[data-edit-article]').forEach(b=>b.onclick=()=>editArticle(b.dataset.editArticle));
}
function openArticle(id){const a=articles.find(x=>x.id===id);if(!a)return;
 $('articleDetail').innerHTML=`<div class="v2-meta">${esc(gameName(a.game))} / ${esc(a.category)} / ${esc(a.edition||'Unspecified')}</div><h3>${esc(a.title)}</h3><div class="v2-summary">${esc(a.summary)}</div><div class="v2-body">${esc(a.body)}</div><p class="hint">${esc((a.tags||[]).join(' · '))} · ${esc(a.updated||'')}</p><p class="hint">${a.status==='draft'?'Local draft':'Published in this local preview'} · No cloud sync</p>`;
 $('articleDialog').showModal();
}
function fillForm(a){$('edGame').value=a.game||'minecraft';$('edCategory').value=a.category||'';$('edTitle').value=a.title||'';$('edSummary').value=a.summary||'';$('edBody').value=a.body||'';$('edEdition').value=a.edition||'';$('edTags').value=(a.tags||[]).join(', ');$('editorStatus').textContent=a.id?'Editing: '+a.title:'New article';}
function editArticle(id){const a=articles.find(x=>x.id===id);if(!a)return;editingId=id;fillForm(a);view('editor');window.scrollTo({top:0,behavior:'smooth'});}
function newArticle(){editingId=null;fillForm({game:'minecraft'});view('editor')}
function saveArticle(status){const title=$('edTitle').value.trim(),summary=$('edSummary').value.trim();if(!title||!summary){alertText('Add an article title and quick summary first.');return}
 const previous=articles.find(a=>a.id===editingId);
 if(previous){revisions.push({articleId:previous.id,at:new Date().toISOString(),snapshot:JSON.parse(JSON.stringify(previous))});}
 const id=editingId||('local-'+Date.now()+'-'+Math.random().toString(36).slice(2,6));
 const a={id,game:$('edGame').value,category:$('edCategory').value.trim()||'General',title,summary,body:$('edBody').value.trim(),edition:$('edEdition').value.trim()||'Not specified',tags:$('edTags').value.split(',').map(s=>s.trim()).filter(Boolean),status,author:'Local preview editor',updated:new Date().toISOString()};
 if(previous)articles=articles.map(x=>x.id===id?a:x);else articles.push(a);
 editingId=id;persist();renderArticles();renderHistory();alertText(status==='published'?'Saved as a locally published article (not online).':'Draft saved on this device.');
}
function renderHistory(){const items=revisions.slice().reverse().slice(0,30);$('revisionList').innerHTML=items.map((r,i)=>`<div class="v2-history"><span>${esc(r.snapshot.title)} · ${esc(new Date(r.at).toLocaleString())}</span><button class="btn" data-revision="${revisions.length-1-i}">Restore</button></div>`).join('')||'<p class="hint">No previous versions yet. Editing an existing article creates a revision.</p>';
 document.querySelectorAll('[data-revision]').forEach(b=>b.onclick=()=>{const r=revisions[Number(b.dataset.revision)];if(!r||!confirm('Restore this previous article version? The current version will also be saved in history.'))return;const now=articles.find(a=>a.id===r.articleId);if(now)revisions.push({articleId:now.id,at:new Date().toISOString(),snapshot:JSON.parse(JSON.stringify(now))});articles=articles.map(a=>a.id===r.articleId?{...r.snapshot,updated:new Date().toISOString()}:a);persist();renderArticles();renderHistory();alertText('Previous version restored in this local preview.');});
}
const checklistItems=[['pokemon','Record a Pokémon in your collection'],['pokemon','Complete a regional Pokédex'],['minecraft','Build a survival base'],['minecraft','Defeat the Ender Dragon'],['cod','Complete a Zombies main quest'],['cod','Reach a personal round goal'],['siege','Learn a new operator'],['ark-evolved','Complete a creature tame'],['ark-ascended','Prepare a starter base']];
function renderChecks(){ $('v2Checks').innerHTML=checklistItems.map(([game,task],i)=>`<div class="v2-checkrow"><div><strong>${esc(task)}</strong><small>${esc(gameName(game))}</small></div><div class="v2-checkcols">${['You','Partner','Together'].map((label,j)=>`<label><input type="checkbox" data-v2tick="${i}-${j}" ${checks[`${i}-${j}`]?'checked':''}><span>${label}</span></label>`).join('')}</div></div>`).join('');document.querySelectorAll('[data-v2tick]').forEach(b=>b.onchange=()=>{checks[b.dataset.v2tick]=b.checked;persist()})}
function downloadJSON(obj,name){const blob=new Blob([JSON.stringify(obj,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),5000)}
function exportAll(){downloadJSON({format:'kjv2-development-backup',version:1,exported:new Date().toISOString(),legacy:{kjv_games:typeof games!=='undefined'?games:read('kjv_games',null),kjv_notes:read('kjv_notes',[]),kjv_ticks:read('kjv_ticks',{})},development:{articles,revisions,checks}},'kinder-jagters-vault-development-backup.json')}
let pendingImport=null;
$('v2Import').onchange=async e=>{const file=e.target.files?.[0];if(!file)return;try{if(file.size>4_000_000)throw Error('File is too large');const data=JSON.parse(await file.text());if(data.format!=='kjv2-development-backup'||!data.development||!Array.isArray(data.development.articles)||!Array.isArray(data.development.revisions)||typeof data.development.checks!=='object'||!data.development.checks)throw Error('This is not a valid V2 development backup');pendingImport=data;$('importPreview').textContent=`Ready to restore: ${data.development.articles.length} articles and ${data.development.revisions.length} revisions. This replaces the local development data only; original V0.1 data stays unchanged.`;$('confirmImport').hidden=false;}catch(err){pendingImport=null;$('confirmImport').hidden=true;$('importPreview').textContent=err.message;}e.target.value=''};
$('confirmImport').onclick=()=>{if(!pendingImport||!confirm('Replace only the local V2 development articles, revisions and checklists with this backup?'))return;articles=pendingImport.development.articles;revisions=pendingImport.development.revisions;checks=pendingImport.development.checks;persist();renderArticles();renderHistory();renderChecks();pendingImport=null;$('confirmImport').hidden=true;$('importPreview').textContent='Development backup restored. Your original V0.1 storage was not overwritten.'};
$('articleSearch').oninput=renderArticles;$('articleGame').onchange=renderArticles;
$('newArticle').onclick=newArticle;$('template').onchange=e=>{const t=templates[e.target.value];if(!t)return;const game=({pokemon:'pokemon',minecraft:'minecraft',zombies:'cod',siege:'siege',ark:'ark-evolved'})[e.target.value]||$('edGame').value;editingId=null;fillForm({...t,game});e.target.value='blank';alertText('Template loaded. Add your own verified information before publishing.')};
$('saveDraft').onclick=()=>saveArticle('draft');$('publishLocal').onclick=()=>saveArticle('published');$('previewArticle').onclick=()=>{const title=$('edTitle').value.trim()||'Untitled';$('articleDetail').innerHTML=`<div class="v2-meta">PREVIEW ONLY</div><h3>${esc(title)}</h3><div class="v2-summary">${esc($('edSummary').value)}</div><div class="v2-body">${esc($('edBody').value)}</div>`;$('articleDialog').showModal()};
$('closeArticle').onclick=()=>$('articleDialog').close();$('v2Export').onclick=exportAll;
$('copyAIPrompt').onclick=()=>{const prompt=`Help me research and draft a fact-checked gaming encyclopaedia article. Game: ${$('edGame').selectedOptions[0]?.text||''}. Category: ${$('edCategory').value}. Topic: ${$('edTitle').value}. Include a short summary, detailed guide, game/edition differences, uncertainties, and source links. Do not invent details. Return a draft for me to review.`;if(navigator.clipboard?.writeText){navigator.clipboard.writeText(prompt).then(()=>alertText('Research prompt copied. Paste it into ChatGPT; AI is not connected to this PWA yet.')).catch(()=>alertText('Copy not available in this preview.'))}else alertText('Clipboard unavailable in this preview. Open over HTTPS to enable copying.')};
$('devNotice').textContent='Local development preview only: no real accounts, cloud sync or online publishing yet.';
$('articleGame').innerHTML='<option value="">All games</option>'+games.map(g=>`<option value="${g[0]}">${esc(g[1])}</option>`).join('');
$('edGame').innerHTML=games.map(g=>`<option value="${g[0]}">${esc(g[1])}</option>`).join('');
renderArticles();renderHistory();renderChecks();
})();
