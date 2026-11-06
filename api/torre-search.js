export default async function handler(req,res){
const title=String(req.query.title||'').slice(0,100);
if(title.length<2)return res.status(400).json({movies:[]});
const key=process.env.TMDB_API_KEY;
const token=process.env.TMDB_READ_TOKEN;
if(!key&&!token)return res.status(503).json({movies:[]});
try{
const u=new URL('https://api.themoviedb.org/3/search/movie');
u.searchParams.set('query',title);
u.searchParams.set('language','es-ES');
if(!token)u.searchParams.set('api_key',key);
const r=await fetch(u,{headers:token?{Authorization:'Bearer '+token}:{}});
const d=await r.json();
return res.status(200).json({movies:(d.results||[]).slice(0,8).map(m=>({id:m.id,title:m.title,year:(m.release_date||'').slice(0,4),poster:m.poster_path?'https://image.tmdb.org/t/p/w185'+m.poster_path:null}))});
}catch{return res.status(502).json({movies:[]})}
}