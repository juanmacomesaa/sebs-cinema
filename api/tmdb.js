// Server-side TMDB proxy. TMDB_API_KEY remains in Vercel Environment Variables.
const aliases={
 'got':'Game of Thrones','hotd':'House of the Dragon','wishplash':'Whiplash',
 'el gran hotel budapest':'The Grand Budapest Hotel','todo al mismo tiempo en todas partes':'Everything Everywhere All at Once',
 '9 reinas':'Nine Queens','no other choise':'No Other Choice','the florida proyect':'The Florida Project',
 'bebé reno - baby reindeer':'Baby Reindeer','el padrino':'The Godfather',
 'el secreto de sus ojos':'The Secret in Their Eyes','los simuladores':'Los simuladores',
 'el caballero de los siete reinos':'A Knight of the Seven Kingdoms',
 'la misteriosa mirada del flamenco':'The Mysterious Gaze of the Flamingo',
 'una batalla tras otra':'One Battle After Another',
 'proyecto hail mary':'Project Hail Mary','el ultimo samurai en pie':'Last Samurai Standing',
 'sex and the city':'Sex and the City','get down':'The Get Down',
 'monstruos: hermanos menendez':'Monsters: The Lyle and Erik Menendez Story',
 'scott pilgrim vs. los ex de la chica de sus sueños':'Scott Pilgrim vs. the World',
 'sudamerican rockers':'Sudamerican Rockers',
 'tiempo de pagar':'Time to Pay',
};
const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const similarity=(a,b)=>{const A=new Set(normalize(a).split(' ')),B=new Set(normalize(b).split(' '));let n=0;for(const x of A)if(B.has(x))n++;return n/Math.max(A.size,B.size,1)};
export default async function handler(req,res){
 if(req.method!=='GET')return res.status(405).json({error:'Método no permitido'});
 const key=process.env.TMDB_API_KEY;
 if(!key)return res.status(503).json({error:'TMDB_API_KEY no configurada en Vercel'});
 const title=String(req.query.title||'').slice(0,130).trim();
 if(title.length<2)return res.status(400).json({error:'Título requerido'});
 const original=title,query=aliases[normalize(title)]||title;
 const kind=req.query.kind==='Serie'?'tv':req.query.kind==='Película'?'movie':'multi';
 const year=Number(req.query.year)||null;
 try{
  const url=new URL('https://api.themoviedb.org/3/search/'+kind);
  url.searchParams.set('query',query);url.searchParams.set('include_adult','false');url.searchParams.set('language','es-ES');
  if(!process.env.TMDB_READ_TOKEN)url.searchParams.set('api_key',key);
  const response=await fetch(url,{headers:process.env.TMDB_READ_TOKEN?{Authorization:'Bearer '+process.env.TMDB_READ_TOKEN}:{},signal:AbortSignal.timeout(8500)});
  if(!response.ok)return res.status(502).json({error:'TMDB no respondió correctamente'});
  const data=await response.json();
  const results=(data.results||[]).filter(x=>x.poster_path && (kind!=='multi'||['movie','tv'].includes(x.media_type)));
  const target=normalize(query);
  const ranked=results.map(x=>{
   const name=x.title||x.name||'', orig=x.original_title||x.original_name||'';
   const release=(x.release_date||x.first_air_date||'').slice(0,4);
   const score=Math.max(similarity(target,name),similarity(target,orig),similarity(normalize(original),name)) + (year&&Number(release)===year?.17:0);
   return {...x,_score:score,_release:release,_name:name};
  }).sort((a,b)=>b._score-a._score);
  const best=ranked[0];
  // Ambiguous titles are left without a poster rather than using a wrong one.
  if(!best||best._score<.48)return res.status(200).setHeader('Cache-Control','s-maxage=86400, stale-while-revalidate=604800').json({found:false});
  res.setHeader('Cache-Control','s-maxage=86400, stale-while-revalidate=604800');
  return res.status(200).json({found:true,poster:'https://image.tmdb.org/t/p/w500'+best.poster_path,tmdb_id:best.id,tmdb_type:best.media_type||(kind==='tv'?'tv':'movie'),title:best._name,year:best._release,overview:best.overview||'',confidence:best._score});
 }catch{return res.status(502).json({error:'No se pudo consultar TMDB'});}
}
