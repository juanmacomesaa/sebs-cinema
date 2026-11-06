import { TORRE_CATEGORIES, TORRE_SECRET } from './torre-data.js';
const root=document.getElementById('torre-game');
if(root){
const $=id=>document.getElementById(id);
const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const pick=items=>items[Math.floor(Math.random()*items.length)];
let current=null,secret=null,tries=0,used=new Set(),filmHistory=[];
const saved=()=>{try{return JSON.parse(localStorage.getItem('sebs-torre-used')||'[]')}catch{return []}};
function choose(){let available=TORRE_CATEGORIES.filter(c=>!used.has(c.id));if(!available.length){used.clear();available=TORRE_CATEGORIES}const item=pick(available);used.add(item.id);try{localStorage.setItem('sebs-torre-used',JSON.stringify([...used]))}catch{}return item}
used=new Set(saved());
function duel(){current=choose();$('torre-duel-category').textContent=current.label;$('torre-duel-family').textContent=current.family+' · '+current.difficulty;$('torre-duel-count').textContent='Más de '+TORRE_CATEGORIES.length.toLocaleString('es-AR')+' categorías disponibles'}
function secretStart(){secret=pick(TORRE_SECRET);tries=0;$('torre-secret-answer').value='';$('torre-secret-feedback').textContent='Tenés 3 intentos para descubrir qué une estas películas.';$('torre-secret-guess').disabled=false;$('torre-secret-answer').disabled=false;secretRender()}
function secretRender(){const examples=secret.examples;$('torre-secret-examples').innerHTML=examples.slice(0,Math.min(3,tries+1)).map((x,i)=>'<div class="torre-clue"><span>PISTA '+(i+1)+'</span><strong>'+escapeHtml(x)+'</strong></div>').join('');$('torre-secret-tries').textContent=(3-tries)+' intentos restantes'}
function escapeHtml(x){return String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','&#39;':'&#39;'}[c]))}
function guess(){if(!secret||tries>=3)return;const guessText=$('torre-secret-answer').value.trim();if(!guessText)return;const g=normalize(guessText), options=[secret.label,...secret.aliases].map(normalize);const generic=new Set(['peliculas','peliculas con','peliculas de','peliculas que','cine','actores','directores','genero','categoria']);const ok=!generic.has(g)&&options.some(x=>x===g||(g.length>=7&&x.includes(g)&&!['peliculas','peliculas con','peliculas de'].includes(g)));tries++;if(ok){$('torre-secret-feedback').textContent='¡Correcto! La categoría era: '+secret.label;$('torre-secret-guess').disabled=true;$('torre-secret-answer').disabled=true;$('torre-secret-examples').innerHTML=secret.examples.map((x,i)=>'<div class="torre-clue"><span>PELÍCULA '+(i+1)+'</span><strong>'+escapeHtml(x)+'</strong></div>').join('')}else if(tries===3){$('torre-secret-feedback').textContent='Se acabaron los intentos. La categoría era: '+secret.label;$('torre-secret-guess').disabled=true;$('torre-secret-answer').disabled=true;secretRender()}else{$('torre-secret-feedback').textContent='No es esa categoría. Se revela otra película como pista.';secretRender()}$('torre-secret-answer').value=''}
function mode(name){root.querySelectorAll('[data-torre-mode]').forEach(b=>b.classList.toggle('active',b.dataset.torreMode===name));$('torre-duel').hidden=name!=='duel';$('torre-secret').hidden=name!=='secret';if(name==='duel'&&!current)duel();if(name==='secret'&&!secret)secretStart()}
root.querySelectorAll('[data-torre-mode]').forEach(b=>b.addEventListener('click',()=>mode(b.dataset.torreMode)));
$('torre-next').addEventListener('click',duel);
$('torre-secret-next').addEventListener('click',secretStart);
$('torre-secret-guess').addEventListener('click',guess);
$('torre-secret-answer').addEventListener('keydown',e=>{if(e.key==='Enter')guess()});
mode('duel');
}
