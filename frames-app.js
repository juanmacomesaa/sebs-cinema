const root=document.getElementById('frames-game');
if(root){
const $=id=>document.getElementById(id);
let puzzle=null,step=0,done=false,marks=[],answer='';
const key=()=>puzzle?'sebs-frames-'+puzzle.day:'';
const save=()=>{try{localStorage.setItem(key(),JSON.stringify({step,done,marks,answer}))}catch{}};
const render=()=>{
if(!puzzle||!puzzle.available)return;
$('frames-day').textContent='Película diaria #'+(puzzle.index+1)+' de '+puzzle.total;
$('frames-image').src=puzzle.frames[Math.min(step,4)];
$('frames-image').hidden=false;
$('frames-step').textContent='Fotograma '+(Math.min(step,4)+1)+' de 5';
$('frames-history').textContent=marks.join('  ');
$('frames-guess').disabled=done;
$('frames-submit').disabled=done;
$('frames-skip').disabled=done;
$('frames-share').hidden=!done;
if(done)$('frames-feedback').textContent=(marks.at(-1)==='🟩'?'¡Correcto! ':'Ronda terminada. ')+'La película era '+answer+'. Volvé mañana.';
};
async function finishGuess(){
if(done||!puzzle?.available)return;
const title=$('frames-guess').value.trim();
if(!title)return;
$('frames-submit').disabled=true;
try{
const r=await fetch('/api/frames?guess='+encodeURIComponent(title));
const result=await r.json();
if(!r.ok)throw Error(result.error||'Error de consulta');
if(result.correct){marks.push('🟩');answer=result.answer;done=true}
else{marks.push('⬛');if(step>=4){answer=result.answer;done=true}else step++}
$('frames-guess').value='';save();render();
if(!done)$('frames-feedback').textContent='No es esa. Se reveló otro fotograma.';
}catch(e){$('frames-feedback').textContent='No se pudo comprobar la respuesta. Probá de nuevo.'}
finally{if(!done)$('frames-submit').disabled=false}
}
function skip(){if(done||!puzzle?.available)return;marks.push('⬜');if(step>=4){done=true;answer='la película misteriosa';$('frames-feedback').textContent='Terminaste los cinco fotogramas.'}else step++;save();render()}
$('frames-submit').onclick=finishGuess;
$('frames-skip').onclick=skip;
$('frames-guess').addEventListener('keydown',e=>{if(e.key==='Enter')finishGuess()});
$('frames-share').onclick=()=>{const result='SEB’S Frames #'+(puzzle.index+1)+' '+marks.join('')+' ('+(marks.at(-1)==='🟩'?marks.length+'/5':'X/5')+')';if(navigator.share)navigator.share({text:result}).catch(()=>{});else if(navigator.clipboard)navigator.clipboard.writeText(result).then(()=>$('frames-feedback').textContent='Resultado copiado.')};
fetch('/api/frames').then(r=>r.json()).then(data=>{if(!data.available){$('frames-day').textContent=data.message||data.error||'Sin partida disponible hoy.';return}puzzle=data;try{const state=JSON.parse(localStorage.getItem(key())||'null');if(state){step=state.step||0;done=!!state.done;marks=state.marks||[];answer=state.answer||''}}catch{}render()}).catch(()=>$('frames-day').textContent='No pudimos cargar el juego diario.');
}
