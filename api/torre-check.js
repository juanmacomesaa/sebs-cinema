// Verify La Torre film proposals using TMDB metadata; do not guess on ambiguous matches.
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const genreMap={'terror':27,'comedia':35,'drama':18,'romance':10749,'acción':28,'aventuras':12,'ciencia ficción':878,'fantasía':14,'thriller':53,'misterio':9648,'animación':16,'musical':10402,'documental':99,'western':37,'crimen':80,'bélico':10752,'histórico':36,'familiar':10751};
const request=async(path,key,token)=>{const u=new URL('https://api.themoviedb.org/3/'+path);if(!token)u.searchParams.set('api_key',key);const r=await fetch(u,{headers:token?{Authorization:'Bearer '+token}:{},signal:AbortSignal.timeout(8500)});if(!r.ok)throw Error('TMDB unavailable');return r.json()};
export default async function handler(req,res){
 if(req.method!=='GET')return res.status(405).json({error:'Método no permitido'});
 const title=String(req.query.title||'').trim().slice(0,120),category=String(req.query.category||'').trim().slice(0,180);
 if(title.length<2||!category.startsWith('Películas '))return res.status(400).json({error:'Datos inválidos'});
 const key=process.env.TMDB_API_KEY,token=process.env.TMDB_READ_TOKEN;
 if(!key&&!token)return res.status(503).json({error:'Servicio cinematográfico no configurado'});
 try{
  const q=await request('search/movie?query='+encodeURIComponent(title)+'&language=es-ES&include_adult=false',key,token);
  const candidates=(q.results||[]).filter(x=>x.title&&x.release_date);
  const target=norm(title);
  let movie=candidates.find(x=>norm(x.title)===target||norm(x.original_title)===target);
  if(!movie)return res.status(200).json({status:'unknown',reason:'No encontré una coincidencia exacta para esa película. Probá con su título original.'});
  const info=await request('movie/'+movie.id+'?append_to_response=credits&language=es-ES',key,token);
  const cat=norm(category);
  let enters=null;
  if(category.startsWith('Películas en las que actúa ')){
   const actor=norm(category.slice('Películas en las que actúa '.length));
   enters=(info.credits?.cast||[]).some(x=>norm(x.name)===actor);
  }else if(category.startsWith('Películas dirigidas por ')){
   const director=norm(category.slice('Películas dirigidas por '.length));
   enters=(info.credits?.crew||[]).some(x=>x.job==='Director'&&norm(x.name)===director);
  }else if(category.startsWith('Películas estrenadas en ')){
   enters=Number(info.release_date?.slice(0,4))===Number(category.slice(-4));
  }else if(category.startsWith('Películas del género ')){
   const genre=category.slice('Películas del género '.length);enters=(info.genres||[]).some(x=>x.id===genreMap[genre]);
  }else if(category.startsWith('Películas que tienen la palabra «')){
   const word=category.match(/«(.+)»/)?.[1];enters=word?norm(info.title).split(' ').includes(norm(word))||norm(info.original_title).split(' ').includes(norm(word)):null;
  }else if(category.startsWith('Películas cuyo título empieza con ')){
   const letter=norm(category.slice(-1));enters=norm(info.title).startsWith(letter)||norm(info.original_title).startsWith(letter);
  }else if(category==='Películas cuyo título contiene un número'){
   enters=/\d/.test(info.title)||/\d/.test(info.original_title);
  }
  if(enters===null)return res.status(200).json({status:'unknown',reason:'No puedo verificar esta consigna con seguridad.'});
  res.setHeader('Cache-Control','s-maxage=3600');
  return res.status(200).json({status:enters?'in':'out',movie:info.title,year:info.release_date?.slice(0,4),poster:info.poster_path?'https://image.tmdb.org/t/p/w185'+info.poster_path:null});
 }catch(e){return res.status(502).json({status:'unknown',reason:'No se pudo consultar la base cinematográfica. Intentá otra vez.'})}
}
