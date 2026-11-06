import { affinityDb, send } from './_shared.js';
import { timingSafeEqual } from 'node:crypto';

const picks = [
  ['Her','movie','Una historia íntima y sensible sobre vínculos, soledad y tecnología.'],
  ['The Grand Budapest Hotel','movie','Humor, composición visual y un universo cinematográfico muy reconocible.'],
  ['Whiplash','movie','Música, obsesión y tensión; una afinidad clara con el cine sobre artistas.'],
  ['La La Land','movie','Musical, romance y amor por el cine clásico.'],
  ['Nine Queens','movie','Un clásico argentino de engaños, ritmo y personajes.'],
  ['The Godfather','movie','Una obra fundamental de personajes, familia y poder.'],
  ['The Apartment','movie','Billy Wilder: comedia amarga, romance y mirada humana.'],
  ['The Florida Project','movie','Realismo social, infancia y sensibilidad visual.'],
  ['Uncut Gems','movie','Energía frenética, ansiedad y puesta en escena.'],
  ['Everything Everywhere All at Once','movie','Una mezcla de géneros, emoción y creatividad formal.'],
  ['Amélie','movie','Romance, color y una identidad visual muy marcada.'],
  ['Sing Street','movie','Música, adolescencia y una historia luminosa.'],
  ['Scott Pilgrim vs. the World','movie','Comedia, música y lenguaje visual de videojuego.'],
  ['The Truman Show','movie','Una idea original con humor y preguntas existenciales.'],
  ['Perfect Days','movie','Una película contemplativa, sensible y cotidiana.'],
  ['Past Lives','movie','Distancia, vínculos y decisiones que permanecen.'],
  ['The Worst Person in the World','movie','Romance contemporáneo, humor y contradicciones humanas.'],
  ['Aftersun','movie','Memoria, intimidad y emoción contenida.'],
  ['The Holdovers','movie','Comedia dramática cálida, con espíritu clásico.'],
  ['Little Miss Sunshine','movie','Familia disfuncional, humor y ternura.'],
  ['The Lobster','movie','Comedia absurda, romance y sátira social.'],
  ['The Menu','movie','Sátira oscura, tensión y humor incómodo.'],
  ['Parasite','movie','Clase social, humor negro y precisión narrativa.'],
  ['The Secret in Their Eyes','movie','Thriller argentino, memoria y drama.'],
  ['Machuca','movie','Cine chileno, infancia y contexto social.'],
  ['The Wolf House','movie','Animación chilena experimental y stop motion.'],
  ['Beast','movie','Animación chilena y una propuesta visual singular.'],
  ['Memoir of a Snail','movie','Stop motion, sensibilidad y humor melancólico.'],
  ['Mary and Max','movie','Animación artesanal, amistad y ternura excéntrica.'],
  ['Fantastic Mr. Fox','movie','Stop motion, humor y composición visual.'],
  ['Isle of Dogs','movie','Universo visual, animación y humor de autor.'],
  ['The Tale of the Princess Kaguya','movie','Animación poética y una estética inolvidable.'],
  ['Spirited Away','movie','Fantasía, imaginación y mundo visual.'],
  ['The Mitchells vs. the Machines','movie','Comedia familiar y animación inventiva.'],
  ['Paddington 2','movie','Humor amable, encanto y precisión cinematográfica.'],
  ['Palm Springs','movie','Comedia romántica con una vuelta fantástica.'],
  ['About Time','movie','Romance, familia y emoción cotidiana.'],
  ['When Harry Met Sally...','movie','Comedia romántica clásica y diálogos memorables.'],
  ['Fleabag','tv','Comedia dramática con una voz autoral muy marcada.'],
  ['Barry','tv','Humor negro, crimen y personajes complejos.'],
  ['The Bear','tv','Cocina, presión, vínculos y puesta en escena intensa.'],
  ['Severance','tv','Misterio, diseño visual y ciencia ficción.'],
  ['Ted Lasso','tv','Comedia cálida, personajes y vínculos.'],
  ['The Studio','tv','Sátira de la industria audiovisual y humor cinéfilo.'],
  ['Los Simuladores','tv','Ingenio, humor y una serie argentina de culto.'],
  ['Okupas','tv','Realismo argentino y retrato social.'],
  ['The Rehearsal','tv','Comedia inclasificable y experimentación narrativa.']
];

function safeEqual(a,b){if(!a||!b)return false;const x=Buffer.from(String(a)),y=Buffer.from(String(b));return x.length===y.length&&timingSafeEqual(x,y)}
function authorized(req){return safeEqual(req.headers['x-sebs-code'],process.env.SEBS_JUANMA_CODE)}
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='POST')return send(res,405,{error:'Método no permitido'});
 if(!authorized(req))return send(res,401,{error:'Se requiere el código de administrador de Juanma.'});
 const key=process.env.TMDB_READ_TOKEN,apiKey=process.env.TMDB_API_KEY;
 if(!key&&!apiKey)return send(res,503,{error:'Falta TMDB_READ_TOKEN o TMDB_API_KEY en Vercel.'});
 try{
  const existing=await affinityDb('affinity_movies','?select=tmdb_id');
  const known=new Set(existing.map(x=>String(x.tmdb_id)));
  const pending=picks.filter(x=>!known.has(x[0]));
  const rows=[];let failures=0;
  let cursor=0;
  async function worker(){while(cursor<pending.length){
   const [title,type,reason]=pending[cursor++];
   try{
    const url=new URL('https://api.themoviedb.org/3/search/'+type);
    url.searchParams.set('query',title);url.searchParams.set('include_adult','false');url.searchParams.set('language','es-ES');
    const response=await fetch(url,{headers:key?{Authorization:'Bearer '+key}:{},...(key?{}:{headers:{}})});
    if(!response.ok){failures++;continue}
    const data=await response.json();const results=(data.results||[]).filter(x=>x.poster_path);
    const normalized=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
    const best=results.find(x=>normalized(x.title||x.name)===normalized(title))||results[0];
    if(!best){failures++;continue}
    rows.push({tmdb_id:best.id,title:best.title||best.name,release_year:Number((best.release_date||best.first_air_date||'').slice(0,4))||null,poster_path:best.poster_path,overview:best.overview||'',recommendation_reason:reason});
   }catch{failures++}
  }}
  await Promise.all(Array.from({length:5},worker));
  if(rows.length)await affinityDb('affinity_movies','',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify(rows)});
  return send(res,200,{ok:true,added:rows.length,skipped:existing.length,notFound:failures,total:existing.length+rows.length});
 }catch(error){console.error('Afinidades catalog seed:',error);return send(res,500,{error:error.message||'No se pudo cargar el catálogo.'})}
}