import {seed} from './seed.js';
const $=id=>document.getElementById(id), esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let items=[],demo=false,editing=null;let posterCache={};try{posterCache=JSON.parse(localStorage.getItem("sebs-poster-cache-v3")||"{}")}catch{};let posterQueueRunning=false;let code=sessionStorage.getItem('sebs-code')||'';
const CATALOG_CORRECTIONS={"seed-19":{"title":"Stuck in Love","kind":"Película","release_year":2012},"seed-20":{"title":"Tiempo de pagar","kind":"Película","release_year":2024},"seed-17":{"title":"No Other Choice","kind":"Película","release_year":2025},"seed-33":{"title":"Obsession","kind":"Película","release_year":2026},"seed-34":{"title":"Primetime","kind":"Película","release_year":2026},"seed-38":{"title":"Bestia","kind":"Película","release_year":2021,"director":"Hugo Covarrubias"},"seed-45":{"title":"Monsters: The Lyle and Erik Menendez Story","kind":"Serie","release_year":2024},"seed-53":{"title":"Scott Pilgrim vs. the World","kind":"Película","release_year":2010},"seed-21":{"title":"The Drama","kind":"Película","release_year":2026},"seed-32":{"title":"Por ahora","kind":"Serie","release_year":2013,"director":"Malena Pichot"}};
function correctCatalog(data){return data.map(x=>{const patch=CATALOG_CORRECTIONS[x.id];return patch?{...x,...patch}:x})}

function readDemo(){
  let data;
  try {
    data = JSON.parse(localStorage.getItem('sebs-demo-library') || 'null') || structuredClone(seed);
  } catch {
    data = structuredClone(seed);
  }
  return correctCatalog(data);
}

