const start='2026-11-06';
const tmdb=async(path)=>{const key=process.env.TMDB_API_KEY,token=process.env.TMDB_READ_TOKEN;if(!key&&!token)throw Error('TMDB missing');const url=new URL('https://api.themoviedb.org/3/'+path);if(!token)url.searchParams.set('api_key',key);const r=await fetch(url,{headers:token?{Authorization:'Bearer '+token}:{},signal:AbortSignal.timeout(9000)});if(!r.ok)throw Error('TMDB '+r.status);return r.json()};
const localDay=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Argentina/Buenos_Aires',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const dayNumber=()=>Math.max(0,Math.floor((Date.parse(localDay()+'T12:00:00Z')-Date.parse(start+'T12:00:00Z'))/86400000));
export default async function handler(req,res){
if(req.method!=='GET')return res.status(405).json({error:'Método no permitido'});
try{
const day=dayNumber(),index=day%100;
const page=Math.floor(index/20)+1,slot=index%20;
const pool=await tmdb('discover/movie?sort_by=vote_count.desc&vote_count.gte=800&include_adult=false&primary_release_date.lte=2025-12-31&page='+page);
const movies=pool.results||[];
const candidate=movies[slot];
if(!candidate)return res.status(503).json({error:'No hay película disponible'});
const images=await tmdb('movie/'+candidate.id+'/images?include_image_language=null,en');
const stills=(images.backdrops||[]).filter(x=>x.file_path&&x.width>=780&&x.height>=400);
if(stills.length<5)return res.status(200).json({day,index,total:100,available:false,message:'Esta película no tiene cinco fotogramas disponibles en TMDB.'});
const unique=[...new Map(stills.map(x=>[x.file_path,x])).values()];
const ranked=unique.sort((a,b)=>(a.vote_count||0)-(b.vote_count||0));
const chosen=[...ranked.slice(0,3),...ranked.slice(-2)].filter((x,i,arr)=>arr.findIndex(y=>y.file_path===x.file_path)===i);
const film={title:candidate.title,originalTitle:candidate.original_title,year:(candidate.release_date||'').slice(0,4)};
const clean=s=>String(s||'').normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
const guess=String(req.query.guess||'').slice(0,120);
if(req.query.reveal==='1')return res.status(200).json({answer:film.title});
if(guess){const correct=clean(guess)===clean(film.title)||clean(guess)===clean(film.originalTitle);return res.status(200).json({correct,answer:correct?film.title:null});}
const payload={day,index,total:300,available:true,frames:chosen.map(x=>'https://image.tmdb.org/t/p/w1280'+x.file_path)};
res.setHeader('Cache-Control','s-maxage=3600, stale-while-revalidate=3600');
return res.status(200).json(payload);
}catch(e){return res.status(502).json({error:'No pudimos cargar los fotogramas hoy.'})}
}