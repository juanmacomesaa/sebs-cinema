const films=[
['The Odyssey',2026],['La Bola Negra',2026],['Wild Horse Nine',2026],['Dune: Part Three',2026],['Project Hail Mary',2026],['The Invite',2026],['The Debut',2026],['Artificial',2026],['I Play Rocky',2026],['Fjord',2026],['You Can See Everything',2026],['Elsinore',2026],['Digger',2026],['Possible Love',2026],['Tender Loving Care',2026],['Obsession',2026]
];
export default async function handler(req,res){
if(req.method!=='GET')return res.status(405).json({error:'Método no permitido'});
const key=process.env.TMDB_API_KEY,token=process.env.TMDB_READ_TOKEN;
if(!key&&!token)return res.status(503).json({error:'TMDB no configurado'});
const result=await Promise.all(films.map(async([title,year],index)=>{try{
const url=new URL('https://api.themoviedb.org/3/search/movie');url.searchParams.set('query',title);url.searchParams.set('language','en-US');url.searchParams.set('include_adult','false');if(!token)url.searchParams.set('api_key',key);
const r=await fetch(url,{headers:token?{Authorization:'Bearer '+token}:{},signal:AbortSignal.timeout(6500)});if(!r.ok)throw Error('TMDB');const data=await r.json();
const clean=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
const match=(data.results||[]).find(m=>(clean(m.title)===clean(title)||clean(m.original_title)===clean(title))&&Math.abs(Number((m.release_date||'').slice(0,4))-year)<=1);
return {title,year,rank:index+1,poster:match?.poster_path?'https://image.tmdb.org/t/p/w500'+match.poster_path:null,tmdbId:match?.id||null};
}catch{return {title,year,rank:index+1,poster:null,tmdbId:null}}}));
res.setHeader('Cache-Control','s-maxage=86400, stale-while-revalidate=86400');
return res.status(200).json({updated:'2026-11-09',status:'Predicciones de la temporada, no nominaciones oficiales',films:result,sources:[{name:'AwardsWatch — Predicciones octubre',url:'https://awardswatch.com/2027-oscar-predictions-best-picture-and-best-director-october/'},{name:'The Playlist — Predicciones octubre',url:'https://theplaylist.net/best-picture-oscars-2027-contenders-predictions-the-odyssey-la-bola-negra-wild-horse-nine-top-the-field-20261021/'},{name:'TheWrap — Carrera después de festivales',url:'https://www.thewrap.com/creative-content/movies/best-picture-oscar-predictions-2027-after-festivals/'},{name:'Academia — Fechas oficiales',url:'https://press.oscars.org/news/academy-and-abc-announce-show-dates-99th-and-100th-oscarsr'}]})
}