function saveDemo(){localStorage.setItem('sebs-demo-library',JSON.stringify(items))}
async function load(){try{const r=await fetch('/api/library');if(!r.ok)throw Error('No hay conexión con Supabase');const d=await r.json();items=correctCatalog(d.items||[]);demo=false;}catch{items=readDemo();demo=true;}render();loadPosters()}
function posterKey(x){return [x.title,x.kind,x.release_year||''].join('|')}
async function loadPosters(){
 if(posterQueueRunning)return;posterQueueRunning=true;
 const queue=items.filter(x=>!posterCache[posterKey(x)]);
 let cursor=0;
 async function worker(){while(cursor<queue.length){const x=queue[cursor++],key=posterKey(x);
 try{const qs=new URLSearchParams({title:x.title,kind:x.kind||'',year:x.release_year||''});
 // Some sheet years are viewing dates or erroneous; do not use them as strict release filters.
 const r=await fetch('/api/tmdb?'+qs);if(!r.ok)continue;
 const data=await r.json();posterCache[key]=data;
 localStorage.setItem('sebs-poster-cache-v3',JSON.stringify(posterCache));
 if(data.poster){const card=[...document.querySelectorAll('[data-film-id]')].find(el=>el.dataset.filmId===String(x.id));
 if(card){const wrap=card.querySelector('.film-poster-wrap');if(wrap){const img=document.createElement('img');img.className='film-poster';img.src=data.poster;img.alt='Póster de '+x.title;img.loading='lazy';wrap.replaceChildren(img)}}}
 }catch{ /* transient failures are retried next visit */ }
 }}
 await Promise.all(Array.from({length:Math.min(4,queue.length)},worker));posterQueueRunning=false;
}
function render(){const q=$('archiveSearch').value.toLocaleLowerCase(),kind=$('archiveFilter').value,status=$('statusFilter').value;const visible=items.filter(x=>(x.title||'').toLocaleLowerCase().includes(q)&&(kind==='all'||x.kind===kind)&&(status==='all'||x.status===status));$('filmCount').textContent=items.length+' títulos · '+items.filter(x=>x.kind==='Película').length+' películas · '+items.filter(x=>x.kind==='Serie').length+' series';$('archiveStatus').textContent=demo?'Modo demostración: los cambios solo se guardan en este navegador. Para compartirlos, configurá Supabase.':'Archivo compartido conectado · Solo Juanma puede agregar, editar o eliminar.';$('filmGrid').innerHTML=visible.map(x=>`<article class="film-card" data-film-id="${esc(x.id)}"><div class="film-poster-wrap">${posterCache[posterKey(x)]?.poster?`<img class="film-poster" src="${esc(posterCache[posterKey(x)].poster)}" alt="Póster de ${esc(x.title)}" loading="lazy">`:`<div class="film-poster-placeholder"><span>SEB’S</span><small>ARCHIVO CINEMATOGRÁFICO</small></div>`}</div><div><div class="meta"><span class="eyebrow">${esc(x.kind)}</span><span class="status">${esc(x.status)}</span></div><h3>${esc(x.title)}</h3><p>${esc(x.director||'')} ${x.release_year?'· '+esc(x.release_year):''}</p><p>${x.watched_on?'Vimos: '+esc(x.watched_on):'Fecha no registrada'}</p></div><div><div class="rating">${x.shared_rating==null?'—':Number(x.shared_rating).toLocaleString('es-AR',{maximumFractionDigits:2})} <span style="font-size:12px">/ 10</span></div><div class="film-actions"><button class="film-action" data-edit="${esc(x.id)}">Editar</button><button class="film-action" data-delete="${esc(x.id)}">Eliminar</button></div></div></article>`).join('')||'<p>No se encontraron títulos.</p>'}
async function auth(){if(demo)return true;if(code)return true;code=prompt('Código privado de administrador (Juanma):')||'';if(code)sessionStorage.setItem('sebs-code',code);return Boolean(code)}
function openEditor(item){editing=item?.id||null;const form=$('editorForm');form.reset();for(const key of ['title','kind','status','director','release_year','juanma_rating','pouk_rating','shared_rating','watched_on','notes']){const el=form.elements.namedItem(key);if(el&&item?.[key]!=null)el.value=item[key];}$('editorHeading').textContent=item?'Editar título':'Agregar título';$('editorMessage').textContent='';$('filmEditor').showModal()}
$('newFilm').addEventListener('click',async()=>{if(await auth())openEditor(null)});
$('closeEditor').addEventListener('click',()=>$('filmEditor').close());
$('filmGrid').addEventListener('click',async e=>{const edit=e.target.closest('[data-edit]'),del=e.target.closest('[data-delete]');if(!edit&&!del)return;if(!await auth())return;const id=(edit||del).dataset.edit||(edit||del).dataset.delete;const item=items.find(x=>x.id===id);if(!item)return;if(edit)return openEditor(item);if(!confirm('¿Eliminar «'+item.title+'» de La Cinemateca?'))return;try{if(demo){items=items.filter(x=>x.id!==id);saveDemo()}else{const r=await fetch('/api/library?id='+encodeURIComponent(id),{method:'DELETE',headers:{'x-sebs-code':code}});const d=await r.json();if(!r.ok){if(r.status===401){code='';sessionStorage.removeItem('sebs-code')}throw Error(d.error)}items=items.filter(x=>x.id!==id)}render()}catch(err){alert(err.message)}});
$('editorForm').addEventListener('submit',async e=>{e.preventDefault();const f=e.currentTarget;const b=Object.fromEntries(new FormData(f).entries());for(const key of ['juanma_rating','pouk_rating','shared_rating','release_year'])if(b[key]==='')b[key]=null;if(b.juanma_rating!==null&&b.pouk_rating!==null)b.shared_rating=Math.round((Number(b.juanma_rating)+Number(b.pouk_rating))*50)/100;
try{if(demo){if(editing){items=items.map(x=>x.id===editing?{...x,...b}:x)}else{items.push({...b,id:crypto.randomUUID()})}saveDemo()}else{const r=await fetch('/api/library'+(editing?'?id='+encodeURIComponent(editing):''),{method:editing?'PATCH':'POST',headers:{'Content-Type':'application/json','x-sebs-code':code},body:JSON.stringify(b)});const d=await r.json();if(!r.ok){if(r.status===401){code='';sessionStorage.removeItem('sebs-code')}throw Error(d.error||'No se pudo guardar')}if(editing)items=items.map(x=>x.id===editing?d.item:x);else items.push(d.item)}$('filmEditor').close();render();loadPosters()}catch(err){$('editorMessage').textContent=err.message}});
for(const id of ['archiveSearch','archiveFilter','statusFilter'])$(id).addEventListener(id==='archiveSearch'?'input':'change',render);
load();
